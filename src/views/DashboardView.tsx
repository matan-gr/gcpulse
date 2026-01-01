import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { FeedItem } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, ShieldAlert, Activity, Info, CalendarClock, Zap, Rocket, CheckCircle2, Globe, Layers, Lock, AlertTriangle, ArrowUpRight, Server } from 'lucide-react';
import { Tooltip } from '../components/ui/Tooltip';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface DashboardViewProps {
  items: FeedItem[];
  onNavigateToIncidents: () => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];
const SEVERITY_COLORS = {
  Critical: '#ef4444', // Red
  High: '#f97316',     // Orange
  Medium: '#eab308',   // Yellow
  Low: '#3b82f6'       // Blue
};

export const DashboardView: React.FC<DashboardViewProps> = ({ items, onNavigateToIncidents }) => {
  
  const {
    stats,
    securityTrendData,
    securityImpactData,
    deprecationTimelineStats,
    architectureData,
    deprecationData,
    productMomentumData,
    topLaunches,
    incidentTrendData,
    recentIncidents
  } = useDashboardStats(items);

  const lastUpdated = items.length > 0 ? new Date(items[0].isoDate).toLocaleDateString() : 'N/A';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive Summary Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Globe size={200} />
        </div>
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
                  Executive Briefing
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  Last Updated: {lastUpdated}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gradient">Google Cloud Landscape</h1>
              <p className="text-slate-300 max-w-2xl text-lg">
                Real-time intelligence on platform stability, security posture, and strategic product velocity.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className={`px-5 py-3 rounded-xl border backdrop-blur-md flex items-center ${
                 stats.healthStatus === 'Optimal' 
                   ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                   : 'bg-red-500/10 border-red-500/30 text-red-400'
               }`}>
                 <Activity size={24} className="mr-3" />
                 <div>
                   <p className="text-xs font-bold uppercase opacity-80">Platform Status</p>
                   <p className="text-lg font-bold">{stats.healthStatus}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Operational Risk & Stability */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <ShieldAlert className="text-slate-400" size={20} />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wide">Operational Risk & Stability</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KPI: Active Incidents */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="card p-6 bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 relative group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Incidents</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{stats.activeIncidents}</h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500">Source: Service Health</span>
              <button onClick={onNavigateToIncidents} className="text-xs font-bold text-blue-600 hover:underline flex items-center">
                View Details <ArrowUpRight size={12} className="ml-1" />
              </button>
            </div>
          </motion.div>

          {/* KPI: Security Bulletins */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="card p-6 bg-white dark:bg-slate-900 border-l-4 border-l-purple-500 relative group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Security Bulletins</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{stats.securityBulletins}</h3>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Lock size={24} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Last 30 Days • Official Bulletins</span>
            </div>
          </motion.div>

          {/* KPI: Lifecycle Risk */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="card p-6 bg-white dark:bg-slate-900 border-l-4 border-l-amber-500 relative group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Imminent EOLs</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{deprecationTimelineStats.next90}</h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <CalendarClock size={24} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold rounded">{deprecationTimelineStats.next30} Critical (&lt;30d)</span>
              <span className="text-xs text-slate-500">Next 90 Days</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Incident Trends Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                <Activity className="mr-2 text-slate-400" size={18} />
                Incident History (YTD)
              </h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}} 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="active" name="Active Incidents" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} barSize={20} />
                  <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Security Trends Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                <ShieldAlert className="mr-2 text-slate-400" size={18} />
                Vulnerability Disclosure Trend
              </h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={securityTrendData}>
                  <defs>
                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SEVERITY_COLORS.Critical} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={SEVERITY_COLORS.Critical} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SEVERITY_COLORS.High} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={SEVERITY_COLORS.High} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Critical" stroke={SEVERITY_COLORS.Critical} fillOpacity={1} fill="url(#colorCritical)" />
                  <Area type="monotone" dataKey="High" stroke={SEVERITY_COLORS.High} fillOpacity={1} fill="url(#colorHigh)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Strategic Velocity & Innovation */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <Rocket className="text-slate-400" size={20} />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wide">Strategic Velocity & Innovation</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Momentum Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 bg-white dark:bg-slate-900 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                  <TrendingUp className="mr-2 text-slate-400" size={18} />
                  Service Momentum
                </h3>
                <p className="text-xs text-slate-500 mt-1">Update frequency of top active services (8-week trend)</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productMomentumData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  {Object.keys(productMomentumData[0] || {}).filter(k => k !== 'date').map((key, index) => (
                    <Line 
                      key={key} 
                      type="monotone" 
                      dataKey={key} 
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={3} 
                      dot={false} 
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Launches List */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 bg-white dark:bg-slate-900 h-full">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-4">
                <CheckCircle2 className="mr-2 text-emerald-500" size={18} />
                Major GA Launches
              </h3>
              <div className="space-y-4">
                {topLaunches.length > 0 ? (
                  topLaunches.map((item, i) => (
                    <div key={i} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors py-1">
                      <span className="text-[10px] text-slate-400 block mb-0.5">{new Date(item.isoDate).toLocaleDateString()}</span>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 block leading-snug">
                        {item.title}
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm italic">
                    No major GA launches detected in the last 30 days.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
           {/* Architecture Distribution */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 bg-white dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-6">
                <Layers className="mr-2 text-slate-400" size={18} />
                Architecture Focus Areas
              </h3>
              <div className="flex items-center justify-center h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={architectureData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {architectureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </motion.div>

           {/* Deprecation Impact */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 bg-white dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-6">
                <Server className="mr-2 text-slate-400" size={18} />
                Services with Upcoming EOLs
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deprecationData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} opacity={0.5} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={120} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} name="Notices" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </motion.div>
        </div>
      </section>
    </div>
  );
};
