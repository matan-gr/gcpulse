import React, { useState } from 'react';
import { FeedItem } from '../types';
import { CheckCircle2, AlertTriangle, Copy, ChevronDown, ChevronUp, ExternalLink, Clock, Activity, Search, Filter, History, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useIncidentsView } from '../hooks/useIncidentsView';
import ReactMarkdown from 'react-markdown';

interface IncidentsViewProps {
  items: FeedItem[];
  loading: boolean;
}

const FormattedUpdateText = ({ text }: { text: string }) => {
  if (!text) return null;

  return (
    <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
      <ReactMarkdown
        components={{
          strong: ({...props}) => <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1 rounded" {...props} />,
          h1: ({...props}) => <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-2 pb-1 border-b border-slate-200 dark:border-slate-700" {...props} />,
          h2: ({...props}) => <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1" {...props} />,
          h3: ({...props}) => <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-2 mb-1" {...props} />,
          ul: ({...props}) => <ul className="list-disc list-outside ml-5 space-y-1 my-2 marker:text-slate-400" {...props} />,
          ol: ({...props}) => <ol className="list-decimal list-outside ml-5 space-y-1 my-2 marker:text-slate-400" {...props} />,
          li: ({...props}) => <li className="pl-1" {...props} />,
          p: ({...props}) => <p className="mb-2 last:mb-0" {...props} />,
          a: ({...props}) => <a className="font-medium text-blue-600 dark:text-blue-400 hover:underline decoration-blue-300/50 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
          code: ({className, children, ...props}) => {
            return (
              <code className={`${className} font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-slate-700`} {...props}>
                {children}
              </code>
            )
          },
          pre: ({children}) => <pre className="bg-slate-900 text-slate-50 p-3 rounded-lg overflow-x-auto my-3 text-xs font-mono border border-slate-700 shadow-sm">{children}</pre>,
          blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500/30 dark:border-blue-400/30 pl-4 italic text-slate-600 dark:text-slate-400 my-3 bg-slate-50 dark:bg-slate-800/30 py-2 pr-2 rounded-r-lg">{children}</blockquote>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export const IncidentsView: React.FC<IncidentsViewProps> = ({ items, loading }) => {
  const {
    currentYear,
    isJanuary,
    activeIncidents,
    historyIncidents,
    getDuration,
    handleCopyUpdate,
    expandedIncidentId,
    toggleExpand
  } = useIncidentsView(items);

  const [historySearch, setHistorySearch] = useState('');

  const filteredHistory = historyIncidents.filter(item => 
    (item.serviceName || '').toLowerCase().includes(historySearch.toLowerCase()) ||
    (item.title || '').toLowerCase().includes(historySearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* System Status Hero */}
      <div className={`relative overflow-hidden rounded-2xl p-8 md:p-12 text-center md:text-left transition-all duration-500 ${
        activeIncidents.length === 0 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20' 
          : 'bg-gradient-to-br from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/20'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
              {activeIncidents.length === 0 ? <CheckCircle2 size={32} className="text-white" /> : <AlertOctagon size={32} className="animate-pulse text-white" />}
              <span className="text-sm font-bold uppercase tracking-widest text-white/90">System Status</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
              {activeIncidents.length === 0 ? 'All Systems Operational' : `${activeIncidents.length} Active Incident${activeIncidents.length > 1 ? 's' : ''}`}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              {activeIncidents.length === 0 
                ? 'Google Cloud Platform services are running normally. No active incidents reported.' 
                : 'Our engineering teams are investigating issues affecting some Google Cloud services.'}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 md:gap-8 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="text-center px-4">
              <div className="text-2xl font-bold">{activeIncidents.length}</div>
              <div className="text-xs font-medium opacity-80 uppercase">Active</div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="text-center px-4">
              <div className="text-2xl font-bold">{historyIncidents.length}</div>
              <div className="text-xs font-medium opacity-80 uppercase">Resolved ({currentYear})</div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 transform rotate-12 scale-150 pointer-events-none">
          {activeIncidents.length === 0 ? <Activity size={300} /> : <AlertTriangle size={300} />}
        </div>
      </div>

      {/* Active Incidents Section */}
      {activeIncidents.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Updates</h2>
          </div>
          
          <div className="grid gap-6">
            {activeIncidents.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all relative ${
                  expandedIncidentId === item.id 
                    ? 'border-red-500 ring-1 ring-red-500 shadow-red-100 dark:shadow-none' 
                    : 'border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-700 shadow-red-50/50 dark:shadow-none'
                }`}
              >
                {/* Active Indicator Strip */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>

                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 cursor-pointer pl-8"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded animate-pulse flex items-center shadow-sm">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></div>
                          LIVE
                        </span>
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold uppercase rounded-full border border-red-200 dark:border-red-800 flex items-center">
                          <AlertTriangle size={12} className="mr-1.5" />
                          {item.severity || "High Severity"}
                        </span>
                        <span className="text-xs text-slate-500 font-mono flex items-center">
                          <Clock size={12} className="mr-1.5" />
                          Started {new Date(item.begin || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 group">
                        {item.serviceName || "GCP Service"}
                        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                          {expandedIncidentId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                        {item.title}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-slate-400 uppercase">Duration</div>
                        <div className="text-sm font-mono font-medium text-red-600 dark:text-red-400">
                          {getDuration(item.begin || '')}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUpdate(item);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                        title="Copy Latest Update"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedIncidentId === item.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                    >
                      <div className="p-6 md:p-8">
                        {/* Incident Details Block */}
                        <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                            <Activity size={14} className="mr-2" />
                            Incident Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <span className="text-xs text-slate-400 block mb-1">Severity Level</span>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${item.severity === 'High' ? 'bg-red-500' : item.severity === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{item.severity || 'High Severity'}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 block mb-1">Affected Service</span>
                              <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
                                {item.serviceName || 'Google Cloud Platform'}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 block mb-1">Resources</span>
                              <div className="flex flex-col space-y-1">
                                <a 
                                  href="https://console.cloud.google.com/support" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                >
                                  Contact Support <ExternalLink size={10} className="ml-1" />
                                </a>
                                <a 
                                  href={`https://cloud.google.com/search?q=${encodeURIComponent(item.serviceName || '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center transition-colors"
                                >
                                  Service Documentation <ExternalLink size={10} className="ml-1" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                           <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center">
                             <Clock size={16} className="mr-2 text-slate-400" />
                             Incident Timeline
                           </h4>
                           <a 
                             href={item.link} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             onClick={(e) => e.stopPropagation()}
                             className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                           >
                             Official Status Page <ExternalLink size={12} className="ml-1.5" />
                           </a>
                        </div>
                        
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                          {item.updates?.map((update, idx) => (
                            <div key={idx} className="relative pl-8 group">
                              <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 z-10 ${idx === 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {new Date(update.created).toLocaleDateString()}
                                </span>
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                  {new Date(update.created).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-shadow">
                                <FormattedUpdateText text={update.text} />
                              </div>
                            </div>
                          ))}
                          {(!item.updates || item.updates.length === 0) && (
                            <div className="pl-8 text-slate-500 italic text-sm">No detailed updates available.</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Incident History */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <History className="text-slate-400" size={20} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Incident History <span className="text-slate-400 font-normal text-base ml-1">({isJanuary ? `${currentYear - 1}-${currentYear}` : currentYear})</span>
            </h2>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter history by service..." 
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-48">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-64">Service</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-32">Duration</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Impact Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr 
                        onClick={() => toggleExpand(item.id)}
                        className={`transition-colors cursor-pointer group ${
                          expandedIncidentId === item.id 
                            ? 'bg-blue-50/50 dark:bg-blue-900/10' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-xs">
                          {new Date(item.begin || '').toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {item.serviceName || "GCP Service"}
                            <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
                              {expandedIncidentId === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {getDuration(item.begin || '', item.end)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-lg">
                          <p className="line-clamp-1 truncate">
                            {item.description || item.title}
                          </p>
                        </td>
                      </tr>
                      {expandedIncidentId === item.id && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                          <td colSpan={4} className="px-0 py-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
                                    <Activity size={16} className="mr-2 text-blue-500" />
                                    Incident Timeline
                                  </h4>
                                  <a 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors"
                                  >
                                    View Official Status Page <ExternalLink size={12} className="ml-1" />
                                  </a>
                                </div>
                                <div className="space-y-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                                  {item.updates?.map((update, idx) => (
                                    <div key={idx} className="relative">
                                      <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900"></div>
                                      <div className="text-xs font-mono text-slate-400 mb-1 flex items-center">
                                        <Clock size={12} className="mr-1" />
                                        {new Date(update.created).toLocaleString()}
                                      </div>
                                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <FormattedUpdateText text={update.text} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p>No incidents found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
};
