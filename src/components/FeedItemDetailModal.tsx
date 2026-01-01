import React from 'react';
import { FeedItem, AnalysisResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Tag, ExternalLink, Sparkles, Bookmark, Link as LinkIcon, Box, AlertOctagon, Check, Activity, Clock, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { extractImage } from '../utils';

interface FeedItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FeedItem;
  analysis?: AnalysisResult;
  onSave: (item: FeedItem) => void;
  isSaved: boolean;
  onSummarize: (item: FeedItem) => void;
  isSummarizing: boolean;
}

export const FeedItemDetailModal: React.FC<FeedItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  analysis,
  onSave,
  isSaved,
  onSummarize,
  isSummarizing
}) => {
  if (!isOpen) return null;

  const image = item.enclosure?.url || extractImage(item.content);
  const date = new Date(item.isoDate).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isIncident = item.source === 'Service Health';
  
  // Determine Incident Status
  let status = 'Investigating';
  let statusColor = 'text-red-600 bg-red-50 border-red-200';
  let StatusIcon = AlertOctagon;

  if (isIncident) {
    const text = (item.title + item.contentSnippet).toLowerCase();
    if (text.includes('resolved')) {
      status = 'Resolved';
      statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
      StatusIcon = Check;
    } else if (text.includes('monitoring') || text.includes('identified')) {
      status = 'Monitoring';
      statusColor = 'text-amber-600 bg-amber-50 border-amber-200';
      StatusIcon = Activity;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed z-50 w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
              <div className="flex-1 pr-8">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    item.source === 'Release Notes' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-900/30' :
                    item.source === 'Product Updates' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30' :
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30'
                  }`}>
                    {item.source}
                  </span>
                  {isIncident && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center ${statusColor}`}>
                      <StatusIcon size={12} className="mr-1" />
                      {status}
                    </span>
                  )}
                  <span className="text-sm text-slate-500 flex items-center">
                    <Clock size={14} className="mr-1.5" />
                    {date}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {item.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 custom-scrollbar">
              {image && (
                <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                  <img src={image} alt={item.title} className="w-full h-64 object-cover" />
                </div>
              )}

              {/* AI Analysis Section */}
              {analysis && (
                <div className="mb-8 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-slate-800/50 rounded-xl border border-purple-100 dark:border-purple-800/30 p-5">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 mr-3">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">AI Insight</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini 2.5 Flash</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-2">Executive Summary</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {analysis.summary}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-2">Business Impact</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {analysis.impact}
                      </p>
                    </div>
                  </div>

                  {analysis.relatedProducts && analysis.relatedProducts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-800/30">
                       <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-2">Related Products</h4>
                       <div className="flex flex-wrap gap-2">
                         {analysis.relatedProducts.map(prod => (
                           <span key={prod} className="px-2 py-1 bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-800/30 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
                             {prod}
                           </span>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* Main Content */}
              <div className="prose dark:prose-invert max-w-none prose-slate prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-700">
                <ReactMarkdown 
                  components={{
                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />,
                    img: ({node, ...props}) => <img {...props} className="rounded-lg shadow-sm" loading="lazy" />
                  }}
                >
                  {item.content || item.contentSnippet}
                </ReactMarkdown>
              </div>

              {/* Categories */}
              {item.categories && item.categories.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center">
                    <Tag size={16} className="mr-2 text-slate-400" />
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item.categories.map(cat => (
                      <span key={cat} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => onSave(item)}
                  className={`btn ${isSaved ? 'btn-primary' : 'btn-secondary'} flex items-center space-x-2`}
                >
                  <Bookmark size={18} className={isSaved ? "fill-white" : ""} />
                  <span>{isSaved ? 'Saved' : 'Read Later'}</span>
                </button>
                
                <button
                  onClick={() => onSummarize(item)}
                  disabled={isSummarizing}
                  className="btn btn-secondary flex items-center space-x-2 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  {isSummarizing ? <div className="animate-spin mr-2">⏳</div> : <Sparkles size={18} className="mr-2" />}
                  <span>{analysis ? 'Re-Analyze' : 'AI Summary'}</span>
                </button>
              </div>

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex items-center space-x-2"
              >
                <span>Read Original</span>
                <ExternalLink size={18} />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
