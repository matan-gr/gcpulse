import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Sparkles, X, Calendar, Tag, LayoutGrid, List, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from './ui/Tooltip';

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  isSmartFilter: boolean;
  onToggleSmartFilter: () => void;
  loading?: boolean;
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  dateRange: { start: string; end: string } | null;
  onDateRangeChange: (range: { start: string; end: string } | null) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onExportCSV?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  value,
  onChange,
  isSmartFilter,
  onToggleSmartFilter,
  loading,
  categories,
  selectedCategory,
  onSelectCategory,
  dateRange,
  onDateRangeChange,
  viewMode,
  onViewModeChange,
  onExportCSV,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasActiveFilters = selectedCategory || dateRange;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 transition-colors ${isSmartFilter ? 'text-purple-500' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSmartFilter ? "Ask AI to find updates..." : "Search updates (Cmd+K)..."}
          className={`input-field pl-11 pr-32 py-2.5 relative z-10 ${
            isSmartFilter ? 'focus:border-purple-500 ring-purple-500/20' : ''
          }`}
        />
        
        {/* Right Actions */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1 z-20">
          {/* Smart Filter Toggle */}
          <Tooltip content="Toggle AI Smart Search" position="bottom">
            <button
              onClick={onToggleSmartFilter}
              className={`p-1.5 rounded-lg transition-all ${
                isSmartFilter 
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                  : 'text-slate-400 hover:text-purple-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles size={16} className={loading ? 'animate-pulse' : ''} />
            </button>
          </Tooltip>

          {/* Filter Toggle */}
          <Tooltip content="Filters & View Options" position="bottom">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`p-1.5 rounded-lg transition-all ${
                isFiltersOpen || hasActiveFilters
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50"
          >
            <div className="space-y-4">
              {/* Header with Clear All */}
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filters</h3>
                {(selectedCategory || dateRange) && (
                  <button 
                    onClick={() => {
                      onSelectCategory(null);
                      onDateRangeChange(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center"
                  >
                    <X size={12} className="mr-1" /> Clear All
                  </button>
                )}
              </div>

              {/* View Mode */}
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View Layout</span>
                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                  <Tooltip content="Grid View" position="top">
                    <button
                      onClick={() => onViewModeChange('grid')}
                      className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <LayoutGrid size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip content="List View" position="top">
                    <button
                      onClick={() => onViewModeChange('list')}
                      className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <List size={16} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                  <Tag size={14} className="mr-2" /> Category
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-2" /> Date Range
                  </div>
                  {onExportCSV && (
                    <button
                      onClick={onExportCSV}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                      title="Export visible items to CSV for QBR"
                    >
                      <Download size={12} className="mr-1" /> Export CSV
                    </button>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange?.start || ''}
                    onChange={(e) => onDateRangeChange({ start: e.target.value, end: dateRange?.end || '' })}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                  <input
                    type="date"
                    value={dateRange?.end || ''}
                    onChange={(e) => onDateRangeChange({ start: dateRange?.start || '', end: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
