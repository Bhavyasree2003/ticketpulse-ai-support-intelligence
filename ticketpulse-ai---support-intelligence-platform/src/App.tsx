import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewMetrics } from './components/OverviewMetrics';
import { NLQueryPanel } from './components/NLQueryPanel';
import { MultiTurnChatbot } from './components/MultiTurnChatbot';
import { AnomalyRadar } from './components/AnomalyRadar';
import { TicketExplorer } from './components/TicketExplorer';
import { TestSuitePanel } from './components/TestSuitePanel';
import { ApiDocsPanel } from './components/ApiDocsModal';
import { IngestModal } from './components/IngestModal';
import { DatasetSummary, AnomalyItem, NLQueryResult } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'query' | 'chat' | 'anomalies' | 'tickets' | 'tests' | 'api'>('overview');
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(true);
  const [isLlmActive, setIsLlmActive] = useState(true);

  // NL Query State
  const [currentQueryResult, setCurrentQueryResult] = useState<NLQueryResult | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  // Ingest Modal
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  // Ticket Explorer jump search
  const [ticketSearchFilter, setTicketSearchFilter] = useState('');

  const loadData = async () => {
    setIsLoadingSummary(true);
    setIsLoadingAnomalies(true);

    try {
      // 1. Fetch Summary
      const summaryRes = await fetch('/api/summary');
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      // 2. Fetch Health & LLM Status
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setIsLlmActive(healthData.llm_engine?.gemini_api_key_configured || false);
      }

      // 3. Fetch Anomalies
      const anomRes = await fetch('/api/anomalies');
      if (anomRes.ok) {
        const anomData = await anomRes.json();
        setAnomalies(anomData.anomalies || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingSummary(false);
      setIsLoadingAnomalies(false);
    }
  };

  useEffect(() => {
    loadData();
    // Default execute sample query 1 so the user sees results immediately
    handleExecuteQuery('How many tickets are currently open?');
  }, []);

  const handleExecuteQuery = async (queryText: string): Promise<NLQueryResult | null> => {
    setIsQueryLoading(true);
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });

      if (res.ok) {
        const data: NLQueryResult = await res.json();
        setCurrentQueryResult(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error executing query:', err);
      return null;
    } finally {
      setIsQueryLoading(false);
    }
  };

  const handleSelectTicketFromAnomaly = (ticketId: string) => {
    setTicketSearchFilter(ticketId);
    setActiveTab('tickets');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenIngest={() => setIsIngestOpen(true)}
        isLlmActive={isLlmActive}
        ticketCount={summary?.total_tickets || 500}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewMetrics
            summary={summary}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectAgent={(agentId) => {
              setTicketSearchFilter(agentId);
              setActiveTab('tickets');
            }}
          />
        )}

        {activeTab === 'query' && (
          <NLQueryPanel
            onExecuteQuery={handleExecuteQuery}
            currentResult={currentQueryResult}
            isLoading={isQueryLoading}
          />
        )}

        {activeTab === 'chat' && (
          <MultiTurnChatbot
            onSelectTicket={(ticketId) => {
              setTicketSearchFilter(ticketId);
              setActiveTab('tickets');
            }}
          />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyRadar
            anomalies={anomalies}
            isLoading={isLoadingAnomalies}
            onSelectTicket={handleSelectTicketFromAnomaly}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketExplorer initialSearch={ticketSearchFilter} />
        )}

        {activeTab === 'tests' && (
          <TestSuitePanel />
        )}

        {activeTab === 'api' && (
          <ApiDocsPanel />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            TicketPulse AI — Technical Assessment Submission for DOTMappers IT Pvt. Ltd. (AI Engineer Sprint)
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Node.js / Express + Python FastAPI | Gemini 3.8 Flash | 500 Dataset Records
          </span>
        </div>
      </footer>

      {/* Ingest Modal */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onIngestSuccess={() => {
          loadData();
          handleExecuteQuery('How many tickets are currently open?');
        }}
      />
    </div>
  );
}
