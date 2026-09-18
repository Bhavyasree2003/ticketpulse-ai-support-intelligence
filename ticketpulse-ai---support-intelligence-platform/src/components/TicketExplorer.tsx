import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X, 
  Download,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Ticket } from '../types';

interface TicketExplorerProps {
  initialSearch?: string;
}

export const TicketExplorer: React.FC<TicketExplorerProps> = ({ initialSearch = '' }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [agent, setAgent] = useState('ALL');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected Ticket for detail modal
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (category !== 'ALL') params.append('category', category);
      if (priority !== 'ALL') params.append('priority', priority);
      if (status !== 'ALL') params.append('status', status);
      if (agent !== 'ALL') params.append('agent', agent);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      if (data && data.tickets) {
        setTickets(data.tickets);
        setTotalTickets(data.total);
        setTotalPages(data.total_pages);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, category, priority, status, agent, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const handleExportCSV = () => {
    window.location.href = '/support_tickets.csv';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Support Ticket Explorer
            </h2>
            <p className="text-xs text-slate-400">
              Query, filter, and inspect all {totalTickets} support tickets in real-time
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center space-x-1.5 transition-all self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV (500 Rows)</span>
          </button>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Search Query */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, issue summary..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg text-xs text-white placeholder-slate-500"
            />
          </form>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Response</th>
                <th className="py-3 px-4">Resolution</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Issue Summary</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No tickets found matching the specified filters.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {t.ticket_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {t.created_at}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-200">{t.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.priority === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : t.priority === 'High'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : t.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : t.status === 'Open'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{t.agent_id}</td>
                    <td className="py-3 px-4 font-mono">{t.response_time_hrs}h</td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {t.resolution_time_hrs !== null ? (
                        <span className={t.resolution_time_hrs > 65 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                          {t.resolution_time_hrs}h
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {t.customer_rating !== null ? (
                        <span className="text-amber-400 font-semibold">{t.customer_rating} ★</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={t.issue_summary}>
                      {t.issue_summary}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="View Ticket Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-mono">{tickets.length}</span> of{' '}
            <span className="text-white font-mono">{totalTickets}</span> tickets
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white font-mono">{selectedTicket.ticket_id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  selectedTicket.priority === 'Critical'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {selectedTicket.priority} Priority
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block uppercase font-mono text-[10px]">Issue Summary</span>
                <p className="text-sm font-semibold text-white mt-0.5">{selectedTicket.issue_summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Category</span>
                  <span className="text-slate-200">{selectedTicket.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Assigned Agent</span>
                  <span className="text-slate-200">{selectedTicket.agent_id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Current Status</span>
                  <span className="text-slate-200">{selectedTicket.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Created Timestamp</span>
                  <span className="text-slate-200">{selectedTicket.created_at}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">First Response</span>
                  <span className="text-slate-200">{selectedTicket.response_time_hrs} hours</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Resolution Time</span>
                  <span className="text-slate-200">{selectedTicket.resolution_time_hrs !== null ? `${selectedTicket.resolution_time_hrs} hours` : 'Pending'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Customer Rating</span>
                  <span className="text-amber-400">{selectedTicket.customer_rating !== null ? `${selectedTicket.customer_rating} / 5 Stars` : 'Unrated'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
