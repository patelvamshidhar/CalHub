import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Percent, 
  ArrowLeftRight, 
  RefreshCcw, 
  Info, 
  Zap,
  TrendingUp,
  History,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'motion/react';
import { ExportActions } from './ExportActions';

interface RateConverterProps {
  onBack?: () => void;
}

export const RateConverter = ({ onBack }: RateConverterProps) => {
  const [mode, setMode] = useState<'pctToRate' | 'rateToPct'>('pctToRate');
  const [inputValue, setInputValue] = useState<string>('');
  const [rateUnit, setRateUnit] = useState<'rupees' | 'paise'>('paise');
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-calculation logic with useMemo
  const results = useMemo(() => {
    if (!inputValue) return null;
    const val = parseFloat(inputValue);
    if (isNaN(val) || val < 0) return null;

    if (mode === 'pctToRate') {
      const rupees = val / 12;
      return {
        value: rupees,
        display: val >= 12 ? `₹${rupees.toFixed(2)}` : `${Math.round(rupees * 100)} Paise`,
        unit: 'per month',
        explanation: `₹1 at 12% p.a. = ₹1 per year`
      };
    } else {
      const pct = rateUnit === 'rupees' ? val * 12 : (val / 100) * 12;
      return {
        value: pct,
        display: `${pct.toFixed(2)}%`,
        unit: 'per annum',
        explanation: `₹1 monthly rate = 12% annual interest`
      };
    }
  }, [inputValue, mode, rateUnit]);

  useEffect(() => {
    if (results) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [results]);

  const reset = () => {
    setInputValue('');
    setRateUnit('paise');
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <Card className="relative overflow-hidden border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] rounded-[22px] bg-card dark:bg-zinc-950 group">
        {/* Neon Accent Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
        
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 border-2 border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Percent className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tighter text-foreground dark:text-zinc-100 leading-none uppercase italic">Rate <span className="text-cyan-600 dark:text-cyan-400">Converter</span></h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 opacity-60">
                Finance Hub Protocol • 12% = ₹1
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={reset}
              className="h-10 w-10 rounded-full hover:bg-muted dark:hover:bg-white/5 text-muted-foreground transition-all"
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 bg-muted/40 dark:bg-zinc-950 p-1.5 rounded-full border-2 border-border/50">
              <span className={`text-[10px] font-black uppercase tracking-tighter px-2 ${mode === 'pctToRate' ? 'text-cyan-600 dark:text-cyan-400' : 'text-muted-foreground/30'}`}>%</span>
              <Switch 
                checked={mode === 'rateToPct'} 
                onCheckedChange={(checked) => setMode(checked ? 'rateToPct' : 'pctToRate')}
                className="data-[state=checked]:bg-cyan-600"
              />
              <span className={`text-[10px] font-black uppercase tracking-tighter px-2 ${mode === 'rateToPct' ? 'text-cyan-600 dark:text-cyan-400' : 'text-muted-foreground/30'}`}>₹/P</span>
            </div>
          </div>
        </div>

        <CardContent className="p-10 pt-6 space-y-12">
          {/* Main Input Area */}
          <div className="space-y-6 text-center">
            <div className="space-y-4 inline-block w-full max-w-[320px]">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground block mb-2 opacity-50">
                {mode === 'pctToRate' ? 'Input Percentage' : 'Monthly Interest'}
              </Label>
              <div className="relative group">
                <Input
                  type="number"
                  placeholder={mode === 'pctToRate' ? "12" : "1"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="text-3xl h-24 bg-white dark:bg-zinc-950 border-2 border-border focus-visible:ring-0 focus-visible:border-cyan-500/50 rounded-[2.5rem] text-center font-black text-foreground dark:text-zinc-100 placeholder:text-muted-foreground/10 transition-all shadow-xl group-hover:shadow-2xl group-hover:-translate-y-1 outline-none"
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
                  {results && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-1.5 rounded-full shadow-[0_10px_20px_rgba(6,182,212,0.4)]"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Active Pulse</span>
                      <Zap className="h-3 w-3 fill-white animate-pulse" />
                    </motion.div>
                  )}
                </div>
                
                {/* Unit Label for Rate mode */}
                {mode === 'rateToPct' && (
                  <div className="absolute top-1/2 -translate-y-1/2 -right-14">
                    <button 
                      onClick={() => setRateUnit(u => u === 'paise' ? 'rupees' : 'paise')}
                      className="h-10 px-3 rounded-xl border border-border dark:border-zinc-800 bg-muted/30 dark:bg-zinc-950 text-[9px] font-black uppercase text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-xl"
                    >
                      {rateUnit}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Display */}
          <div className="relative min-h-[140px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {results ? (
                <motion.div
                  key={`${results.display}-${mode}`}
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.1, opacity: 0, y: -10 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="text-center space-y-2"
                >
                  <div className="text-[11px] font-black text-muted-foreground/60 dark:text-zinc-600 uppercase tracking-[0.4em] mb-2">Equivalent Rate</div>
                  <div className="relative inline-block">
                    {/* Neon Glow behind result */}
                    <div className="absolute inset-0 blur-3xl bg-cyan-500/20 -z-10 rounded-full" />
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground dark:from-zinc-100 via-cyan-600 dark:via-cyan-400 to-blue-700 dark:to-blue-500 tracking-tighter px-4 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                      {results.display}
                    </h2>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground mt-2 lowercase">{results.unit}</p>
                </motion.div>
              ) : (
                <div className="text-center opacity-10 select-none">
                  <ArrowLeftRight className="h-14 w-14 text-foreground dark:text-zinc-100 mx-auto mb-4" />
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground dark:text-zinc-100">Enter Signal Value</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Info Bar */}
          <div className="pt-6 border-t border-border dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/20 dark:bg-zinc-950 border border-border dark:border-zinc-800">
              <Info className="h-3 w-3 text-muted-foreground/40 dark:text-zinc-700" />
              <span className="text-[9px] font-bold text-muted-foreground/40 dark:text-zinc-700 uppercase tracking-tight">
                Synced with Indian Financial Standards
              </span>
            </div>

            {results && (
              <ExportActions
                title="Rate Analysis"
                inputs={[
                  { label: 'Signal', value: mode === 'pctToRate' ? 'Annual Pct' : 'Monthly Rate' },
                  { label: 'Value', value: `${inputValue}${mode === 'pctToRate' ? '%' : rateUnit === 'rupees' ? '₹' : 'P'}` },
                ]}
                results={[
                  { label: 'Conversion', value: results.display },
                ]}
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dynamic Interpretation */}
      {results && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-card dark:bg-zinc-950 border border-border dark:border-zinc-800 py-3 px-6 rounded-full w-fit mx-auto shadow-xl"
        >
          <TrendingUp className="h-3 w-3 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          <span className="text-foreground dark:text-zinc-300">{results.explanation}</span>
        </motion.div>
      )}
    </div>
  );
};
