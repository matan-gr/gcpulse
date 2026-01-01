import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'motion/react';
import { ChartData } from '../types';

interface InsightChartsProps {
  data: ChartData;
}

export const InsightCharts: React.FC<InsightChartsProps> = ({ data }) => {
  const priorityColor = data.actionPriority > 75 ? '#ef4444' : data.actionPriority > 40 ? '#f59e0b' : '#3b82f6';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Risk Radar Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Risk Assessment</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.riskAnalysis}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Risk Score"
                dataKey="A"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Action Priority Gauge (Simulated with Bar) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">Action Priority Score</h3>
        
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Circular Progress Background */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-100 dark:text-gray-700"
                />
                <motion.circle
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * data.actionPriority) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={priorityColor}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray="553"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-bold text-gray-900 dark:text-white"
                >
                    {data.actionPriority}
                </motion.span>
                <span className="text-xs font-medium text-gray-500 uppercase mt-1">
                    {data.actionPriority > 75 ? 'Critical' : data.actionPriority > 40 ? 'Moderate' : 'Low'}
                </span>
            </div>
        </div>
        
        <p className="text-center text-xs text-gray-500 mt-6 max-w-[200px]">
          AI-calculated urgency based on business impact and technical complexity.
        </p>
      </motion.div>
    </div>
  );
};
