import React, { useState, Suspense } from 'react';
import { Globe, Server, Loader2, Wrench, ArrowRight, GitMerge } from 'lucide-react';
import { motion } from 'motion/react';

// Lazy load tool components
const IPRangeFinder = React.lazy(() => import('../components/IPRangeFinder').then(module => ({ default: module.IPRangeFinder })));
const GKEVersionTracker = React.lazy(() => import('../components/GKEVersionTracker').then(module => ({ default: module.GKEVersionTracker })));
const GKESkewValidator = React.lazy(() => import('../components/tools/GKESkewValidator').then(module => ({ default: module.GKESkewValidator })));

export const ToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'ip-ranges' | 'gke-tracker' | 'gke-skew'>('ip-ranges');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4">
          <Wrench className="text-blue-600 dark:text-blue-400" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Engineering Utilities
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Essential tools for Google Cloud engineers, SREs, and developers to streamline daily operations.
        </p>
      </div>

      {/* Tool Selection Tabs */}
      <div className="flex justify-center mb-12 flex-wrap gap-2">
        <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm inline-flex flex-wrap justify-center">
          <button
            onClick={() => setActiveTool('ip-ranges')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center space-x-2.5 ${
              activeTool === 'ip-ranges'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Globe size={18} />
            <span>IP Range Finder</span>
          </button>
          <button
            onClick={() => setActiveTool('gke-tracker')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center space-x-2.5 ${
              activeTool === 'gke-tracker'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Server size={18} />
            <span>GKE Lifecycle</span>
          </button>
          <button
            onClick={() => setActiveTool('gke-skew')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center space-x-2.5 ${
              activeTool === 'gke-skew'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <GitMerge size={18} />
            <span>GKE Skew Validator</span>
          </button>
        </div>
      </div>

      {/* Tool Content Area */}
      <motion.div
        key={activeTool}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[500px]"
      >
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
            <p className="text-lg font-medium">Loading tool resources...</p>
          </div>
        }>
          {activeTool === 'ip-ranges' && <IPRangeFinder />}
          {activeTool === 'gke-tracker' && <GKEVersionTracker />}
          {activeTool === 'gke-skew' && <GKESkewValidator />}
        </Suspense>
      </motion.div>
    </div>
  );
};
