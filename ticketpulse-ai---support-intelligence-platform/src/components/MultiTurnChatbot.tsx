import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  Database, 
  Cpu, 
  CheckCircle2, 
  HelpCircle,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChatMessage, ChatSession, NLQueryResult } from '../types';

interface MultiTurnChatbotProps {
  onSelectTicket?: (ticketId: string) => void;
}

const SAMPLE_STARTER_QUERIES = [
  'How many tickets are currently open?',
  'Which agent resolved the most tickets this month?',
  'Show me all Critical tickets not resolved within 12 hours.',
  'What is the average customer rating for Technical category tickets?',
  'Are there any anomalies in resolution times this week?',
  'Which agent has the lowest average customer rating?',
  'What are the main causes for tickets being escalated?'
];

export const MultiTurnChatbot: React.FC<MultiTurnChatbotProps> = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load chat sessions from Firestore
  const loadSessions = async () => {
    setIsSessionsLoading(true);
    try {
      const q = query(collection(db, 'chat_sessions'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      const loaded: ChatSession[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        loaded.push({
          id: docSnap.id,
          title: data.title || 'New Conversation',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });
      setSessions(loaded);

      // Select first session or create default
      if (loaded.length > 0) {
        if (!activeSessionId || !loaded.some(s => s.id === activeSessionId)) {
          setActiveSessionId(loaded[0].id);
        }
      } else {
        await createNewSession('Support Ticket Analysis');
      }
    } catch (err) {
      console.warn('Could not load Firestore chat sessions, falling back to local session:', err);
      // Local fallback session
      if (sessions.length === 0) {
        const fallbackSession: ChatSession = {
          id: 'local-session-1',
          title: 'Support Intelligence Session',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSessions([fallbackSession]);
        setActiveSessionId(fallbackSession.id);
      }
    } finally {
      setIsSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Load messages when activeSessionId changes
  useEffect(() => {
    if (!activeSessionId) return;

    const loadMessages = async () => {
      try {
        const msgQuery = query(
          collection(db, 'chat_sessions', activeSessionId, 'messages'),
          orderBy('createdAt', 'asc')
        );
        const snapshot = await getDocs(msgQuery);
        const loadedMsgs: ChatMessage[] = [];
        snapshot.forEach(d => {
          const m = d.data();
          loadedMsgs.push({
            id: d.id,
            role: m.role,
            text: m.text,
            createdAt: m.createdAt,
            queryResult: m.queryResult
          });
        });

        if (loadedMsgs.length > 0) {
          setMessages(loadedMsgs);
        } else {
          // Welcome greeting
          const welcome: ChatMessage = {
            id: 'welcome-msg',
            role: 'model',
            text: `Hello! I am your AI Support Intelligence Assistant powered by Gemini 3.8 Flash.\n\nI can analyze our 500 support tickets in real time, run multi-turn inquiries, audit agent SLA performance, and highlight resolution bottlenecks. How can I help you today?`,
            createdAt: new Date().toISOString()
          };
          setMessages([welcome]);
        }
      } catch (err) {
        console.warn('Using local in-memory message history:', err);
        setMessages([
          {
            id: 'welcome-msg',
            role: 'model',
            text: `Hello! I am your AI Support Intelligence Assistant powered by Gemini 3.8 Flash.\n\nI can analyze our 500 support tickets in real time, run multi-turn inquiries, audit agent SLA performance, and highlight resolution bottlenecks. How can I help you today?`,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    };

    loadMessages();
  }, [activeSessionId]);

  const createNewSession = async (customTitle?: string) => {
    const title = customTitle || 'New Ticket Investigation';
    const now = new Date().toISOString();
    try {
      const docRef = await addDoc(collection(db, 'chat_sessions'), {
        title,
        createdAt: now,
        updatedAt: now
      });
      const newSession: ChatSession = {
        id: docRef.id,
        title,
        createdAt: now,
        updatedAt: now
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([
        {
          id: 'welcome-new',
          role: 'model',
          text: `Starting a new investigation session. What aspect of the support queue or agent metrics would you like to explore?`,
          createdAt: now
        }
      ]);
    } catch (err) {
      console.warn('Error creating Firestore session:', err);
      const fallbackId = 'session-' + Date.now();
      const newSession: ChatSession = {
        id: fallbackId,
        title,
        createdAt: now,
        updatedAt: now
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(fallbackId);
    }
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'chat_sessions', sessionId));
    } catch (err) {
      console.warn('Failed to delete session in Firestore:', err);
    }
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputPrompt).trim();
    if (!queryText || isLoading) return;

    setInputPrompt('');
    const userMsgId = 'user-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: queryText,
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Save user message to Firestore
    if (activeSessionId) {
      try {
        await addDoc(collection(db, 'chat_sessions', activeSessionId, 'messages'), {
          role: 'user',
          text: queryText,
          createdAt: userMsg.createdAt
        });
        await updateDoc(doc(db, 'chat_sessions', activeSessionId), {
          updatedAt: new Date().toISOString(),
          title: messages.length <= 1 ? queryText.slice(0, 35) + (queryText.length > 35 ? '...' : '') : undefined
        });
      } catch (err) {
        console.warn('Failed to persist user message in Firestore:', err);
      }
    }

    // Build context history from previous turns for multi-turn conversational reasoning
    const historyPayload = messages
      .filter(m => m.id !== 'welcome-msg' && m.id !== 'welcome-new')
      .map(m => ({
        role: m.role,
        text: m.text
      }))
      .slice(-6); // Keep last 3 exchanges for sharp context window

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error('API server returned error ' + res.status);
      }

      const queryResult: NLQueryResult = await res.json();
      const modelMsgId = 'model-' + Date.now();
      const modelMsg: ChatMessage = {
        id: modelMsgId,
        role: 'model',
        text: queryResult.answer,
        createdAt: new Date().toISOString(),
        queryResult: queryResult
      };

      setMessages([...updatedMessages, modelMsg]);

      // Save model reply to Firestore
      if (activeSessionId) {
        try {
          await addDoc(collection(db, 'chat_sessions', activeSessionId, 'messages'), {
            role: 'model',
            text: queryResult.answer,
            createdAt: modelMsg.createdAt,
            queryResult: queryResult
          });
        } catch (err) {
          console.warn('Failed to persist assistant reply in Firestore:', err);
        }
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'model',
        text: `I encountered an issue processing your query: ${err.message}. Please try rephrasing or check network connectivity.`,
        createdAt: new Date().toISOString()
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDetails = (msgId: string) => {
    setExpandedDetails(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)] min-h-[640px]">
      {/* Left Column: Persistent Sessions Sidebar */}
      <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col p-4 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Chat Sessions</span>
          </div>
          <button
            id="new-chat-btn"
            onClick={() => createNewSession()}
            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-all flex items-center space-x-1 text-xs"
            title="Start a new chat session"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-semibold">New</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
          {isSessionsLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Loading history...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No saved sessions yet.
            </div>
          ) : (
            sessions.map(sess => (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                  activeSessionId === sess.id
                    ? 'bg-blue-600/20 border border-blue-500/40 text-white font-medium shadow-sm'
                    : 'bg-slate-950/40 hover:bg-slate-800/60 border border-transparent text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Bot className={`w-3.5 h-3.5 flex-shrink-0 ${activeSessionId === sess.id ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="truncate">{sess.title}</span>
                </div>
                <button
                  onClick={(e) => deleteSession(e, sess.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 rounded transition-opacity"
                  title="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Database Sync Info Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Firestore Sync Active</span>
          </span>
          <span>Multi-turn</span>
        </div>
      </div>

      {/* Right Column: Active Conversation Stream */}
      <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
        {/* Chat Stream Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Gemini 3.8 Flash Ticket Assistant</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                  Conversational Memory
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Maintains multi-turn context across queries with grounded 500-ticket SQL metrics
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>500 records</span>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl px-4 py-3.5 text-sm shadow-md space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Message Text */}
                <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                  {msg.text}
                </div>

                {/* Grounded Query Breakdown (If Model produced tabular/SQL data) */}
                {msg.queryResult && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1.5 font-mono">
                        <Cpu className="w-3 h-3 text-blue-400" />
                        <span>{msg.queryResult.model_used}</span>
                      </span>
                      <span className="font-mono flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{msg.queryResult.execution_time_ms} ms</span>
                      </span>
                    </div>

                    {/* Collapsible Technical Details (SQL + Matched Tickets) */}
                    <button
                      type="button"
                      onClick={() => toggleDetails(msg.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-300 transition-colors"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Database className="w-3 h-3 text-blue-400" />
                        <span>View SQL Plan & Records ({msg.queryResult.matching_records?.length || 0})</span>
                      </span>
                      {expandedDetails[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedDetails[msg.id] && (
                      <div className="space-y-3 pt-2 text-xs">
                        {/* SQL Plan */}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Deterministic Execution Plan:
                          </span>
                          <pre className="font-mono text-[11px] text-blue-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                            {msg.queryResult.sql_or_plan}
                          </pre>
                        </div>

                        {/* Summary Badges */}
                        {Object.keys(msg.queryResult.data_summary || {}).length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(msg.queryResult.data_summary).map(([k, v]) => (
                              <div key={k} className="p-2 rounded bg-slate-900 border border-slate-800">
                                <span className="text-[9px] uppercase text-slate-400 block truncate">{k}</span>
                                <span className="font-bold text-white text-[11px]">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Matched Tickets Table Sample */}
                        {msg.queryResult.matching_records && msg.queryResult.matching_records.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                                <TableIcon className="w-3 h-3 text-blue-400" />
                                <span>Matched Ticket Records (Sample):</span>
                              </span>
                            </div>
                            <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900">
                              <table className="w-full text-left text-[11px] text-slate-300">
                                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800 sticky top-0">
                                  <tr>
                                    <th className="py-1.5 px-2">ID</th>
                                    <th className="py-1.5 px-2">Pri</th>
                                    <th className="py-1.5 px-2">Status</th>
                                    <th className="py-1.5 px-2">Agent</th>
                                    <th className="py-1.5 px-2">Issue</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                  {msg.queryResult.matching_records.slice(0, 5).map(t => (
                                    <tr key={t.ticket_id} className="hover:bg-slate-800/40">
                                      <td className="py-1 px-2 font-mono font-bold text-white">{t.ticket_id}</td>
                                      <td className="py-1 px-2 text-[10px]">{t.priority}</td>
                                      <td className="py-1 px-2 text-[10px]">{t.status}</td>
                                      <td className="py-1 px-2 font-mono text-[10px] text-slate-400">{t.agent_id}</td>
                                      <td className="py-1 px-2 truncate max-w-xs">{t.issue_summary}</td>
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
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-slate-400 ml-2">Reasoning over 500 support records with Gemini 3.8 Flash...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Follow-up Prompts */}
        <div className="px-6 py-2 bg-slate-950/50 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap flex items-center space-x-1">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>Try:</span>
          </span>
          {SAMPLE_STARTER_QUERIES.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(sq)}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-[11px] text-slate-300 whitespace-nowrap transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              id="multi-turn-chat-input"
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask a question or follow-up (e.g., 'Now filter those by Critical priority', 'Which agent handled TKT-108?')"
              className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 transition-all"
            />
            <button
              id="multi-turn-chat-send-btn"
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shadow-md"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
