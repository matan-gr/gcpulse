import React, { useMemo, useState } from 'react';
import { FeedItem } from '../types';
import { extractEOLDate } from '../utils';
import { Calendar, AlertTriangle, ArrowRight, CheckCircle2, AlertOctagon, Clock, CalendarDays, Filter, Hourglass, Download, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './ErrorBoundary';
import { toast } from 'sonner';

interface DeprecationTimelineProps {
  items: FeedItem[];
}

interface TimelineItem extends FeedItem {
  eolDate: Date | null;
  daysUntil: number | null;
}

export const DeprecationTimeline: React.FC<DeprecationTimelineProps> = ({ items }) => {
  return (
    <ErrorBoundary componentName="DeprecationTimeline">
      <DeprecationTimelineContent items={items} />
    </ErrorBoundary>
  );
};

const DeprecationTimelineContent: React.FC<DeprecationTimelineProps> = ({ items }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');

  const { sortedItems, stats, groups } = useMemo(() => {
    let processed = items.map(item => {
      const eolDate = extractEOLDate(item.contentSnippet || item.content || item.title);
      let daysUntil = null;
      if (eolDate) {
        const now = new Date();
        daysUntil = Math.ceil((eolDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { ...item, eolDate, daysUntil };
    }).sort((a, b) => {
      if (!a.eolDate) return 1;
      if (!b.eolDate) return -1;
      return a.eolDate.getTime() - b.eolDate.getTime();
    });

    // Apply Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      processed = processed.filter(i => 
        i.title.toLowerCase().includes(lowerSearch) || 
        i.contentSnippet?.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply Filter
    if (filter === 'critical') {
      processed = processed.filter(i => i.daysUntil !== null && i.daysUntil < 90 && i.daysUntil >= 0);
    } else if (filter === 'warning') {
      processed = processed.filter(i => i.daysUntil !== null && i.daysUntil < 180);
    }

    const stats = {
      critical: processed.filter(i => i.daysUntil !== null && i.daysUntil < 90 && i.daysUntil >= 0).length,
      warning: processed.filter(i => i.daysUntil !== null && i.daysUntil >= 90 && i.daysUntil < 180).length,
      total: processed.length
    };

    const groups = {
      imminent: processed.filter(i => i.daysUntil !== null && i.daysUntil < 90 && i.daysUntil >= 0),
      upcoming: processed.filter(i => i.daysUntil !== null && i.daysUntil >= 90 && i.daysUntil < 180),
      future: processed.filter(i => i.daysUntil !== null && i.daysUntil >= 180),
      unknown: processed.filter(i => i.daysUntil === null || i.daysUntil < 0)
    };

    return { sortedItems: processed, stats, groups };
  }, [items, search, filter]);

  const handleExportCalendar = () => {
    if (sortedItems.length === 0) return;
    
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GCP Pulse//Deprecations//EN\n";
    
    sortedItems.forEach(item => {
      if (item.eolDate) {
        const dateStr = item.eolDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:EOL: ${item.title}\n`;
        icsContent += `DTSTART:${dateStr}\n`;
        icsContent += `DTEND:${dateStr}\n`;
        icsContent += `DESCRIPTION:${item.contentSnippet || item.title}\\n\\nMigration Guide: ${item.link}\n`;
        icsContent += "END:VEVENT\n";
      }
    });
    
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gcp-deprecations.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Calendar (.ics) downloaded");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Active Deprecations</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Great news! There are no known deprecations or end-of-life notices in the current feed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header & Stats */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
              <CalendarDays className="mr-3 text-blue-600" size={32} />
              Deprecation Roadmap
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
              Stay ahead of service retirements. Plan your migrations effectively with our timeline view.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search services..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
             </div>
             <button 
               onClick={handleExportCalendar}
               className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap"
             >
               <Download size={16} className="mr-2" />
               Export .ics
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <StatCard 
             label="Critical (<90d)" 
             value={stats.critical} 
             icon={AlertOctagon} 
             color="red" 
             active={filter === 'critical'}
             onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
           />
           <StatCard 
             label="Warning (<180d)" 
             value={stats.warning} 
             icon={AlertTriangle} 
             color="amber" 
             active={filter === 'warning'}
             onClick={() => setFilter(filter === 'warning' ? 'all' : 'warning')}
           />
           <StatCard 
             label="Total Active" 
             value={stats.total} 
             icon={Calendar} 
             color="blue" 
             active={filter === 'all'}
             onClick={() => setFilter('all')}
           />
        </div>

        {/* Timeline */}
        <div className="relative space-y-16 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800">
          
          {groups.imminent.length > 0 && (
            <TimelineSection title="Imminent Action Required" color="red" items={groups.imminent} />
          )}
          
          {groups.upcoming.length > 0 && (
            <TimelineSection title="Plan Migration" color="amber" items={groups.upcoming} />
          )}
          
          {groups.future.length > 0 && (
            <TimelineSection title="Future Roadmap" color="blue" items={groups.future} />
          )}

          {groups.unknown.length > 0 && (
            <TimelineSection title="Past / TBD" color="slate" items={groups.unknown} />
          )}

          {sortedItems.length === 0 && (
             <div className="text-center py-12">
                <p className="text-slate-500">No deprecations found matching your criteria.</p>
                <button onClick={() => { setSearch(''); setFilter('all'); }} className="text-blue-600 hover:underline mt-2 text-sm">Clear filters</button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, active, onClick }: any) => {
  const colors = {
    red: 'bg-red-50 text-red-600 border-red-200 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-slate-950 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-950 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',
  };

  const inactiveColors = 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-700';
  
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all duration-200 w-full ${active ? colors[color as keyof typeof colors] : inactiveColors}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</span>
        <Icon size={18} />
      </div>
      <span className="text-3xl font-bold tracking-tight">{value}</span>
    </button>
  );
};

const TimelineSection = ({ title, color, items }: { title: string, color: string, items: TimelineItem[] }) => {
  const badgeColors = {
    red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800',
    amber: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-800',
    blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800',
    slate: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  };

  return (
    <div className="relative">
      <div className="sticky top-20 z-10 flex justify-center mb-8">
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border shadow-sm ${badgeColors[color as keyof typeof badgeColors]}`}>
          {title}
        </span>
      </div>
      <div className="space-y-8">
        {items.map((item, idx) => (
          <TimelineCard key={idx} item={item} color={color} index={idx} />
        ))}
      </div>
    </div>
  );
};

const TimelineCard = ({ item, color, index }: { item: TimelineItem, color: string, index: number }) => {
  const isLeft = index % 2 === 0;
  
  const borderColors = {
    red: 'border-l-4 border-l-red-500',
    amber: 'border-l-4 border-l-amber-500',
    blue: 'border-l-4 border-l-blue-500',
    slate: 'border-l-4 border-l-slate-400',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group`}
    >
      {/* Timeline Dot */}
      <div className="absolute left-0 md:left-1/2 w-10 h-10 -ml-5 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 shadow-sm z-10 group-hover:scale-110 transition-transform">
        <Clock size={16} className={`text-${color}-500`} />
      </div>

      {/* Card */}
      <div className={`w-full md:w-[calc(50%-2.5rem)] ml-12 md:ml-0 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 ${borderColors[color as keyof typeof borderColors]}`}>
        <div className="flex justify-between items-start mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400`}>
            {item.eolDate ? item.eolDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}
          </span>
          {item.daysUntil !== null && item.daysUntil > 0 && (
            <span className={`text-xs font-bold ${item.daysUntil < 90 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
              {item.daysUntil} Days Left
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
            {item.title}
          </a>
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
          {item.contentSnippet}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
           <div className="flex gap-2">
             {item.categories?.slice(0, 2).map(cat => (
               <span key={cat} className="text-[10px] uppercase font-bold text-slate-400">
                 {cat}
               </span>
             ))}
           </div>
           <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center">
             Migration Guide <ArrowRight size={12} className="ml-1" />
           </a>
        </div>
      </div>
    </motion.div>
  );
};
