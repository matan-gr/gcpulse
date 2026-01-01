import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ColumnCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  columnOrder: string[];
  hiddenColumns: string[];
  onUpdateOrder: (newOrder: string[]) => void;
  onToggleVisibility: (column: string) => void;
}

export const ColumnCustomizer: React.FC<ColumnCustomizerProps> = ({
  isOpen,
  onClose,
  columnOrder,
  hiddenColumns,
  onUpdateOrder,
  onToggleVisibility
}) => {
  // Combine visible and hidden columns for the full list management
  // Actually, we want to show the order of visible columns, and maybe a separate list for hidden ones?
  // Or just one list with toggles.
  // Let's use one list of ALL potential columns, but respecting the order of the visible ones.
  
  const allColumns = React.useMemo(() => {
    // Ensure we have all known columns
    const knownColumns = ['Cloud Blog', 'Product Updates', 'Release Notes', 'Service Health'];
    // Merge with current order to respect user's sort
    const merged = Array.from(new Set([...columnOrder, ...knownColumns]));
    return merged;
  }, [columnOrder]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(allColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order preference (which implicitly defines the sort order for visible columns)
    onUpdateOrder(items);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-20 right-6 z-50 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Customize Feed Columns</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-2">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="columns">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                      {allColumns.map((column, index) => {
                        const isHidden = hiddenColumns.includes(column);
                        return (
                        <Draggable key={column} draggableId={column} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center p-3 rounded-lg border ${
                                snapshot.isDragging 
                                  ? 'bg-blue-50 border-blue-200 shadow-lg z-50' 
                                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                              } transition-colors`}
                            >
                              <div {...provided.dragHandleProps} className="mr-3 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600">
                                <GripVertical size={16} />
                              </div>
                              <span className={`text-sm font-medium flex-1 ${isHidden ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                                {column}
                              </span>
                              <button
                                onClick={() => onToggleVisibility(column)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  isHidden 
                                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                                title={isHidden ? "Show column" : "Hide column"}
                              >
                                {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          )}
                        </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 text-xs text-center text-gray-500 border-t border-gray-100 dark:border-gray-800">
              Drag to reorder • Click eye to toggle
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
