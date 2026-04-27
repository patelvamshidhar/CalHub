/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IndianRupee, Percent, RotateCcw, TrendingDown, Gift, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const calculations = useMemo(() => {
    const price = parseFloat(originalPrice) || 0;
    const mainDiscount = parseFloat(discountPercent) || 0;
    
    // Validate inputs for calculation
    if (price <= 0 || mainDiscount < 0 || mainDiscount > 100) {
      return { discountAmount: 0, totalSavings: 0, finalPrice: price };
    }

    const discountAmount = (price * mainDiscount) / 100;
    const totalSavings = discountAmount;
    const finalPrice = Math.max(0, price - totalSavings);
    
    return {
      discountAmount,
      totalSavings,
      finalPrice
    };
  }, [originalPrice, discountPercent]);

  const handleReset = () => {
    setOriginalPrice('');
    setDiscountPercent('');
    setErrors({});
  };

  useEffect(() => {
    const newErrors: { [key: string]: string } = {};
    
    const price = parseFloat(originalPrice);
    if (originalPrice !== '' && (isNaN(price) || price < 0)) {
      newErrors.price = 'Price must be a positive number';
    }

    const dPercent = parseFloat(discountPercent);
    if (discountPercent !== '' && (isNaN(dPercent) || dPercent < 0 || dPercent > 100)) {
      newErrors.discount = 'Discount must be between 0 and 100%';
    }

    setErrors(newErrors);
  }, [originalPrice, discountPercent]);

  const hasAnyError = Object.keys(errors).length > 0;

  return (
    <Card className="w-full h-full border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-3xl rounded-[2rem] overflow-hidden group transition-all duration-500 hover:shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 z-20" />
      
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl">
            <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            FISCAL_REDUCTION
          </div>
        </div>
        <CardTitle className="text-3xl font-black mt-6 tracking-tighter uppercase italic text-gray-900 dark:text-white">
          Discount <span className="text-blue-600">Calculator</span>
        </CardTitle>
        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          Neural Net Pricing Optimizer
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 pt-4 space-y-8">
        {/* Original Price */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <IndianRupee className="h-3 w-3 text-blue-500" /> Original Price
            </Label>
            {errors.price && (
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.price}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="Enter amount (₹)"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className={`h-14 bg-gray-50/50 dark:bg-gray-900/50 border-2 rounded-2xl pl-10 pr-6 font-bold text-lg transition-all dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 ${
                errors.price ? 'border-red-500/50 focus:border-red-500' : 'border-gray-100 dark:border-gray-700/50 focus:border-blue-500/50'
              }`}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="font-bold text-sm">₹</span>
            </div>
          </div>
        </div>

        {/* Discount Percentage */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Percent className="h-3 w-3 text-blue-500" /> Discount Rate
            </Label>
            {errors.discount && (
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.discount}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="Enter percentage (%)"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className={`h-14 bg-gray-50/50 dark:bg-gray-900/50 border-2 rounded-2xl pl-12 pr-6 font-bold text-lg transition-all dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 ${
                errors.discount ? 'border-red-500/50 focus:border-red-500' : 'border-gray-100 dark:border-gray-700/50 focus:border-blue-500/50'
              }`}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[10, 20, 50].map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                onClick={() => setDiscountPercent(val.toString())}
                className={`rounded-xl font-bold text-[10px] uppercase tracking-widest h-10 border transition-all ${
                  discountPercent === val.toString() 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'border-gray-100 dark:border-gray-700 text-gray-500'
                }`}
              >
                {val}%
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {originalPrice && !hasAnyError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/20 text-center">
                  <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Savings</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(calculations.totalSavings)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Off %</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{discountPercent}%</p>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 group-hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Settlement Price</p>
                  <Gift className="h-4 w-4 opacity-80" />
                </div>
                <p className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">{formatCurrency(calculations.finalPrice)}</p>
                <div className="bg-white/20 backdrop-blur-md rounded-xl py-2 px-4 inline-block text-center w-full">
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    You Saved {formatCurrency(calculations.totalSavings)} 🎉
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Button */}
        <Button
          variant="ghost"
          onClick={handleReset}
          className="w-full h-12 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[10px] font-black uppercase tracking-widest gap-2 transition-all p-0"
        >
          <RotateCcw className="h-3 w-3" /> Purge Matrix Cache
        </Button>
      </CardContent>
    </Card>
  );
}
