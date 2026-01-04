import React, { useState } from 'react';
import { Sidebar } from '../Sidebar';
import { Menu, Maximize2, Minimize2, Sun, Moon, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { GlobalSearch } from '../GlobalSearch';
import { useTheme } from '../../hooks/useTheme';
import { Tooltip } from '../ui/Tooltip';
import { ScrollToTopButton } from '../ui/ScrollToTopButton';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isPresentationMode: boolean;
  setIsPresentationMode: (mode: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  // Search Props
  search: string;
  setSearch: (search: string) => void;
  isSmartFilter: boolean;
  setIsSmartFilter: (isSmart: boolean) => void;
  isAiLoading: boolean;
  categories: string[];
  selectedCategory: string | null;
  handleCategoryChange: (category: string | null) => void;
  dateRange: { start: string; end: string } | null;
  handleDateRangeChange: (range: { start: string; end: string } | null) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onExportCSV: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  isPresentationMode,
  setIsPresentationMode,
  isSidebarOpen,
  setIsSidebarOpen,
  search,
  setSearch,
  isSmartFilter,
  setIsSmartFilter,
  isAiLoading,
  categories,
  selectedCategory,
  handleCategoryChange,
  dateRange,
  handleDateRangeChange,
  viewMode,
  onViewModeChange,
  onExportCSV
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isPresentationMode={isPresentationMode}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isDesktopOpen={isDesktopSidebarOpen}
      />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${!isPresentationMode && isDesktopSidebarOpen ? 'lg:ml-72' : ''}`}>
        
        {/* Top Header / Controls */}
        <div className="sticky top-0 z-40 glass border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 grid grid-cols-12 gap-3 sm:gap-4 items-center">
          <div className="col-span-8 md:col-span-3 flex items-center">
            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden mr-3 p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Desktop Sidebar Toggle */}
            {!isPresentationMode && (
              <button
                onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                className="hidden lg:flex mr-4 p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={isDesktopSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              >
                {isDesktopSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
              </button>
            )}

            {isPresentationMode && (
              <div className="flex items-center space-x-2 mr-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">GCP Pulse</span>
              </div>
            )}
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white capitalize truncate">
              {isPresentationMode ? 'Executive Briefing' : activeTab === 'all' ? 'Discover Feed' : activeTab === 'saved' ? 'Read Later' : activeTab === 'dashboard' ? 'Dashboard' : activeTab}
            </h1>
          </div>

          {/* Central Global Search */}
          <div className="col-span-12 md:col-span-5 order-last md:order-none">
             {!isPresentationMode && activeTab !== 'tools' && (
                <GlobalSearch 
                  value={search} 
                  onChange={setSearch} 
                  isSmartFilter={isSmartFilter}
                  onToggleSmartFilter={() => setIsSmartFilter(!isSmartFilter)}
                  loading={isAiLoading}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategoryChange}
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  viewMode={viewMode}
                  onViewModeChange={onViewModeChange}
                  onExportCSV={onExportCSV}
                />
             )}
          </div>

          <div className="col-span-4 md:col-span-4 flex justify-end items-center space-x-2">
             {/* Theme Toggle */}
             <Tooltip content={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`} position="bottom">
               <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
             </Tooltip>
          </div>
        </div>

        <div className="p-4 sm:p-6 pb-20">
          {children}
        </div>
        
        <ScrollToTopButton />
      </div>
    </div>
  );
};
