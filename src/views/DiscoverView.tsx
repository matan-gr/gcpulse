import React, { useState } from 'react';
import { FeedItem } from '../types';
import { StatusDashboard } from '../components/StatusDashboard';
import { FeedColumn } from '../components/FeedColumn';
import { AnalysisResult } from '../types';
import { Loader2, LayoutTemplate, Image as ImageIcon, AlignJustify, Grid, Zap, ArrowRight, Sparkles, Columns, Check, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useDiscoverView } from '../hooks/useDiscoverView';
import { UserPreferences } from '../hooks/useUserPreferences';
import { motion, Reorder } from 'motion/react';

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
  onToggleColumnVisibility: (column: string) => void;
  onUpdateColumnOrder: (order: string[]) => void;
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
  isAiLoading,
  onToggleColumnVisibility,
  onUpdateColumnOrder
}) => {
  const { visibleColumns, getColumnItems, handleScrollToFeed } = useDiscoverView(items, prefs);
  
  // View Customization State
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [showImages, setShowImages] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Filter out columns that shouldn't be toggled/reordered for the main feed logic if necessary,
  // but usually we want to reorder the main content columns.
  // The 'Deprecations' and 'Service Health' might be fixed or handled differently, 
  // but for reordering, let's allow reordering of the main content columns.
  // Based on previous code, toggleableColumns excluded Deprecations and Service Health.
  // Let's keep that logic for now but allow reordering of the *visible* ones that are toggleable.
  
  const toggleableColumns = prefs.columnOrder.filter(c => c !== 'Deprecations' && c !== 'Service Health');

  const handleReorder = (newOrder: string[]) => {
    // We need to preserve the non-toggleable columns in their positions or append them?
    // Actually, prefs.columnOrder contains ALL columns.
    // We are only reordering the "toggleable" subset.
    // Let's reconstruct the full list.
    const nonToggleable = prefs.columnOrder.filter(c => c === 'Deprecations' || c === 'Service Health');
    // This simple merge assumes non-toggleable are always at the end or specific spots.
    // For simplicity, let's just update the order of the toggleable ones and keep others as is (or remove them if they aren't in the list).
    // Better approach: Just reorder the whole list if possible, but if UI only shows subset, we need to be careful.
    
    // Let's assume we want to reorder the *entire* list that is available in the UI.
    // If the UI only shows a subset, we can't reorder the others.
    // Let's show ALL columns in the reorder list for maximum flexibility.
    onUpdateColumnOrder(newOrder);
  };

  return (
    <div className="space-y-8">
      {/* Status Dashboard */}
      {!loading && items.length > 0 && (
        <StatusDashboard 
          items={items} 
          onViewCritical={handleScrollToFeed}
        />
      )}

      {isAiLoading && (
          <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-full border border-purple-100 shadow-sm animate-pulse">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-sm font-medium">AI is analyzing the feed...</span>
              </div>
          </div>
      )}

      {/* View Customization Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-[60px] sm:top-[70px] z-20 transition-all">
        <div className="flex items-center space-x-2">
          <LayoutTemplate size={20} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">Feed View</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {/* Column Visibility & Order Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                showColumnMenu
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Columns size={14} />
              <span className="hidden xs:inline">Customize</span>
              <span className="inline xs:hidden">Cols</span>
            </button>

            {showColumnMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-30">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Visibility & Order</h3>
                <p className="text-[10px] text-slate-400 mb-3">Drag to reorder. Click eye to toggle.</p>
                
                <Reorder.Group axis="y" values={prefs.columnOrder} onReorder={handleReorder} className="space-y-2">
                  {prefs.columnOrder.map((column) => {
                    const isVisible = !prefs.hiddenColumns.includes(column);
                    // Prevent toggling essential columns if needed, or just allow all.
                    // Let's allow all for now, or restrict 'Service Health' if it's critical.
                    const isLocked = false; 

                    return (
                      <Reorder.Item key={column} value={column}>
                        <div className={`flex items-center justify-between p-2 rounded-lg border ${
                          isVisible 
                            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-60'
                        } cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-700 transition-colors`}>
                          <div className="flex items-center space-x-3">
                            <GripVertical size={14} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{column}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent drag start
                              onToggleColumnVisibility(column);
                            }}
                            className={`p-1.5 rounded-md transition-colors ${
                              isVisible 
                                ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                                : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            title={isVisible ? "Hide Column" : "Show Column"}
                          >
                            {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                        </div>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </div>
            )}
          </div>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

          {/* Density Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setDensity('comfortable')}
              className={`p-1.5 rounded-md transition-all ${density === 'comfortable' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Comfortable View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setDensity('compact')}
              className={`p-1.5 rounded-md transition-all ${density === 'compact' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Compact View"
            >
              <AlignJustify size={16} />
            </button>
          </div>

          {/* Image Toggle */}
          <button
            onClick={() => setShowImages(!showImages)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              showImages 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <ImageIcon size={14} />
            <span>{showImages ? 'Images On' : 'Images Off'}</span>
          </button>
        </div>
      </div>

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
                density={density}
                showImages={showImages}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
