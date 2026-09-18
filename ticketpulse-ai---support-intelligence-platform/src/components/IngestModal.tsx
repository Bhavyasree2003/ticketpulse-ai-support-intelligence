import React, { useState } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle, FileText, RotateCcw } from 'lucide-react';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess: () => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({
  isOpen,
  onClose,
  onIngestSuccess
}) => {
  const [csvText, setCsvText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text || '');
      };
      reader.readAsText(file);
    }
  };

  const handleIngest = async () => {
    if (!csvText.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste CSV content or select a CSV file.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStatusMessage({ type: 'success', text: `Success: Ingested ${data.rows_ingested} tickets into memory.` });
        setTimeout(() => {
          onIngestSuccess();
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to ingest CSV.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error during ingestion' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Ingest Ticket Dataset</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Upload or paste a CSV with support ticket records. The system will parse columns, calculate statistical boundaries, and update LLM context immediately.
        </p>

        {/* File upload trigger */}
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-white flex items-center space-x-2 transition-all">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Choose CSV File</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <span className="text-xs text-slate-500">or paste raw CSV text below:</span>
        </div>

        {/* Textarea for CSV */}
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={`ticket_id,created_at,category,priority,status,response_time_hrs,resolution_time_hrs,agent_id,customer_rating,issue_summary\nTKT-001,2024-01-15 09:30,Technical,High,Resolved,2.5,8.0,AGT-01,4,"Database connection pool exhausted"`}
          rows={8}
          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        {statusMessage && (
          <div className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300' : 'bg-rose-950/50 border border-rose-800 text-rose-300'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleIngest}
            disabled={isSubmitting || !csvText.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-xs font-semibold text-white rounded-lg flex items-center space-x-2 shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Parsing CSV...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Ingest & Re-index</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
