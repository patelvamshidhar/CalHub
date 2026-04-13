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
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold text-xs uppercase tracking-widest"
        >
          <Trash2 className="h-3 w-3 mr-2" />
          Clear History
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {history.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="border-2 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Clock className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 rounded-full"
                    onClick={() => onReuse(item)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inputs</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.inputs).map(([key, value]) => (
                        <div key={key} className="px-2 py-0.5 bg-muted rounded-md text-[10px] font-bold">
                          <span className="opacity-50 mr-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-dashed">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Result</p>
                    <p className="text-lg font-black text-primary truncate">
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
