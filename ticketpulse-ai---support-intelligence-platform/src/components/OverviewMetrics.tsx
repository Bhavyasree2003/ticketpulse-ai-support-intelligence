import React from 'react';
import { 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Star, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { DatasetSummary } from '../types';

interface OverviewMetricsProps {
  summary: DatasetSummary | null;
  onNavigateTab: (tab: 'query' | 'chat' | 'anomalies' | 'tickets' | 'tests') => void;
  onSelectAgent?: (agentId: string) => void;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  summary,
  onNavigateTab,
  onSelectAgent
}) => {
  if (!summary) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading dataset metrics...
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Tickets',
      value: summary.total_tickets.toLocaleString(),
      subtext: `Spanning ${summary.date_range.min_date.split(' ')[0]} to ${summary.date_range.max_date.split(' ')[0]}`,
      icon: TicketIcon,
      color: 'from-blue-600 to-indigo-600',
      badge: '100% Ingested'
    },
    {
      title: 'Open Queue',
      value: summary.open_tickets.toLocaleString(),
      subtext: `${((summary.open_tickets / summary.total_tickets) * 100).toFixed(1)}% of total queue`,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      badge: 'Active Work'
    },
    {
      title: 'Resolved Tickets',
      value: summary.resolved_tickets.toLocaleString(),
      subtext: `${summary.resolution_rate_percent}% resolution success rate`,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      badge: `${summary.resolution_rate_percent}% Rate`
    },
    {
      title: 'Escalated Cases',
      value: summary.escalated_tickets.toLocaleString(),
      subtext: 'High-touch cases requiring Tier 2/3',
      icon: AlertOctagon,
      color: 'from-rose-500 to-red-600',
      badge: 'Escalated'
    },
    {
      title: 'Avg First Response',
      value: `${summary.avg_response_time_hrs}h`,
      subtext: 'Across all ticket categories',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-600',
      badge: 'SLA Target < 2.0h'
    },
    {
      title: 'Avg Resolution Time',
      value: `${summary.avg_resolution_time_hrs}h`,
      subtext: 'Turnaround on completed tickets',
      icon: Clock,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Mean Duration'
    },
    {
      title: 'Customer Satisfaction',
      value: `${summary.avg_customer_rating} / 5`,
      subtext: 'Average rating from resolved cases',
      icon: Star,
      color: 'from-amber-400 to-yellow-600',
      badge: 'CSAT'
    },
    {
      title: 'Flagged Anomalies',
      value: summary.anomaly_count.toLocaleString(),
      subtext: 'SLA breaches & resolution outliers',
      icon: AlertTriangle,
      color: 'from-red-600 to-rose-700',
      badge: 'Requires Review',
      highlight: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Alert / Action bar */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-800/40 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                Dataset Live
              </span>
              <span className="text-xs text-slate-400">
                500 support tickets analyzed with Gemini 3.8 Flash & Anomaly Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Executive Support Operations Intelligence
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Ask natural language questions to query tickets in real-time, inspect statistical turnaround outliers, and explore SLA compliance across 12 support agents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('chat')}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center space-x-2"
            >
              <span>AI Chatbot (Multi-Turn)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('query')}
              className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center space-x-2"
            >
              <span>Single NL Query</span>
            </button>
            <button
              onClick={() => onNavigateTab('anomalies')}
              className="px-4 py-2 text-sm font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Inspect Anomalies</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-xl border transition-all bg-slate-900/60 backdrop-blur-sm ${
                kpi.highlight
                  ? 'border-amber-500/40 hover:border-amber-500/60 shadow-lg shadow-amber-500/5 cursor-pointer'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => {
                if (kpi.highlight) onNavigateTab('anomalies');
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {kpi.badge}
                </span>
              </div>
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                  {kpi.value}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{kpi.subtext}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Distribution & Categorization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Category Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">500 Total</span>
          </div>
          <div className="space-y-3">
            {Object.entries(summary.category_breakdown).map(([cat, count]) => {
              const pct = ((count / summary.total_tickets) * 100).toFixed(1);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{cat}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat === 'Technical'
                          ? 'bg-blue-500'
                          : cat === 'Billing'
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Priority Urgency Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-mono">SLA Tiers</span>
          </div>
          <div className="space-y-3">
            {Object.entries(summary.priority_breakdown).map(([pri, count]) => {
              const pct = ((count / summary.total_tickets) * 100).toFixed(1);
              const color =
                pri === 'Critical'
                  ? 'bg-rose-500'
                  : pri === 'High'
                  ? 'bg-orange-500'
                  : pri === 'Medium'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

              return (
                <div key={pri} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{pri}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Queue Status Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-mono">Workflow States</span>
          </div>
          <div className="space-y-3">
            {Object.entries(summary.status_breakdown).map(([status, count]) => {
              const pct = ((count / summary.total_tickets) * 100).toFixed(1);
              const color =
                status === 'Resolved'
                  ? 'bg-emerald-500'
                  : status === 'Open'
                  ? 'bg-blue-500'
                  : 'bg-red-500';

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{status}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent Performance Leaderboard */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Agent Performance & CSAT Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative turnaround and customer satisfaction across 12 support specialists
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('tickets')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Agent ID</th>
                <th className="py-3 px-4">Assigned</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Open</th>
                <th className="py-3 px-4">Escalated</th>
                <th className="py-3 px-4">Avg CSAT Rating</th>
                <th className="py-3 px-4">Avg Resolution</th>
                <th className="py-3 px-4">Avg First Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {summary.agent_rankings.map((agent, i) => (
                <tr 
                  key={agent.agent_id} 
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-slate-700">
                      {i + 1}
                    </span>
                    <span>{agent.agent_id}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">{agent.total_assigned}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{agent.resolved_count}</td>
                  <td className="py-3 px-4 font-mono text-amber-400">{agent.open_count}</td>
                  <td className="py-3 px-4 font-mono text-rose-400">{agent.escalated_count}</td>
                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className={agent.avg_rating && agent.avg_rating >= 3.8 ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                        {agent.avg_rating !== null ? agent.avg_rating : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {agent.avg_resolution_hrs !== null ? `${agent.avg_resolution_hrs}h` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {agent.avg_response_hrs}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
