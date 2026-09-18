import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TestCaseResult, TestSuiteSummary } from '../types';

export const TestSuitePanel: React.FC = () => {
  const [suiteSummary, setSuiteSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const runSuite = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/test-suite/run', { method: 'POST' });
      const data = await res.json();
      setSuiteSummary(data);
    } catch (err) {
      console.error('Failed to run test suite:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runSuite();
  }, []);

  const filteredResults = suiteSummary?.results.filter(tc => {
    if (selectedCategory === 'ALL') return true;
    return tc.category === selectedCategory;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Test Suite Control Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated Quality Assurance</span>
              </span>
              <span className="text-xs text-slate-400">
                Live Verification & Benchmark Test Runner
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Assessment Test Runner & Verification Suite
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Simulates evaluator grading by executing all 5 assessment sample queries, testing edge cases, validating anomaly threshold math, and verifying REST API contracts.
            </p>
          </div>

          <button
            id="run-test-suite-btn"
            onClick={runSuite}
            disabled={isRunning}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all shrink-0 self-start md:self-auto"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running Test Cases...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Full Test Suite</span>
              </>
            )}
          </button>
        </div>

        {/* Scorecard Metrics Grid */}
        {suiteSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 font-mono block">Pass Rate</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {suiteSummary.pass_rate}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 font-mono block">Tests Passed</span>
              <span className="text-2xl font-bold font-mono text-white">
                {suiteSummary.passed_tests} / {suiteSummary.total_tests}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 font-mono block">Total Latency</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {suiteSummary.total_duration_ms} ms
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 font-mono block">Failed Tests</span>
              <span className={`text-2xl font-bold font-mono ${suiteSummary.failed_tests === 0 ? 'text-slate-400' : 'text-rose-400'}`}>
                {suiteSummary.failed_tests}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto text-xs pb-1">
        {['ALL', 'Sample Query', 'Core Requirement', 'Anomaly Detection', 'API Contract', 'Edge Case'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {filteredResults.map((tc) => {
          const isExpanded = expandedTestId === tc.id;
          const isPassed = tc.status === 'PASSED';

          return (
            <div
              key={tc.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isPassed
                  ? 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                  : 'border-rose-800 bg-rose-950/20'
              }`}
            >
              <div
                onClick={() => setExpandedTestId(isExpanded ? null : tc.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3">
                  <div className="shrink-0">
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{tc.id}</span>
                      <span className="text-xs font-semibold text-white">{tc.name}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {tc.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-lg sm:max-w-2xl">
                      Query: "{tc.query}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{tc.latency_ms} ms</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tc.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Collapsible Details Panel */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Expected Outcome</span>
                      <p className="text-slate-200">{tc.expected_outcome}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block font-mono">Actual System Output</span>
                      <p className="text-slate-200">{tc.actual_outcome}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-slate-300 font-mono text-[11px]">
                    <span className="font-bold text-blue-400 block mb-1">Verification Details:</span>
                    {tc.details}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
