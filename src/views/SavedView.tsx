import React from 'react';
import { FeedItem } from '../types';
import { FeedCard } from '../components/FeedCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { AnalysisResult } from '../types';
import { Bookmark, Trash2, BookOpen, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSavedView } from '../hooks/useSavedView';

interface SavedViewProps {
  items: FeedItem[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  savedPosts: string[];
  subscribedCategories: string[];
  toggleCategorySubscription: (category: string) => void;
  handleCategoryChange: (category: string | null) => void;
  analyses: Record<string, AnalysisResult>;
  isPresentationMode: boolean;
  onClearAll: () => void;
  onExplore: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  items,
  loading,
  viewMode,
  onSummarize,
  summarizingId,
  onSave,
  savedPosts,
  subscribedCategories,
  toggleCategorySubscription,
  handleCategoryChange,
  analyses,
  isPresentationMode,
  onClearAll,
  onExplore
}) => {
  const { handleClearAll } = useSavedView(onClearAll);

  if (loading) {
    return (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
          <Bookmark size={48} className="text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Your reading list is empty
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
          Save interesting updates, tutorials, and announcements here to read them later when you have more time.
        </p>
        <button 
          onClick={onExplore}
          className="btn btn-primary btn-lg group"
        >
          Explore Updates <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reading List</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{items.length} articles saved</p>
          </div>
        </div>
        
        <button 
          onClick={handleClearAll}
          className="btn btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 size={16} className="mr-2" />
          Clear List
        </button>
      </div>

      <div className={`grid gap-8 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 max-w-4xl mx-auto'
      }`}>
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={`${item.link}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <FeedCard 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === item.link}
                onSave={() => onSave(item)}
                isSaved={true}
                viewMode={viewMode}
                subscribedCategories={subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.link]}
                isPresentationMode={isPresentationMode}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
