import React from 'react';
import { FeedItem } from '../types';
import { Activity, TrendingUp, Zap, Server, ShieldCheck, AlertTriangle, ArrowRight, Maximize2, Minimize2, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivityChart } from './dashboard/ActivityChart';
import { CategoryDistribution } from './dashboard/CategoryDistribution';

interface StatusDashboardProps {
  items: FeedItem[];
  onViewCritical?: () => void;
  isPresentationMode?: boolean;
  onTogglePresentationMode?: () => void;
}

export const StatusDashboard: React.FC<StatusDashboardProps> = ({ 
  items, 
  onViewCritical,
  isPresentationMode = false,
  onTogglePresentationMode
}) => {
  // 1. System Health Logic (Robust)
  const serviceHealthItems = items.filter(i => i.source === 'Service Health');
  const activeIncidents = serviceHealthItems.filter(i => i.isActive);
  const hasActiveIncidents = activeIncidents.length > 0;

  // 2. Security Logic
  const securityBulletins = items.filter(i => i.source === 'Security Bulletins');
  const newSecurityCount = securityBulletins.filter(i => {
    const date = new Date(i.isoDate);
    const now = new Date();
    return (now.getTime() - date.getTime()) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
  }).length;

  // 3. Velocity Logic
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyItems = items.filter(i => new Date(i.isoDate) > oneWeekAgo);

  // 4. Action Items Logic
  const criticalUpdates = items
    .filter(i => i.source === 'Deprecations')
    .slice(0, 5);

  return (
    <div className={`container mx-auto px-4 transition-all duration-500 ${isPresentationMode ? 'py-8' : 'mb-12'}`}>
      
      {/* Dashboard Header - Only visible in Presentation Mode */}
      {isPresentationMode && (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">GCP Executive Briefing</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time landscape analysis and critical updates</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Live Data</p>
            </div>
            <button 
              onClick={onTogglePresentationMode}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Exit Presentation Mode"
            >
              <Minimize2 size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className={`grid gap-6 ${isPresentationMode ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        
        {/* 1. System Health Card */}
        <motion.div 
          layout
          className={`card p-6 flex flex-col justify-between relative overflow-hidden border-l-4 ${
            hasActiveIncidents ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' : 'border-l-emerald-500 bg-white dark:bg-slate-900'
          } ${isPresentationMode ? 'h-64' : 'h-60'}`}
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">System Health</p>
              <h3 className={`text-2xl font-bold ${hasActiveIncidents ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                {hasActiveIncidents ? 'Service Disruption' : 'Fully Operational'}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${hasActiveIncidents ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <Activity size={24} />
            </div>
          </div>

          <div className="z-10 mt-4">
            {hasActiveIncidents ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {activeIncidents.length} active incident{activeIncidents.length > 1 ? 's' : ''} reported.
                </p>
                {activeIncidents.slice(0, 2).map((inc, idx) => (
                  <a key={idx} href={inc.link} target="_blank" rel="noopener noreferrer" className="block text-xs text-red-600 hover:underline truncate">
                    • {inc.serviceName}: {inc.title}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                All Google Cloud services are running normally. No active incidents detected.
              </p>
            )}
          </div>

          <div className="mt-auto pt-4 z-10">
             <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${hasActiveIncidents ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: hasActiveIncidents ? '60%' : '100%' }}></div>
             </div>
          </div>
        </motion.div>

        {/* 2. Security Posture Card */}
        <motion.div 
          layout
          className={`card p-6 flex flex-col justify-between relative overflow-hidden border-l-4 border-l-purple-500 bg-white dark:bg-slate-900 ${isPresentationMode ? 'h-64' : 'h-60'}`}
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Security Posture</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {newSecurityCount} New Alerts
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <ShieldCheck size={24} />
            </div>
          </div>

          <div className="z-10 mt-4 flex-1">
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
               {securityBulletins.length} total bulletins in the last 30 days.
             </p>
             <div className="space-y-2">
               {securityBulletins.slice(0, 2).map((item, idx) => (
                 <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors">
                   <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 flex-shrink-0" />
                   <span className="truncate">{item.title}</span>
                 </a>
               ))}
             </div>
          </div>
        </motion.div>

        {/* 3. Velocity Card */}
        <motion.div 
          layout
          className={`card p-6 flex flex-col justify-between relative overflow-hidden border-l-4 border-l-blue-500 bg-white dark:bg-slate-900 ${isPresentationMode ? 'h-64' : 'h-60'}`}
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Update Velocity</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {weeklyItems.length} Updates
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="z-10 mt-4 flex-1 flex flex-col justify-end">
             <div className="h-24 w-full -ml-2">
                <ActivityChart items={items} />
             </div>
             <p className="text-xs text-slate-400 text-center mt-2">7-Day Activity Trend</p>
          </div>
        </motion.div>

        {/* 4. Action Items Card */}
        <motion.div 
          layout
          className={`card p-6 flex flex-col justify-between relative overflow-hidden border-l-4 border-l-amber-500 bg-white dark:bg-slate-900 ${isPresentationMode ? 'h-64' : 'h-60'}`}
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Actions</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {criticalUpdates.length} Deprecations
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Clock size={24} />
            </div>
          </div>

          <div className="z-10 mt-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
             {criticalUpdates.length > 0 ? (
               <div className="space-y-3">
                 {criticalUpdates.map((item, idx) => (
                   <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">EOL</span>
                       <span className="text-[10px] text-slate-400">{new Date(item.isoDate).toLocaleDateString()}</span>
                     </div>
                     <p className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 line-clamp-2">
                       {item.title}
                     </p>
                   </a>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-400">
                 <CheckCircle size={20} className="mb-2 opacity-50" />
                 <p className="text-xs">No pending actions</p>
               </div>
             )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
