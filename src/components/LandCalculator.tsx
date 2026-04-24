import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ruler, Map as MapIcon, MapPin, Banknote, Info, RefreshCcw, Maximize, Download, ChevronDown, ChevronUp, History, FileText, Share2, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LAND_UNITS, convertLandArea, formatCurrency } from '@/lib/calculations';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';

interface LandCalculatorProps {
  currency: string;
}

export const LandCalculator = ({ currency }: LandCalculatorProps) => {
  // Area Calculator State
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<'SQ_FT' | 'SQ_M'>('SQ_FT');

  // Price Calculator State
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [priceUnit, setPriceUnit] = useState<keyof typeof LAND_UNITS>('SQ_FT');

  // Toggle State
  const [showSteps, setShowSteps] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<{
    area: number;
    conversions: any;
    totalPrice: number;
  } | null>(null);

  // Debounce logic
  const [debouncedValues, setDebouncedValues] = useState({ length, width, pricePerUnit });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValues({ length, width, pricePerUnit });
    }, 300);
    return () => clearTimeout(timer);
  }, [length, width, pricePerUnit]);

  // Calculations
  const calculate = () => {
    if (!length || !width || !pricePerUnit) {
      setError("Enter all details to see result");
      setResults(null);
      return null;
    }

    const l = Number(length);
    const w = Number(width);
    const price = Number(pricePerUnit);

    if (isNaN(l) || isNaN(w) || isNaN(price)) {
      setError("Please enter valid numeric dimensions and price");
      setResults(null);
      return null;
    }

    if (l <= 0 || w <= 0) {
      setError("Dimensions must be greater than zero");
      setResults(null);
      return null;
    }

    if (price < 0) {
      setError("Price cannot be negative");
      setResults(null);
      return null;
    }

    setError(null);
    const a = l * w;
    const conv = convertLandArea(a, inputUnit);
    
    // Calculate price
    let finalArea = conv.sqFt;
    if (priceUnit === 'SQ_FT') finalArea = conv.sqFt;
    if (priceUnit === 'SQ_M') finalArea = conv.sqM;
    if (priceUnit === 'SQ_YD') finalArea = conv.sqYd;
    if (priceUnit === 'ACRE') finalArea = conv.acre;
    if (priceUnit === 'HECTARE') finalArea = conv.hectare;
    if (priceUnit === 'GUNTA') finalArea = conv.gunta;
    if (priceUnit === 'CENT') finalArea = conv.cent;

    const tp = finalArea * price;
    const res = { area: a, conversions: conv, totalPrice: tp };
    setResults(res);
    return res;
  };

  useEffect(() => {
    calculate();
  }, [debouncedValues, inputUnit, priceUnit]);

  const reset = () => {
    setLength('');
    setWidth('');
    setInputUnit('SQ_FT');
    setPricePerUnit('');
    setPriceUnit('SQ_FT');
    setResults(null);
    setError(null);
  };

  const handleSaveToHistory = () => {
    const res = calculate();
    if (res && res.totalPrice > 0) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        type: 'Land',
        inputs: {
          length,
          width,
          inputUnit,
          pricePerUnit,
          priceUnit
        },
        result: formatCurrency(res.totalPrice, currency),
        timestamp: new Date().toISOString()
      };
      const newHistory = [newItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('lc_history', JSON.stringify(newHistory));
    }
  };

  const handleReuse = (item: HistoryItem) => {
    setLength(item.inputs.length);
    setWidth(item.inputs.width);
    setInputUnit(item.inputs.inputUnit);
    setPricePerUnit(item.inputs.pricePerUnit);
    setPriceUnit(item.inputs.priceUnit);
    // Trigger calculation
    setTimeout(() => calculate(), 100);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('lc_history');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Controls */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <MapPin className="h-3 w-3" />
              Neural Topography Analysis
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-foreground dark:text-white uppercase italic leading-none">
              Estate <span className="text-emerald-500">Hub</span>
            </h2>
            <p className="text-muted-foreground text-sm font-medium">Professional geospatial area conversion and holographic valuation mapping.</p>
          </div>

          <Card className="relative border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] bg-card dark:bg-zinc-950 overflow-hidden rounded-[2.5rem]">
            {/* Top Accents */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_20px_emerald]" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />

            <CardHeader className="pb-4 pt-10 px-10">
              <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground dark:text-zinc-100 uppercase tracking-tight">
                <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <Maximize className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Plot Dimensions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-10 pb-10 px-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="length" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Side Length (L)
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground/30 dark:text-zinc-600 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors uppercase">L</div>
                    <Input
                      id="length"
                      type="number"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="50"
                      autoComplete="off"
                      className="h-20 pl-12 pr-4 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-3xl font-black text-3xl text-foreground dark:text-zinc-100 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="width" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Side Width (W)
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground/30 dark:text-zinc-600 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors uppercase">W</div>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="30"
                      autoComplete="off"
                      className="h-20 pl-12 pr-4 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-3xl font-black text-3xl text-foreground dark:text-zinc-100 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Input Unit System</Label>
                <div className="flex gap-2 p-1.5 bg-muted/20 dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-2xl h-14">
                  {['SQ_FT', 'SQ_M'].map((u) => (
                    <button
                      key={u}
                      onClick={() => setInputUnit(u as any)}
                      className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        inputUnit === u 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                          : 'text-muted-foreground hover:text-foreground dark:hover:text-zinc-300'
                      }`}
                    >
                      {u === 'SQ_FT' ? 'Feet' : 'Meters'}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Matrix */}
          <Card className="relative border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] bg-card dark:bg-zinc-950 overflow-hidden rounded-[2.5rem]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_20px_amber]" />
            <CardHeader className="pb-4 pt-10 px-10">
              <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground dark:text-zinc-100 uppercase tracking-tight">
                <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <Banknote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                Valuation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pb-10 px-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                   <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                     Market Price
                   </Label>
                   <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Per {priceUnit.replace('_', ' ')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground/30 dark:text-zinc-800 group-focus-within:text-amber-600 dark:group-focus-within:text-amber-500 transition-colors uppercase">{currency}</div>
                    <Input
                      type="number"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      placeholder="2000"
                      autoComplete="off"
                      className="h-24 pl-16 pr-6 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-amber-600 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-[2rem] font-black text-4xl text-foreground dark:text-zinc-100 transition-all outline-none"
                    />
                  </div>
                  <Select value={priceUnit} onValueChange={(v: any) => setPriceUnit(v)}>
                    <SelectTrigger className="h-24 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 rounded-[2rem] font-black text-sm text-foreground dark:text-zinc-100 focus:ring-amber-500 transition-colors">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-card dark:bg-zinc-950 border-border dark:border-zinc-800 rounded-2xl text-foreground dark:text-zinc-100 outline-none">
                      <SelectItem value="SQ_FT">Sq. Ft</SelectItem>
                      <SelectItem value="SQ_M">Sq. Meter</SelectItem>
                      <SelectItem value="SQ_YD">Sq. Yard</SelectItem>
                      <SelectItem value="ACRE">Acre</SelectItem>
                      <SelectItem value="HECTARE">Hectare</SelectItem>
                      <SelectItem value="GUNTA">Gunta</SelectItem>
                      <SelectItem value="CENT">Cent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {['2000', '5000', '10000'].map(p => (
                  <button 
                  key={p}
                  onClick={() => setPricePerUnit(p)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${pricePerUnit === p ? 'bg-amber-600 text-white border-amber-500 shadow-lg' : 'bg-muted/10 dark:bg-zinc-950 text-muted-foreground border-border dark:border-zinc-800 hover:text-foreground dark:hover:text-zinc-300'}`}
                  >
                    {currency}{p}
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500 text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_emerald]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">⚡ Real-time Analytics</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="ghost" className="h-10 font-black gap-2 rounded-xl text-[9px] uppercase tracking-widest flex-1 sm:flex-none text-muted-foreground hover:text-foreground dark:hover:text-zinc-100 hover:bg-muted dark:hover:bg-white/5" onClick={reset}>
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                  <Button 
                    onClick={handleSaveToHistory} 
                    disabled={!results}
                    className="h-10 font-black px-6 rounded-xl text-[9px] uppercase tracking-widest bg-emerald-600 dark:bg-emerald-500 hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none flex items-center gap-2 text-white dark:text-zinc-950"
                  >
                    💾 Log Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Sidebar */}
        <div className="lg:col-span-5 sticky top-8 space-y-8">
          <Card className="relative border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] bg-card dark:bg-zinc-950 overflow-hidden rounded-[2.5rem] text-foreground dark:text-zinc-100">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-500 opacity-80" />
            <CardHeader className="pb-4 pt-10 px-10 text-center">
               <div className="flex items-center justify-center gap-3 mb-2">
                 <div className="p-2 bg-emerald-500/10 rounded-xl">
                   <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400 font-black" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Projected Valuation</span>
               </div>
               <CardTitle className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground dark:from-zinc-100 via-emerald-600 dark:via-emerald-400 to-emerald-800 dark:to-emerald-700 drop-shadow-2xl">
                {results ? formatCurrency(results.totalPrice, currency) : '---'}
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-10 pb-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-[2rem] bg-muted/20 dark:bg-zinc-900 border border-border dark:border-zinc-800/50">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-600 block mb-1">Total Coverage</Label>
                   <p className="text-2xl font-black text-foreground dark:text-zinc-100">
                     {results ? results.area.toLocaleString() : '0'} 
                     <span className="text-[10px] text-muted-foreground dark:text-zinc-600 ml-1 font-bold">{inputUnit === 'SQ_FT' ? 'FT²' : 'M²'}</span>
                   </p>
                </div>
                <div className="p-5 rounded-[2rem] bg-muted/20 dark:bg-zinc-900 border border-border dark:border-zinc-800/50">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-600 block mb-1">Price Index</Label>
                   <p className="text-2xl font-black text-foreground dark:text-zinc-100 tracking-tight">
                     {currency}{parseFloat(pricePerUnit || '0').toLocaleString()}
                   </p>
                </div>
              </div>

              {results && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-600">Unit Distribution</Label>
                    <div className="h-px flex-1 bg-border dark:bg-zinc-800/50 mx-4" />
                  </div>
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2 scrollbar-hide">
                    {[
                      { label: 'Sq. Feet', value: results.conversions.sqFt.toLocaleString(), unit: 'ft²' },
                      { label: 'Sq. Meter', value: results.conversions.sqM.toLocaleString(), unit: 'm²' },
                      { label: 'Acre', value: results.conversions.acre.toFixed(4), unit: 'ac' },
                      { label: 'Sq. Yard', value: results.conversions.sqYd.toLocaleString(), unit: 'yd²' },
                      { label: 'Gunta', value: results.conversions.gunta.toLocaleString(), unit: 'gunta' },
                      { label: 'Cent', value: results.conversions.cent.toLocaleString(), unit: 'cent' },
                    ].map((r, i) => (
                      <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-muted/10 dark:bg-zinc-950/50 hover:bg-muted/30 dark:hover:bg-zinc-900 transition-colors border border-border dark:border-zinc-800/50 group">
                        <span className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{r.label}</span>
                        <div className="text-right">
                          <span className="text-base font-black text-foreground dark:text-zinc-100">{r.value}</span>
                          <span className="text-[9px] text-muted-foreground dark:text-zinc-700 ml-1 font-bold">{r.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                 <div className="flex items-center justify-center gap-2 px-4 py-3 bg-muted/20 dark:bg-zinc-950/50 border border-border dark:border-zinc-800/50 rounded-2xl">
                   <Info className="h-3.5 w-3.5 text-muted-foreground dark:text-zinc-700" />
                   <span className="text-[9px] font-bold text-muted-foreground dark:text-zinc-600 uppercase tracking-[0.2em]">Verified calculation matrix</span>
                 </div>
                 
                 <div className="flex gap-4">
                   <ExportActions
                    title="Land Area & Price Analysis"
                    inputs={[
                      { label: 'Length', value: `${length} ${inputUnit === 'SQ_FT' ? 'ft' : 'm'}` },
                      { label: 'Width', value: `${width} ${inputUnit === 'SQ_FT' ? 'ft' : 'm'}` },
                      { label: 'Price Per Unit', value: `${currency}${pricePerUnit} per ${priceUnit}` },
                    ]}
                    results={results ? [
                      { label: 'Total Area', value: `${results.area.toLocaleString()} ${inputUnit === 'SQ_FT' ? 'sq ft' : 'sq m'}` },
                      { label: 'Total Cost', value: formatCurrency(results.totalPrice, currency) },
                      { label: 'Sq. Feet', value: results.conversions.sqFt.toLocaleString() },
                      { label: 'Acre', value: results.conversions.acre.toFixed(4) },
                    ] : []}
                  />
                  <Button variant="ghost" className="h-14 rounded-2xl border border-border dark:border-zinc-800 text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-100 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 bg-muted/10 dark:bg-zinc-950/50">
                    <Share2 className="h-4 w-4" />
                    Asset Share
                  </Button>
                 </div>
              </div>
            </CardContent>
          </Card>

          <LocalLandTerminology />
        </div>
      </div>

      {/* History Feed */}
      <div className="mt-20 relative">
        <CalculationHistory 
          history={history} 
          onClear={clearHistory} 
          onReuse={handleReuse} 
          title="Audit Log: Spatial Ledger"
        />
      </div>
    </div>
  );
};

const LocalLandTerminology = () => {
  return (
    <Card className="border-none bg-card dark:bg-zinc-900/50 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="pt-8 px-8 pb-4">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-500 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Unit Definitions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8 space-y-4">
        {[
          { term: 'Acre', def: '43,560 sq. ft or 4047 sq. m' },
          { term: 'Hectare', def: '10,000 sq. m or 2.47 acres' },
          { term: 'Gunta', def: '1,089 sq. ft (Standard in India)' },
          { term: 'Cent', def: '435.6 sq. ft (1/100 of an acre)' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">{item.term}</span>
            <span className="text-[10px] font-medium text-muted-foreground dark:text-zinc-600 leading-relaxed">{item.def}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
