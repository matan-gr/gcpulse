import React, { useState } from 'react';
import { FeedItem } from '../types';
import { StatusDashboard } from '../components/StatusDashboard';
import { FeedColumn } from '../components/FeedColumn';
import { AnalysisResult } from '../types';
import { Loader2, LayoutTemplate, Image as ImageIcon, AlignJustify, Grid, Columns, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { useDiscoverView } from '../hooks/useDiscoverView';
import { UserPreferences } from '../hooks/useUserPreferences';
import { motion, AnimatePresence, Reorder } from 'motion/react';

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

  // Handle reorder
  const handleReorder = (newOrder: string[]) => {
    // We need to merge the new order of visible columns with the hidden columns to keep the full list intact
    const hiddenCols = prefs.columnOrder.filter(c => !visibleColumns.includes(c));
    // This simple merge puts hidden columns at the end, which is fine for now
    onUpdateColumnOrder([...newOrder, ...hiddenCols]);
  };

  const moveColumn = (column: string, direction: 'up' | 'down') => {
    const currentIndex = prefs.columnOrder.indexOf(column);
    if (currentIndex === -1) return;
    
    const newOrder = [...prefs.columnOrder];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
      onUpdateColumnOrder(newOrder);
    }
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
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-[60px] sm:top-[70px] z-20"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-all">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Feed View</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Customize your layout</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
             <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                  showColumnMenu
                    ? 'bg-blue-600 text-white shadow-blue-600/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <Columns size={14} />
                <span className="hidden sm:inline">Customize Columns</span>
                <span className="inline sm:hidden">Cols</span>
              </motion.button>
            </div>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1" />

            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1">
            {/* View Options Group */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setDensity('comfortable')}
                className={`p-2 rounded-lg transition-all flex items-center space-x-2 ${
                  density === 'comfortable' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Comfortable View"
              >
                <Grid size={16} />
                <span className="text-xs font-medium hidden lg:inline">Comfortable</span>
              </button>
              <button
                onClick={() => setDensity('compact')}
                className={`p-2 rounded-lg transition-all flex items-center space-x-2 ${
                  density === 'compact' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Compact View"
              >
                <AlignJustify size={16} />
                <span className="text-xs font-medium hidden lg:inline">Compact</span>
              </button>
            </div>

            {/* Image Toggle Switch */}
            <button
              onClick={() => setShowImages(!showImages)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                showImages 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              <ImageIcon size={16} className={showImages ? 'text-blue-500' : 'text-slate-400'} />
              <span className="hidden sm:inline">Images</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${showImages ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${showImages ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
            </div>
          </div>
        </div>
        
        {/* Dropdown Menu */}
        <AnimatePresence>
            {showColumnMenu && (
                <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-4 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50"
                style={{ marginLeft: '0px' }} 
                >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manage Columns</h3>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500">{visibleColumns.length} Visible</span>
                </div>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    {prefs.columnOrder.filter(c => !['Deprecations', 'Service Health', 'Architecture Center', 'Security Bulletins', 'Open Source Blog'].includes(c)).map((column, index) => {
                    const isVisible = !prefs.hiddenColumns.includes(column);
                    return (
                        <motion.div 
                        key={column} 
                        layout
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all group ${
                            isVisible 
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' 
                            : 'bg-transparent border-transparent opacity-50 hover:opacity-100'
                        }`}
                        >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                              <GripVertical size={14} />
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isVisible ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            <span className={`text-sm font-medium truncate ${isVisible ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500'}`}>{column}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                           {/* Simple Reorder Buttons (since full DnD is complex to implement perfectly in this snippet without extra libs) */}
                           <div className="flex flex-col space-y-0.5 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveColumn(column, 'up'); }}
                                disabled={index === 0}
                                className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                              >
                                <ArrowUp size={10} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveColumn(column, 'down'); }}
                                disabled={index === prefs.columnOrder.length - 1}
                                className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                              >
                                <ArrowDown size={10} />
                              </button>
                           </div>

                            <button
                                onClick={(e) => {
                                e.stopPropagation();
                                onToggleColumnVisibility(column);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                isVisible 
                                    ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title={isVisible ? "Hide Column" : "Show Column"}
                            >
                                {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                        </div>
                        </motion.div>
                    );
                    })}
                </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      {/* Column Layout */}
      <div id="feed-grid" className="flex flex-wrap justify-center gap-6">
        <Reorder.Group axis="x" values={visibleColumns} onReorder={handleReorder} className="contents">
        {visibleColumns.map((source: string) => {
          const columnItems = getColumnItems(source);
          
          return (
            <Reorder.Item key={source} value={source} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] min-w-[300px]">
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
            </Reorder.Item>
          );
        })}
        </Reorder.Group>
      </div>
    </div>
  );
};
