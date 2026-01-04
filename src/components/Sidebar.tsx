import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Rss, AlertOctagon, Bookmark, Wrench, ChevronRight, Menu, X, ShieldAlert, Layers, Sparkles, CalendarClock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'all' | 'saved' | 'incidents' | 'deprecations' | 'security' | 'architecture' | 'tools' | 'dashboard' | 'assistant') => void;
  isPresentationMode: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDesktopOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isPresentationMode,
  isOpen,
  setIsOpen,
  isDesktopOpen
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

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <AnimatePresence mode="wait">
        {((isDesktop && isDesktopOpen) || (!isDesktop && isOpen)) && (
          <motion.div 
            initial={isDesktop ? { x: -280, opacity: 0 } : { x: -280 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 h-full w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-[50] shadow-2xl lg:shadow-none flex flex-col`}
          >
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
                  <Zap size={20} className="fill-current" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">GCP Pulse</h1>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Intelligence</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
              {[
                {
                  title: 'Overview',
                  items: [
                    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
                    { id: 'assistant', label: 'TAM Assistant', icon: Sparkles },
                  ]
                },
                {
                  title: 'Intelligence Feeds',
                  items: [
                    { id: 'all', label: 'Discover Feed', icon: Rss },
                    { id: 'incidents', label: 'Incidents', icon: AlertOctagon },
                    { id: 'security', label: 'Security Bulletins', icon: ShieldAlert },
                    { id: 'deprecations', label: 'Deprecations', icon: CalendarClock },
                    { id: 'architecture', label: 'Architecture', icon: Layers },
                  ]
                },
                {
                  title: 'Personal',
                  items: [
                    { id: 'saved', label: 'Read Later', icon: Bookmark },
                    { id: 'tools', label: 'Tools', icon: Wrench },
                  ]
                }
              ].map((section, idx) => (
                <div key={idx}>
                  <div className="flex items-center px-4 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.title}</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 ml-3" />
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = activeTab === item.id;
                      const Icon = item.icon;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            if (!isDesktop) setIsOpen(false);
                          }}
                          className={`relative w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${
                            isActive 
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeTabBackground"
                              className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          
                          <div className="relative flex items-center space-x-3 z-10">
                            <div className={`p-1.5 rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-300' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300'
                            }`}>
                              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`font-medium text-sm ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                          </div>
                          
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="relative z-10"
                            >
                              <ChevronRight size={16} className="text-blue-500" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* User/Footer Area */}
            {/* <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  JD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Jane Doe</p>
                  <p className="text-xs text-slate-500 truncate">Technical Account Manager</p>
                </div>
              </div>
            </div> */}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay for mobile */}
      {isOpen && !isDesktop && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[45]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
