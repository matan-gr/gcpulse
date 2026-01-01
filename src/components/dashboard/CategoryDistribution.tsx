import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FeedItem } from '../../types';

interface CategoryDistributionProps {
  items: FeedItem[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ items }) => {
  const data = React.useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      // Use source as the primary category for this view
      const category = item.source;
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 sources
  }, [items]);

  return (
    <div className="h-full w-full min-h-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={80} 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            interval={0}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
