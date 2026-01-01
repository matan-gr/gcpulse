import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FeedItem } from '../../types';

interface ActivityChartProps {
  items: FeedItem[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ items }) => {
  // Aggregate data by date (last 14 days)
  const data = React.useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const counts = last14Days.map(date => {
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: items.filter(item => item.isoDate.startsWith(date)).length
      };
    });

    return counts;
  }, [items]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
