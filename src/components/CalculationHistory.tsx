import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2, RotateCcw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface HistoryItem {
  id: string;
  type: 'Finance' | 'Vehicle' | 'Land';
  inputs: Record<string, any>;
  result: any;
  timestamp: string;
}

interface CalculationHistoryProps {
  history: HistoryItem[];
  onClear: () => void;
  onReuse: (item: HistoryItem) => void;
  title?: string;
}

export const CalculationHistory = ({ history, onClear, onReuse, title = "Previous Calculations" }: CalculationHistoryProps) => {
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-12"
    >
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <History className="h-5 w-5 text-gray-900 dark:text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">{title}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 font-black text-[9px] uppercase tracking-widest h-9 rounded-xl px-3"
        >
          <Trash2 className="h-3 w-3 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <AnimatePresence mode="popLayout">
          {history.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800 relative overflow-hidden rounded-[2rem] group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0 text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg shadow-sm hover:scale-110 transition-transform bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    onClick={() => onReuse(item)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-5 pt-3 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(item.inputs).map(([key, value]) => (
                        <div key={key} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-[8px] font-black border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                          <span className="opacity-40 mr-1 uppercase tracking-tighter">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1">Result</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight truncate italic">
                      {typeof item.result === 'object' ? JSON.stringify(item.result) : item.result}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
