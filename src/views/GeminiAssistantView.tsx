import React, { useMemo } from 'react';
import { FeedItem } from '../types';
import { Sparkles, ShieldAlert, AlertOctagon, RefreshCw, CheckCircle2, ArrowRight, MessageSquare, Send, User, Bot, Lightbulb, TrendingUp, Target, Filter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '../components/ui/Tooltip';
import { ContextSelectorModal } from '../components/ContextSelectorModal';
import { useGeminiAssistant } from '../hooks/useGeminiAssistant';

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

  const MarkdownComponents = useMemo(() => ({
    h1: ({...props}: any) => (
      <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 pb-4 border-b border-slate-200 dark:border-slate-700" {...props} />
    ),
    h2: ({...props}: any) => (
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3" {...props} />
    ),
    h3: ({...props}: any) => (
      <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-3" {...props} />
    ),
    strong: ({...props}: any) => (
      <strong className="font-bold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/40 px-1 py-0.5 rounded box-decoration-clone text-shadow-sm" {...props} />
    ),
    ul: ({...props}: any) => (
      <ul className="space-y-3 my-4" {...props} />
    ),
    li: ({...props}: any) => (
      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300 leading-relaxed p-1">
        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 shadow-sm" />
        <div className="flex-1">{props.children}</div>
      </li>
    ),
    blockquote: ({...props}: any) => (
      <div className="flex gap-4 p-5 my-6 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900 border-l-4 border-purple-500 rounded-r-xl shadow-sm">
        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
        <div className="text-slate-700 dark:text-slate-300 italic font-medium">{props.children}</div>
      </div>
    ),
    p: ({...props}: any) => (
      <p className="mb-4 leading-7 text-slate-600 dark:text-slate-300" {...props} />
    ),
    a: ({...props}: any) => (
      <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all" target="_blank" rel="noopener noreferrer" {...props} />
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
        
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          
          <button 
            onClick={() => setIsContextModalOpen(true)}
            className="btn btn-secondary flex items-center space-x-2 relative"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Context</span>
            {manualContextIds.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {manualContextIds.length}
              </span>
            )}
          </button>

          <Tooltip content="Regenerate Briefing" position="top">
            <button 
              onClick={generateBriefing}
              disabled={loading}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Chat History */}
        <div className="lg:col-span-8 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && loading && (
               <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                    <Sparkles size={48} className="text-purple-600 dark:text-purple-400 animate-bounce relative z-10" />
                  </div>
                  <p className="text-slate-500 font-medium">Analyzing ecosystem data...</p>
               </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'model' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {msg.role === 'model' ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  
                  <div className={`flex-1 max-w-[90%] rounded-2xl p-5 ${
                    msg.role === 'model'
                      ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                      : 'bg-blue-600 text-white'
                  }`}>
                    <div className="text-sm">
                      <ReactMarkdown components={msg.role === 'model' ? MarkdownComponents : undefined}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <div className={`text-[10px] mt-2 opacity-60 font-medium ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && messages.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2 text-slate-400 ml-12">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                placeholder="Ask a follow-up question about the briefing..." 
                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm"
                disabled={loading}
              />
              <button 
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Key Stats / Quick Actions */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto custom-scrollbar pr-1">
          {/* Status Card */}
          <div className="card p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Service Health</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Nominal</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                    <ShieldAlert size={18} />
                  </div>
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Security Score</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">98/100</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Suggested Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={generateBriefing}
                disabled={loading}
                className="w-full text-left p-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all shadow-md flex items-center justify-between group"
              >
                <div className="flex items-center">
                  <Sparkles size={16} className="mr-3 text-white" />
                  <span className="truncate mr-2">Generate Weekly Briefing</span>
                </div>
                <ArrowRight size={14} className="text-white flex-shrink-0" />
              </button>
              {[
                { label: "Draft Customer Email", query: "Draft a general email to customers summarizing the top 3 updates this week.", icon: MessageSquare },
                { label: "Identify Risks", query: "What are the top 3 risks I should warn my customers about?", icon: AlertOctagon },
                { label: "Strategic Opportunities", query: "What new features should I pitch to customers for modernization?", icon: Lightbulb },
                { label: "Deprecation Check", query: "List all deprecations effective in the next 90 days.", icon: TrendingUp },
                { label: "Architecture Trends", query: "Summarize recent architecture center updates.", icon: Target },
              ].map((action, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(action.query)}
                  disabled={loading}
                  className="w-full text-left p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <action.icon size={16} className="mr-3 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    <span className="truncate mr-2">{action.label}</span>
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Context Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <p className="flex items-start">
              <Sparkles size={14} className="mr-2 mt-0.5 flex-shrink-0" />
              <strong>Official Data Only:</strong> Insights are derived strictly from the {items.length} most recent official Google Cloud RSS feeds (Release Notes, Security Bulletins, Deprecations).
            </p>
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
