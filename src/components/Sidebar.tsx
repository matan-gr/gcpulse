import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Rss, AlertOctagon, Bookmark, Wrench, ChevronRight, Menu, X, ShieldAlert, Layers, Sparkles, CalendarClock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'all' | 'saved' | 'incidents' | 'deprecations' | 'security' | 'architecture' | 'tools' | 'dashboard' | 'assistant') => void;
  isPresentationMode: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isPresentationMode,
  isOpen,
  setIsOpen
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setIsOpen(false); // Close mobile menu state when switching to desktop
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'TAM Assistant', icon: Sparkles },
    { id: 'all', label: 'Discover Feed', icon: Rss },
    { id: 'incidents', label: 'Incidents', icon: AlertOctagon },
    { id: 'security', label: 'Security Bulletins', icon: ShieldAlert },
    { id: 'deprecations', label: 'Deprecations', icon: CalendarClock },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'saved', label: 'Read Later', icon: Bookmark },
    { id: 'tools', label: 'Tools', icon: Wrench },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <AnimatePresence mode="wait">
        {(isOpen || isDesktop) && (
          <motion.div 
            initial={isDesktop ? { x: 0 } : { x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 shadow-xl lg:shadow-none`}
          >
            <div className="flex flex-col h-full">
              {/* Logo Area */}
              <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">GCP Pulse</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                  Main Menu
                </div>
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        if (!isDesktop) setIsOpen(false);
                      }}
                      className={`relative w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${
                        isActive 
                          ? 'text-blue-700 dark:text-blue-400 font-bold' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      
                      <div className="relative flex items-center space-x-3 z-10">
                        <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'} />
                        <span>{item.label}</span>
                      </div>
                      
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="relative z-10"
                        >
                          <ChevronRight size={16} className="text-blue-600 dark:text-blue-400" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay for mobile */}
      {isOpen && !isDesktop && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
