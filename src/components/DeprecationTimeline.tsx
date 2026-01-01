import React, { useMemo } from 'react';
import { FeedItem } from '../types';
import { extractEOLDate } from '../utils';
import { Calendar, AlertTriangle, ArrowRight, CheckCircle2, AlertOctagon, Clock, CalendarDays, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { ErrorBoundary } from './ErrorBoundary';

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
  const { sortedItems, stats, groups } = useMemo(() => {
    const processed = items.map(item => {
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

    const stats = {
      critical: processed.filter(i => i.daysUntil !== null && i.daysUntil < 90 && i.daysUntil >= 0).length,
      warning: processed.filter(i => i.daysUntil !== null && i.daysUntil >= 90 && i.daysUntil < 180).length,
      total: processed.length
    };

    const groups = {
      imminent: processed.filter(i => i.daysUntil !== null && i.daysUntil < 90 && i.daysUntil >= 0),
      upcoming: processed.filter(i => i.daysUntil !== null && i.daysUntil >= 90 && i.daysUntil < 180),
      future: processed.filter(i => i.daysUntil !== null && i.daysUntil >= 180),
      unknown: processed.filter(i => i.daysUntil === null || i.daysUntil < 0) // Past or unknown
    };

    return { sortedItems: processed, stats, groups };
  }, [items]);

  if (sortedItems.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No deprecation timeline data available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header & Stats */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
              <CalendarDays className="mr-3 text-blue-600" size={32} />
              Deprecation Roadmap
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Strategic timeline of service retirements and critical changes.
            </p>
          </div>
          
          {/* Summary Cards */}
          <div className="flex gap-4">
            <div className="px-5 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg mr-3 text-red-600 dark:text-red-400">
                <AlertOctagon size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider">Critical</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.critical}</p>
              </div>
            </div>
            
            <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center">
              <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg mr-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider">Warning</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.warning}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Groups */}
        <div className="space-y-12">
          
          {/* Imminent Section */}
          {groups.imminent.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <div className="h-px flex-1 bg-red-200 dark:bg-red-900/50"></div>
                <span className="px-4 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm font-bold uppercase tracking-wide border border-red-200 dark:border-red-800 mx-4">
                  Imminent (Next 90 Days)
                </span>
                <div className="h-px flex-1 bg-red-200 dark:bg-red-900/50"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.imminent.map((item, idx) => (
                  <DeprecationCard key={idx} item={item} status="critical" />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Section */}
          {groups.upcoming.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <div className="h-px flex-1 bg-amber-200 dark:bg-amber-900/50"></div>
                <span className="px-4 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-sm font-bold uppercase tracking-wide border border-amber-200 dark:border-amber-800 mx-4">
                  Upcoming (3-6 Months)
                </span>
                <div className="h-px flex-1 bg-amber-200 dark:bg-amber-900/50"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.upcoming.map((item, idx) => (
                  <DeprecationCard key={idx} item={item} status="warning" />
                ))}
              </div>
            </section>
          )}

          {/* Future Section */}
          {groups.future.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <div className="h-px flex-1 bg-blue-200 dark:bg-blue-900/50"></div>
                <span className="px-4 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold uppercase tracking-wide border border-blue-200 dark:border-blue-800 mx-4">
                  Future Roadmap (6+ Months)
                </span>
                <div className="h-px flex-1 bg-blue-200 dark:bg-blue-900/50"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.future.map((item, idx) => (
                  <DeprecationCard key={idx} item={item} status="info" />
                ))}
              </div>
            </section>
          )}

           {/* Unknown/Past Section */}
           {groups.unknown.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <span className="px-4 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700 mx-4">
                  Date TBD / Past
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.unknown.map((item, idx) => (
                  <DeprecationCard key={idx} item={item} status="neutral" />
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

const DeprecationCard: React.FC<{ item: TimelineItem; status: 'critical' | 'warning' | 'info' | 'neutral' }> = ({ item, status }) => {
  let styles = {
    border: 'border-slate-200 dark:border-slate-800',
    bg: 'bg-white dark:bg-slate-900',
    iconColor: 'text-slate-400',
    dateColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    hover: 'hover:border-blue-300 dark:hover:border-blue-700'
  };

  if (status === 'critical') {
    styles = {
      border: 'border-red-200 dark:border-red-800',
      bg: 'bg-red-50/50 dark:bg-red-900/10',
      iconColor: 'text-red-500',
      dateColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      hover: 'hover:shadow-red-100 dark:hover:shadow-none'
    };
  } else if (status === 'warning') {
    styles = {
      border: 'border-amber-200 dark:border-amber-800',
      bg: 'bg-amber-50/50 dark:bg-amber-900/10',
      iconColor: 'text-amber-500',
      dateColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      hover: 'hover:shadow-amber-100 dark:hover:shadow-none'
    };
  } else if (status === 'info') {
    styles = {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50/30 dark:bg-blue-900/10',
      iconColor: 'text-blue-500',
      dateColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      hover: 'hover:shadow-blue-100 dark:hover:shadow-none'
    };
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-xl border ${styles.border} ${styles.bg} p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono flex items-center ${styles.dateColor}`}>
          <Clock size={12} className="mr-1.5" />
          {item.eolDate 
            ? item.eolDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
            : 'Date TBD'}
        </span>
        {item.daysUntil !== null && item.daysUntil > 0 && (
          <span className={`text-[10px] font-bold uppercase tracking-wide ${styles.iconColor}`}>
            {item.daysUntil} Days Left
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-1">
        {item.contentSnippet}
      </p>

      <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between mt-auto">
        <div className="flex gap-1">
           {item.categories?.slice(0, 2).map(cat => (
             <span key={cat} className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500">
               {cat}
             </span>
           ))}
        </div>
        <a 
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs font-bold flex items-center ${styles.iconColor} hover:underline`}
        >
          Migration Guide <ArrowRight size={12} className="ml-1" />
        </a>
      </div>
    </motion.div>
  );
};
