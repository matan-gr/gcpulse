import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedItem } from '../types';
import { extractImage, extractGCPProducts } from '../utils';
import { Calendar, Tag, ExternalLink, Sparkles, Bookmark, Loader2, Plus, Check, AlertOctagon, Activity, Zap, Box, Link as LinkIcon, ChevronDown, ChevronUp, Clock, ArrowRight, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

import { AnalysisResult } from '../types';
import { Tooltip } from './ui/Tooltip';
import { FeedItemDetailModal } from './FeedItemDetailModal';

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
  density?: 'comfortable' | 'compact';
  showImages?: boolean;
}

import { ErrorBoundary } from './ErrorBoundary';

export const FeedCard = React.memo<FeedCardProps>((props) => {
  const { item } = props;
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '400px 0px',
  });

  return (
    <div ref={ref} className="min-h-[100px]">
      {inView ? (
        <ErrorBoundary componentName={`FeedCard-${item.title}`}>
          <FeedCardContent {...props} />
        </ErrorBoundary>
      ) : (
        <div className="w-full h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div className="w-24 h-6 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                <div className="w-16 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="w-3/4 h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="space-y-2">
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-2/3 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
        </div>
      )}
    </div>
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
  isPresentationMode = false, 
  density = 'comfortable', 
  showImages = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const image = item.enclosure?.url || extractImage(item.content);
  const date = new Date(item.isoDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isListView = viewMode === 'list' && !isPresentationMode;
  const isIncident = item.source === 'Service Health';
  const isDeprecation = item.source === 'Deprecations';
  const isCompact = density === 'compact';

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

        <div className={`${isCompact ? 'p-3' : 'p-5'} flex flex-col flex-1 relative`}>
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

          <h3 className={`font-bold text-slate-900 dark:text-white mb-2 z-10 relative ${isPresentationMode ? 'text-xl' : isCompact ? 'text-sm' : 'text-base'} leading-snug`}>
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
      className={`card card-hover flex ${
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
      {image && !isPresentationMode && showImages && (
        <div 
          className={`${isListView ? 'w-48 min-w-[192px]' : isCompact ? 'h-24' : 'h-40'} overflow-hidden relative cursor-pointer group/image bg-slate-100 dark:bg-slate-900`}
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
      
        <div className={`${isCompact ? 'p-3' : 'p-6'} flex-1 flex flex-col ${isListView ? 'justify-between' : ''}`}>
        <div>
          <div className={`flex items-center justify-between ${isCompact ? 'mb-1' : 'mb-3'}`}>
             <div className="flex items-center space-x-2">
                <span className={`badge ${
                  item.source === 'Release Notes' ? 'badge-orange' :
                  item.source === 'Product Updates' ? 'badge-green' :
                  'badge-blue'
                }`}>
                  {item.source}
                </span>
             </div>
             <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center">
                {date}
             </span>
          </div>
          
          <h3 className={`font-bold text-slate-900 dark:text-white ${isCompact ? 'mb-1 text-sm' : 'mb-3 text-lg'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight`}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                  {item.title}
              </a>
          </h3>
          
          <div className={`relative ${isCompact ? 'mb-2' : 'mb-4'}`}>
            <div className={`text-slate-600 dark:text-slate-300 ${isCompact ? 'text-xs leading-snug line-clamp-2' : 'text-sm leading-relaxed line-clamp-3'} ${isExpanded || isPresentationMode ? '' : ''} prose dark:prose-invert max-w-none prose-sm prose-p:my-0`}>
                <ReactMarkdown 
                  components={{
                    a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} />
                  }}
                >
                  {item.contentSnippet || ''}
                </ReactMarkdown>
            </div>
            {item.contentSnippet && item.contentSnippet.length > 150 && !isPresentationMode && !isCompact && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mt-2 flex items-center focus:outline-none uppercase tracking-wide transition-colors"
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
          {!isPresentationMode && !isCompact && (
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
            <div className={`mb-4 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-slate-800 rounded-lg border border-purple-100 dark:border-purple-800/30 ${isCompact ? 'p-2' : 'p-3'}`}>
              <div className="flex items-center text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
                <Zap size={10} className="mr-1" /> AI Insight
              </div>
              <p className={`text-slate-700 dark:text-slate-300 leading-relaxed ${isCompact ? 'text-[10px] line-clamp-2' : 'text-xs line-clamp-3'}`}>
                {analysis.impact}
              </p>
            </div>
          )}
        </div>
        
        <div className={`mt-auto ${!isListView ? `pt-4 border-t border-slate-50 dark:border-slate-800/50 ${isCompact ? 'pt-2' : 'pt-4'}` : ''}`}>
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
                      className="btn-icon"
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
                      className={`btn-icon ${isSaved ? 'text-blue-600 dark:text-blue-400' : ''}`}
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
      
      <FeedItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={item}
        analysis={analysis}
        onSave={onSave}
        isSaved={isSaved}
        onSummarize={onSummarize}
        isSummarizing={isSummarizing}
      />
    </motion.div>
  );
};
