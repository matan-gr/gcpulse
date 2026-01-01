import React from 'react';
import { FeedItem } from '../types';
import { CheckCircle, AlertTriangle, Copy, ChevronDown, ChevronUp, ExternalLink, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useIncidentsView } from '../hooks/useIncidentsView';

interface IncidentsViewProps {
  items: FeedItem[];
  loading: boolean;
}

const FormattedUpdateText = ({ text }: { text: string }) => {
  if (!text) return null;

  // Split by newlines to handle paragraphs/lists
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;

        // 1. Check for "Key: Value" pattern (e.g., "Description: ...")
        const keyMatch = trimmed.match(/^([A-Z][a-zA-Z\s]+):(\s+.*)/);
        if (keyMatch) {
          return (
            <div key={i} className="mb-1">
              <span className="font-bold text-slate-900 dark:text-white">{keyMatch[1]}:</span>
              <span>{keyMatch[2]}</span>
            </div>
          );
        }

        // 2. Check for List Items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start ml-4">
              <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0"></span>
              <span>{trimmed.substring(2)}</span>
            </div>
          );
        }

        // 3. Regular Text (with simple date highlighting)
        // Regex for YYYY-MM-DD or similar date patterns
        const dateRegex = /(\d{4}-\d{2}-\d{2}(?:\s\d{2}:\d{2})?)/g;
        const parts = trimmed.split(dateRegex);
        
        return (
          <p key={i}>
            {parts.map((part, j) => 
              dateRegex.test(part) ? (
                <span key={j} className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {part}
                </span>
              ) : part
            )}
          </p>
        );
      })}
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

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Incident Command Center...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Component A: Active Incident Monitor */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Active Incident Monitor</h2>
        
        {activeIncidents.length === 0 ? (
          // UI State 1: No Active
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <CheckCircle size={48} className="text-green-600 dark:text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300">All Google Cloud Services Operational</h3>
            <p className="text-green-700 dark:text-green-400 mt-2">System Nominal</p>
          </div>
        ) : (
          // UI State 2: Active Incident(s)
          <div className="space-y-4">
            {activeIncidents.map(item => (
              <div 
                key={item.id} 
                onClick={() => toggleExpand(item.id)}
                className={`bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl p-6 shadow-sm cursor-pointer transition-all ${
                  expandedIncidentId === item.id ? 'ring-2 ring-red-500/20' : 'hover:bg-red-100 dark:hover:bg-red-900/30'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
                        {item.serviceName || "GCP Service"}
                        {expandedIncidentId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </h3>
                      <span className="px-2 py-0.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs font-bold uppercase rounded">
                        {item.severity || "High"}
                      </span>
                    </div>
                    <div className="flex items-center text-red-700 dark:text-red-400 font-medium">
                      <AlertTriangle size={18} className="mr-2" />
                      ⚠️ Ongoing for {getDuration(item.begin || '')}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUpdate(item);
                    }}
                    className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy Update
                  </button>
                </div>

                <AnimatePresence>
                  {expandedIncidentId === item.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-800/50 space-y-4">
                        <div className="flex justify-between items-center">
                           <h4 className="font-bold text-red-900 dark:text-red-200 text-sm uppercase tracking-wider">Incident Updates</h4>
                           <a 
                             href={item.link} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             onClick={(e) => e.stopPropagation()}
                             className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center"
                           >
                             View Official Status Page <ExternalLink size={12} className="ml-1" />
                           </a>
                        </div>
                        <div className="space-y-6 pl-4 border-l-2 border-red-200 dark:border-red-800/50 ml-2">
                          {item.updates?.map((update, idx) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-red-400 border-2 border-white dark:border-slate-900"></div>
                              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 flex items-center">
                                <Clock size={12} className="mr-1" />
                                {new Date(update.created).toLocaleString()}
                              </div>
                              <FormattedUpdateText text={update.text} />
                            </div>
                          ))}
                          {(!item.updates || item.updates.length === 0) && (
                            <p className="text-slate-500 italic text-sm">No detailed updates available.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Component B: Incident History */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Incident History ({isJanuary ? `${currentYear - 1}-${currentYear}` : currentYear})
        </h2>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Service</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Duration</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyIncidents.length > 0 ? (
                  historyIncidents.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr 
                        onClick={() => toggleExpand(item.id)}
                        className={`transition-colors cursor-pointer ${
                          expandedIncidentId === item.id 
                            ? 'bg-blue-50/50 dark:bg-blue-900/10' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {new Date(item.begin || '').toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {expandedIncidentId === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {item.serviceName || "GCP Service"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono">
                          {getDuration(item.begin || '', item.end)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-lg">
                          <p className="line-clamp-1">
                            {item.description || item.title}
                          </p>
                        </td>
                      </tr>
                      {expandedIncidentId === item.id && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                          <td colSpan={4} className="px-6 py-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="py-6 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Incident Timeline</h4>
                                  <a 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                  >
                                    View Official Status Page <ExternalLink size={12} className="ml-1" />
                                  </a>
                                </div>
                                <div className="space-y-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                                  {item.updates?.map((update, idx) => (
                                    <div key={idx} className="relative">
                                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900"></div>
                                      <div className="text-xs font-mono text-slate-400 mb-1 flex items-center">
                                        <Clock size={12} className="mr-1" />
                                        {new Date(update.created).toLocaleString()}
                                      </div>
                                      <FormattedUpdateText text={update.text} />
                                    </div>
                                  ))}
                                  {(!item.updates || item.updates.length === 0) && (
                                    <p className="text-slate-500 italic text-sm">No detailed updates available.</p>
                                  )}
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
                      No incident history available.
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
