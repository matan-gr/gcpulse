import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  stats?: { label: string; value: string | number }[];
  actions?: React.ReactNode;
  gradient?: string; // e.g., "from-blue-600 to-indigo-600"
  patternOpacity?: number;
  textColor?: string; // Default white
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  icon: Icon,
  stats,
  actions,
  gradient = "from-slate-900 to-slate-800",
  patternOpacity = 0.1,
  textColor = "text-white"
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} shadow-xl ${textColor} mb-8`}
    >
      {/* Background Icon Decoration */}
      {Icon && (
        <div className={`absolute -right-10 -top-10 opacity-${Math.round(patternOpacity * 100)} pointer-events-none transform rotate-12 scale-150`}>
          <Icon size={300} />
        </div>
      )}
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>

      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-3xl">
          {badge && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm"
            >
              {badge}
            </motion.div>
          )}
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight"
          >
            {title}
          </motion.h1>
          
          {description && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl opacity-90 leading-relaxed font-medium max-w-2xl"
            >
              {description}
            </motion.p>
          )}

          {stats && stats.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-6 mt-8"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {actions && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex-shrink-0"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
