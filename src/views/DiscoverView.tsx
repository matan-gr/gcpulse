import React from 'react';
import { FeedItem } from '../types';
import { StatusDashboard } from '../components/StatusDashboard';
import { FeedColumn } from '../components/FeedColumn';
import { AnalysisResult } from '../types';
import { Loader2 } from 'lucide-react';
import { useDiscoverView } from '../hooks/useDiscoverView';
import { UserPreferences } from '../hooks/useUserPreferences';

interface DiscoverViewProps {
  items: FeedItem[];
  loading: boolean;
  prefs: UserPreferences;
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  toggleCategorySubscription: (category: string) => void;
  handleCategoryChange: (category: string | null) => void;
  analyses: Record<string, AnalysisResult>;
  isPresentationMode: boolean;
  isAiLoading: boolean;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  items,
  loading,
  prefs,
  onSummarize,
  summarizingId,
  onSave,
  toggleCategorySubscription,
  handleCategoryChange,
  analyses,
  isPresentationMode,
  isAiLoading
}) => {
  const { visibleColumns, getColumnItems, handleScrollToFeed } = useDiscoverView(items, prefs);

  return (
    <>
      {/* Status Dashboard */}
      {!loading && items.length > 0 && (
        <div className="mb-10">
          <StatusDashboard 
            items={items} 
            onViewCritical={handleScrollToFeed}
          />
        </div>
      )}

      {isAiLoading && (
          <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-sm font-medium">AI is analyzing the feed...</span>
              </div>
          </div>
      )}

      {/* Column Layout */}
      <div id="feed-grid" className="flex flex-wrap justify-center gap-6">
        {visibleColumns.map((source: string) => {
          const columnItems = getColumnItems(source);
          
          return (
            <div key={source} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] min-w-[300px]">
              <FeedColumn
                source={source}
                items={columnItems}
                isLoading={loading}
                onSummarize={onSummarize}
                summarizingId={summarizingId}
                onSave={onSave}
                savedPosts={prefs.savedPosts}
                subscribedCategories={prefs.subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analyses={analyses}
                isPresentationMode={isPresentationMode}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};
