import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { FeedItem } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, ShieldAlert, Activity, Info, CalendarClock, Zap, Rocket, CheckCircle2, Globe, Layers, Lock } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            <Globe className="mr-3 text-blue-600 dark:text-blue-400" size={32} />
            Global GCP Ecosystem State
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Comprehensive intelligence on Google Cloud's global infrastructure, security, and architectural trends.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex items-center">
             <Activity size={18} className="text-emerald-600 dark:text-emerald-400 mr-2" />
             <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Global Platform Healthy</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Innovation Velocity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Innovation Velocity</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.innovationScore}%</h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Zap size={20} />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.innovationScore}%` }}></div>
          </div>
          <p className="text-xs text-slate-500">{stats.totalUpdates} updates in last 30 days</p>
        </motion.div>

        {/* 2. Service Health Status (Replaces Platform Stability) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Health</p>
              <h3 className={`text-3xl font-bold mt-1 ${stats.healthStatus === 'Optimal' ? 'text-emerald-600 dark:text-emerald-400' : stats.healthStatus === 'Degraded' ? 'text-amber-500' : 'text-red-600'}`}>
                {stats.healthStatus}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${stats.healthStatus === 'Optimal' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
              <Activity size={20} />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div className={`h-full rounded-full ${stats.healthStatus === 'Optimal' ? 'bg-emerald-500' : stats.healthStatus === 'Degraded' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: stats.healthStatus === 'Optimal' ? '100%' : '60%' }}></div>
          </div>
          <p className="text-xs text-slate-500">{stats.activeIncidents} active incidents</p>
        </motion.div>

        {/* 3. Security Alert Volume */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Alert Volume</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.securityBulletins}</h3>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="flex items-end space-x-1 h-8 mb-2">
            {/* Mini Bar Chart Simulation */}
            {[40, 60, 30, 80, 50, 70, 40].map((h, i) => (
              <div key={i} className="flex-1 bg-purple-100 dark:bg-purple-900/30 rounded-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Bulletins in last 30 days</p>
        </motion.div>

        {/* 4. Deprecation Urgency */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deprecation Urgency</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{deprecationTimelineStats.next90}</h3>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
              <CalendarClock size={20} />
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
             <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold rounded">{deprecationTimelineStats.next30} Critical</span>
             <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px] font-bold rounded">{deprecationTimelineStats.next60} High</span>
          </div>
          <p className="text-xs text-slate-500">EOLs within 90 days</p>
        </motion.div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Incident Trends & List */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 col-span-1 md:col-span-2 lg:col-span-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Activity className="mr-2 text-red-600" size={20} />
              Incident Trends ({new Date().getFullYear()})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="active" name="Active" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent List */}
            <div className="lg:col-span-1 border-l border-slate-100 dark:border-slate-800 pl-0 lg:pl-8">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Recent Incidents</h4>
              <div className="space-y-4">
                {recentIncidents.length > 0 ? (
                  recentIncidents.map((item, i) => (
                    <div key={i} className="group">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] text-slate-400">{new Date(item.isoDate).toLocaleDateString()}</span>
                      </div>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="block mt-1 text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 line-clamp-2">
                        {item.title}
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No recent incidents.</p>
                )}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={onNavigateToIncidents}
                    className="text-xs font-bold text-blue-600 cursor-pointer hover:underline focus:outline-none"
                  >
                    View All Incidents in Incidents Tab &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart: Product Momentum (Service Adoption Trends) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <TrendingUp className="mr-2 text-blue-600" size={20} />
              Service Momentum (Adoption Proxy)
            </h3>
            <Tooltip content="This metric tracks the frequency of product mentions across all official Google Cloud feeds (Blog, Release Notes, Security Bulletins) over the last 8 weeks. A rising trend indicates increased development velocity, new feature releases, and higher strategic focus from Google, serving as a proxy for service adoption and maturity." position="left">
              <Info size={16} className="text-slate-400 hover:text-blue-500 cursor-help" />
            </Tooltip>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productMomentumData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend />
                {Object.keys(productMomentumData[0] || {}).filter(k => k !== 'date').map((key, index) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* List: Top GA Launches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Rocket size={18} className="mr-2 text-blue-600" />
              Global GA Launches
            </h3>
          </div>
          <div className="space-y-4">
            {topLaunches.length > 0 ? (
              topLaunches.map((item, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 block">
                      {item.title}
                    </a>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.contentSnippet}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No major GA launches detected in the last 30 days.</p>
            )}
          </div>
        </motion.div>

        {/* Chart: Security Severity Trends */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 col-span-1 md:col-span-2">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Lock className="mr-2 text-blue-600" size={20} />
              Security Vulnerability Trends
            </h3>
            <Tooltip content="Volume of security bulletins over the last 6 months, categorized by severity." position="left">
              <Info size={16} className="text-slate-400 hover:text-blue-500 cursor-help" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={securityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="Critical" stackId="a" fill={SEVERITY_COLORS.Critical} />
                  <Bar dataKey="High" stackId="a" fill={SEVERITY_COLORS.High} />
                  <Bar dataKey="Medium" stackId="a" fill={SEVERITY_COLORS.Medium} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="md:col-span-1 border-l border-slate-100 dark:border-slate-800 pl-4">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Impacted Products</h4>
               <div className="space-y-3">
                 {securityImpactData.map((item, i) => (
                   <div key={i} className="flex justify-between items-center text-sm">
                     <span className="text-slate-700 dark:text-slate-300 truncate mr-2">{item.name}</span>
                     <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs">{item.value}</span>
                   </div>
                 ))}
                 {securityImpactData.length === 0 && <p className="text-xs text-slate-400 italic">No data available</p>}
               </div>
            </div>
          </div>
        </motion.div>

        {/* Chart: Architecture Patterns */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Layers className="mr-2 text-blue-600" size={20} />
              Architectural Patterns
            </h3>
          </div>
          <div className="h-[250px] w-full">
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
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart: Deprecation Impact */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 col-span-1">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <CalendarClock className="mr-2 text-blue-600" size={20} />
              Deprecation Impact
            </h3>
          </div>
          <div className="flex justify-between items-center mb-4 text-xs">
             <div className="text-center">
               <span className="block font-bold text-red-500 text-lg">{deprecationTimelineStats.next30}</span>
               <span className="text-slate-500">30 Days</span>
             </div>
             <div className="text-center">
               <span className="block font-bold text-orange-500 text-lg">{deprecationTimelineStats.next60}</span>
               <span className="text-slate-500">60 Days</span>
             </div>
             <div className="text-center">
               <span className="block font-bold text-yellow-500 text-lg">{deprecationTimelineStats.next90}</span>
               <span className="text-slate-500">90 Days</span>
             </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deprecationData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15} name="Notices" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
