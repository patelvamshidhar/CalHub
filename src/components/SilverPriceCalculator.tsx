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
    <div className="max-w-md mx-auto px-4 pb-24 pt-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-400">Metallic Evaluation Hub</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white italic">Silver Valuation</h2>
        </div>

        {/* Weight Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
          {(['g', 'kg'] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-500 ${
                unit === u 
                  ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {u === 'g' ? 'Grams' : 'Kilograms'}
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          <div className="relative">
            <Label htmlFor="silver-weight" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 block">Weight</Label>
            <Input
              id="silver-weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-zinc-400 outline-none transition-all duration-500 font-black"
              placeholder="100.0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Label htmlFor="silver-rate" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 block">Rate (₹/g)</Label>
              <Input
                id="silver-rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-zinc-400 outline-none transition-all duration-500 font-black"
              />
            </div>
            <div className="relative">
              <Label htmlFor="silver-making" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 block">Making (%)</Label>
              <Input
                id="silver-making"
                type="number"
                value={makingPercent}
                onChange={(e) => setMakingPercent(e.target.value)}
                className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-zinc-400 outline-none transition-all duration-500 font-black"
              />
            </div>
          </div>
        </div>

        {/* Result Section */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={results.totalPrice}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-700"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Asset Value</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
              {results.isValid ? formatCurrency(results.totalPrice) : '₹0'}
            </h2>
            {results.isValid && (
              <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                <span>Base: {formatCurrency(results.basePrice)}</span>
                <span>GST: {formatCurrency(results.gstPrice)}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button 
            onClick={copyToClipboard}
            disabled={!results.isValid}
            className="w-full h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Export Data'}
          </button>
          
          <button 
            onClick={reset}
            className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all duration-500 flex items-center justify-center gap-2"
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
