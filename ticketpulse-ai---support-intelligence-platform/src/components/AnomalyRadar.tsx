import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Filter, 
  CheckCircle, 
  Star, 
  ArrowUpRight, 
  Flame,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { AnomalyItem } from '../types';

interface AnomalyRadarProps {
  anomalies: AnomalyItem[];
  isLoading: boolean;
  onSelectTicket?: (ticketId: string) => void;
}

export const AnomalyRadar: React.FC<AnomalyRadarProps> = ({
  anomalies,
  isLoading,
  onSelectTicket
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(a => {
      if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
      if (selectedType !== 'ALL' && a.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.ticket_id.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.ticket.agent_id.toLowerCase().includes(q) ||
          a.ticket.issue_summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [anomalies, selectedSeverity, selectedType, searchQuery]);

  const stats = useMemo(() => {
    const critical = anomalies.filter(a => a.severity === 'Critical').length;
    const high = anomalies.filter(a => a.severity === 'High').length;
    const medium = anomalies.filter(a => a.severity === 'Medium').length;
    const resolOutliers = anomalies.filter(a => a.type === 'RESOLUTION_OUTLIER').length;
    const slaBreaches = anomalies.filter(a => a.type === 'UNRESOLVED_SLA_BREACH').length;
    const lowCsat = anomalies.filter(a => a.type === 'LOW_RATING_INCIDENT').length;
    return { critical, high, medium, resolOutliers, slaBreaches, lowCsat };
  }, [anomalies]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Running anomaly detection algorithms across 500 support tickets...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center space-x-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Detection Engine Active</span>
              </span>
              <span className="text-xs text-slate-400">
                Multi-factor: Statistical 2-Sigma + SLA Rule Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Operational Anomaly Radar ({anomalies.length} Flagged)</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Identifies severe resolution duration outliers, active SLA breaches exceeding 24 hours on High/Critical tickets, customer dissatisfaction incidents (CSAT ≤ 2), and stalled escalations.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap gap-2 text-xs font-mono shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>{stats.critical} Critical</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-orange-950/50 border border-orange-800 text-orange-300">
              <span>{stats.high} High</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-blue-950/50 border border-blue-800 text-blue-300">
              <span>{stats.resolOutliers} Dur. Outliers</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-purple-950/50 border border-purple-800 text-purple-300">
              <span>{stats.slaBreaches} SLA Breaches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, agent, or summary keyword..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Severity selector */}
          <div className="flex items-center space-x-1 overflow-x-auto text-xs">
            <span className="text-slate-400 text-[11px] mr-1 uppercase font-semibold">Severity:</span>
            {['ALL', 'Critical', 'High', 'Medium'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedSeverity === sev
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Anomaly Type Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs pt-1 border-t border-slate-800">
          <span className="text-slate-400 text-[11px] uppercase font-semibold mr-1 flex items-center">
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            Type:
          </span>
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'RESOLUTION_OUTLIER', label: `Resolution Outliers (${stats.resolOutliers})` },
            { id: 'UNRESOLVED_SLA_BREACH', label: `SLA Breaches > 24h (${stats.slaBreaches})` },
            { id: 'LOW_RATING_INCIDENT', label: `CSAT Drops ≤ 2★ (${stats.lowCsat})` },
            { id: 'ESCALATED_STALLED', label: 'Stalled Escalations' },
            { id: 'RESPONSE_DELAY', label: 'Slow First Response' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                selectedType === type.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Anomalies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAnomalies.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">No anomalies matching current filter criteria.</p>
            <p className="text-xs mt-1">Try resetting the severity or category filter.</p>
          </div>
        ) : (
          filteredAnomalies.map((anom) => {
            const isCritical = anom.severity === 'Critical';
            const isHigh = anom.severity === 'High';

            return (
              <div
                key={anom.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between bg-slate-900/80 backdrop-blur-sm ${
                  isCritical
                    ? 'border-rose-900/60 hover:border-rose-700/80 bg-gradient-to-b from-rose-950/20 to-slate-900/90 shadow-lg shadow-rose-950/10'
                    : isHigh
                    ? 'border-orange-900/50 hover:border-orange-700/70 bg-gradient-to-b from-orange-950/10 to-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {anom.ticket_id}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400 font-mono">
                          Agent: {anom.ticket.agent_id}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">
                          {anom.ticket.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mt-1">
                        {anom.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-600 text-white'
                          : isHigh
                          ? 'bg-orange-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {anom.severity}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {anom.description}
                  </p>

                  {/* Metric vs Threshold Box */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Observed Metric</span>
                      <span className="font-bold text-amber-400">{anom.metric_value}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">SLA Threshold</span>
                      <span className="text-slate-300">{anom.threshold}</span>
                    </div>
                  </div>

                  {/* Operational Recommendation */}
                  <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/30 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1">
                      <Info className="w-3 h-3" />
                      <span>Recommended Operational Action</span>
                    </span>
                    <p className="text-xs text-blue-200 leading-normal">
                      {anom.recommendation}
                    </p>
                  </div>
                </div>

                {/* Ticket details summary footer */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-xs font-mono text-slate-400">
                    Created: {anom.ticket.created_at} | Status: {anom.ticket.status}
                  </span>
                  {onSelectTicket && (
                    <button
                      onClick={() => onSelectTicket(anom.ticket_id)}
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-medium"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
