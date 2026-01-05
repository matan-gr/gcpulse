import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ScatterChart, Scatter, ZAxis, Brush
} from 'recharts';
import { FeedItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ShieldAlert, Activity, Info, CalendarClock, Zap, Rocket, CheckCircle2, Globe, Layers, Lock, AlertTriangle, ArrowUpRight, Server, AlertOctagon, ExternalLink, BrainCircuit, Target, Flame, X, Filter } from 'lucide-react';
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
      <div className="bg-slate-900 text-white text-xs rounded-lg shadow-xl p-3 border border-slate-700/50 z-50">
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
  
  // Interactive Filter State
  const [activeFilter, setActiveFilter] = useState<{ type: 'category' | 'severity' | 'product', value: string } | null>(null);

  // Filter items based on selection
  const filteredItems = useMemo(() => {
    if (!activeFilter) return items;
    return items.filter(item => {
      if (activeFilter.type === 'category') {
        // Check if item matches the category (using simple string matching for now as categories are inferred)
        const cats = item.categories || [];
        if (cats.includes(activeFilter.value)) return true;
        // Fallback for inferred categories logic in hook
        const text = (item.title + item.contentSnippet).toLowerCase();
        if (activeFilter.value === 'Data & Analytics' && (text.includes('data') || text.includes('analytics'))) return true;
        if (activeFilter.value === 'AI & ML' && (text.includes('ai') || text.includes('machine learning'))) return true;
        if (activeFilter.value === 'Security' && (text.includes('security'))) return true;
        if (activeFilter.value === 'Modernization' && (text.includes('kubernetes') || text.includes('container'))) return true;
        return false;
      }
      if (activeFilter.type === 'severity') {
        return item.title.toLowerCase().includes(activeFilter.value.toLowerCase()) || 
               item.contentSnippet?.toLowerCase().includes(activeFilter.value.toLowerCase());
      }
      if (activeFilter.type === 'product') {
        return (item.title + item.contentSnippet).includes(activeFilter.value);
      }
      return true;
    });
  }, [items, activeFilter]);

  const {
    stats,
    securityTrendData,
    deprecationTimelineStats,
    architectureData,
    deprecationData,
    productMomentumData,
    topLaunches,
    incidentTrendData,
    riskHeatmapData,
    strategicRecommendations
  } = useDashboardStats(filteredItems);

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
      className="space-y-8 max-w-7xl mx-auto pb-10"
    >
      {/* Executive Header */}
      <motion.div variants={itemAnim} className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <Globe size={400} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-white/50 to-transparent dark:from-blue-900/20 dark:via-slate-900/50 pointer-events-none" />
        
        <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-blue-500/30">
                Executive Briefing
              </span>
              <span className="text-slate-400 text-xs font-medium flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                <CalendarClock size={12} className="mr-1.5" />
                Updated: {lastUpdated}
              </span>
              {onRefresh && (
                <button 
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                  title="Refresh Data"
                >
                  <Zap size={14} className={isRefreshing ? "animate-spin text-blue-500" : ""} />
                </button>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              Google Cloud <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Landscape</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base leading-relaxed">
              Real-time strategic intelligence on platform stability, security posture, and product velocity.
            </p>
            
            {/* Active Filter Indicator */}
            <AnimatePresence>
              {activeFilter && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">Filtered by:</span>
                  <button 
                    onClick={() => setActiveFilter(null)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                  >
                    <Filter size={12} />
                    {activeFilter.value}
                    <X size={12} className="ml-1" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Health</p>
                <p className={`text-2xl font-black ${
                  stats.healthStatus === 'Optimal' ? 'text-emerald-500' : 'text-red-500'
                }`}>{stats.healthStatus}</p>
             </div>
             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
               stats.healthStatus === 'Optimal' 
                 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30' 
                 : 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-500/30'
             }`}>
               <Activity size={32} />
             </div>
          </div>
        </div>
      </motion.div>

      {/* Strategic Recommendations */}
      <motion.div variants={itemAnim}>
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="text-purple-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Strategic Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategicRecommendations.map((rec, idx) => (
            <div key={idx} className="card p-5 border-t-4 border-t-transparent hover:border-t-purple-500 transition-all hover:shadow-lg group">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${
                  rec.type === 'security' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                  rec.type === 'reliability' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                  'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {rec.type === 'security' ? <ShieldAlert size={18} /> :
                   rec.type === 'reliability' ? <AlertTriangle size={18} /> :
                   <Target size={18} />}
                </div>
                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 line-clamp-1" title={rec.title}>{rec.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{rec.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemAnim} className="card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <AlertOctagon size={60} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Incidents</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stats.activeIncidents}</h3>
          </div>
          <button onClick={onNavigateToIncidents} className="mt-4 text-xs font-bold text-red-600 dark:text-red-400 flex items-center hover:underline">
            View Details <ArrowUpRight size={12} className="ml-1" />
          </button>
        </motion.div>

        <motion.div 
          variants={itemAnim} 
          className="card p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all"
          onClick={() => setActiveFilter({ type: 'severity', value: 'High' })}
        >
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <ShieldAlert size={60} className="text-purple-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Security Alerts</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stats.securityBulletins}</h3>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Last 30 Days Activity</p>
        </motion.div>

        <motion.div variants={itemAnim} className="card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <CalendarClock size={60} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Imminent EOLs</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{deprecationTimelineStats.next90}</h3>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold rounded">
              {deprecationTimelineStats.next30} Critical
            </span>
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded">
              {deprecationTimelineStats.next60} Warning
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Zap size={60} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Innovation Score</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stats.innovationScore}%</h3>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stats.innovationScore}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Feature Velocity Index</p>
        </motion.div>
      </div>

      {/* Risk Heatmap & Security Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemAnim} className="card p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="text-orange-500" size={20} />
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Risk Heatmap</h3>
          </div>
          <div className="space-y-3">
            {riskHeatmapData.length > 0 ? (
              riskHeatmapData.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
                  onClick={() => setActiveFilter({ type: 'product', value: item.name })}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs font-mono text-slate-400 w-4">{idx + 1}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 transition-colors">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          idx < 3 ? 'bg-red-500' : idx < 6 ? 'bg-orange-500' : 'bg-blue-400'
                        }`} 
                        style={{ width: `${Math.min(100, (item.value / riskHeatmapData[0].value) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-6 text-right">{item.value}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">No significant risk signals detected.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-purple-500" size={20} />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Vulnerability Trends</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> High
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
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
                <Area type="monotone" dataKey="Critical" stroke={SEVERITY_COLORS.Critical} fillOpacity={1} fill="url(#colorCritical)" strokeWidth={2} />
                <Area type="monotone" dataKey="High" stroke={SEVERITY_COLORS.High} fillOpacity={1} fill="url(#colorHigh)" strokeWidth={2} />
                <Brush dataKey="month" height={30} stroke="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
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
              <div className="flex items-center gap-2">
                <Activity className="text-blue-500" size={20} />
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Incident History (YTD)</h3>
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
              <div className="flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={20} />
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Service Momentum</h3>
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
                      activeDot={{ r: 6, strokeWidth: 0, onClick: () => setActiveFilter({ type: 'product', value: key }) }}
                      cursor="pointer"
                    />
                  ))}
                  <Brush dataKey="date" height={30} stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          
          {/* Architecture Distribution (Donut) */}
          <motion.div variants={itemAnim} className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="text-indigo-500" size={20} />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Architecture Focus</h3>
            </div>
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
                    onClick={(data) => setActiveFilter({ type: 'category', value: data.name })}
                    cursor="pointer"
                  >
                    {architectureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
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
                <div key={index} className="flex items-center text-xs cursor-pointer hover:text-blue-500" onClick={() => setActiveFilter({ type: 'category', value: entry.name })}>
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-400 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Launches */}
          <motion.div variants={itemAnim} className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="text-blue-500" size={20} />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Major Launches</h3>
            </div>
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
            <div className="flex items-center gap-2 mb-6">
              <Server className="text-amber-500" size={20} />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">EOL Impact</h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deprecationData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} opacity={0.5} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Bar 
                    dataKey="value" 
                    fill="#f59e0b" 
                    radius={[0, 4, 4, 0]} 
                    barSize={16} 
                    name="Notices" 
                    onClick={(data) => setActiveFilter({ type: 'product', value: data.name })}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};
