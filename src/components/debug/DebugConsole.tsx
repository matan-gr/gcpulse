import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, Server, X, Trash2, Play, Pause, Bug, Wifi, Cpu, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  details?: any;
}

interface NetworkRequest {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  type: 'fetch' | 'xhr';
}

export const DebugConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'network' | 'system'>('console');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const networkEndRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Capture Console Logs
  useEffect(() => {
    if (isPaused) return;

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (type: LogEntry['type'], args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      // Defer state update to avoid "Cannot update component while rendering"
      setTimeout(() => {
        setLogs(prev => [...prev.slice(-199), { // Keep last 200 logs
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          type,
          message,
          details: args.length > 1 ? args : undefined
        }]);
      }, 0);
    };

    console.log = (...args) => {
      addLog('log', args);
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warn', args);
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      addLog('error', args);
      originalError.apply(console, args);
    };

    console.info = (...args) => {
      addLog('info', args);
      originalInfo.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, [isPaused]);

  // Capture Fetch Requests
  useEffect(() => {
    if (isPaused) return;

    const originalFetch = window.fetch;
    let isIntercepted = false;

    try {
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : String(args[0]);
        const options = args[1] || {};
        const method = options.method || 'GET';
        const requestId = Math.random().toString(36).substr(2, 9);

        // Add pending request
        setTimeout(() => {
          setNetworkRequests(prev => [...prev.slice(-99), {
            id: requestId,
            timestamp: new Date(),
            method,
            url,
            type: 'fetch'
          }]);
        }, 0);

        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - startTime;
          
          // Update request with status
          setTimeout(() => {
            setNetworkRequests(prev => prev.map(req => 
              req.id === requestId 
                ? { ...req, status: response.status, duration } 
                : req
            ));
          }, 0);
          
          return response;
        } catch (error) {
          const duration = performance.now() - startTime;
          setTimeout(() => {
            setNetworkRequests(prev => prev.map(req => 
              req.id === requestId 
                ? { ...req, status: 0, duration } // 0 indicates network error
                : req
            ));
          }, 0);
          throw error;
        }
      };
      isIntercepted = true;
    } catch (e) {
      console.warn("DebugConsole: Failed to intercept window.fetch. Network logging disabled.", e);
    }

    return () => {
      if (isIntercepted) {
        try {
          window.fetch = originalFetch;
        } catch (e) {
          console.warn("DebugConsole: Failed to restore window.fetch", e);
        }
      }
    };
  }, [isPaused]);

  // Auto-scroll
  useEffect(() => {
    if (!isPaused && isOpen) {
        if (activeTab === 'console') logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (activeTab === 'network') networkEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, networkRequests, isOpen, activeTab, isPaused]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ y: 300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 300, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 h-[350px] bg-slate-950 border-t border-slate-800 shadow-2xl z-[100] flex flex-col font-mono text-sm"
    >
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <Bug size={16} />
            <span className="font-bold text-slate-200">DevOps Console</span>
          </div>
          
          <div className="h-4 w-px bg-slate-700" />

          <div className="flex space-x-1">
            <button 
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${activeTab === 'console' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              Console ({logs.length})
            </button>
            <button 
              onClick={() => setActiveTab('network')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${activeTab === 'network' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              Network
            </button>
            <button 
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${activeTab === 'system' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              System
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded hover:bg-slate-800 ${isPaused ? 'text-yellow-500' : 'text-slate-400'}`}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button 
            onClick={() => {
              if (activeTab === 'console') setLogs([]);
              if (activeTab === 'network') setNetworkRequests([]);
            }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400"
            title="Clear"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-slate-950 p-2 custom-scrollbar">
        {activeTab === 'console' && (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2 hover:bg-slate-900/50 p-1 rounded">
                <span className="text-slate-500 text-[10px] min-w-[70px]">{log.timestamp.toLocaleTimeString()}</span>
                <span className={`text-[10px] font-bold uppercase min-w-[50px] ${
                  log.type === 'error' ? 'text-red-500' : 
                  log.type === 'warn' ? 'text-yellow-500' : 
                  log.type === 'info' ? 'text-blue-400' : 'text-slate-300'
                }`}>
                  {log.type}
                </span>
                <span className={`break-all ${log.type === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}

        {activeTab === 'network' && (
          <div className="w-full text-left border-collapse">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 border-b border-slate-800 pb-2 mb-2 px-2">
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Method</div>
                <div className="col-span-6">URL</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2 text-right">Duration</div>
            </div>
            {networkRequests.map((req) => (
              <div key={req.id} className="grid grid-cols-12 gap-2 text-xs hover:bg-slate-900/50 p-1 rounded items-center">
                <div className={`col-span-1 font-bold ${
                    !req.status ? 'text-slate-500' :
                    req.status >= 400 ? 'text-red-500' : 
                    req.status >= 300 ? 'text-yellow-500' : 'text-emerald-500'
                }`}>
                  {req.status || '...'}
                </div>
                <div className="col-span-1 text-slate-300">{req.method}</div>
                <div className="col-span-6 text-slate-400 truncate" title={req.url}>{req.url}</div>
                <div className="col-span-2 text-slate-500">{req.timestamp.toLocaleTimeString()}</div>
                <div className="col-span-2 text-right text-slate-400">{req.duration ? `${Math.round(req.duration)}ms` : '-'}</div>
              </div>
            ))}
            <div ref={networkEndRef} />
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center"><Terminal size={14} className="mr-2" /> Environment</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Node Env:</span> <span>{process.env.NODE_ENV}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">API Key Present:</span> <span className={((window as any).ENV?.GEMINI_API_KEY || process.env.GEMINI_API_KEY) ? "text-emerald-500" : "text-red-500"}>{((window as any).ENV?.GEMINI_API_KEY || process.env.GEMINI_API_KEY) ? "Yes" : "No"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">User Agent:</span> <span className="truncate max-w-[200px]">{navigator.userAgent}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Platform:</span> <span>{navigator.platform}</span></div>
                </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center"><Activity size={14} className="mr-2" /> Performance</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Memory Limit:</span> <span>{(performance as any).memory?.jsHeapSizeLimit ? Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024) + ' MB' : 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total Heap:</span> <span>{(performance as any).memory?.totalJSHeapSize ? Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024) + ' MB' : 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Used Heap:</span> <span>{(performance as any).memory?.usedJSHeapSize ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + ' MB' : 'N/A'}</span></div>
                </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
