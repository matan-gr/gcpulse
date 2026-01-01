import React, { useState } from 'react';
import { Server, AlertTriangle, CheckCircle, Clock, ExternalLink, ShieldAlert, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './ErrorBoundary';
import { useGKEVersions, GKEChannelInfo } from '../hooks/useGKEVersions';

export const GKEVersionTracker: React.FC = () => {
  return (
    <ErrorBoundary componentName="GKEVersionTracker">
      <GKEVersionTrackerContent />
    </ErrorBoundary>
  );
};

const ChannelCard: React.FC<{ channel: GKEChannelInfo; index: number }> = ({ channel, index }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Security Patch': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'Deprecated': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400';
    }
  };

  const statusStyles = getStatusColor(channel.current.status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 group"
    >
      <div className={`p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center relative overflow-hidden`}>
        <div className={`absolute inset-0 opacity-10 ${
          channel.name === 'Stable' ? 'bg-emerald-500' :
          channel.name === 'Rapid' ? 'bg-purple-500' : 'bg-blue-500'
        }`} />
        <div className="relative z-10 flex items-center space-x-3">
           <div className={`p-2 rounded-lg ${
             channel.name === 'Stable' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' :
             channel.name === 'Rapid' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' : 
             'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
           }`}>
             <Activity size={20} />
           </div>
           <h3 className="font-bold text-lg text-slate-900 dark:text-white">{channel.name}</h3>
        </div>
        {channel.current.status === 'Security Patch' && (
          <div className="relative z-10 animate-pulse">
             <ShieldAlert size={20} className="text-red-500" />
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
             <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Current Version</span>
             <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center">
                <Clock size={10} className="mr-1" /> {channel.current.date}
             </span>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white tracking-tight">
            {channel.current.version}
          </div>
        </div>

        <div className={`mb-6 px-3 py-2 rounded-lg text-xs font-bold border flex items-center justify-center ${statusStyles}`}>
            {channel.current.status === 'Healthy' && <CheckCircle size={14} className="mr-1.5" />}
            {channel.current.status === 'Security Patch' && <ShieldAlert size={14} className="mr-1.5" />}
            {channel.current.status === 'Deprecated' && <AlertTriangle size={14} className="mr-1.5" />}
            {channel.current.status.toUpperCase()}
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 line-clamp-3 leading-relaxed">
          {channel.current.description}
        </p>

        {/* Collapsible History Section */}
        {channel.history.length > 0 && (
          <div className="mb-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="w-full flex justify-between items-center text-xs text-slate-500 uppercase tracking-wider font-bold mb-2 hover:text-blue-600 transition-colors group/history"
            >
              <span>Recent History</span>
              {isHistoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} className="group-hover/history:translate-y-0.5 transition-transform" />}
            </button>
            
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pb-2">
                    {channel.history.map((hist, hIdx) => (
                      <div key={hIdx} className="flex justify-between items-center text-xs p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{hist.version}</span>
                        <span className="text-slate-400">{hist.date}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <a 
            href={channel.current.link}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center w-full py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Read Release Notes <ExternalLink size={14} className="ml-1.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const GKEVersionTrackerContent: React.FC = () => {
  const { data: channels, isLoading, error } = useGKEVersions();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Syncing with Google Cloud Release Feeds...</p>
      </div>
    );
  }

  if (error || !channels) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <AlertTriangle size={48} className="mb-4 text-red-500 opacity-50" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Failed to load GKE data</h3>
        <p className="text-sm">Could not retrieve the latest GKE channel information.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Server size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Server className="text-blue-100" size={32} />
              </div>
              <h2 className="text-2xl font-bold">GKE Release Channels</h2>
            </div>
            <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
              Official release status tracked directly from Google Cloud feeds. 
              Monitor the latest versions across Stable, Regular, and Rapid channels.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-slate-50 dark:bg-slate-950/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {channels.map((channel, index) => (
              <ChannelCard key={channel.name} channel={channel} index={index} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Source: <a href="https://cloud.google.com/kubernetes-engine/docs/release-notes" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Google Cloud GKE Release Notes</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
