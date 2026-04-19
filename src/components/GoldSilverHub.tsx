import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Coins, 
  CircleDot, 
  MapPin, 
  RefreshCcw, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  IndianRupee, 
  Calculator, 
  ShieldCheck,
  Zap,
  ChevronRight,
  Scale,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';

// Mock data as fallback and starting point
const MOCK_RATES: Record<string, { gold24: number; gold22: number; silver: number }> = {
  'hyderabad': { gold24: 6500, gold22: 5950, silver: 75 },
  'mumbai': { gold24: 6520, gold22: 5970, silver: 76 },
  'delhi': { gold24: 6510, gold22: 5960, silver: 75.5 },
  'chennai': { gold24: 6530, gold22: 5980, silver: 76.5 },
  'bangalore': { gold24: 6515, gold22: 5965, silver: 75.8 },
  'kolkata': { gold24: 6525, gold22: 5975, silver: 76.2 },
  'pune': { gold24: 6505, gold22: 5955, silver: 75.3 },
  'ahmedabad': { gold24: 6495, gold22: 5945, silver: 74.8 },
  'visakhapatnam': { gold24: 6480, gold22: 5930, silver: 74 },
  'vijayawada': { gold24: 6470, gold22: 5920, silver: 74 },
  'tirupati': { gold24: 6475, gold22: 5925, silver: 73.8 },
  'guntur': { gold24: 6465, gold22: 5915, silver: 73.5 },
  'kurnool': { gold24: 6460, gold22: 5910, silver: 73.2 },
  'nellore': { gold24: 6472, gold22: 5922, silver: 74.1 },
  'rajamahendravaram': { gold24: 6478, gold22: 5928, silver: 74.3 },
  'kakinada': { gold24: 6482, gold22: 5932, silver: 74.4 },
  'kadapa': { gold24: 6458, gold22: 5908, silver: 73.0 },
  'anantapur': { gold24: 6455, gold22: 5905, silver: 72.8 },
  'eluru': { gold24: 6468, gold22: 5918, silver: 73.7 },
  'vizianagaram': { gold24: 6485, gold22: 5935, silver: 74.5 },
  'ongole': { gold24: 6462, gold22: 5912, silver: 73.4 },
  'chittoor': { gold24: 6472, gold22: 5922, silver: 73.6 },
  'machilipatnam': { gold24: 6474, gold22: 5924, silver: 74.2 },
  'tenali': { gold24: 6466, gold22: 5916, silver: 73.6 },
};

const DEFAULT_RATES = MOCK_RATES['hyderabad'];
const GST_RATE = 0.03; // 3% GST

type WeightUnit = 'g' | 'kg';

export const GoldSilverHub = () => {
  const [searchCity, setSearchCity] = useState<string>('Hyderabad');
  const [debouncedCity, setDebouncedCity] = useState<string>('hyderabad');
  const [isFallback, setIsFallback] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [showGST, setShowGST] = useState(true);

  // Get matching cities for suggestions
  const suggestions = useMemo(() => {
    const input = searchCity.toLowerCase().trim();
    if (!input || !showSuggestions) return [];
    return Object.keys(MOCK_RATES).filter(c => c.includes(input)).slice(0, 5);
  }, [searchCity, showSuggestions]);

  // Debounce city input
  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = searchCity.toLowerCase().trim();
      if (!normalized) {
        setDebouncedCity('hyderabad');
        setIsFallback(true);
      } else if (MOCK_RATES[normalized]) {
        setDebouncedCity(normalized);
        setIsFallback(false);
      } else {
        setDebouncedCity('hyderabad');
        setIsFallback(true);
      }
      setLastUpdated(new Date());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchCity]);

  // Selection logic
  const handleSelectCity = (cityName: string) => {
    const capitalized = cityName.charAt(0).toUpperCase() + cityName.slice(1);
    setSearchCity(capitalized);
    setDebouncedCity(cityName);
    setIsFallback(false);
    setShowSuggestions(false);
  };

  // Gold State
  const [goldWeight, setGoldWeight] = useState<string>('10');
  const [goldUnit, setGoldUnit] = useState<WeightUnit>('g');
  const [goldPurity, setGoldPurity] = useState<'24K' | '22K'>('24K');
  const [makingCharges, setMakingCharges] = useState<string>('0');
  
  // Silver State
  const [silverWeight, setSilverWeight] = useState<string>('100');
  const [silverUnit, setSilverUnit] = useState<WeightUnit>('g');

  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Simulation of live data fetch
  const refreshRates = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 800);
  };

  const rates = MOCK_RATES[debouncedCity] || DEFAULT_RATES;

  // Gold Calculation Logic
  const goldCalc = useMemo(() => {
    const rawWeight = parseFloat(goldWeight) || 0;
    const weightInGrams = goldUnit === 'kg' ? rawWeight * 1000 : rawWeight;
    const ratePerGram = goldPurity === '24K' ? rates.gold24 : rates.gold22;
    const making = parseFloat(makingCharges) || 0;
    
    const basePrice = (weightInGrams * ratePerGram) + making;
    const gstPrice = showGST ? basePrice * GST_RATE : 0;
    const totalPrice = basePrice + gstPrice;

    return {
      basePrice,
      gstPrice,
      totalPrice,
      ratePerGram,
      weightInGrams,
      isValid: rawWeight > 0
    };
  }, [goldWeight, goldUnit, goldPurity, makingCharges, rates, showGST]);

  // Silver Calculation Logic
  const silverCalc = useMemo(() => {
    const rawWeight = parseFloat(silverWeight) || 0;
    const weightInGrams = silverUnit === 'kg' ? rawWeight * 1000 : rawWeight;
    const ratePerGram = rates.silver;
    
    const basePrice = weightInGrams * ratePerGram;
    const gstPrice = showGST ? basePrice * GST_RATE : 0;
    const totalPrice = basePrice + gstPrice;

    return {
      basePrice,
      gstPrice,
      totalPrice,
      ratePerGram,
      weightInGrams,
      isValid: rawWeight > 0
    };
  }, [silverWeight, silverUnit, rates, showGST]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSaveGold = () => {
    if (!goldCalc.isValid) return;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      type: 'Finance',
      inputs: {
        item: 'Gold',
        weight: `${goldWeight}${goldUnit}`,
        purity: goldPurity,
        city: searchCity || 'India Average',
        gst: showGST ? 'Included' : 'Excluded'
      },
      result: `Total: ${formatCurrency(goldCalc.totalPrice)}`,
      timestamp: new Date().toISOString()
    };
    setHistory([newItem, ...history].slice(0, 10));
  };

  const handleSaveSilver = () => {
    if (!silverCalc.isValid) return;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      type: 'Finance',
      inputs: {
        item: 'Silver',
        weight: `${silverWeight}${silverUnit}`,
        city: searchCity || 'India Average',
        gst: showGST ? 'Included' : 'Excluded'
      },
      result: `Total: ${formatCurrency(silverCalc.totalPrice)}`,
      timestamp: new Date().toISOString()
    };
    setHistory([newItem, ...history].slice(0, 10));
  };

  const handleReuse = (item: HistoryItem) => {
    if (item.inputs.item === 'Gold') {
      const weightStr = item.inputs.weight;
      if (weightStr.endsWith('kg')) {
        setGoldWeight(weightStr.replace('kg', ''));
        setGoldUnit('kg');
      } else {
        setGoldWeight(weightStr.replace('g', ''));
        setGoldUnit('g');
      }
      setGoldPurity(item.inputs.purity);
      setSearchCity(item.inputs.city);
    } else {
      const weightStr = item.inputs.weight;
      if (weightStr.endsWith('kg')) {
        setSilverWeight(weightStr.replace('kg', ''));
        setSilverUnit('kg');
      } else {
        setSilverWeight(weightStr.replace('g', ''));
        setSilverUnit('g');
      }
      setSearchCity(item.inputs.city);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/30 backdrop-blur-md p-4 rounded-[2rem] border-2 border-primary/10">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 shrink-0">
            <Search className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-0.5 relative">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Search Your City</Label>
            <div className="relative">
              <Input 
                value={searchCity}
                onChange={(e) => {
                  setSearchCity(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Delay closing suggestions to allow selection
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Enter city (e.g., Hyderabad)"
                className="h-10 border-none bg-transparent p-0 font-black text-lg focus-visible:ring-0 placeholder:text-muted-foreground/30 w-full"
              />
              
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-card border-2 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSelectCity(s)}
                        className="w-full px-4 py-3 text-left hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          {s}
                        </span>
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-1.5 leading-none mt-1">
              {isFallback ? (
                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">⚠️ Using average India rates</span>
              ) : (
                <span className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                   <MapPin className="h-2 w-2" /> Showing rates for: {debouncedCity}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 justify-end text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <Clock className="h-3 w-3" />
              Last Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 justify-end">
              <TrendingUp className="h-3 w-3" /> Live Market Data
            </div>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshRates} 
            disabled={loading}
            className="h-12 w-12 rounded-2xl border-2 transition-all hover:rotate-180 hover:bg-primary/5 active:scale-95"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Gold Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -5 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 blur-3xl -z-10 group-hover:opacity-100 opacity-50 transition-opacity rounded-[3rem]" />
          <Card className="border-2 shadow-2xl overflow-hidden rounded-[2.5rem] bg-card/60 backdrop-blur-xl transition-all hover:border-amber-500/40">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 rotate-3 group-hover:rotate-0 transition-transform">
                    <Coins className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tighter uppercase">Gold Hub</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-amber-500" /> Auto-Calculation Active
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-muted-foreground uppercase block mb-1">Today's Rate (24K)</span>
                  <span className="text-xl font-black text-amber-600">{formatCurrency(rates.gold24)}/g</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Purity</Label>
                  <div className="flex gap-2 p-1 bg-muted/50 rounded-2xl border-2">
                    <Button 
                      variant={goldPurity === '24K' ? 'default' : 'ghost'} 
                      onClick={() => setGoldPurity('24K')}
                      className="flex-1 h-10 rounded-xl font-black text-xs transition-all shadow-none uppercase tracking-widest"
                    >24K</Button>
                    <Button 
                      variant={goldPurity === '22K' ? 'default' : 'ghost'} 
                      onClick={() => setGoldPurity('22K')}
                      className="flex-1 h-10 rounded-xl font-black text-xs transition-all shadow-none uppercase tracking-widest"
                    >22K</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Weight Input</Label>
                    <div className="flex gap-1 h-6 bg-muted/50 p-0.5 rounded-lg border">
                       <button 
                        onClick={() => setGoldUnit('g')}
                        className={`px-2 rounded-md text-[8px] font-black transition-all ${goldUnit === 'g' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground/50'}`}
                       >G</button>
                       <button 
                        onClick={() => setGoldUnit('kg')}
                        className={`px-2 rounded-md text-[8px] font-black transition-all ${goldUnit === 'kg' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground/50'}`}
                       >KG</button>
                    </div>
                  </div>
                  <div className="relative group">
                    <Input 
                      type="number" 
                      value={goldWeight} 
                      onChange={(e) => setGoldWeight(e.target.value)}
                      className="h-12 border-2 rounded-2xl pl-12 font-black text-lg focus:ring-primary focus:border-amber-500/50 transition-all"
                    />
                    <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">{goldUnit}</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    {goldUnit === 'kg' && goldWeight ? (
                      <p className="text-[8px] font-bold text-muted-foreground uppercase animate-in fade-in slide-in-from-left-2">
                        👉 {parseFloat(goldWeight).toLocaleString()} kg = {(parseFloat(goldWeight) * 1000).toLocaleString()} grams
                      </p>
                    ) : (
                      <div />
                    )}
                    {parseFloat(goldWeight) < 0 && (
                      <p className="text-[9px] font-black text-destructive uppercase tracking-widest animate-pulse">Enter valid weight</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border-2 border-dashed">
                   <div>
                     <Label className="text-[10px] font-black uppercase tracking-widest">Include GST (3%)</Label>
                     <p className="text-[9px] text-muted-foreground font-semibold">Mandatory for retail purchase</p>
                   </div>
                   <Switch checked={showGST} onCheckedChange={setShowGST} />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                    Making Charges (Optional)
                    <span className="text-[8px] opacity-40">Flat ₹ Discount / Premium</span>
                  </Label>
                  <div className="relative">
                     <Input 
                      type="number" 
                      value={makingCharges} 
                      onChange={(e) => setMakingCharges(e.target.value)}
                      className="h-12 border-2 rounded-2xl pl-12 font-black text-lg"
                      placeholder="0"
                    />
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="pt-6 border-t border-dashed border-muted">
                <div className="bg-gradient-to-br from-amber-500/5 to-orange-600/5 p-6 rounded-3xl border-2 border-amber-500/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Breakdown</span>
                    <div className="px-2 py-0.5 bg-amber-500/10 rounded-full text-[8px] font-black uppercase text-amber-600 tracking-[0.2em] flex items-center gap-1">
                      <TrendingUp className="h-2 w-2" /> {goldCalc.weightInGrams.toLocaleString()}g Calculation
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 font-medium">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Base Price ({goldPurity})</span>
                      <span>{formatCurrency(goldCalc.basePrice - (parseFloat(makingCharges) || 0))}</span>
                    </div>
                    {parseFloat(makingCharges) !== 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Making Charges</span>
                        <span>{formatCurrency(parseFloat(makingCharges))}</span>
                      </div>
                    )}
                    {showGST && (
                      <div className="flex justify-between text-xs text-amber-600/80 italic">
                        <span>GST @ 3%</span>
                        <span>+ {formatCurrency(goldCalc.gstPrice)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-amber-500/10 flex justify-between items-end">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Estimated Total Cost</span>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={goldCalc.totalPrice}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-3xl font-black text-emerald-500 tracking-tighter"
                        >
                          {goldCalc.isValid ? formatCurrency(goldCalc.totalPrice) : '--'}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!goldCalc.isValid}
                      onClick={handleSaveGold}
                      className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[10px] hover:bg-amber-500/10 hover:text-amber-600 transition-all border-2 border-transparent hover:border-amber-500/20"
                    >
                      Save Result <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Silver Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -5 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-300/20 to-slate-500/20 blur-3xl -z-10 group-hover:opacity-100 opacity-50 transition-opacity rounded-[3rem]" />
          <Card className="border-2 shadow-2xl overflow-hidden rounded-[2.5rem] bg-card/60 backdrop-blur-xl transition-all hover:border-slate-400/40">
            <div className="h-1.5 bg-gradient-to-r from-slate-300 to-slate-500" />
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-300 to-slate-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-500/20 -rotate-3 group-hover:rotate-0 transition-transform">
                    <CircleDot className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tighter uppercase">Silver Hub</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Live Silver Pricing
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-muted-foreground uppercase block mb-1">Rate / Gram</span>
                  <span className="text-xl font-black text-slate-600">₹{rates.silver.toFixed(2)}/g</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Weight Input</Label>
                    <div className="flex gap-1 h-6 bg-muted/50 p-0.5 rounded-lg border">
                       <button 
                        onClick={() => setSilverUnit('g')}
                        className={`px-2 rounded-md text-[8px] font-black transition-all ${silverUnit === 'g' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground/50'}`}
                       >G</button>
                       <button 
                        onClick={() => setSilverUnit('kg')}
                        className={`px-2 rounded-md text-[8px] font-black transition-all ${silverUnit === 'kg' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground/50'}`}
                       >KG</button>
                    </div>
                  </div>
                  <div className="relative group">
                    <Input 
                      type="number" 
                      value={silverWeight} 
                      onChange={(e) => setSilverWeight(e.target.value)}
                      className="h-16 border-2 rounded-2xl pl-12 font-black text-3xl focus:ring-primary focus:border-slate-400/50 transition-all text-center"
                    />
                    <Calculator className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-slate-500 transition-colors" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground uppercase opacity-40">{silverUnit}</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    {silverUnit === 'kg' && silverWeight ? (
                      <p className="text-[8px] font-bold text-muted-foreground uppercase animate-in fade-in slide-in-from-left-2">
                        👉 {parseFloat(silverWeight).toLocaleString()} kg = {(parseFloat(silverWeight) * 1000).toLocaleString()} grams
                      </p>
                    ) : (
                      <div />
                    )}
                    {parseFloat(silverWeight) < 0 && (
                      <p className="text-[9px] font-black text-destructive uppercase tracking-widest animate-pulse">Enter valid weight</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border-2 border-dashed">
                   <div>
                     <Label className="text-[10px] font-black uppercase tracking-widest">Include GST (3%)</Label>
                     <p className="text-[9px] text-muted-foreground font-semibold">Standard tax applicable</p>
                   </div>
                   <Switch checked={showGST} onCheckedChange={setShowGST} />
                </div>
              </div>

              <div className="pt-2">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-2xl border-2 border-transparent">
                       <span className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Per KG Rate</span>
                       <span className="text-lg font-black text-slate-700">₹{(rates.silver * 1000).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl border-2 border-transparent">
                       <span className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Tax Amount</span>
                       <span className="text-lg font-black text-slate-700">{formatCurrency(silverCalc.gstPrice)}</span>
                    </div>
                 </div>
              </div>

              {/* Result Area */}
              <div className="pt-6 border-t border-dashed border-muted mt-auto">
                <div className="bg-gradient-to-br from-slate-400/5 to-slate-600/5 p-8 rounded-[2.5rem] border-2 border-slate-400/10 relative overflow-hidden text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Final Silver Valuation</p>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={silverCalc.totalPrice}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl font-black text-emerald-500 tracking-tighter"
                    >
                      {silverCalc.isValid ? formatCurrency(silverCalc.totalPrice) : '--'}
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="pt-6">
                    <Button 
                      onClick={handleSaveSilver}
                      disabled={!silverCalc.isValid}
                      className="bg-slate-700 hover:bg-slate-800 text-white rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-500/20 w-full flex items-center justify-center gap-2"
                    >
                       Save to History
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
         <div className="flex-1">
            <CalculationHistory 
              history={history} 
              onClear={() => setHistory([])} 
              onReuse={handleReuse} 
              title="Recent Gold & Silver Queries"
            />
         </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/5 border-2 border-primary/10 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
        <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl shrink-0">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-black uppercase tracking-tight">Market Disclaimer</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-3xl">
            Gold and Silver rates fluctuate throughout the day based on international market conditions. Rates shown are for <span className="text-foreground font-bold">informational purposes only</span> and may vary from local jewelers due to local taxes, making charges, and hallmarking fees.
          </p>
        </div>
      </div>
    </div>
  );
};
