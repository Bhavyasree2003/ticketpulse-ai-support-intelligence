import fs from 'fs';
import path from 'path';
import { Ticket, DatasetSummary, AgentMetric } from '../src/types';

class TicketDataStore {
  private tickets: Ticket[] = [];
  private csvPath: string = path.join(process.cwd(), 'support_tickets.csv');

  constructor() {
    this.loadData();
  }

  public parseCSV(content: string): Ticket[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const records: Ticket[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted commas properly
      const tokens: string[] = [];
      let currentToken = '';
      let insideQuote = false;

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          tokens.push(currentToken.trim().replace(/^"|"$/g, ''));
          currentToken = '';
        } else {
          currentToken += char;
        }
      }
      tokens.push(currentToken.trim().replace(/^"|"$/g, ''));

      if (tokens.length < headers.length) {
        // Pad if empty trailing fields
        while (tokens.length < headers.length) {
          tokens.push('');
        }
      }

      const rawTicket: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rawTicket[h] = tokens[idx] || '';
      });

      const responseTime = parseFloat(rawTicket['response_time_hrs'] || rawTicket['resp_time_hrs'] || '0');
      const resolStr = rawTicket['resolution_time_hrs'] || rawTicket['resol_time_hrs'] || '';
      const resolutionTime = resolStr ? parseFloat(resolStr) : null;
      const ratingStr = rawTicket['customer_rating'] || rawTicket['cust_rating'] || '';
      const customerRating = ratingStr ? parseInt(ratingStr, 10) : null;

      const ticket: Ticket = {
        ticket_id: rawTicket['ticket_id'] || `TKT-${i.toString().padStart(3, '0')}`,
        created_at: rawTicket['created_at'] || '',
        category: (rawTicket['category'] as any) || 'General',
        priority: (rawTicket['priority'] as any) || 'Low',
        status: (rawTicket['status'] as any) || 'Open',
        response_time_hrs: isNaN(responseTime) ? 0 : responseTime,
        resolution_time_hrs: resolutionTime !== null && !isNaN(resolutionTime) ? resolutionTime : null,
        agent_id: rawTicket['agent_id'] || 'Unassigned',
        customer_rating: customerRating !== null && !isNaN(customerRating) ? customerRating : null,
        issue_summary: rawTicket['issue_summary'] || 'No summary provided'
      };

      records.push(ticket);
    }

    return records;
  }

  public loadData(): boolean {
    try {
      if (fs.existsSync(this.csvPath)) {
        const content = fs.readFileSync(this.csvPath, 'utf-8');
        this.tickets = this.parseCSV(content);
        console.log(`[DataStore] Loaded ${this.tickets.length} support tickets from ${this.csvPath}`);
        return true;
      } else {
        console.warn(`[DataStore] CSV not found at ${this.csvPath}`);
        return false;
      }
    } catch (err) {
      console.error(`[DataStore] Failed to read CSV:`, err);
      return false;
    }
  }

  public ingestNewCSV(csvContent: string): { success: boolean; count: number; message: string } {
    try {
      const parsed = this.parseCSV(csvContent);
      if (parsed.length === 0) {
        return { success: false, count: 0, message: 'No valid ticket records found in CSV' };
      }
      this.tickets = parsed;
      fs.writeFileSync(this.csvPath, csvContent, 'utf-8');
      return { success: true, count: parsed.length, message: `Successfully ingested ${parsed.length} tickets` };
    } catch (err: any) {
      return { success: false, count: 0, message: err.message || 'Error ingesting CSV' };
    }
  }

  public getAllTickets(): Ticket[] {
    return [...this.tickets];
  }

  public getSummary(): DatasetSummary {
    const total = this.tickets.length;
    let openCount = 0;
    let resolvedCount = 0;
    let escalatedCount = 0;

    let sumResponse = 0;
    let sumResolution = 0;
    let countResolution = 0;
    let sumRating = 0;
    let countRating = 0;

    const categoryBreakdown: Record<string, number> = {};
    const priorityBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};

    const agentMap: Record<string, {
      total: number;
      resolved: number;
      open: number;
      escalated: number;
      ratingSum: number;
      ratingCount: number;
      resolSum: number;
      resolCount: number;
      respSum: number;
    }> = {};

    let minDate = '';
    let maxDate = '';

    for (const t of this.tickets) {
      // Dates
      if (t.created_at) {
        if (!minDate || t.created_at < minDate) minDate = t.created_at;
        if (!maxDate || t.created_at > maxDate) maxDate = t.created_at;
      }

      // Status
      statusBreakdown[t.status] = (statusBreakdown[t.status] || 0) + 1;
      if (t.status === 'Open') openCount++;
      else if (t.status === 'Resolved') resolvedCount++;
      else if (t.status === 'Escalated') escalatedCount++;

      // Category
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + 1;

      // Priority
      priorityBreakdown[t.priority] = (priorityBreakdown[t.priority] || 0) + 1;

      // Metrics
      sumResponse += t.response_time_hrs;
      if (t.resolution_time_hrs !== null) {
        sumResolution += t.resolution_time_hrs;
        countResolution++;
      }
      if (t.customer_rating !== null) {
        sumRating += t.customer_rating;
        countRating++;
      }

      // Agent
      if (!agentMap[t.agent_id]) {
        agentMap[t.agent_id] = {
          total: 0,
          resolved: 0,
          open: 0,
          escalated: 0,
          ratingSum: 0,
          ratingCount: 0,
          resolSum: 0,
          resolCount: 0,
          respSum: 0
        };
      }
      const a = agentMap[t.agent_id];
      a.total++;
      if (t.status === 'Resolved') a.resolved++;
      else if (t.status === 'Open') a.open++;
      else if (t.status === 'Escalated') a.escalated++;

      a.respSum += t.response_time_hrs;
      if (t.resolution_time_hrs !== null) {
        a.resolSum += t.resolution_time_hrs;
        a.resolCount++;
      }
      if (t.customer_rating !== null) {
        a.ratingSum += t.customer_rating;
        a.ratingCount++;
      }
    }

    const agentRankings: AgentMetric[] = Object.keys(agentMap).map(agent_id => {
      const a = agentMap[agent_id];
      return {
        agent_id,
        total_assigned: a.total,
        resolved_count: a.resolved,
        open_count: a.open,
        escalated_count: a.escalated,
        avg_rating: a.ratingCount > 0 ? parseFloat((a.ratingSum / a.ratingCount).toFixed(2)) : null,
        avg_resolution_hrs: a.resolCount > 0 ? parseFloat((a.resolSum / a.resolCount).toFixed(2)) : null,
        avg_response_hrs: parseFloat((a.respSum / a.total).toFixed(2))
      };
    }).sort((x, y) => y.resolved_count - x.resolved_count);

    return {
      total_tickets: total,
      open_tickets: openCount,
      resolved_tickets: resolvedCount,
      escalated_tickets: escalatedCount,
      avg_response_time_hrs: total > 0 ? parseFloat((sumResponse / total).toFixed(2)) : 0,
      avg_resolution_time_hrs: countResolution > 0 ? parseFloat((sumResolution / countResolution).toFixed(2)) : 0,
      avg_customer_rating: countRating > 0 ? parseFloat((sumRating / countRating).toFixed(2)) : 0,
      resolution_rate_percent: total > 0 ? parseFloat(((resolvedCount / total) * 100).toFixed(1)) : 0,
      category_breakdown: categoryBreakdown,
      priority_breakdown: priorityBreakdown,
      status_breakdown: statusBreakdown,
      total_agents: Object.keys(agentMap).length,
      agent_rankings: agentRankings,
      anomaly_count: 0, // Injected by anomalyEngine
      date_range: {
        min_date: minDate,
        max_date: maxDate
      }
    };
  }
}

export const dataStore = new TicketDataStore();
