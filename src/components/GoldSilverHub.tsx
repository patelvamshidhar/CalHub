import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Coins, 
  CircleDot, 
  MapPin, 
  RefreshCcw, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  IndianRupee, 
  Calculator, 
  ShieldCheck,
  ChevronRight,
  Scale,
  Search,
  Lock,
  Unlock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';
import { useLocalStorage } from '@/lib/pwa';
import { getCachedPrices, fetchAllPrices, LivePrices } from '@/services/priceService';
import { GoldPriceCalculator } from './GoldPriceCalculator';
import { SilverPriceCalculator } from './SilverPriceCalculator';

// Mock data as fallback and starting point (Updated for Today: April 23, 2026)
const MOCK_RATES: Record<string, { gold24: number; gold22: number; silver: number }> = {
  'hyderabad': { gold24: 8650, gold22: 7930, silver: 115 },
  'mumbai': { gold24: 8670, gold22: 7950, silver: 116 },
  'delhi': { gold24: 8660, gold22: 7940, silver: 115.5 },
  'chennai': { gold24: 8680, gold22: 7960, silver: 116.5 },
  'bangalore': { gold24: 8665, gold22: 7945, silver: 115.8 },
  'kolkata': { gold24: 8675, gold22: 7955, silver: 116.2 },
  'pune': { gold24: 8655, gold22: 7935, silver: 115.3 },
  'ahmedabad': { gold24: 8645, gold22: 7925, silver: 114.8 },
  'visakhapatnam': { gold24: 8630, gold22: 7910, silver: 114 },
  'vijayawada': { gold24: 8620, gold22: 7900, silver: 114 },
  'tirupati': { gold24: 8625, gold22: 7905, silver: 113.8 },
  'guntur': { gold24: 8615, gold22: 7895, silver: 113.5 },
  'kurnool': { gold24: 8610, gold22: 7890, silver: 113.2 },
  'nellore': { gold24: 8622, gold22: 7902, silver: 114.1 },
  'rajamahendravaram': { gold24: 8628, gold22: 7908, silver: 114.3 },
  'kakinada': { gold24: 8632, gold22: 7912, silver: 114.4 },
  'kadapa': { gold24: 8608, gold22: 7888, silver: 113.0 },
  'anantapur': { gold24: 8605, gold22: 7885, silver: 112.8 },
  'eluru': { gold24: 8618, gold22: 7898, silver: 113.7 },
  'vizianagaram': { gold24: 8635, gold22: 7915, silver: 114.5 },
  'ongole': { gold24: 8612, gold22: 7892, silver: 113.4 },
  'chittoor': { gold24: 8622, gold22: 7902, silver: 113.6 },
  'machilipatnam': { gold24: 8624, gold22: 7904, silver: 114.2 },
  'tenali': { gold24: 8616, gold22: 7896, silver: 113.6 },
};

const DEFAULT_RATES = MOCK_RATES['hyderabad'];
const GST_RATE = 0.03; // 3% GST

type WeightUnit = 'g' | 'kg';

export const GoldSilverHub = () => {
  const [lastUpdated, setLastUpdated] = useLocalStorage<string>('gs-last-updated', new Date().toISOString());
  const [showGST, setShowGST] = useLocalStorage<boolean>('gs-show-gst', true);

  const [history, setHistory] = useLocalStorage<HistoryItem[]>('gs-history', []);

  // Rates derived from live or mock data
  const currentData = useMemo(() => getCachedPrices(), [lastUpdated]);

  const rates = useMemo(() => {
    const live = currentData;
    
    // Always use live or default Hyderabad rates as the global baseline
    if (live.source === 'api') {
      return {
        gold24: live.gold24,
        gold22: live.gold22,
        silver: live.silver
      };
    }

    return MOCK_RATES['hyderabad'];
  }, [currentData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleReuse = (item: HistoryItem) => {
    // Silver and Gold calculators manage their own state
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4 md:px-6 pb-24">
      {/* Top Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-5 md:p-6 rounded-[2rem] border border-border shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-0.5">
            <Coins className="h-3 w-3 text-amber-600 dark:text-amber-500" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground">Metallic Evaluation Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
            Gold & Silver <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600">Hub</span>
          </h1>
          <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-tight opacity-60">Precision metallic analysis terminal.</p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-xl border border-border/50">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">System Live</span>
            <span className="text-[10px] font-black uppercase tracking-tighter text-foreground">Encrypted Node</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {/* Connection logic removed for pure offline-first experience */}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Premium Gold Calculator Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <GoldPriceCalculator 
              initialRate={rates.gold24} 
              onSave={(data) => {
                const newItem: HistoryItem = {
                  id: Date.now().toString(),
                  type: 'Finance',
                  inputs: {
                    item: 'Gold',
                    weight: `${data.weight}${data.unit}`,
                    purity: data.purity,
                    rate: `₹${data.rate}/g`
                  },
                  result: `Total: ${formatCurrency(data.totalPrice)}`,
                  timestamp: new Date().toISOString()
                };
                setHistory([newItem, ...history].slice(0, 10));
              }}
            />
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SilverPriceCalculator 
              initialRate={rates.silver}
              onSave={(data) => {
                const newItem: HistoryItem = {
                  id: Date.now().toString(),
                  type: 'Finance',
                  inputs: {
                    item: 'Silver',
                    weight: `${data.weight}${data.unit}`,
                    rate: `₹${data.rate}/g`
                  },
                  result: `Total: ${formatCurrency(data.totalPrice)}`,
                  timestamp: new Date().toISOString()
                };
                setHistory([newItem, ...history].slice(0, 10));
              }}
            />
          </motion.div>
        </div>
      </div>

      <div className="space-y-6">
         <CalculationHistory 
           history={history} 
           onClear={() => setHistory([])} 
           onReuse={handleReuse} 
           title="Audit Log: Metallic Transactions"
         />
      </div>

      {/* Market Protocol Banner */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border border-border p-5 md:p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden shadow-sm group">
        <div className="bg-amber-500/10 dark:bg-white/5 p-3 rounded-xl shrink-0">
          <Zap className="h-5 w-5 text-amber-600 dark:text-amber-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
            Market Intelligence <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </h3>
          <p className="text-muted-foreground text-[10px] font-medium leading-relaxed max-w-3xl opacity-80">
            Rates are indexed globally. Displays are for informational analysis. Final trade values may vary based on GST, making charges, and local hallmarking protocols.
          </p>
        </div>
      </div>
    </div>
  );
};
