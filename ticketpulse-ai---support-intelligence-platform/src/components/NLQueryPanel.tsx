import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Sparkles, 
  Database, 
  Clock, 
  CheckCircle2, 
  Cpu, 
  Table as TableIcon,
  HelpCircle,
  Zap
} from 'lucide-react';
import { NLQueryResult, Ticket } from '../types';

interface NLQueryPanelProps {
  onExecuteQuery: (query: string) => Promise<NLQueryResult | null>;
  currentResult: NLQueryResult | null;
  isLoading: boolean;
}

const SAMPLE_QUERIES = [
  {
    category: 'Assessment Query 1',
    query: 'How many tickets are currently open?',
    description: 'Computes open status count and queue percentage'
  },
  {
    category: 'Assessment Query 2',
    query: 'Which agent resolved the most tickets this month?',
    description: 'Finds top performing support agent by completed resolution volume'
  },
  {
    category: 'Assessment Query 3',
    query: 'Show me all Critical tickets not resolved within 12 hours.',
    description: 'Filters Critical urgency tickets exceeding the 12-hour turnaround target'
  },
  {
    category: 'Assessment Query 4',
    query: 'What is the average customer rating for Technical category tickets?',
    description: 'Calculates CSAT score for technical troubleshooting tickets'
  },
  {
    category: 'Assessment Query 5',
    query: 'Are there any anomalies in resolution times this week?',
    description: 'Executes statistical Z-score and IQR outlier detection on turnaround times'
  },
  {
    category: 'Executive SLA',
    query: 'Which agent has the lowest average customer rating?',
    description: 'Identifies agents needing coaching or workflow improvements'
  },
  {
    category: 'Urgency Triage',
    query: 'How many critical tickets are unresolved?',
    description: 'Calculates active Critical tickets in Open or Escalated states'
  }
];

export const NLQueryPanel: React.FC<NLQueryPanelProps> = ({
  onExecuteQuery,
  currentResult,
  isLoading
}) => {
  const [inputQuery, setInputQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      onExecuteQuery(inputQuery.trim());
    }
  };

  const handleSelectSample = (sample: string) => {
    setInputQuery(sample);
    onExecuteQuery(sample);
  };

  return (
    <div className="space-y-6">
      {/* Header & Query Input Box */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Natural Language Query Intelligence</span>
            </h2>
            <p className="text-xs text-slate-400">
              Powered by Gemini 3.8 Flash & Grounded SQL/Filter Execution Engine
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Zero Hallucination Guarantee</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              id="nl-query-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about support tickets (e.g. 'How many critical tickets are unresolved?')"
              className="w-full pl-12 pr-28 py-3.5 bg-slate-950/70 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-white placeholder-slate-500 transition-all font-medium"
            />
            <button
              id="nl-query-submit-btn"
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="absolute right-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preset Sample Queries */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Click to test benchmark assessment queries:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSample(sq.query)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 hover:border-blue-500/50 text-xs text-slate-300 hover:text-white transition-all text-left flex items-center space-x-1.5 group"
                title={sq.description}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-cyan-400"></span>
                <span>{sq.query}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Result View */}
      {currentResult && (
        <div className="space-y-6">
          {/* Answer Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-blue-900/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Analysis & Synthesis</h3>
                  <p className="text-xs text-slate-400 font-mono">Query: "{currentResult.query}"</p>
                </div>
              </div>

              {/* Badges: Latency & Model */}
              <div className="flex items-center space-x-2 text-xs">
                <div className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center space-x-1 font-mono">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{currentResult.execution_time_ms} ms</span>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-blue-900/30 border border-blue-700/40 text-blue-300 flex items-center space-x-1 font-mono">
                  <Cpu className="w-3 h-3 text-blue-400" />
                  <span>{currentResult.model_used}</span>
                </div>
              </div>
            </div>

            {/* Answer Body */}
            <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              {currentResult.answer}
            </div>

            {/* Technical Execution Breakdown: Plan + Data Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              {/* Query Plan / SQL */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>Execution Plan / SQL</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">Grounded Filter</span>
                </div>
                <pre className="font-mono text-xs text-blue-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                  {currentResult.sql_or_plan}
                </pre>
              </div>

              {/* Data Summary Badges */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Aggregated Metrics</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">Key-Value Extract</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(currentResult.data_summary).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] uppercase text-slate-400 block truncate font-medium">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                        {typeof val === 'object' ? JSON.stringify(val).slice(0, 15) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Matched Records Table */}
          {currentResult.matching_records && currentResult.matching_records.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TableIcon className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">
                    Matching Ticket Records ({currentResult.matching_records.length} shown)
                  </h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Grounded from support_tickets.csv
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Ticket ID</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Agent</th>
                      <th className="py-2.5 px-3">Response</th>
                      <th className="py-2.5 px-3">Resolution</th>
                      <th className="py-2.5 px-3">Rating</th>
                      <th className="py-2.5 px-3">Issue Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {currentResult.matching_records.map((ticket) => (
                      <tr key={ticket.ticket_id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-white">{ticket.ticket_id}</td>
                        <td className="py-2.5 px-3">{ticket.category}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ticket.priority === 'Critical'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : ticket.priority === 'High'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : ticket.priority === 'Medium'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ticket.status === 'Resolved'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : ticket.status === 'Open'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{ticket.agent_id}</td>
                        <td className="py-2.5 px-3 font-mono">{ticket.response_time_hrs}h</td>
                        <td className="py-2.5 px-3 font-mono">
                          {ticket.resolution_time_hrs !== null ? `${ticket.resolution_time_hrs}h` : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">
                          {ticket.customer_rating !== null ? `${ticket.customer_rating} ★` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={ticket.issue_summary}>
                          {ticket.issue_summary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
