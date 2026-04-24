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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3.5rem] bg-card dark:bg-zinc-950 text-foreground dark:text-zinc-100 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Input Section */}
          <div className="p-12 lg:p-16 space-y-12 border-b lg:border-b-0 lg:border-r border-border/50">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-500/10 border-2 border-zinc-500/20 text-muted-foreground dark:text-zinc-400 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg">
                <CircleDot className="h-4 w-4" />
                Metallic Evaluation Protocol
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-[0.9] italic">
                Silver <br /><span className="text-zinc-500 dark:text-zinc-400">Appraisal</span>
              </h2>
              <p className="text-muted-foreground text-sm font-bold opacity-50 uppercase tracking-tight">High-fidelity silver density and market valuation suite.</p>
            </div>

            <div className="space-y-10 group/inputs">
              {/* Weight Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">Weight Analysis</Label>
                  <div className="flex gap-2 p-1.5 bg-muted/40 dark:bg-zinc-900 rounded-2xl border-2 border-border/50">
                    {(['g', 'kg'] as Unit[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                          unit === u 
                            ? 'bg-zinc-600 text-white shadow-xl shadow-zinc-500/30 dark:bg-zinc-200 dark:text-zinc-950' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {u === 'g' ? 'Grams' : 'KG'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative group/field">
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white dark:bg-zinc-950 border-2 border-border flex items-center justify-center shadow-lg group-focus-within/field:border-zinc-500 transition-all z-10">
                    <Scale className="h-7 w-7 text-muted-foreground group-focus-within/field:text-zinc-600 dark:group-focus-within/field:text-zinc-300" />
                  </div>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="text-3xl h-24 bg-white dark:bg-zinc-950 border-2 border-border focus-visible:ring-0 focus-visible:border-zinc-500/50 rounded-[2.5rem] pl-28 pr-8 font-black text-foreground transition-all shadow-xl group-hover/field:shadow-2xl group-hover/field:-translate-y-1 outline-none"
                    placeholder="100.0"
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-3xl font-black text-muted-foreground/10 uppercase tracking-tighter transition-all group-focus-within/field:text-zinc-500/20">
                    {unit}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 px-1">
                {/* Rate Input */}
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-2 opacity-50">Market Rate (₹/g)</Label>
                  <div className="relative group/field">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground/30 group-focus-within/field:text-zinc-600 dark:group-focus-within/field:text-zinc-300 transition-colors z-10">₹</div>
                    <Input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="h-20 bg-white dark:bg-zinc-950 border-2 border-border focus-visible:ring-0 focus-visible:border-zinc-500/50 rounded-3xl pl-12 pr-6 text-2xl font-black text-foreground shadow-xl group-hover/field:shadow-2xl group-hover/field:-translate-y-1 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Making Charges */}
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-2 opacity-50">Making (%)</Label>
                  <div className="relative group/field">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground/30 group-focus-within/field:text-zinc-600 dark:group-focus-within/field:text-zinc-300 transition-colors z-10">%</div>
                    <Input
                      type="number"
                      value={makingPercent}
                      onChange={(e) => setMakingPercent(e.target.value)}
                      className="h-20 bg-white dark:bg-zinc-950 border-2 border-border focus-visible:ring-0 focus-visible:border-zinc-500/50 rounded-3xl pl-12 pr-6 text-2xl font-black text-foreground shadow-xl group-hover/field:shadow-2xl group-hover/field:-translate-y-1 transition-all outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-5">
                <Button 
                  onClick={reset}
                  variant="outline" 
                  className="h-18 flex-1 rounded-2xl border-2 border-border hover:bg-muted dark:text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                >
                  <RefreshCcw className="h-5 w-5 mr-3" />
                  Reset
                </Button>
                <Button 
                  onClick={copyToClipboard}
                  disabled={!results.isValid}
                  className="h-18 flex-1 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-white dark:to-zinc-200 dark:text-zinc-950 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.05] active:scale-[0.95] transition-all group"
                >
                  {copied ? <Check className="h-5 w-5 mr-3" /> : <Copy className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />}
                  {copied ? 'Copied' : 'Export Packet'}
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
                    <h3 className="relative text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-300 via-zinc-600 to-zinc-900 dark:from-white dark:via-zinc-400 dark:to-zinc-600 italic">
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
