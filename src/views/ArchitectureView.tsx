import React from 'react';
import { FeedItem } from '../types';
import { FeedCard } from '../components/FeedCard';
import { Layers, ArrowRight, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useArchitectureView } from '../hooks/useArchitectureView';

interface ArchitectureViewProps {
  items: FeedItem[];
  loading: boolean;
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  savedPosts: string[];
  isPresentationMode: boolean;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  items,
  loading,
  onSummarize,
  summarizingId,
  onSave,
  savedPosts,
  isPresentationMode
}) => {
  const { featuredItems, standardItems } = useArchitectureView(items);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section - Top 4 Items */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Star size={24} className="fill-indigo-600 dark:fill-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Architecture</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Hero Card (Item 0) */}
          {featuredItems[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 relative group overflow-hidden rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 opacity-100 transition-opacity group-hover:opacity-95" />
              
              <div className="relative p-8 md:p-12 h-full flex flex-col justify-center text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/30">
                    Latest Release
                  </span>
                  <span className="text-indigo-100 text-sm font-medium">
                    {new Date(featuredItems[0].isoDate).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  <a href={featuredItems[0].link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-2 underline-offset-4 decoration-indigo-300">
                    {featuredItems[0].title}
                  </a>
                </h3>
                
                <p className="text-indigo-50 text-lg mb-8 max-w-3xl line-clamp-3 leading-relaxed">
                  {featuredItems[0].contentSnippet}
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  {featuredItems[0].categories?.slice(0, 4).map(cat => (
                    <span key={cat} className="px-3 py-1 rounded-md bg-white/10 border border-white/20 text-sm font-medium text-white">
                      {cat}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  <a 
                    href={featuredItems[0].link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-colors flex items-center"
                  >
                    Read Guide <ArrowRight size={18} className="ml-2" />
                  </a>
                  <button 
                    onClick={() => onSummarize(featuredItems[0])}
                    className="px-6 py-3 bg-indigo-700/50 hover:bg-indigo-700/70 text-white font-bold rounded-xl border border-indigo-500/50 backdrop-blur-sm transition-colors flex items-center"
                  >
                    <Zap size={18} className="mr-2" /> AI Summary
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Secondary Featured Cards (Items 1-3) */}
          {featuredItems.slice(1).map((item, index) => (
            <motion.div
              key={item.id || item.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 1) * 0.1 }}
              className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 group"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    {item.categories?.slice(0, 2).map(cat => (
                      <span key={cat} className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(item.isoDate).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h4>

                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                  {item.contentSnippet}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <a 
                    href={item.link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                  >
                    View Details <ArrowRight size={14} className="ml-1" />
                  </a>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSave(item)}
                      className={`p-2 rounded-lg transition-colors ${savedPosts.includes(item.link) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <Layers size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Standard Feed Section */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Updates</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standardItems.map((item, index) => (
            <FeedCard
              key={item.id || item.link}
              item={item}
              index={index}
              onSummarize={onSummarize}
              isSummarizing={summarizingId === item.link}
              onSave={onSave}
              isSaved={savedPosts.includes(item.link)}
              viewMode="grid"
              subscribedCategories={[]}
              onToggleSubscription={() => {}}
              isPresentationMode={isPresentationMode}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
