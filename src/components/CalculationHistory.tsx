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
      className="space-y-6 mt-20"
    >
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-2xl">
            <History className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-black tracking-tighter uppercase">{title}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 font-black text-[10px] uppercase tracking-widest h-10 rounded-2xl px-4"
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {history.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="border-2 hover:border-primary/30 transition-all shadow-xl hover:shadow-2xl bg-card relative overflow-hidden rounded-3xl group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-xl">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/60">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl shadow-sm hover:scale-110 transition-transform"
                    onClick={() => onReuse(item)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6 pt-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Parameters</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.inputs).map(([key, value]) => (
                        <div key={key} className="px-3 py-1 bg-muted/50 rounded-xl text-[10px] font-black border border-border/50">
                          <span className="opacity-40 mr-1.5 uppercase tracking-tighter">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-dashed border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Final Result</p>
                    <p className="text-2xl font-black text-primary tracking-tight truncate">
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
