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
      <div className={`flex items-center space-x-2 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700`}>
        <div className={`w-3 h-8 rounded-full ${barColor}`}></div>
        <h2 className={`text-lg font-bold ${headerColor}`}>{source}</h2>
        <span className={`${badgeColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
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
              <div ref={ref} className="flex justify-center py-4">
                 <div className="flex items-center space-x-2 text-slate-400 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading more...</span>
                 </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
            {source === 'Service Health' ? (
                <>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-green-800 dark:text-green-300 font-medium">All systems operational</p>
                </>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm italic">No recent updates</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
