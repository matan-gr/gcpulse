import React, { useState, useEffect } from 'react';
import { FeedItem } from '../types';
import { FeedCard } from './FeedCard';
import { SkeletonCard } from './SkeletonCard';
import { DeprecationLoader } from './DeprecationLoader';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult } from '../types';
import { useInView } from 'react-intersection-observer';

interface FeedColumnProps {
  source: string;
  items: FeedItem[];
  isLoading: boolean;
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  savedPosts: string[];
  subscribedCategories: string[];
  onToggleSubscription: (category: string) => void;
  onSelectCategory: (category: string | null) => void;
  analyses: Record<string, AnalysisResult>;
  isPresentationMode: boolean;
  density?: 'comfortable' | 'compact';
  showImages?: boolean;
}

export const FeedColumn: React.FC<FeedColumnProps> = ({
  source,
  items,
  isLoading,
  onSummarize,
  summarizingId,
  onSave,
  savedPosts,
  subscribedCategories,
  onToggleSubscription,
  onSelectCategory,
  analyses,
  isPresentationMode,
  density = 'comfortable',
  showImages = true
}) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px', // Load more before reaching the bottom
  });

  useEffect(() => {
    if (inView && hasMore) {
      // Small delay to simulate loading or just debounce slightly
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 5);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [inView, hasMore]);

  // Define styles based on source
  let headerColor = '';
  let badgeColor = '';
  let barColor = '';

  switch (source) {
    case 'Cloud Blog':
      headerColor = 'text-indigo-800 dark:text-indigo-400';
      badgeColor = 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300';
      barColor = 'bg-indigo-600 dark:bg-indigo-500';
      break;
    case 'Product Updates':
      headerColor = 'text-emerald-800 dark:text-emerald-400';
      badgeColor = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      barColor = 'bg-emerald-600 dark:bg-emerald-500';
      break;
    case 'Release Notes':
      headerColor = 'text-violet-800 dark:text-violet-400';
      badgeColor = 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300';
      barColor = 'bg-violet-600 dark:bg-violet-500';
      break;
    case 'Service Health':
      headerColor = 'text-rose-800 dark:text-rose-400';
      badgeColor = 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300';
      barColor = 'bg-rose-600 dark:bg-rose-500';
      break;
    case 'Deprecations':
      headerColor = 'text-amber-800 dark:text-amber-400';
      badgeColor = 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
      barColor = 'bg-amber-500';
      break;
    default:
      headerColor = 'text-gray-800 dark:text-gray-200';
      badgeColor = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      barColor = 'bg-gray-600 dark:bg-gray-500';
  }

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 group`}>
        <div className="flex items-center space-x-3">
          <div className={`w-1.5 h-6 rounded-full ${barColor} group-hover:scale-y-125 transition-transform`}></div>
          <h2 className={`text-lg font-bold ${headerColor} tracking-tight`}>{source}</h2>
        </div>
        <span className={`${badgeColor} text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm`}>
          {items.length}
        </span>
      </div>
      
      <div className="space-y-6">
        {isLoading ? (
          source === 'Deprecations' ? (
            <DeprecationLoader />
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} viewMode="grid" />
            ))
          )
        ) : visibleItems.length > 0 ? (
          <>
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item, index) => (
                <FeedCard 
                  key={`${item.link}-${index}`} 
                  item={item} 
                  index={index}
                  onSummarize={onSummarize}
                  isSummarizing={summarizingId === item.link}
                  onSave={onSave}
                  isSaved={savedPosts.includes(item.link)}
                  viewMode="grid"
                  subscribedCategories={subscribedCategories}
                  onToggleSubscription={onToggleSubscription}
                  onSelectCategory={onSelectCategory}
                  analysis={analyses[item.link]}
                  isPresentationMode={isPresentationMode}
                  density={density}
                  showImages={showImages}
                />
              ))}
            </AnimatePresence>
            
            {hasMore && (
              <div ref={ref} className="flex justify-center py-6">
                 <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-medium">
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    <span>Loading updates...</span>
                 </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[200px]">
            {source === 'Service Health' ? (
                <>
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                  <Check size={32} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-emerald-900 dark:text-emerald-200 font-bold text-sm">All systems operational</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1">No active incidents reported</p>
                </>
            ) : (
              <>
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <ChevronDown size={20} className="text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No recent updates</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
