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
    <div className="max-w-xl mx-auto px-4 pb-24 pt-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-400">Metallic Evaluation Hub</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white italic">Gold Valuation</h2>
        </div>

        {/* Weight Unit Selector */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 block">Weight Unit</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['g', 'kg'] as Unit[]).map((u) => {
              const active = unit === u;
              return (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`py-3 rounded-xl border transition-all duration-500 text-sm font-semibold ${
                    active 
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-transparent'
                  }`}
                >
                  {u === 'g' ? 'Grams' : 'Kilograms'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          <div className="relative">
            <Label htmlFor="gold-weight" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 block">Weight</Label>
            <Input
              id="gold-weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none transition-all duration-500 font-black"
              placeholder="10.0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Label htmlFor="gold-rate" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 block">Rate (₹/g)</Label>
              <Input
                id="gold-rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none transition-all duration-500 font-black"
              />
            </div>
            <div className="relative">
              <Label htmlFor="gold-making" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 block">Making (%)</Label>
              <Input
                id="gold-making"
                type="number"
                value={makingPercent}
                onChange={(e) => setMakingPercent(e.target.value)}
                className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none transition-all duration-500 font-black"
              />
            </div>
          </div>
        </div>

        {/* Purity Selector */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 block">Purity Standard</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['24K', '22K', '18K'] as Purity[]).map((p) => {
              const active = purity === p;
              return (
                <button
                  key={p}
                  onClick={() => setPurity(p)}
                  className={`py-3 rounded-xl border transition-all duration-500 text-sm font-semibold ${
                    active 
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-transparent'
                  }`}
                >
                  {p}
                </button>
              );
            })}
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
              onClick={() => onSave({ weight, unit, purity, rate: parseFloat(rate), totalPrice: results.totalPrice })}
              disabled={!results.isValid}
              className="w-full h-12 rounded-xl bg-amber-600 text-white font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all duration-500 disabled:opacity-50"
            >
              Archive Evaluation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
