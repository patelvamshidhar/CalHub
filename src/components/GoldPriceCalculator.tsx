import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Scale, 
  Dna, 
  BadgeIndianRupee, 
  Percent, 
  RefreshCcw, 
  Copy, 
  Check,
  TrendingUp,
  Coins,
  ChevronRight,
  Info,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Purity = '24K' | '22K' | '18K';
type Unit = 'g' | 'kg';

const PURITY_FACTORS: Record<Purity, number> = {
  '24K': 1.0,
  '22K': 0.916,
  '18K': 0.75
};

interface GoldPriceCalculatorProps {
  initialRate?: number;
  onSave?: (data: { weight: string; unit: string; purity: string; rate: number; totalPrice: number }) => void;
}

export const GoldPriceCalculator: React.FC<GoldPriceCalculatorProps> = ({ initialRate = 7500, onSave }) => {
  const [weight, setWeight] = useState<string>('10');
  const [unit, setUnit] = useState<Unit>('g');
  const [purity, setPurity] = useState<Purity>('22K');
  const [rate, setRate] = useState<string>(initialRate.toString());
  const [makingPercent, setMakingPercent] = useState<string>('0');
  const [copied, setCopied] = useState(false);

  // Sync rate if initialRate changes (e.g. from live data)
  useEffect(() => {
    if (initialRate) {
      setRate(initialRate.toString());
    }
  }, [initialRate]);

  const results = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const weightInGrams = unit === 'kg' ? w * 1000 : w;
    const r = parseFloat(rate) || 0;
    const mPercent = parseFloat(makingPercent) || 0;
    const purityFactor = PURITY_FACTORS[purity];

    const basePrice = weightInGrams * r * purityFactor;
    const makingCharges = basePrice * (mPercent / 100);
    const totalPrice = basePrice + makingCharges;

    return {
      basePrice,
      makingCharges,
      totalPrice,
      isValid: w > 0 && r > 0
    };
  }, [weight, unit, purity, rate, makingPercent]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const copyToClipboard = () => {
    const text = `Gold Calculation:\nWeight: ${weight}${unit}\nPurity: ${purity}\nRate: ₹${rate}/g\nMaking: ${makingPercent}%\nTotal: ${formatCurrency(results.totalPrice)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setWeight('10');
    setUnit('g');
    setPurity('22K');
    setRate(initialRate.toString());
    setMakingPercent('0');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-card dark:bg-zinc-950 text-foreground dark:text-zinc-100">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Input Section */}
          <div className="p-8 sm:p-12 space-y-10 border-b lg:border-b-0 lg:border-r border-border dark:border-zinc-800">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-widest">
                <Coins className="h-3 w-3" />
                Premium Calculator
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">
                Gold <span className="text-amber-600 dark:text-amber-500">Value</span>
              </h2>
              <p className="text-muted-foreground text-sm font-medium">Precision calculation with real-time purity factoring.</p>
            </div>

            <div className="space-y-8">
              {/* Weight Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Weight Analysis</Label>
                  <div className="flex gap-1 p-1 bg-muted/30 dark:bg-zinc-900/50 rounded-xl border border-border dark:border-zinc-800">
                    {(['g', 'kg'] as Unit[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                          unit === u 
                            ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-zinc-950 shadow-lg shadow-amber-500/20' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {u === 'g' ? 'Grams' : 'KG'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-muted/40 dark:bg-zinc-800 flex items-center justify-center border border-border dark:border-zinc-700 group-focus-within:border-amber-500/50 group-focus-within:bg-amber-500/10 transition-all">
                    <Scale className="h-5 w-5 text-muted-foreground group-focus-within:text-amber-600 dark:group-focus-within:text-amber-500" />
                  </div>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    autoFocus
                    className="h-20 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-amber-600 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-3xl pl-20 pr-6 text-3xl font-black text-foreground transition-all shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] outline-none"
                    placeholder="10.0"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground/30 dark:text-zinc-200 pointer-events-none uppercase tracking-tighter">
                    {unit}
                  </div>
                </div>
              </div>

              {/* Purity Picker */}
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gold Purity (Std.)</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['24K', '22K', '18K'] as Purity[]).map((p) => {
                    const active = purity === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setPurity(p)}
                        className={`h-16 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center gap-0.5 ${
                          active 
                            ? 'bg-amber-500/10 border-amber-600 dark:border-amber-500 text-amber-600 dark:text-amber-500 shadow-lg shadow-amber-500/10 scale-[1.02]' 
                            : 'bg-muted/10 dark:bg-zinc-900/50 border-border dark:border-zinc-800 text-muted-foreground hover:border-foreground/20'
                        }`}
                      >
                        <span className="text-xl leading-none">{p}</span>
                        <span className="text-[7px] uppercase tracking-widest opacity-60 font-bold">
                          {p === '22K' ? '91.6%' : `${PURITY_FACTORS[p] * 100}%`} PURE
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Rate Input */}
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Rate (₹/g)</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-muted-foreground/30 group-focus-within:text-amber-600 dark:group-focus-within:text-amber-500 transition-colors">₹</div>
                    <Input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="h-14 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-amber-600 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-2xl pl-10 pr-4 text-xl font-black text-foreground shadow-[0_4px_20px_rgb(0,0,0,0.05)] outline-none"
                    />
                  </div>
                </div>

                {/* Making Charges */}
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Making Charges (%)</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-muted-foreground/30 group-focus-within:text-amber-600 dark:group-focus-within:text-amber-500 transition-colors">%</div>
                    <Input
                      type="number"
                      value={makingPercent}
                      onChange={(e) => setMakingPercent(e.target.value)}
                      className="h-14 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-amber-600 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-2xl pl-10 pr-4 text-xl font-black text-foreground shadow-[0_4px_20px_rgb(0,0,0,0.05)] outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <Button 
                  onClick={reset}
                  variant="outline" 
                  className="h-14 flex-1 rounded-2xl border-border dark:border-zinc-800 bg-transparent text-muted-foreground font-bold uppercase tracking-widest hover:bg-muted dark:hover:bg-zinc-900 transition-all"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={copyToClipboard}
                  disabled={!results.isValid}
                  className="h-14 flex-1 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95"
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied' : 'Copy Result'}
                </Button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="relative bg-muted/20 dark:bg-zinc-900 flex flex-col justify-center overflow-hidden min-h-[400px]">
            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 p-10 sm:p-16 space-y-12 text-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card dark:bg-zinc-950/50 border border-border dark:border-zinc-800/80 backdrop-blur-md">
                  <Zap className="h-3 w-3 text-amber-600 dark:text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Total Valuation</span>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={results.totalPrice}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="relative inline-block group">
                      <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                      <h3 className="relative text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-amber-400 dark:from-amber-200 via-amber-600 dark:via-amber-500 to-amber-900 dark:to-amber-700 drop-shadow-2xl">
                        {results.isValid ? formatCurrency(results.totalPrice) : '₹0'}
                      </h3>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-6 pt-4 max-w-xs mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-card dark:bg-zinc-950/50 border border-border dark:border-zinc-800/50 text-left space-y-1">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 dark:text-zinc-500">Base Value</span>
                    <span className="text-lg font-black text-foreground dark:text-zinc-200">{formatCurrency(results.basePrice)}</span>
                  </div>
                  <div className="p-5 rounded-3xl bg-card dark:bg-zinc-950/50 border border-border dark:border-zinc-800/50 text-left space-y-1">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 dark:text-zinc-500">Making Charges</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-500/80">{formatCurrency(results.makingCharges)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 p-3 bg-muted/40 dark:bg-zinc-800/20 rounded-2xl border border-border dark:border-zinc-800/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Info className="h-3 w-3" />
                  Rates calculated per Indian Bullion Std.
                </div>
              </div>

              {/* Visual Breakdown Tag */}
              <div className="flex items-center justify-center gap-6 pt-6 mb-8">
                <div className="flex flex-col items-center gap-1">
                   <div className="px-3 py-1 rounded-lg bg-card dark:bg-zinc-950 text-muted-foreground dark:text-zinc-400 font-black text-[10px] tracking-widest border border-border dark:border-zinc-800">
                     {weight}{unit}
                   </div>
                   <span className="text-[8px] font-bold uppercase text-muted-foreground/60 dark:text-zinc-600 tracking-tighter">Gross Wt.</span>
                </div>
                <div className="w-px h-8 bg-border dark:bg-zinc-800" />
                <div className="flex flex-col items-center gap-1">
                   <div className="px-3 py-1 rounded-lg bg-card dark:bg-zinc-950 text-amber-600 dark:text-amber-500 font-black text-[10px] tracking-widest border border-amber-500/20">
                     {purity}
                   </div>
                   <span className="text-[8px] font-bold uppercase text-muted-foreground/60 dark:text-zinc-600 tracking-tighter">Purity Std.</span>
                </div>
                <div className="w-px h-8 bg-border dark:bg-zinc-800" />
                <div className="flex flex-col items-center gap-1">
                   <div className="px-3 py-1 rounded-lg bg-card dark:bg-zinc-950 text-muted-foreground dark:text-zinc-400 font-black text-[10px] tracking-widest border border-border dark:border-zinc-800">
                     {makingPercent}%
                   </div>
                   <span className="text-[8px] font-bold uppercase text-muted-foreground/60 dark:text-zinc-600 tracking-tighter">Making Fee</span>
                </div>
              </div>

              {onSave && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => onSave({ weight, unit, purity, rate: parseFloat(rate), totalPrice: results.totalPrice })}
                    disabled={!results.isValid}
                    variant="ghost"
                    className="rounded-2xl border border-border dark:border-zinc-800 hover:bg-muted dark:hover:bg-zinc-800 hover:text-amber-600 dark:hover:text-amber-500 transition-all font-black uppercase tracking-widest text-[10px] h-12 px-8"
                  >
                    Save Calculation <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-600 dark:via-amber-500 to-transparent opacity-20" />
          </div>
        </div>
      </Card>
    </div>
  );
};
