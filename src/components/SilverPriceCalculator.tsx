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
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<Unit>('g');
  const [rate, setRate] = useState<string>('');
  const [makingPercent, setMakingPercent] = useState<string>('');
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
    setWeight('');
    setUnit('g');
    setRate('');
    setMakingPercent('');
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-24 pt-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Metallic Evaluation Hub</p>
          <h2 className="text-2xl font-bold text-foreground italic">Silver Valuation</h2>
        </div>

        {/* Weight Toggle */}
        <div className="flex bg-muted rounded-xl p-1">
          {(['g', 'kg'] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-500 ${
                unit === u 
                  ? 'bg-card shadow text-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              {u === 'g' ? 'Grams' : 'Kilograms'}
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          <div className="relative">
            <Label htmlFor="silver-weight" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Weight</Label>
            <Input
              id="silver-weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 px-4 rounded-xl border-border bg-card text-foreground focus:ring-2 focus:ring-zinc-400 outline-none transition-all duration-500 font-black placeholder:text-muted-foreground"
              placeholder="Enter weight"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Label htmlFor="silver-rate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Rate (₹/g)</Label>
              <Input
                id="silver-rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Enter rate (₹)"
                className="h-12 px-4 rounded-xl border-border bg-card text-foreground focus:ring-2 focus:ring-zinc-400 outline-none transition-all duration-500 font-black placeholder:text-muted-foreground"
              />
            </div>
            <div className="relative">
              <Label htmlFor="silver-making" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Making (%)</Label>
              <Input
                id="silver-making"
                type="number"
                value={makingPercent}
                onChange={(e) => setMakingPercent(e.target.value)}
                placeholder="Enter %"
                className="h-12 px-4 rounded-xl border-border bg-card text-foreground focus:ring-2 focus:ring-zinc-400 outline-none transition-all duration-500 font-black placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Result Section */}
        <AnimatePresence mode="wait">
          {results.isValid ? (
            <motion.div 
              key={results.totalPrice}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted rounded-2xl p-4 text-center border border-border"
            >
              <p className="text-xs text-muted-foreground mb-1 font-medium">Total Asset Value</p>
              <h2 className="text-3xl font-bold text-foreground tabular-nums">
                {formatCurrency(results.totalPrice)}
              </h2>
              <div className="flex justify-center gap-4 mt-2 text-[10px] text-muted-foreground font-medium">
                <span>Base: {formatCurrency(results.basePrice)}</span>
                <span>GST: {formatCurrency(results.gstPrice)}</span>
              </div>
            </motion.div>
          ) : (
            <div className="bg-muted rounded-2xl p-8 text-center border border-dashed border-border">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enter values to calculate</p>
            </div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button 
            onClick={copyToClipboard}
            disabled={!results.isValid}
            className="w-full h-12 rounded-xl bg-foreground text-background font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Export Data'}
          </button>
          
          <button 
            onClick={reset}
            className="w-full h-12 rounded-xl border border-border text-muted-foreground font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all duration-500 flex items-center justify-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>

          {onSave && (
            <button
              onClick={() => onSave({ weight, unit, rate: parseFloat(rate), totalPrice: results.totalPrice, gstPrice: results.gstPrice })}
              disabled={!results.isValid}
              className="w-full h-12 rounded-xl bg-zinc-600 text-white font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all duration-500 disabled:opacity-50"
            >
              Archive Appraisal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
