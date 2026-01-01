import React, { useRef, useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ColumnCustomizer } from './ColumnCustomizer';
import { motion } from 'motion/react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setSearch: (search: string) => void;
  setIsSmartFilter: (isSmart: boolean) => void;
  handleCategoryChange: (category: string | null) => void;
  handleDateRangeChange: (range: { start: string; end: string } | null) => void;
  savedCount: number;
  isPresentationMode: boolean;
  // Column Customizer Props
  isColumnCustomizerOpen: boolean;
  setIsColumnCustomizerOpen: (open: boolean) => void;
  columnOrder: string[];
  hiddenColumns: string[];
  onUpdateOrder: (order: string[]) => void;
  onToggleVisibility: (column: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  setSearch,
  setIsSmartFilter,
  handleCategoryChange,
  handleDateRangeChange,
  savedCount,
  isPresentationMode,
  isColumnCustomizerOpen,
  setIsColumnCustomizerOpen,
  columnOrder,
  hiddenColumns,
  onUpdateOrder,
  onToggleVisibility
}) => {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  if (isPresentationMode) return null;

  const tabs = [
    { id: 'all', label: 'Discover', color: 'blue' },
    { id: 'incidents', label: 'Incidents', color: 'red' },
    { id: 'deprecations', label: 'Deprecations', color: 'amber' },
    { id: 'security', label: 'Security', color: 'purple' },
    { id: 'architecture', label: 'Architecture', color: 'indigo' },
    { id: 'saved', label: `Read Later (${savedCount})`, color: 'blue' },
  ];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setSearch('');
    setIsSmartFilter(false);
    handleCategoryChange(null);
    handleDateRangeChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % tabs.length;
      setFocusedIndex(nextIndex);
      tabsRef.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      setFocusedIndex(prevIndex);
      tabsRef.current[prevIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center items-center mb-8 border-b border-gray-200 dark:border-gray-800 relative">
      <div className="flex overflow-x-auto relative" role="tablist" aria-label="Feed Categories">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => (tabsRef.current[index] = el)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-t-lg ${
                isActive 
                  ? `text-${tab.color}-600 dark:text-${tab.color}-400` 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-600 dark:bg-${tab.color}-400`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {activeTab === 'all' && (
        <div className="absolute right-0">
          <button
            onClick={() => setIsColumnCustomizerOpen(!isColumnCustomizerOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors mr-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Customize Columns"
          >
            <SlidersHorizontal size={14} />
            <span>Customize</span>
          </button>
          <ColumnCustomizer
            isOpen={isColumnCustomizerOpen}
            onClose={() => setIsColumnCustomizerOpen(false)}
            columnOrder={columnOrder}
            hiddenColumns={hiddenColumns}
            onUpdateOrder={onUpdateOrder}
            onToggleVisibility={onToggleVisibility}
          />
        </div>
      )}
    </div>
  );
};
