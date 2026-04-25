import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Scale, 
  RefreshCcw, 
  Copy, 
  Check,
  ChevronRight,
  Info,
  Zap,
  CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Unit = 'g' | 'kg';

interface SilverPriceCalculatorProps {
  initialRate?: number;
  onSave?: (data: { weight: string; unit: string; rate: number; totalPrice: number; gstPrice: number }) => void;
}

export const SilverPriceCalculator: React.FC<SilverPriceCalculatorProps> = ({ initialRate = 100, onSave }) => {
  const [weight, setWeight] = useState<string>('100');
  const [unit, setUnit] = useState<Unit>('g');
  const [rate, setRate] = useState<string>(initialRate.toString());
  const [makingPercent, setMakingPercent] = useState<string>('0');
  const [copied, setCopied] = useState(false);

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
    const GST_RATE = 0.03; // 3% GST

    const basePrice = weightInGrams * r;
    const makingCharges = basePrice * (mPercent / 100);
    const subtotal = basePrice + makingCharges;
    const gstPrice = subtotal * GST_RATE;
    const totalPrice = subtotal + gstPrice;

    return {
      basePrice,
      makingCharges,
      gstPrice,
      totalPrice,
      isValid: w > 0 && r > 0
    };
  }, [weight, unit, rate, makingPercent]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const copyToClipboard = () => {
    const text = `Silver Calculation:\nWeight: ${weight}${unit}\nRate: ₹${rate}/g\nMaking: ${makingPercent}%\nTotal: ${formatCurrency(results.totalPrice)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setWeight('100');
    setUnit('g');
    setRate(initialRate.toString());
    setMakingPercent('0');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pb-24">
      <Card className="overflow-hidden border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] rounded-[2.5rem] bg-card dark:bg-zinc-950 text-foreground dark:text-zinc-100 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Input Section */}
          <div className="p-6 md:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-border/50">
            <div className="space-y-4 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-muted-foreground dark:text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em]">
                <CircleDot className="h-3 w-3" />
                Evaluation Protocol
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic text-text-primary">
                Silver <span className="text-zinc-500 dark:text-zinc-400">Appraisal</span>
              </h2>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-widest leading-relaxed">High-fidelity bullion analysis matrix. Rates indexed globally.</p>
            </div>

            <div className="space-y-6 group/inputs">
              {/* Weight Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 mb-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">Weight Analysis</Label>
                  <div className="flex gap-1.5 p-1 bg-secondary dark:bg-zinc-900 rounded-xl border border-border">
                    {(['g', 'kg'] as Unit[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                          unit === u 
                            ? 'bg-zinc-600 text-white shadow-lg' 
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {u === 'g' ? 'Grams' : 'Kilograms'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative group/field">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm z-10 transition-transform group-focus-within/field:scale-110">
                    <Scale className="h-5 w-5 text-text-muted group-focus-within/field:text-zinc-600" />
                  </div>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="text-3xl h-20 bg-background border-2 border-border focus-visible:ring-0 focus-visible:border-zinc-500/50 rounded-2xl pl-20 pr-6 font-black text-text-primary transition-all outline-none"
                    placeholder="100.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
                {/* Rate Input */}
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Rate (₹/g)</Label>
                  <Input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="h-11 bg-white dark:bg-zinc-950 border-2 border-border rounded-xl px-4 text-lg font-black text-foreground outline-none"
                  />
                </div>

                {/* Making Charges */}
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Making (%)</Label>
                  <Input
                    type="number"
                    value={makingPercent}
                    onChange={(e) => setMakingPercent(e.target.value)}
                    className="h-11 bg-white dark:bg-zinc-950 border-2 border-border rounded-xl px-4 text-lg font-black text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button 
                  onClick={reset}
                  variant="outline" 
                  className="h-14 flex-1 rounded-xl border-2 border-border hover:bg-muted dark:text-zinc-500 font-black uppercase tracking-[0.2em] text-[9px] transition-all"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={copyToClipboard}
                  disabled={!results.isValid}
                  className="h-14 flex-1 rounded-xl bg-zinc-900 dark:bg-white dark:text-zinc-950 text-white font-black uppercase tracking-[0.2em] text-[9px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />}
                  {copied ? 'Copied' : 'Export'}
                </Button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="relative bg-muted/20 dark:bg-zinc-900 flex flex-col justify-center overflow-hidden min-h-[500px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-zinc-400/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
            
            <div className="relative z-10 p-12 lg:p-20 space-y-16 text-center">
              <div className="space-y-6 flex flex-col items-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white dark:bg-zinc-950 border-2 border-border shadow-2xl">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Silver Asset Valuation</span>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={results.totalPrice}
                    initial={{ scale: 0.8, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative block group"
                  >
                    <h3 className="relative text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-300 via-zinc-600 to-zinc-900 dark:from-white dark:via-zinc-400 dark:to-zinc-600 italic">
                      {results.isValid ? formatCurrency(results.totalPrice) : '₹0'}
                    </h3>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-8 pt-6 max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-950 border-2 border-border text-left space-y-2 shadow-lg group-hover:shadow-2xl transition-all">
                    <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Market Subtotal</span>
                    <span className="text-2xl font-black text-foreground leading-none">{formatCurrency(results.basePrice)}</span>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-950 border-2 border-border text-left space-y-2 shadow-lg hover:border-zinc-500/50 transition-all">
                    <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">GST (3%)</span>
                    <span className="text-2xl font-black text-zinc-600 dark:text-zinc-400 leading-none">{formatCurrency(results.gstPrice)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-zinc-950/20 rounded-2xl border-2 border-border/50 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground shadow-xl">
                  Sovereign fiscal indices applied
                </div>
              </div>

              <div className="flex items-center justify-center gap-10 pt-10">
                <div className="flex flex-col items-center gap-2">
                   <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center border-2 border-border shadow-xl font-black text-[11px] uppercase tracking-tighter">
                     {weight}
                   </div>
                   <span className="text-[10px] font-black uppercase text-muted-foreground opacity-40 tracking-widest">Weight ({unit})</span>
                </div>
                <div className="w-px h-16 bg-border/50" />
                <div className="flex flex-col items-center gap-2">
                   <div className="w-14 h-14 rounded-2xl bg-zinc-400 text-white dark:text-zinc-950 flex items-center justify-center border-2 border-zinc-400 shadow-xl font-black text-[11px] uppercase italic">
                     Silver
                   </div>
                   <span className="text-[10px] font-black uppercase text-muted-foreground opacity-40 tracking-widest">Density Std.</span>
                </div>
                <div className="w-px h-16 bg-border/50" />
                <div className="flex flex-col items-center gap-2">
                   <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center border-2 border-border shadow-xl font-black text-[11px] uppercase tracking-tighter">
                     {makingPercent}%
                   </div>
                   <span className="text-[10px] font-black uppercase text-muted-foreground opacity-40 tracking-widest">Charges Pct.</span>
                </div>
              </div>

              {onSave && (
                <div className="flex justify-center pt-10">
                  <Button
                    onClick={() => onSave({ weight, unit, rate: parseFloat(rate), totalPrice: results.totalPrice, gstPrice: results.gstPrice })}
                    disabled={!results.isValid}
                    className="rounded-[2rem] bg-zinc-600 text-white dark:bg-zinc-200 dark:text-zinc-950 font-black uppercase tracking-[0.4em] text-[11px] h-18 px-12 shadow-2xl shadow-zinc-500/40 hover:scale-[1.05] active:scale-[0.95] transition-all"
                  >
                    Archive Appraisal <ChevronRight className="h-5 w-5 ml-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
