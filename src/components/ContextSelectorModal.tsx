import React, { useState, useMemo } from 'react';
import { FeedItem } from '../types';
import { X, Search, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContextSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: FeedItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const ContextSelectorModal: React.FC<ContextSelectorModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedIds,
  onToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.contentSnippet?.toLowerCase().includes(query) ||
      item.source.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Context</h3>
              <p className="text-xs text-slate-500">Choose specific items to include in the AI analysis.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => onToggle(item.id)}
                    className={`flex items-start p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'
                    }`}
                  >
                    <div className={`mt-1 mr-3 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                      {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.source}</span>
                        <span className="text-xs text-slate-400">{new Date(item.isoDate).toLocaleDateString()}</span>
                      </div>
                      <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.contentSnippet}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                No items found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {selectedIds.length} items selected
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
