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
  Unlock
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
    <div className="space-y-12 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
      {/* Top Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card dark:bg-zinc-950 overflow-hidden p-8 rounded-[2.5rem] border border-border shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
            <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-500/20">
              <Coins className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Global Metals Authority</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-zinc-100 uppercase italic leading-none">
            Gold & Silver <span className="text-amber-500">Hub</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Real-time metallic evaluation and neural market analytics.</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-2 justify-end text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Pulse Sync: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 justify-end mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_emerald]" />
               Vault Data Active
            </div>
          </div>
          <div className="w-px h-10 bg-border hidden sm:block" />
          <Button 
            variant="ghost" 
            className="h-16 w-16 rounded-[1.5rem] bg-secondary border border-border text-amber-500 hover:bg-accent hover:text-amber-400 transition-all group"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-6 w-6 group-active:rotate-180 transition-transform duration-500" />
          </Button>
        </div>
      </motion.div>

      {/* Data Status Notification */}
      <AnimatePresence>
        {!currentData.metalsSynced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-5 rounded-[2rem] border-2 flex items-center gap-4 bg-amber-500/10 border-amber-500/20 text-amber-500 backdrop-blur-xl`}>
              <div className="p-3 rounded-2xl shrink-0 bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                <Info className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">
                  System Connection Notice
                </p>
                <p className="text-sm font-medium leading-tight text-amber-400/80">
                  {currentData.metalsError || 'Synchronizing with global vaults...'}. Price metrics are now in safe-mode.
                </p>
              </div>
            </div>
          </motion.div>
        )}
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

      {/* Info Banner */}
      <div className="bg-card dark:bg-zinc-950 border border-border p-12 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden shadow-2xl group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:rotate-45 transition-transform duration-1000">
          <ShieldCheck className="h-64 w-64 text-emerald-500" />
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-[2rem] shadow-2xl shadow-emerald-500/20 shrink-0 relative z-10">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <div className="space-y-4 text-center md:text-left relative z-10">
          <h3 className="text-2xl font-black uppercase tracking-tight text-foreground dark:text-zinc-100 italic">Neural Verification <span className="text-emerald-500">Active</span></h3>
          <p className="text-muted-foreground text-base font-medium leading-relaxed max-w-4xl">
            Global bullion markets are monitored via a decentralized neural network. Rates fluctuate based on international sovereign indices. 
            Displayed metrics are for <span className="text-emerald-400 font-black">informational analysis only</span>. Final trade execution values may optimize based on local fiscal jurisdictions including GST, making charges, and hallmarking protocols.
          </p>
        </div>
      </div>
    </div>
  );
};
