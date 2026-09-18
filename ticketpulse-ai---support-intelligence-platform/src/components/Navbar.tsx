import React from 'react';
import { 
  Bot, 
  Activity, 
  Search, 
  AlertTriangle, 
  Table, 
  CheckCircle2, 
  FileCode2, 
  UploadCloud,
  Terminal,
  MessageSquare
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'query' | 'chat' | 'anomalies' | 'tickets' | 'tests' | 'api';
  setActiveTab: (tab: 'overview' | 'query' | 'chat' | 'anomalies' | 'tickets' | 'tests' | 'api') => void;
  onOpenIngest: () => void;
  isLlmActive: boolean;
  ticketCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenIngest,
  isLlmActive,
  ticketCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  TicketPulse AI
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  DOTMappers Sprint
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous Support Ticket Intelligence & Anomaly Engine
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-overview-btn"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'overview'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              id="nav-query-btn"
              onClick={() => setActiveTab('query')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'query'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>NL Query</span>
            </button>

            <button
              id="nav-chat-btn"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-blue-300 border border-blue-400/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>AI Chatbot</span>
              <span className="px-1.5 py-0.2 bg-blue-500/30 text-blue-300 rounded text-[10px] font-bold uppercase">Multi-turn</span>
            </button>

            <button
              id="nav-anomalies-btn"
              onClick={() => setActiveTab('anomalies')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'anomalies'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Anomaly Radar</span>
            </button>

            <button
              id="nav-tickets-btn"
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'tickets'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Tickets ({ticketCount})</span>
            </button>

            <button
              id="nav-tests-btn"
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'tests'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Live Test Suite</span>
            </button>

            <button
              id="nav-api-btn"
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'api'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>REST API</span>
            </button>
          </nav>

          {/* Status badge & Quick Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isLlmActive ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
              <span className="font-mono text-[11px]">{isLlmActive ? 'Gemini 3.8 Flash' : 'Hybrid AI Engine'}</span>
            </div>

            <button
              id="upload-csv-btn"
              onClick={onOpenIngest}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors shadow-sm"
              title="Upload custom support_tickets.csv"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Ingest Data</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="md:hidden flex items-center justify-between pb-3 overflow-x-auto space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'query' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            NL Query
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'chat' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium' : 'text-slate-300'}`}
          >
            AI Chatbot (Multi-turn)
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'anomalies' ? 'bg-amber-500 text-slate-950 font-medium' : 'text-slate-300'}`}
          >
            Anomalies
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'tickets' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            Tickets
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'tests' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
          >
            Tests (10/10)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'api' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            API Docs
          </button>
        </div>
      </div>
    </header>
  );
};
