import React, { useMemo } from 'react';
import { FeedItem } from '../types';
import { Sparkles, ShieldAlert, AlertOctagon, RefreshCw, CheckCircle2, ArrowRight, MessageSquare, Send, User, Bot, Lightbulb, TrendingUp, Target, Filter, Activity, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '../components/ui/Tooltip';
import { ContextSelectorModal } from '../components/ContextSelectorModal';
import { useGeminiAssistant } from '../hooks/useGeminiAssistant';
import { toast } from 'sonner';

interface GeminiAssistantViewProps {
  items: FeedItem[];
  userProfile?: { name: string; role: string };
}

export const GeminiAssistantView: React.FC<GeminiAssistantViewProps> = ({ items, userProfile = { name: 'Partner', role: 'TAM' } }) => {
  const {
    messages,
    input,
    setInput,
    loading,
    lastUpdated,
    messagesEndRef,
    isContextModalOpen,
    setIsContextModalOpen,
    manualContextIds,
    setManualContextIds,
    generateBriefing,
    handleSendMessage
  } = useGeminiAssistant(items);

  const handleExport = () => {
    if (messages.length === 0) {
      toast.error("No conversation to export.");
      return;
    }

    const content = messages.map(m => `[${m.timestamp.toLocaleString()}] ${m.role.toUpperCase()}:\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tam-assistant-export-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Conversation exported!");
  };

  const MarkdownComponents = useMemo(() => ({
    h1: ({...props}: any) => (
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-slate-700" {...props} />
    ),
    h2: ({...props}: any) => (
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4 flex items-center" {...props} />
    ),
    h3: ({...props}: any) => (
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-6 mb-3" {...props} />
    ),
    strong: ({...props}: any) => (
      <strong className="font-semibold text-slate-900 dark:text-white" {...props} />
    ),
    ul: ({...props}: any) => (
      <ul className="space-y-2 my-4 list-disc list-outside ml-5 text-slate-700 dark:text-slate-300" {...props} />
    ),
    ol: ({...props}: any) => (
      <ol className="space-y-2 my-4 list-decimal list-outside ml-5 text-slate-700 dark:text-slate-300" {...props} />
    ),
    li: ({...props}: any) => (
      <li className="leading-relaxed pl-1">{props.children}</li>
    ),
    blockquote: ({...props}: any) => (
      <blockquote className="pl-4 border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-800/50 py-3 pr-4 rounded-r my-6 text-slate-700 dark:text-slate-300 italic" {...props} />
    ),
    p: ({...props}: any) => (
      <p className="mb-4 leading-7 text-slate-700 dark:text-slate-300" {...props} />
    ),
    a: ({...props}: any) => (
      <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    code: ({node, inline, className, children, ...props}: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <div className="relative group my-4 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700 text-xs text-slate-400">
            <span className="font-mono font-medium">{match ? match[1] : 'code'}</span>
          </div>
          <pre className="p-4 overflow-x-auto custom-scrollbar">
            <code className={`font-mono text-sm text-slate-200 ${className}`} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ) : (
        <code className="font-mono text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700" {...props}>
          {children}
        </code>
      );
    },
    table: ({...props}: any) => (
      <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} />
      </div>
    ),
    thead: ({...props}: any) => (
      <thead className="bg-slate-50 dark:bg-slate-800" {...props} />
    ),
    th: ({...props}: any) => (
      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" {...props} />
    ),
    tbody: ({...props}: any) => (
      <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700" {...props} />
    ),
    tr: ({...props}: any) => (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" {...props} />
    ),
    td: ({...props}: any) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300" {...props} />
    ),
    hr: ({...props}: any) => (
      <hr className="my-8 border-slate-200 dark:border-slate-700" {...props} />
    ),
  }), []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            <Sparkles className="mr-3 text-purple-600 dark:text-purple-400" size={32} />
            TAM Assistant
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your personal AI analyst for Google Cloud strategy and operations.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400 font-medium hidden sm:inline mr-2">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            <Tooltip content="Filter Data Context" position="top">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsContextModalOpen(true)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  manualContextIds.length > 0 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Context</span>
                {manualContextIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                )}
              </motion.button>
            </Tooltip>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            <Tooltip content="Regenerate Briefing" position="top">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateBriefing}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Reset</span>
              </motion.button>
            </Tooltip>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            <Tooltip content="Export Conversation" position="top">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={messages.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Chat History */}
        <div className="lg:col-span-8 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative z-10">
            {messages.length === 0 && loading && (
               <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full animate-pulse"></div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-lg relative z-10">
                      <Sparkles size={48} className="text-purple-600 dark:text-purple-400 animate-bounce" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analyzing Ecosystem Data</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      I'm reviewing the latest updates, security bulletins, and deprecation notices to generate your briefing...
                    </p>
                  </div>
               </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    msg.role === 'model' 
                      ? 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200 dark:shadow-none'
                  }`}>
                    {msg.role === 'model' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  
                  <div className={`flex-1 max-w-[90%] rounded-2xl p-6 shadow-sm ${
                    msg.role === 'model'
                      ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200'
                      : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown components={msg.role === 'model' ? MarkdownComponents : undefined}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <div className={`text-[10px] mt-3 opacity-60 font-medium flex items-center justify-end ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && messages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-2 text-slate-400 ml-14">
                <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-medium animate-pulse">Thinking...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-20">
            <div className="relative flex items-center shadow-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                placeholder="Ask a follow-up question about the briefing..." 
                className="w-full pl-4 pr-12 py-4 bg-transparent border-none text-sm focus:ring-0 outline-none placeholder:text-slate-400"
                disabled={loading}
              />
              <button 
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center mt-2">
               <p className="text-[10px] text-slate-400">
                 AI can make mistakes. Verify important information.
               </p>
            </div>
          </div>
        </div>

        {/* Right Column: Key Stats / Quick Actions */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto custom-scrollbar pr-1">
          {/* Status Card */}
          <div className="card p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-t-4 border-t-purple-500 shadow-md">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Ecosystem Pulse</h3>
               <Activity size={16} className="text-purple-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-slate-800 dark:text-slate-100">Service Health</span>
                    <span className="text-xs text-slate-500">Global Status</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">Nominal</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-slate-800 dark:text-slate-100">Security Score</span>
                    <span className="text-xs text-slate-500">Threat Level</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">98/100</span>
              </div>
            </div>
          </div>

          <div className="card p-6 shadow-md border-t-4 border-t-blue-500">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Suggested Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={generateBriefing}
                disabled={loading}
                className="w-full text-left p-4 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="flex items-center relative z-10">
                  <Sparkles size={18} className="mr-3 text-yellow-300" />
                  <span className="truncate mr-2">Generate Weekly Briefing</span>
                </div>
                <ArrowRight size={16} className="text-white flex-shrink-0 relative z-10" />
              </button>
              {[
                { label: "Draft Customer Email", query: "Draft a general email to customers summarizing the top 3 updates this week.", icon: MessageSquare, color: "text-blue-500" },
                { label: "Identify Risks", query: "What are the top 3 risks I should warn my customers about?", icon: AlertOctagon, color: "text-red-500" },
                { label: "Strategic Opportunities", query: "What new features should I pitch to customers for modernization?", icon: Lightbulb, color: "text-yellow-500" },
                { label: "Deprecation Check", query: "List all deprecations effective in the next 90 days.", icon: TrendingUp, color: "text-orange-500" },
                { label: "Architecture Trends", query: "Summarize recent architecture center updates.", icon: Target, color: "text-emerald-500" },
              ].map((action, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(action.query)}
                  disabled={loading}
                  className="w-full text-left p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-between group hover:shadow-sm"
                >
                  <div className="flex items-center">
                    <div className={`p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 mr-3 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors`}>
                      <action.icon size={16} className={`${action.color}`} />
                    </div>
                    <span className="truncate mr-2">{action.label}</span>
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Context Info */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 text-xs text-blue-800 dark:text-blue-200 leading-relaxed shadow-sm">
            <div className="flex items-start">
              <div className="bg-blue-200 dark:bg-blue-800 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                <Sparkles size={10} className="text-blue-700 dark:text-blue-100" />
              </div>
              <span>
                <strong>Official Data Only:</strong> Insights are derived strictly from the {items.length} most recent official Google Cloud RSS feeds (Release Notes, Security Bulletins, Deprecations).
              </span>
            </div>
          </div>
        </div>
      </div>
      <ContextSelectorModal 
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        items={items}
        selectedIds={manualContextIds}
        onToggle={(id) => {
          setManualContextIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
          );
        }}
      />
    </div>
  );
};
