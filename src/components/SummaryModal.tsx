import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Target, Zap, Box, ExternalLink, Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { InsightCharts } from './InsightCharts';
import { AnalysisResult } from '../types';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  analysis: AnalysisResult | null;
  streamContent?: string;
  isStreaming?: boolean;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, title, analysis, streamContent, isStreaming }) => {
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
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[85vh] border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="bg-white dark:bg-gray-900 p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start shrink-0 sticky top-0 z-10">
                <div className="flex items-start space-x-4 pr-8">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">{title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <FileText size={12} className="mr-1" /> AI-Generated Analysis
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
                {streamContent ? (
                   <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-6 mb-4 flex items-center border-b border-purple-100 dark:border-purple-900/50 pb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-none space-y-2 pl-0 my-4" {...props} />,
                          li: ({node, ...props}) => (
                            <li className="flex items-start text-gray-700 dark:text-gray-300">
                              <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />
                              <span className="flex-1">{props.children}</span>
                            </li>
                          ),
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 pl-4 py-3 pr-4 my-4 rounded-r-lg italic text-gray-700 dark:text-gray-300 shadow-sm" {...props} />
                          ),
                          strong: ({node, ...props}) => <strong className="font-bold text-purple-900 dark:text-purple-300" {...props} />,
                          code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-700" {...props} />,
                        }}
                      >
                        {streamContent}
                      </ReactMarkdown>
                      {isStreaming && (
                        <div className="flex items-center mt-6 text-purple-600 dark:text-purple-400 animate-pulse font-medium">
                          <Loader2 size={20} className="animate-spin mr-2" />
                          Analyzing content...
                        </div>
                      )}
                   </div>
                ) : analysis ? (
                  <div className="space-y-8">
                    {/* Executive Summary */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4 flex items-center">
                        <Sparkles size={14} className="mr-2" /> Executive Summary
                      </h3>
                      <div className="prose prose-indigo dark:prose-invert max-w-none">
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                          <ReactMarkdown
                            components={{
                              strong: ({node, ...props}) => <strong className="font-bold text-purple-900 dark:text-purple-300" {...props} />,
                              code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                            }}
                          >
                            {analysis.summary}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Impact Analysis */}
                      <section className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                        <h3 className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest mb-4 flex items-center">
                          <Zap size={14} className="mr-2" /> Business Impact
                        </h3>
                        <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          <ReactMarkdown
                            components={{
                              blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-4 border-orange-400 pl-4 italic my-2 text-orange-900 dark:text-orange-200" {...props} />
                              ),
                            }}
                          >
                            {analysis.impact}
                          </ReactMarkdown>
                        </div>
                      </section>

                      {/* Target Audience */}
                      <section className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center">
                          <Target size={14} className="mr-2" /> Target Audience
                        </h3>
                        <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          <ReactMarkdown
                            components={{
                              strong: ({node, ...props}) => <strong className="font-bold text-blue-900 dark:text-blue-300" {...props} />,
                              code: ({node, ...props}) => <code className="bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                            }}
                          >
                            {analysis.targetAudience}
                          </ReactMarkdown>
                        </div>
                      </section>
                    </div>

                    {/* Related Products */}
                    {analysis.relatedProducts.length > 0 && (
                      <section>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                          <Box size={14} className="mr-2" /> Related Products
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.relatedProducts.map((prod, idx) => (
                            <a 
                              key={idx} 
                              href={`https://cloud.google.com/search?q=${encodeURIComponent(prod)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 hover:text-purple-700 dark:hover:text-purple-400 hover:shadow-md transition-all flex items-center group"
                            >
                              {prod}
                              <ExternalLink size={12} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
                            </a>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Interactive Charts */}
                    {analysis.chartData && (
                      <section>
                         <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                          <Sparkles size={14} className="mr-2" /> AI Insights & Metrics
                        </h3>
                        <InsightCharts data={analysis.chartData} />
                      </section>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
                    {isStreaming ? (
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                                <Loader2 className="animate-spin mb-6 text-purple-600 dark:text-purple-400 relative z-10" size={48} />
                            </div>
                            <p className="font-medium text-lg text-gray-600 dark:text-gray-300">Initializing AI Analysis...</p>
                            <p className="text-sm mt-2">Connecting to Gemini 2.5 Flash</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Analysis not available.</p>
                        </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-900 px-8 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    Powered by Google Gemini
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
