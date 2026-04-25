import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Clock, 
  RefreshCcw, 
  ChevronRight,
  IndianRupee,
  Calendar as CalendarIcon,
  Layers,
  ArrowUpRight,
  Info,
  Sparkles,
  RefreshCw,
  ArrowRightLeft
} from 'lucide-react';
import { format, differenceInDays, addYears, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';

// Hook for number count up animation
const useCountUp = (end: number, duration: number = 500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

export const InterestCalculator = () => {
  const [principal, setPrincipal] = useState<string>('50000');
  const [rate, setRate] = useState<string>('12');
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(addYears(new Date(), 1), 'yyyy-MM-dd'));
  const [compounding, setCompounding] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Calculate results
  const results = useMemo(() => {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(P) || P <= 0 || isNaN(R) || R < 0 || !isAfter(end, start)) return null;

    const totalDays = differenceInDays(end, start);
    const T = totalDays / 365;

    const nMap = { monthly: 12, quarterly: 4, yearly: 1 };
    const n = nMap[compounding];
    
    // SI
    const siInterest = (P * R * T) / 100;
    const siTotal = P + siInterest;

    // CI
    const ciTotal = P * Math.pow(1 + (R / 100) / n, n * T);
    const ciInterest = ciTotal - P;

    // Duration
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;

    return {
      siInterest, siTotal, ciInterest, ciTotal,
      duration: `${years}Y ${months}M ${days}D`,
      totalDays
    };
  }, [principal, rate, startDate, endDate, compounding]);

  const handleSaveToHistory = () => {
    if (results) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        type: 'Finance',
        inputs: { principal, rate, startDate, endDate, compounding },
        result: `Total: ₹${Math.round(results.ciTotal).toLocaleString()}`,
        timestamp: new Date().toISOString()
      };
      const newHistory = [newItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('ic_history', JSON.stringify(newHistory));
    }
  };

  const handleReuse = (item: HistoryItem) => {
    setPrincipal(item.inputs.principal);
    setRate(item.inputs.rate);
    setStartDate(item.inputs.startDate);
    setEndDate(item.inputs.endDate);
    setCompounding(item.inputs.compounding);
  };

  const reset = () => {
    setPrincipal('50000');
    setRate('12');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate(format(addYears(new Date(), 1), 'yyyy-MM-dd'));
    setCompounding('yearly');
  };

  useEffect(() => {
    const saved = localStorage.getItem('ic_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="relative overflow-hidden border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] rounded-[2.5rem] bg-card dark:bg-zinc-950/60 backdrop-blur-2xl group">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5 -z-10 transition-opacity" />
        
        {/* Neon Accents */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-emerald-500 opacity-80" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <CardContent className="p-0 text-foreground dark:text-zinc-100">
          <div className="p-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border-2 border-purple-500/30 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground dark:text-zinc-100 uppercase tracking-tighter leading-none italic">Interest <span className="text-purple-600 dark:text-purple-400">Planner</span></h3>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1.5 mt-1.5 opacity-60">
                  <Clock className="h-3 w-3" /> Growth Protocol
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={reset}
              className="h-10 w-10 border-2 border-border/50 rounded-full hover:bg-muted dark:hover:bg-white/5 text-muted-foreground transition-all"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-8 space-y-8">
            {/* Input Grid */}
            <div className="space-y-6">
              {/* Principal Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <Label htmlFor="principal-cap" className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">Principal Capital</Label>
                  <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">₹{parseFloat(principal).toLocaleString()}</div>
                </div>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-black text-muted-foreground/20 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-500 transition-colors z-10">₹</div>
                  <Input
                    id="principal-cap"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="h-20 sm:h-24 pl-12 sm:pl-16 pr-6 text-3xl sm:text-4xl bg-white dark:bg-zinc-950 font-black border-2 border-border shadow-xl group-hover:shadow-2xl rounded-[1.5rem] sm:rounded-[2rem] focus-visible:ring-0 focus-visible:border-purple-500/50 transition-all text-foreground dark:text-zinc-100 outline-none"
                    placeholder="50,000"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {['10000', '50000', '100000', '500000'].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setPrincipal(amt)}
                      className={`flex-shrink-0 px-4 py-2 bg-muted/40 dark:bg-zinc-900 border-2 border-border rounded-xl text-[10px] font-black transition-all active:scale-95 ${principal === amt ? 'text-white border-purple-600 bg-purple-600' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      +₹{parseInt(amt).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Interest Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="interest-yield" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Yield % P.A.</Label>
                    <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">{rate}%</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground/30 dark:text-zinc-700">%</div>
                    <Input
                      id="interest-yield"
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="h-12 pl-10 pr-4 bg-muted/20 dark:bg-zinc-950 text-lg font-black border-2 border-border dark:border-zinc-800 rounded-xl focus-visible:border-purple-600 dark:focus-visible:border-purple-500 transition-all text-foreground dark:text-zinc-100 outline-none"
                    />
                  </div>
                </div>

                {/* Compounding Selector */}
                <div className="space-y-2">
                  <Label id="compounding-type" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Compounding</Label>
                  <div role="group" aria-labelledby="compounding-type" className="grid grid-cols-3 gap-1 p-1 bg-muted/20 dark:bg-zinc-950 rounded-xl border border-border dark:border-zinc-800 h-12">
                    {['monthly', 'quarterly', 'yearly'].map(item => (
                      <button
                        key={item}
                        onClick={() => setCompounding(item as any)}
                        className={`rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${compounding === item ? 'bg-purple-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {item.charAt(0)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="start-date" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Term Range</Label>
                  {results && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      {results.duration}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 px-4 bg-muted/20 dark:bg-zinc-950 font-black border-2 border-border rounded-xl text-xs outline-none"
                  />
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 px-4 bg-muted/20 dark:bg-zinc-950 font-black border-2 border-border rounded-xl text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Result Section */}
            <AnimatePresence mode="wait">
              {results ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="relative p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-muted/10 dark:bg-zinc-950 overflow-hidden border-2 border-purple-500/20 shadow-xl group/result text-center">
                    <div className="space-y-1">
                       <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Maturity Projection</span>
                       <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground dark:from-zinc-100 via-emerald-600 dark:via-emerald-400 to-emerald-800 tracking-tighter">
                         ₹{Math.round(results.ciTotal).toLocaleString()}
                       </h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border dark:border-zinc-900">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Growth</p>
                        <p className="text-xl font-black text-emerald-600 leading-none">+{Math.round(results.ciInterest).toLocaleString()}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Timeline</p>
                        <p className="text-xl font-black text-foreground dark:text-zinc-100 leading-none">{results.totalDays}D</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-3">
                    <Button 
                      variant="ghost" 
                      onClick={handleSaveToHistory}
                      className="h-12 sm:h-10 w-full sm:w-auto px-4 rounded-xl bg-muted/40 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 font-black uppercase tracking-widest text-[10px] sm:text-[9px] flex items-center justify-center gap-2 transition-all border border-border dark:border-zinc-800"
                    >
                      <span>Log Evaluation</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    
                    <div className="w-full sm:w-auto flex justify-center sm:block">
                      <ExportActions
                        title="Financial Projection"
                        inputs={[
                          { label: 'Principal', value: `₹${principal}` },
                          { label: 'Rate', value: `${rate}%` },
                          { label: 'Term', value: results.duration }
                        ]}
                        results={[
                          { label: 'Maturity', value: `₹${Math.round(results.ciTotal).toLocaleString()}` },
                          { label: 'Growth', value: `₹${Math.round(results.ciInterest).toLocaleString()}` }
                        ]}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center gap-6 bg-muted/10 dark:bg-zinc-950/40 rounded-[3rem] border-2 border-dashed border-border dark:border-zinc-900">
                  <div className="w-20 h-20 rounded-[2rem] bg-muted/30 dark:bg-zinc-900 flex items-center justify-center text-muted-foreground/30 dark:text-zinc-800">
                    <Info className="h-10 w-10 opacity-20" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[11px] font-black text-muted-foreground/40 dark:text-zinc-700 uppercase tracking-[0.4em]">Awaiting Financial Signal</p>
                    <p className="text-[9px] font-bold text-muted-foreground/30 dark:text-zinc-800 uppercase tracking-widest">Inputs required for projection</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* History Section */}
      <div className="relative">
        <CalculationHistory 
          history={history} 
          onClear={() => {
            setHistory([]);
            localStorage.removeItem('ic_history');
          }} 
          onReuse={handleReuse} 
          title="Audit Log: Fiscal Ledger"
        />
      </div>
    </div>
  );
};

