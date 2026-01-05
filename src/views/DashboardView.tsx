import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { FeedItem } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, ShieldAlert, Activity, Info, CalendarClock, Zap, Rocket, CheckCircle2, Globe, Layers, Lock, AlertTriangle, ArrowUpRight, Server, AlertOctagon, ExternalLink } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface DashboardViewProps {
  items: FeedItem[];
  onNavigateToIncidents: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];
const SEVERITY_COLORS = {
  Critical: '#ef4444', // Red
  High: '#f97316',     // Orange
  Medium: '#eab308',   // Yellow
  Low: '#3b82f6'       // Blue
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg shadow-xl p-3 border border-slate-700/50">
        <p className="font-bold mb-2 text-slate-300">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-mono font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ items, onNavigateToIncidents, onRefresh, isRefreshing }) => {
  
  const {
    stats,
    securityTrendData,
    deprecationTimelineStats,
    architectureData,
    deprecationData,
    productMomentumData,
    topLaunches,
    incidentTrendData,
    recentIncidents
  } = useDashboardStats(items);

  const lastUpdated = items.length > 0 ? new Date(items[0].isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-10"
    >
      {/* Executive Header */}
      <motion.div variants={itemAnim} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <Globe size={300} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-transparent dark:from-blue-900/10 pointer-events-none" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold uppercase tracking-wider">
                Executive Briefing
              </span>
              <span className="text-slate-400 text-xs font-medium flex items-center">
                <CalendarClock size={12} className="mr-1" />
                Updated: {lastUpdated}
              </span>
              {onRefresh && (
                <button 
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="ml-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                  title="Refresh Data"
                >
                  <Zap size={12} className={isRefreshing ? "animate-spin text-blue-500" : ""} />
                </button>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              Google Cloud Landscape
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
              Real-time intelligence on platform stability, security posture, and strategic product velocity.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className={`px-5 py-3 rounded-xl border flex items-center shadow-sm ${
               stats.healthStatus === 'Optimal' 
                 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                 : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400'
             }`}>
               <div className="relative mr-3">
                 <Activity size={24} />
                 {stats.healthStatus === 'Optimal' && (
                   <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                   </span>
                 )}
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase opacity-70 tracking-wider">Platform Status</p>
                 <p className="text-lg font-bold leading-none">{stats.healthStatus}</p>
               </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Incidents */}
        <motion.div variants={itemAnim} className="card p-5 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Incidents</p>
            <AlertOctagon size={18} className="text-red-500" />
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeIncidents}</h3>
            <button onClick={onNavigateToIncidents} className="text-xs font-bold text-blue-600 hover:underline flex items-center mb-1">
              View <ArrowUpRight size={10} className="ml-0.5" />
            </button>
          </div>
        </motion.div>

        {/* Metric 2: Security Bulletins */}
        <motion.div variants={itemAnim} className="card p-5 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Alerts</p>
            <ShieldAlert size={18} className="text-purple-500" />
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.securityBulletins}</h3>
            <span className="text-[10px] text-slate-400 mb-1">Last 30 Days</span>
          </div>
        </motion.div>

        {/* Metric 3: Deprecations */}
        <motion.div variants={itemAnim} className="card p-5 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Imminent EOLs</p>
            <CalendarClock size={18} className="text-amber-500" />
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{deprecationTimelineStats.next90}</h3>
            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold rounded">
              {deprecationTimelineStats.next30} Critical
            </span>
          </div>
        </motion.div>

        {/* Metric 4: Innovation Score */}
        <motion.div variants={itemAnim} className="card p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Innovation Score</p>
            <Zap size={18} className="text-blue-500" />
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.innovationScore}%</h3>
            <span className="text-[10px] text-slate-400 mb-1">Feature Velocity</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Incident Trends */}
          <motion.div variants={itemAnim} className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center text-lg">
                  <Activity className="mr-2 text-slate-400" size={20} />
                  Incident History (YTD)
                </h3>
                <p className="text-xs text-slate-500 mt-1">Monthly active vs resolved incidents</p>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="active" name="Active" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} barSize={32} />
                  <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Product Momentum */}
          <motion.div variants={itemAnim} className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center text-lg">
                  <TrendingUp className="mr-2 text-slate-400" size={20} />
                  Service Momentum
                </h3>
                <p className="text-xs text-slate-500 mt-1">Update frequency of top active services (8-week trend)</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productMomentumData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  {Object.keys(productMomentumData[0] || {}).filter(k => k !== 'date').map((key, index) => (
                    <Line 
                      key={key} 
                      type="monotone" 
                      dataKey={key} 
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={3} 
                      dot={false} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Security Trends */}
          <motion.div variants={itemAnim} className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center text-lg">
                  <ShieldAlert className="mr-2 text-slate-400" size={20} />
                  Vulnerability Trends
                </h3>
                <p className="text-xs text-slate-500 mt-1">Security bulletins by severity (6-month view)</p>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={securityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="Critical" stroke={SEVERITY_COLORS.Critical} fillOpacity={1} fill="url(#colorCritical)" strokeWidth={2} />
                  <Area type="monotone" dataKey="High" stroke={SEVERITY_COLORS.High} fillOpacity={1} fill="url(#colorHigh)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          
          {/* Architecture Distribution (Donut) */}
          <motion.div variants={itemAnim} className="card p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-6 text-lg">
              <Layers className="mr-2 text-slate-400" size={20} />
              Architecture Focus
            </h3>
            <div className="h-[220px] w-full relative">
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
                    stroke="none"
                  >
                    {architectureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{architectureData.reduce((a, b) => a + b.value, 0)}</span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Updates</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {architectureData.slice(0, 4).map((entry, index) => (
                <div key={index} className="flex items-center text-xs">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-400 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Launches */}
          <motion.div variants={itemAnim} className="card p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-4 text-lg">
              <Rocket className="mr-2 text-slate-400" size={20} />
              Major Launches
            </h3>
            <div className="space-y-4">
              {topLaunches.length > 0 ? (
                topLaunches.map((item, i) => (
                  <div key={i} className="group relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors py-1">
                    <span className="text-[10px] text-slate-400 block mb-0.5">{new Date(item.isoDate).toLocaleDateString()}</span>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block leading-snug">
                      {item.title}
                    </a>
                    <ExternalLink size={12} className="absolute top-1 right-0 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  No major GA launches detected in the last 30 days.
                </div>
              )}
            </div>
          </motion.div>

          {/* Deprecation Impact */}
          <motion.div variants={itemAnim} className="card p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-6 text-lg">
              <Server className="mr-2 text-slate-400" size={20} />
              EOL Impact
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deprecationData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} opacity={0.5} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} name="Notices" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};
