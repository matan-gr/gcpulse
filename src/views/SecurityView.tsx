import React from 'react';
import { FeedItem } from '../types';
import { ShieldAlert, ShieldCheck, Search, Filter, AlertTriangle, CheckCircle, ExternalLink, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSecurityView } from '../hooks/useSecurityView';

interface SecurityViewProps {
  items: FeedItem[];
  loading: boolean;
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ 
  items, 
  loading,
  onSummarize,
  summarizingId
}) => {
  const {
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    processedData,
    filteredItems
  } = useSecurityView(items);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Bulletins</p>
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-2">{processedData.stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
            <ShieldCheck size={24} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Critical Severity</p>
            <h3 className="text-4xl font-bold text-red-600 dark:text-red-400 mt-2">{processedData.stats.critical}</h3>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
            <ShieldAlert size={24} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">High Severity</p>
            <h3 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mt-2">{processedData.stats.high}</h3>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
            <AlertTriangle size={24} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter size={18} className="text-slate-400 mr-2 flex-shrink-0" />
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                severityFilter === sev 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search bulletins or products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Bulletin List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md bg-white dark:bg-slate-900 ${
                  item.severity === 'Critical' ? 'border-l-4 border-l-red-500 border-red-100 dark:border-red-900/30' :
                  item.severity === 'High' ? 'border-l-4 border-l-orange-500 border-orange-100 dark:border-orange-900/30' :
                  item.severity === 'Medium' ? 'border-l-4 border-l-yellow-500 border-yellow-100 dark:border-yellow-900/30' :
                  'border-l-4 border-l-blue-500 border-blue-100 dark:border-blue-900/30'
                }`}
              >
                <div className={`p-6 ${
                   item.severity === 'Critical' ? 'bg-red-50/30 dark:bg-red-900/5' :
                   item.severity === 'High' ? 'bg-orange-50/30 dark:bg-orange-900/5' :
                   ''
                }`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide flex items-center shadow-sm ${
                          item.severity === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800' :
                          item.severity === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800' :
                          item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}>
                          {item.severity === 'Critical' && <ShieldAlert size={12} className="mr-1.5" />}
                          {item.severity === 'High' && <AlertTriangle size={12} className="mr-1.5" />}
                          {item.severity === 'Medium' && <ShieldCheck size={12} className="mr-1.5" />}
                          {item.severity} Severity
                        </span>
                        <span className="text-xs text-slate-500 flex items-center">
                          {new Date(item.isoDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                          {item.title}
                        </a>
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => onSummarize(item)}
                        disabled={summarizingId === item.link}
                        className="flex items-center px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        <Zap size={14} className={`mr-1.5 ${summarizingId === item.link ? 'animate-spin' : 'text-purple-500'}`} />
                        {summarizingId === item.link ? 'Analyzing...' : 'AI Analysis'}
                      </button>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition-colors border border-blue-100 dark:border-blue-800"
                      >
                        Bulletin <ExternalLink size={14} className="ml-1.5" />
                      </a>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {item.contentSnippet}
                  </p>

                  {item.products.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center shrink-0">
                        <Search size={12} className="mr-1.5" />
                        Affected Products:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.products.slice(0, 5).map(prod => (
                          <span key={prod} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md font-medium border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-default">
                            {prod}
                          </span>
                        ))}
                        {item.products.length > 5 && (
                          <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs rounded-md font-medium border border-transparent">
                            +{item.products.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No bulletins found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
