import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { dataStore } from './server/dataStore';
import { anomalyEngine } from './server/anomalyEngine';
import { geminiService } from './server/geminiService';
import { assessmentTestSuite } from './server/testSuite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Ensure dataset is loaded
  dataStore.loadData();

  // --- API ROUTES ---

  // 1. Health Check Endpoint (Required Deliverable)
  app.get('/api/health', (req, res) => {
    const summary = dataStore.getSummary();
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

    res.json({
      status: 'ok',
      service: 'DOTMappers AI Ticket Intelligence API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      dataset: {
        file: 'support_tickets.csv',
        total_tickets: summary.total_tickets,
        open_tickets: summary.open_tickets,
        resolved_tickets: summary.resolved_tickets,
        escalated_tickets: summary.escalated_tickets,
        agents_count: summary.total_agents,
      },
      llm_engine: {
        model: 'gemini-3.8-flash',
        provider: 'Google GenAI SDK',
        status: hasGeminiKey ? 'active_connected' : 'fallback_deterministic_mode',
        gemini_api_key_configured: hasGeminiKey
      }
    });
  });

  // 2. Natural Language Query Endpoint (Required Deliverable)
  app.post('/api/query', async (req, res) => {
    try {
      const userQuery = req.body.query || req.body.q;
      const history = Array.isArray(req.body.history) ? req.body.history : undefined;
      if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
        return res.status(400).json({
          error: 'Missing required "query" parameter in request body.',
          example: { query: 'How many critical tickets are unresolved?' }
        });
      }

      const result = await geminiService.answerQuery(userQuery.trim(), false, history);
      res.json(result);
    } catch (err: any) {
      console.error('[API /api/query] Error:', err);
      res.status(500).json({
        error: 'Failed to process natural language query',
        message: err.message
      });
    }
  });

  // GET convenience alias for easy browser or curl queries
  app.get('/api/query', async (req, res) => {
    const query = req.query.q as string || req.query.query as string;
    if (!query) {
      return res.status(400).json({
        error: 'Missing "q" query parameter',
        example: '/api/query?q=How many tickets are currently open?'
      });
    }

    try {
      const result = await geminiService.answerQuery(query.trim());
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Anomaly Detection Endpoint (Required Deliverable)
  app.get('/api/anomalies', (req, res) => {
    try {
      const anomalies = anomalyEngine.detectAnomalies();
      const summary = dataStore.getSummary();

      // Category breakdown of anomalies
      const typeCounts: Record<string, number> = {};
      const severityCounts: Record<string, number> = {};

      for (const a of anomalies) {
        typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
        severityCounts[a.severity] = (severityCounts[a.severity] || 0) + 1;
      }

      res.json({
        total_anomalies: anomalies.length,
        breakdown_by_severity: severityCounts,
        breakdown_by_type: typeCounts,
        anomalies: anomalies,
        fleet_metrics: {
          mean_resolution_hrs: summary.avg_resolution_time_hrs,
          mean_response_hrs: summary.avg_response_time_hrs,
          mean_rating: summary.avg_customer_rating,
        },
        algorithms_applied: [
          'Statistical 2-Sigma & IQR Outlier Filtering (Resolution Time > 65h)',
          'High/Critical Urgency Unresolved SLA Breach (> 24h Stagnation)',
          'Customer Satisfaction Degradation (CSAT <= 2.0)',
          'First-Response SLA Risk Flagging (Response Time >= 4.8h)',
          'Critical Escalation Stagnation Monitor'
        ]
      });
    } catch (err: any) {
      console.error('[API /api/anomalies] Error:', err);
      res.status(500).json({ error: 'Failed to detect anomalies', message: err.message });
    }
  });

  // 4. Tickets Endpoint (Queryable, filterable, paginated)
  app.get('/api/tickets', (req, res) => {
    try {
      let list = dataStore.getAllTickets();
      const { category, priority, status, agent, search, page = '1', limit = '50', sort_by, sort_order = 'asc' } = req.query;

      if (category && typeof category === 'string') {
        list = list.filter(t => t.category.toLowerCase() === category.toLowerCase());
      }
      if (priority && typeof priority === 'string') {
        list = list.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
      }
      if (status && typeof status === 'string') {
        list = list.filter(t => t.status.toLowerCase() === status.toLowerCase());
      }
      if (agent && typeof agent === 'string') {
        list = list.filter(t => t.agent_id.toLowerCase() === agent.toLowerCase());
      }
      if (search && typeof search === 'string') {
        const s = search.toLowerCase();
        list = list.filter(t => 
          t.ticket_id.toLowerCase().includes(s) ||
          t.issue_summary.toLowerCase().includes(s) ||
          t.agent_id.toLowerCase().includes(s)
        );
      }

      // Sorting
      if (sort_by && typeof sort_by === 'string') {
        const order = sort_order === 'desc' ? -1 : 1;
        list.sort((a: any, b: any) => {
          const valA = a[sort_by];
          const valB = b[sort_by];
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * order;
          }
          return String(valA).localeCompare(String(valB)) * order;
        });
      }

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;
      const totalFiltered = list.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = list.slice(startIndex, startIndex + limitNum);

      res.json({
        total: totalFiltered,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(totalFiltered / limitNum),
        tickets: paginated
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve tickets', message: err.message });
    }
  });

  // 5. Dataset Summary & KPI Metrics
  app.get('/api/summary', (req, res) => {
    try {
      const summary = dataStore.getSummary();
      const anomalies = anomalyEngine.detectAnomalies();
      summary.anomaly_count = anomalies.length;
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve summary', message: err.message });
    }
  });

  // 6. CSV Data Ingestion Endpoint
  app.post('/api/ingest', (req, res) => {
    try {
      const csvContent = req.body.csv || req.body.content;
      if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({ error: 'Missing "csv" string payload in body.' });
      }

      const result = dataStore.ingestNewCSV(csvContent);
      if (result.success) {
        res.json({
          status: 'success',
          message: result.message,
          rows_ingested: result.count
        });
      } else {
        res.status(400).json({ status: 'error', message: result.message });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to ingest data', message: err.message });
    }
  });

  // 7. Automated Test Suite Runner (Unique Website Testing feature)
  app.get('/api/test-suite', async (req, res) => {
    try {
      const results = await assessmentTestSuite.runFullSuite();
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to execute test suite', message: err.message });
    }
  });

  app.post('/api/test-suite/run', async (req, res) => {
    try {
      const results = await assessmentTestSuite.runFullSuite();
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to execute test suite', message: err.message });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TicketPulse] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
