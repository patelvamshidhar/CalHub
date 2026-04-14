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
import { Ruler, Map as MapIcon, Banknote, Info, RefreshCcw, Maximize, Download, ChevronDown, ChevronUp, History, FileText, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LAND_UNITS, convertLandArea, formatCurrency } from '@/lib/calculations';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';

interface LandCalculatorProps {
  currency: string;
  onSuggest?: () => void;
}

export const LandCalculator = ({ currency, onSuggest }: LandCalculatorProps) => {
  // Area Calculator State
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<'SQ_FT' | 'SQ_M'>('SQ_FT');

  // Price Calculator State
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [priceUnit, setPriceUnit] = useState<keyof typeof LAND_UNITS>('SQ_FT');

  // Toggle State
  const [showSteps, setShowSteps] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<{
    area: number;
    conversions: any;
    totalPrice: number;
  } | null>(null);

  // Calculations
  const calculate = () => {
    if (!length) {
      setError("Please enter the plot length");
      setResults(null);
      return null;
    }

    if (!width) {
      setError("Please enter the plot width");
      setResults(null);
      return null;
    }

    if (!pricePerUnit) {
      setError("Please enter the price per unit");
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
    if (autoCalculate) {
      calculate();
    }
  }, [length, width, inputUnit, pricePerUnit, priceUnit, autoCalculate]);

  const reset = () => {
    setLength('');
    setWidth('');
    setInputUnit('SQ_FT');
    setPricePerUnit('');
    setPriceUnit('SQ_FT');
    setAutoCalculate(false);
    setResults(null);
    setError(null);
  };

  const handleCalculate = () => {
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

      // Reset after calculation
      reset();
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
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Area Input Card */}
          <Card className="border-2 shadow-2xl bg-card overflow-hidden rounded-3xl">
            <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <Ruler className="h-6 w-6 text-orange-500" />
                Land Area Calculator
              </CardTitle>
              <CardDescription className="flex justify-between items-center font-medium">
                <span>Calculate plot area and dimensions</span>
                <span className="text-[10px] font-black text-destructive uppercase tracking-widest bg-destructive/5 px-2 py-0.5 rounded-full">New Session</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="length" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Length
                  </Label>
                  <Input
                    id="length"
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="e.g. 50"
                    autoComplete="off"
                    className="h-14 border-2 font-black text-lg rounded-2xl focus-visible:ring-orange-500 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="width" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Width
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="e.g. 30"
                    autoComplete="off"
                    className="h-14 border-2 font-black text-lg rounded-2xl focus-visible:ring-orange-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Input Unit</Label>
                <Select value={inputUnit} onValueChange={(v: any) => setInputUnit(v)}>
                  <SelectTrigger className="h-14 border-2 rounded-2xl font-black text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="SQ_FT" className="rounded-xl font-bold">Feet (ft)</SelectItem>
                    <SelectItem value="SQ_M" className="rounded-xl font-bold">Meters (m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Price Input Card */}
          <Card className="border-2 shadow-2xl bg-card overflow-hidden rounded-3xl">
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <Banknote className="h-6 w-6 text-amber-500" />
                Plot Price Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pb-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Price Per Unit
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative group">
                    <Input
                      type="number"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      placeholder="e.g. 2000"
                      autoComplete="off"
                      className="h-14 border-2 font-black text-lg pl-12 rounded-2xl focus-visible:ring-amber-500 transition-all"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-lg">{currency}</span>
                  </div>
                  <Select value={priceUnit} onValueChange={(v: any) => setPriceUnit(v)}>
                    <SelectTrigger className="h-14 border-2 rounded-2xl font-black text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="SQ_FT" className="rounded-xl font-bold">Per Sq. Ft</SelectItem>
                      <SelectItem value="SQ_M" className="rounded-xl font-bold">Per Sq. Meter</SelectItem>
                      <SelectItem value="SQ_YD" className="rounded-xl font-bold">Per Sq. Yard</SelectItem>
                      <SelectItem value="ACRE" className="rounded-xl font-bold">Per Acre</SelectItem>
                      <SelectItem value="HECTARE" className="rounded-xl font-bold">Per Hectare</SelectItem>
                      <SelectItem value="GUNTA" className="rounded-xl font-bold">Per Gunta</SelectItem>
                      <SelectItem value="CENT" className="rounded-xl font-bold">Per Cent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-xl text-destructive text-[10px] font-black uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Switch
                    id="auto-calc-lc"
                    checked={autoCalculate}
                    onCheckedChange={setAutoCalculate}
                    className="data-[state=checked]:bg-orange-500"
                  />
                  <Label htmlFor="auto-calc-lc" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-muted-foreground">Auto Calculate</Label>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button variant="outline" className="h-12 font-black gap-2 border-2 rounded-2xl text-[10px] uppercase tracking-widest flex-1 sm:flex-none" onClick={reset}>
                    <RefreshCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  {!autoCalculate && (
                    <Button onClick={handleCalculate} className="h-12 font-black px-8 rounded-2xl text-[10px] uppercase tracking-widest bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20 flex-1 sm:flex-none">
                      Calculate
                    </Button>
                  )}
                </div>
              </div>

              {onSuggest && (
                <Button variant="link" onClick={onSuggest} className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  Suggest Improvement
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Results Card */}
          <Card className="border-none shadow-2xl bg-gradient-to-tr from-background to-muted/30 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="h-6 w-6 text-orange-500" />
                Area & Price Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {results ? (
                <div className="space-y-6">
                  {/* Main Highlight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-500/10 rounded-2xl border-2 border-orange-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Total Area</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-orange-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-[10px]">Formula: Length × Width</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-3xl font-black text-orange-700">
                        {results.area.toLocaleString()} <span className="text-sm font-medium">{inputUnit === 'SQ_FT' ? 'Sq. Ft' : 'Sq. M'}</span>
                      </p>
                    </div>
                    <div className="p-4 bg-amber-500/10 rounded-2xl border-2 border-amber-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Total Cost</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-amber-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-[10px]">Formula: Area in {priceUnit} × Price</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-3xl font-black text-amber-700">
                        {formatCurrency(results.totalPrice, currency)}
                      </p>
                    </div>
                  </div>

                  {/* Unit Conversions Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Sq. Feet', value: results.conversions.sqFt, unit: 'sq ft' },
                      { label: 'Sq. Meter', value: results.conversions.sqM, unit: 'sq m' },
                      { label: 'Sq. Yard', value: results.conversions.sqYd, unit: 'sq yd' },
                      { label: 'Acre', value: results.conversions.acre, unit: 'ac' },
                      { label: 'Hectare', value: results.conversions.hectare, unit: 'ha' },
                      { label: 'Gunta', value: results.conversions.gunta, unit: 'gunta' },
                      { label: 'Cent', value: results.conversions.cent, unit: 'cent' },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-background rounded-xl border border-border/50 shadow-sm">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{item.label}</p>
                        <p className="text-sm font-black">{item.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                      </div>
                    ))}
                  </div>

                  {/* Rectangle Preview */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Maximize className="h-3 w-3" />
                      Plot Layout Preview
                    </Label>
                    <div className="relative aspect-video bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden">
                      <motion.div
                        layout
                        className="bg-orange-500/20 border-2 border-orange-500 rounded-lg flex items-center justify-center relative"
                        style={{
                          width: `${Math.min(90, (results.area / Math.max(results.area, 1000)) * 80)}%`,
                          height: `${Math.min(90, (results.area / Math.max(results.area, 1000)) * 80)}%`,
                        }}
                      >
                        <span className="text-xs font-black text-orange-700">{results.area.toLocaleString()} {inputUnit === 'SQ_FT' ? 'sq ft' : 'sq m'}</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Export & Share Actions */}
                  <ExportActions
                    title="Land Area & Price Calculation"
                    inputs={[
                      { label: 'Length', value: `${length} ${inputUnit === 'SQ_FT' ? 'ft' : 'm'}` },
                      { label: 'Width', value: `${width} ${inputUnit === 'SQ_FT' ? 'ft' : 'm'}` },
                      { label: 'Price Per Unit', value: `${currency}${pricePerUnit} per ${priceUnit}` },
                    ]}
                    results={[
                      { label: 'Total Area', value: `${results.area.toLocaleString()} ${inputUnit === 'SQ_FT' ? 'sq ft' : 'sq m'}` },
                      { label: 'Total Cost', value: formatCurrency(results.totalPrice, currency) },
                      { label: 'Sq. Feet', value: results.conversions.sqFt.toLocaleString() },
                      { label: 'Acre', value: results.conversions.acre.toFixed(4) },
                    ]}
                  />

                  {/* Step-by-Step Breakdown */}
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShowSteps(!showSteps)}
                      className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted rounded-2xl border-2 border-dashed"
                    >
                      <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-orange-500" />
                        <span className="font-black uppercase tracking-widest text-xs">Show Calculation Steps</span>
                      </div>
                      {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>

                    <AnimatePresence>
                      {showSteps && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-muted/50 rounded-2xl border border-border space-y-3">
                            <div className="text-xs space-y-2 font-mono text-muted-foreground">
                              <div className="p-2 bg-background rounded-lg border">
                                <p className="text-orange-600 font-bold mb-1">1. Area Calculation:</p>
                                <p>Area = Length × Width</p>
                                <p>Area = {results.area.toLocaleString()} {inputUnit === 'SQ_FT' ? 'sq ft' : 'sq m'}</p>
                              </div>
                              <div className="p-2 bg-background rounded-lg border">
                                <p className="text-amber-600 font-bold mb-1">2. Unit Conversion:</p>
                                <p>Base (Sq. Ft) = {results.conversions.sqFt.toLocaleString()} sq ft</p>
                                <p>Acre = {results.conversions.sqFt.toLocaleString()} / 43,560 = {results.conversions.acre.toFixed(4)} ac</p>
                              </div>
                              <div className="p-2 bg-background rounded-lg border">
                                <p className="text-primary font-bold mb-1">3. Price Calculation:</p>
                                <p>Total Cost = Area in {priceUnit} × Price per {priceUnit}</p>
                                <p>Total Cost = {formatCurrency(results.totalPrice, currency)}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Maximize className="h-8 w-8 opacity-20" />
                  </div>
                  <p className="text-sm font-medium">Enter valid dimensions to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <CalculationHistory 
        history={history} 
        onClear={clearHistory} 
        onReuse={handleReuse} 
      />
    </TooltipProvider>
  );
};
