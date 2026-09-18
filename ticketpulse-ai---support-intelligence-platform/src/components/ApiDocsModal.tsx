import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Code2 } from 'lucide-react';

export const ApiDocsPanel: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/health',
      description: 'Verifies API status, dataset row count, uptime, and Gemini LLM connection state.',
      curl: 'curl -s http://localhost:3000/api/health',
      response: `{
  "status": "ok",
  "service": "DOTMappers AI Ticket Intelligence API",
  "version": "1.0.0",
  "uptime_seconds": 320,
  "dataset": {
    "file": "support_tickets.csv",
    "total_tickets": 500,
    "open_tickets": 111,
    "resolved_tickets": 327,
    "escalated_tickets": 62,
    "agents_count": 12
  },
  "llm_engine": {
    "model": "gemini-3.8-flash",
    "status": "active_connected"
  }
}`
    },
    {
      method: 'POST',
      path: '/api/query',
      description: 'Answers natural language questions about the support ticket dataset using Gemini 3.8 Flash grounded in real data. Supports multi-turn conversational context via history.',
      curl: `curl -s -X POST http://localhost:3000/api/query \\
  -H "Content-Type: application/json" \\
  -d '{"query": "How many critical tickets are unresolved?", "history": [{"role": "user", "text": "Hello"}, {"role": "model", "text": "Hi, how can I help?"}]}'`,
      response: `{
  "query": "How many critical tickets are unresolved?",
  "answer": "There are 21 unresolved Critical priority tickets currently in Open or Escalated states requiring immediate Tier-3 response.",
  "sql_or_plan": "SELECT * FROM support_tickets WHERE priority = 'Critical' AND status IN ('Open', 'Escalated');",
  "data_summary": {
    "unresolved_count": 21,
    "open_count": 14,
    "escalated_count": 7
  },
  "execution_time_ms": 32,
  "model_used": "gemini-3.8-flash (Google GenAI SDK)"
}`
    },
    {
      method: 'GET',
      path: '/api/anomalies',
      description: 'Runs statistical 2-Sigma, IQR, and SLA rule-based anomaly detection algorithms to flag outliers and breaches.',
      curl: 'curl -s http://localhost:3000/api/anomalies',
      response: `{
  "total_anomalies": 196,
  "breakdown_by_severity": {
    "Critical": 62,
    "High": 76,
    "Medium": 58
  },
  "breakdown_by_type": {
    "UNRESOLVED_SLA_BREACH": 80,
    "ESCALATED_STALLED": 22,
    "RESOLUTION_OUTLIER": 18,
    "RESPONSE_DELAY": 29,
    "LOW_RATING_INCIDENT": 47
  }
}`
    },
    {
      method: 'GET',
      path: '/api/tickets',
      description: 'Queryable tickets endpoint with category, priority, status, agent, and search keyword filters.',
      curl: 'curl -s "http://localhost:3000/api/tickets?priority=Critical&status=Open&limit=10"',
      response: `{
  "total": 14,
  "page": 1,
  "limit": 10,
  "total_pages": 2,
  "tickets": [...]
}`
    },
    {
      method: 'GET',
      path: '/api/test-suite',
      description: 'Executes automated assessment test suite validating all 5 sample queries, anomaly thresholds, and API contracts.',
      curl: 'curl -s http://localhost:3000/api/test-suite',
      response: `{
  "total_tests": 10,
  "passed_tests": 10,
  "failed_tests": 0,
  "pass_rate": 100,
  "total_duration_ms": 12,
  "results": [...]
}`
    },
    {
      method: 'POST',
      path: '/api/ingest',
      description: 'Ingests new or updated CSV text and re-indexes the dataset in-memory.',
      curl: `curl -s -X POST http://localhost:3000/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{"csv": "ticket_id,created_at,category,priority,status,response_time_hrs,resolution_time_hrs,agent_id,customer_rating,issue_summary\\n..."}'`,
      response: `{
  "status": "success",
  "message": "Successfully ingested 500 tickets",
  "rows_ingested": 500
}`
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <span>REST API Documentation & cURL Playground</span>
        </h2>
        <p className="text-xs text-slate-400">
          All endpoints conform to standard JSON REST contracts. You can test directly via your terminal, Postman, or our frontend tabs.
        </p>
      </div>

      <div className="space-y-6">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  ep.method === 'POST' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono text-sm font-bold text-white">{ep.path}</span>
              </div>
              <span className="text-xs text-slate-400">{ep.description}</span>
            </div>

            {/* cURL Command Box */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>cURL Request:</span>
                <button
                  onClick={() => handleCopy(ep.curl, idx)}
                  className="hover:text-white flex items-center space-x-1"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                {ep.curl}
              </pre>
            </div>

            {/* Sample Response Box */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 block">Sample 200 OK Response:</span>
              <pre className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                {ep.response}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
