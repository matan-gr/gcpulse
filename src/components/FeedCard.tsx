import React, { useState } from 'react';
import { FeedItem } from '../types';
import { extractImage, extractGCPProducts } from '../utils';
import { Calendar, Tag, ExternalLink, Sparkles, Bookmark, Loader2, Plus, Check, AlertOctagon, Activity, Zap, Box, Link as LinkIcon, ChevronDown, ChevronUp, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

import { AnalysisResult } from '../types';
import { Tooltip } from './ui/Tooltip';

interface FeedCardProps {
  item: FeedItem;
  index: number;
  onSummarize: (item: FeedItem) => void;
  isSummarizing: boolean;
  onSave: (item: FeedItem) => void;
  isSaved: boolean;
  viewMode: 'grid' | 'list';
  subscribedCategories: string[];
  onToggleSubscription: (category: string) => void;
  onSelectCategory?: (category: string) => void;
  analysis?: AnalysisResult;
  isPresentationMode?: boolean;
}

import { ErrorBoundary } from './ErrorBoundary';

export const FeedCard = React.memo<FeedCardProps>(({ 
  item, 
  index, 
  onSummarize, 
  isSummarizing,
  onSave,
  isSaved,
  viewMode,
  subscribedCategories,
  onToggleSubscription,
  onSelectCategory,
  analysis,
  isPresentationMode = false
}) => {
  return (
    <ErrorBoundary componentName={`FeedCard-${item.title}`}>
      <FeedCardContent 
        item={item}
        index={index}
        onSummarize={onSummarize}
        isSummarizing={isSummarizing}
        onSave={onSave}
        isSaved={isSaved}
        viewMode={viewMode}
        subscribedCategories={subscribedCategories}
        onToggleSubscription={onToggleSubscription}
        onSelectCategory={onSelectCategory}
        analysis={analysis}
        isPresentationMode={isPresentationMode}
      />
    </ErrorBoundary>
  );
});

const FeedCardContent: React.FC<FeedCardProps> = ({ 
  item, 
  index, 
  onSummarize, 
  isSummarizing,
  onSave,
  isSaved,
  viewMode,
  subscribedCategories,
  onToggleSubscription,
  onSelectCategory,
  analysis,
  isPresentationMode = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const image = item.enclosure?.url || extractImage(item.content);
  const date = new Date(item.isoDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isListView = viewMode === 'list' && !isPresentationMode;
  const isIncident = item.source === 'Service Health';
  const isDeprecation = item.source === 'Deprecations';

  // Calculate days until deprecation if applicable
  let daysUntilEOL = 0;
  let urgencyColor = 'bg-slate-100 text-slate-600';
  
  if (isDeprecation) {
    const futureDateMatch = item.contentSnippet?.match(/(\d{4}-\d{2}-\d{2})/);
    if (futureDateMatch) {
      const eolDate = new Date(futureDateMatch[0]);
      const now = new Date();
      const diffTime = eolDate.getTime() - now.getTime();
      daysUntilEOL = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysUntilEOL < 30) {
        urgencyColor = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      } else if (daysUntilEOL < 90) {
        urgencyColor = 'bg-orange-50 text-orange-700 border-orange-200';
      } else {
        urgencyColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      }
    }
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.link);
    toast.success("Link copied to clipboard");
  };

  const detectedProducts = analysis?.relatedProducts || extractGCPProducts(item.title + " " + item.contentSnippet);
  const displayLabels = Array.from(new Set([...detectedProducts, ...(item.categories || [])]));

  // Determine Incident Status
  let status: 'Resolved' | 'Monitoring' | 'Investigating' = 'Investigating';
  let statusColor = 'bg-red-50 text-red-700 border-red-200';
  let cardBorder = 'border-red-100';
  let iconColor = 'text-red-600';

  if (isIncident) {
    const text = (item.title + item.contentSnippet).toLowerCase();
    if (text.includes('resolved')) {
      status = 'Resolved';
      statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      cardBorder = 'border-emerald-100';
      iconColor = 'text-emerald-600';
    } else if (text.includes('monitoring') || text.includes('identified')) {
      status = 'Monitoring';
      statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
      cardBorder = 'border-amber-100';
      iconColor = 'text-amber-600';
    }
  }

  // Incident Card Design
  if (isIncident) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`rounded-xl shadow-sm border ${cardBorder} dark:border-opacity-20 flex flex-col relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-slate-900 ${isPresentationMode ? 'scale-105 shadow-lg' : ''}`}
      >
        {/* Status Header */}
        <div className={`px-5 py-3 border-b ${cardBorder} dark:border-opacity-20 ${status === 'Resolved' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : status === 'Monitoring' ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'bg-red-50/50 dark:bg-red-900/10'} flex justify-between items-center`}>
           <div className="flex items-center space-x-2">
              {status === 'Resolved' ? <Check size={16} className={iconColor} /> : <AlertOctagon size={16} className={iconColor} />}
              <span className={`text-xs font-bold uppercase tracking-wider ${iconColor}`}>
                {status}
              </span>
           </div>
           <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center">
              <Clock size={10} className="mr-1" />
              {new Date(item.isoDate).toLocaleString()}
           </span>
        </div>

        <div className="p-5 flex flex-col flex-1 relative">
          {item.serviceName && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Box size={10} className="mr-1" />
                {item.serviceName}
              </span>
            </div>
          )}

          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none transform rotate-12 scale-150">
            {status === 'Resolved' ? (
              <Check size={100} className={iconColor} />
            ) : status === 'Monitoring' ? (
              <Activity size={100} className={iconColor} />
            ) : (
              <AlertOctagon size={100} className={iconColor} />
            )}
          </div>

          <h3 className={`font-bold text-slate-900 dark:text-white mb-2 z-10 relative ${isPresentationMode ? 'text-xl' : 'text-base'} leading-snug`}>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className={`hover:text-blue-600 transition-colors`}>
              {item.title}
            </a>
          </h3>

          <p className={`text-slate-600 dark:text-slate-300 text-sm mb-4 z-10 relative flex-1 leading-relaxed ${isPresentationMode ? 'line-clamp-4' : 'line-clamp-3'}`}>
            {item.contentSnippet}
          </p>

          <div className="mt-auto z-10 flex items-center justify-between relative pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-flex items-center text-xs font-bold hover:underline transition-colors ${iconColor}`}
            >
                View Incident <ArrowRight size={12} className="ml-1" />
            </a>
            
            {!isPresentationMode && (
              <div className="flex space-x-1">
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSummarize(item);
                    }}
                    disabled={isSummarizing}
                    className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${iconColor}`}
                    title="Summarize Incident"
                >
                  {isSummarizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Standard Feed Card Design
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex ${
        isListView ? 'flex-row min-h-[180px]' : 'flex-col h-full'
      } group relative ${isSaved ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
    >
      {/* Deprecation Warning Banner */}
      {isDeprecation && daysUntilEOL > 0 && (
        <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide flex items-center justify-between border-b ${urgencyColor}`}>
          <span className="flex items-center">
            <AlertOctagon size={10} className="mr-1.5" />
            Deprecation Notice
          </span>
          <span>{daysUntilEOL} Days Left</span>
        </div>
      )}

      {/* Save Ribbon */}
      {isSaved && !isPresentationMode && (
        <div className="absolute top-0 right-0 z-20">
          <div className="bg-blue-600 text-white p-1 rounded-bl-lg shadow-sm">
            <Bookmark size={12} className="fill-white" />
          </div>
        </div>
      )}

      {/* Image Section */}
      {image && !isPresentationMode && (
        <div 
          className={`${isListView ? 'w-48 min-w-[192px]' : 'h-40'} overflow-hidden relative cursor-pointer group/image bg-slate-100 dark:bg-slate-900`}
          onClick={(e) => {
            e.stopPropagation();
            onSummarize(item);
          }}
        >
            <img 
                src={image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                referrerPolicy="no-referrer"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-end justify-start p-3">
              <div className="flex items-center space-x-1.5 text-white text-xs font-medium">
                <Sparkles size={12} className="text-yellow-400" />
                <span>AI Summary</span>
              </div>
            </div>
        </div>
      )}
      
      <div className={`p-5 flex-1 flex flex-col ${isListView ? 'justify-between' : ''}`}>
        <div>
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  item.source === 'Release Notes' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-900/30' :
                  item.source === 'Product Updates' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30' :
                  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30'
                }`}>
                  {item.source}
                </span>
             </div>
             <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center">
                {date}
             </span>
          </div>
          
          <h3 className={`font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight ${
            isListView || isPresentationMode ? 'text-lg' : 'text-base'
          }`}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                  {item.title}
              </a>
          </h3>
          
          <div className="relative mb-4">
            <div className={`text-slate-600 dark:text-slate-400 text-sm leading-relaxed ${isExpanded || isPresentationMode ? '' : isListView ? 'line-clamp-2' : 'line-clamp-3'} prose dark:prose-invert max-w-none prose-sm prose-p:my-0`}>
                <ReactMarkdown 
                  components={{
                    a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} />
                  }}
                >
                  {item.contentSnippet || ''}
                </ReactMarkdown>
            </div>
            {item.contentSnippet && item.contentSnippet.length > 150 && !isPresentationMode && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mt-1 flex items-center focus:outline-none uppercase tracking-wide transition-colors"
              >
                {isExpanded ? (
                  <>Show Less <ChevronUp size={10} className="ml-1" /></>
                ) : (
                  <>Show More <ChevronDown size={10} className="ml-1" /></>
                )}
              </button>
            )}
          </div>

          {/* Categories */}
          {!isPresentationMode && (
          <div className="mb-4 flex flex-wrap gap-1.5">
              {displayLabels.slice(0, 4).map((cat) => {
                const isSubscribed = subscribedCategories.includes(cat);
                return (
                  <button 
                    key={cat} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectCategory) onSelectCategory(cat);
                      else onToggleSubscription(cat);
                    }}
                    className={`badge transition-colors ${
                      isSubscribed 
                        ? 'badge-green'
                        : 'badge-gray hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                      <span className="truncate max-w-[100px]">{cat}</span>
                  </button>
                );
              })}
          </div>
          )}

          {/* AI Analysis Data */}
          {analysis && (
            <div className="mb-4 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-slate-800 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30">
              <div className="flex items-center text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
                <Zap size={10} className="mr-1" /> AI Insight
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                {analysis.impact}
              </p>
            </div>
          )}
        </div>
        
        <div className={`mt-auto ${!isListView ? 'pt-4 border-t border-slate-50 dark:border-slate-800/50' : ''}`}>
            <div className="flex items-center justify-between">
                <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/link"
                >
                    Read Full Article <ExternalLink size={10} className="ml-1 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                </a>

                {!isPresentationMode && (
                <div className="flex items-center space-x-1">
                  <Tooltip content="Copy Link" position="top">
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      aria-label="Copy Link"
                    >
                      <LinkIcon size={14} />
                    </button>
                  </Tooltip>

                  <Tooltip content={isSaved ? "Remove from Read Later" : "Read Later"} position="top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSave(item);
                      }}
                      className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isSaved ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
                      aria-label={isSaved ? "Remove from Read Later" : "Read Later"}
                    >
                      <Bookmark size={14} className={isSaved ? "fill-current" : ""} />
                    </button>
                  </Tooltip>

                  <Tooltip content="Generate AI Summary" position="top">
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSummarize(item);
                        }}
                        disabled={isSummarizing}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-[10px] font-bold disabled:opacity-50"
                        aria-label="Generate AI Summary"
                    >
                        {isSummarizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="mr-1" />}
                        {isSummarizing ? '' : 'AI'}
                    </button>
                  </Tooltip>
                </div>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};


