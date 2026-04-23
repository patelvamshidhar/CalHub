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
  Search,
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';
import { useLocalStorage } from '@/lib/pwa';
import { getCachedPrices, fetchAllPrices, LivePrices } from '@/services/priceService';

// Mock data as fallback and starting point (Updated for Today: April 23, 2026)
const MOCK_RATES: Record<string, { gold24: number; gold22: number; silver: number }> = {
  'hyderabad': { gold24: 8650, gold22: 7930, silver: 115 },
  'mumbai': { gold24: 8670, gold22: 7950, silver: 116 },
  'delhi': { gold24: 8660, gold22: 7940, silver: 115.5 },
  'chennai': { gold24: 8680, gold22: 7960, silver: 116.5 },
  'bangalore': { gold24: 8665, gold22: 7945, silver: 115.8 },
  'kolkata': { gold24: 8675, gold22: 7955, silver: 116.2 },
  'pune': { gold24: 8655, gold22: 7935, silver: 115.3 },
  'ahmedabad': { gold24: 8645, gold22: 7925, silver: 114.8 },
  'visakhapatnam': { gold24: 8630, gold22: 7910, silver: 114 },
  'vijayawada': { gold24: 8620, gold22: 7900, silver: 114 },
  'tirupati': { gold24: 8625, gold22: 7905, silver: 113.8 },
  'guntur': { gold24: 8615, gold22: 7895, silver: 113.5 },
  'kurnool': { gold24: 8610, gold22: 7890, silver: 113.2 },
  'nellore': { gold24: 8622, gold22: 7902, silver: 114.1 },
  'rajamahendravaram': { gold24: 8628, gold22: 7908, silver: 114.3 },
  'kakinada': { gold24: 8632, gold22: 7912, silver: 114.4 },
  'kadapa': { gold24: 8608, gold22: 7888, silver: 113.0 },
  'anantapur': { gold24: 8605, gold22: 7885, silver: 112.8 },
  'eluru': { gold24: 8618, gold22: 7898, silver: 113.7 },
  'vizianagaram': { gold24: 8635, gold22: 7915, silver: 114.5 },
  'ongole': { gold24: 8612, gold22: 7892, silver: 113.4 },
  'chittoor': { gold24: 8622, gold22: 7902, silver: 113.6 },
  'machilipatnam': { gold24: 8624, gold22: 7904, silver: 114.2 },
  'tenali': { gold24: 8616, gold22: 7896, silver: 113.6 },
};

const DEFAULT_RATES = MOCK_RATES['hyderabad'];
const GST_RATE = 0.03; // 3% GST

type WeightUnit = 'g' | 'kg';

export const GoldSilverHub = () => {
  const [searchCity, setSearchCity] = useLocalStorage<string>('gs-search-city', 'Hyderabad');
  const [debouncedCity, setDebouncedCity] = useLocalStorage<string>('gs-debounced-city', 'hyderabad');
  const [isFallback, setIsFallback] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastUpdated, setLastUpdated] = useLocalStorage<string>('gs-last-updated', new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [showGST, setShowGST] = useLocalStorage<boolean>('gs-show-gst', true);

  // Manual Input Mode
  const [manualMode, setManualMode] = useLocalStorage<boolean>('gs-manual-mode', false);
  const [manualGold24, setManualGold24] = useLocalStorage<string>('gs-manual-gold24', '8500');
  const [manualGold22, setManualGold22] = useLocalStorage<string>('gs-manual-gold22', '7780');
  const [manualSilver, setManualSilver] = useLocalStorage<string>('gs-manual-silver', '110');

  // Gold State
  const [goldWeight, setGoldWeight] = useLocalStorage<string>('gs-gold-weight', '10');
  const [goldUnit, setGoldUnit] = useLocalStorage<WeightUnit>('gs-gold-unit', 'g');
  const [goldPurity, setGoldPurity] = useLocalStorage<'24K' | '22K'>('gs-gold-purity', '24K');
  const [makingCharges, setMakingCharges] = useLocalStorage<string>('gs-making-charges', '0');
  
  // Silver State
  const [silverWeight, setSilverWeight] = useLocalStorage<string>('gs-silver-weight', '100');
  const [silverUnit, setSilverUnit] = useLocalStorage<WeightUnit>('gs-silver-unit', 'g');

  const [history, setHistory] = useLocalStorage<HistoryItem[]>('gs-history', []);

  // Get matching cities for suggestions
  const suggestions = useMemo(() => {
    const input = searchCity.toLowerCase().trim();
    if (!input || !showSuggestions) return [];
    return Object.keys(MOCK_RATES)
      .filter(c => c.includes(input))
      .sort((a, b) => {
        // Boost cities that start with the input
        const aStart = a.startsWith(input) ? 1 : 0;
        const bStart = b.startsWith(input) ? 1 : 0;
        return bStart - aStart || a.localeCompare(b);
      })
      .slice(0, 6);
  }, [searchCity, showSuggestions]);

  const cityInfo = useMemo(() => {
    const city = debouncedCity.toLowerCase();
    const andhraCities = ['visakhapatnam', 'vijayawada', 'tirupati', 'guntur', 'kurnool', 'nellore', 'kadapa', 'anantapur', 'eluru', 'vizianagaram', 'ongole', 'chittoor', 'machilipatnam', 'tenali'];
    
    if (andhraCities.includes(city)) {
      return {
        label: 'Andhra Pradesh City',
        note: 'Live local market rates applied',
        icon: '🏠'
      };
    }
    if (city === 'hyderabad') {
      return {
        label: 'Primary Hub',
        note: 'Real-time Telangana market rates',
        icon: '⭐'
      };
    }
    return null;
  }, [debouncedCity]);

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
      setLastUpdated(new Date().toISOString());
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

  // Simulation of live data fetch
  const refreshRates = async () => {
    setLoading(true);
    // Passing searchCity to get localized fuel prices if needed, 
    // though this hub is mainly for gold/silver.
    const updated = await fetchAllPrices(searchCity || 'Andhra Pradesh');
    setLastUpdated(updated.lastUpdated);
    setLoading(false);
  };

  const currentData = useMemo(() => getCachedPrices(), [lastUpdated]);

  const rates = useMemo(() => {
    const live = currentData;
    
    if (manualMode) {
      return {
        gold24: parseFloat(manualGold24) || 0,
        gold22: parseFloat(manualGold22) || 0,
        silver: parseFloat(manualSilver) || 0
      };
    }
    
    // If it's a known city, we might have specific mock offsets, 
    // but for "Live" we favor the global Live price if city isn't found
    const cityData = MOCK_RATES[debouncedCity];
    if (cityData) {
      // Blend live with city variation (simple strategy: use live but keep city relative diff if any)
      // Actually per requirement: "Load corresponing rates"
      // If no API, use mock. If API, we use API.
      if (live.source === 'api') {
        return {
          gold24: live.gold24,
          gold22: live.gold22,
          silver: live.silver
        };
      }
      return cityData;
    }

    return {
      gold24: live.gold24,
      gold22: live.gold22,
      silver: live.silver
    };
  }, [manualMode, manualGold24, manualGold22, manualSilver, debouncedCity]);

  // Gold Calculation Logic
  const goldCalc = useMemo(() => {
    const rawWeight = parseFloat(goldWeight) || 0;
    const weightInGrams = goldUnit === 'kg' ? rawWeight * 1000 : rawWeight;
    const making = parseFloat(makingCharges) || 0;
    
    const calculateForRate = (rate: number) => {
      const base = (weightInGrams * rate) + making;
      const gst = showGST ? base * GST_RATE : 0;
      return base + gst;
    };

    const price24K = calculateForRate(rates.gold24);
    const price22K = calculateForRate(rates.gold22);
    
    const selectedPrice = goldPurity === '24K' ? price24K : price22K;
    const gstPrice = showGST ? ((weightInGrams * (goldPurity === '24K' ? rates.gold24 : rates.gold22)) + making) * GST_RATE : 0;

    return {
      basePrice: selectedPrice - gstPrice,
      gstPrice,
      totalPrice: selectedPrice,
      price24K,
      price22K,
      difference: Math.abs(price24K - price22K),
      ratePerGram: goldPurity === '24K' ? rates.gold24 : rates.gold22,
      weightInGrams,
      isValid: rawWeight > 0 && rates.gold24 > 0 && rates.gold22 > 0
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
      isValid: rawWeight > 0 && rates.silver > 0
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
                    {suggestions.map((s) => {
                      const inputMatch = searchCity.toLowerCase().trim();
                      const matchIdx = s.toLowerCase().indexOf(inputMatch);
                      
                      return (
                        <button
                          key={s}
                          onClick={() => handleSelectCity(s)}
                          className="w-full px-4 py-3 text-left hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group border-b last:border-b-0"
                        >
                          <span className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
                              <MapPin className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                            </div>
                            {matchIdx !== -1 ? (
                              <span className="flex whitespace-pre">
                                <span>{s.substring(0, matchIdx)}</span>
                                <span className="text-primary bg-primary/10 px-0.5 rounded-sm">{s.substring(matchIdx, matchIdx + inputMatch.length)}</span>
                                <span>{s.substring(matchIdx + inputMatch.length)}</span>
                              </span>
                            ) : (
                              <span>{s}</span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            {['visakhapatnam', 'vijayawada', 'tirupati'].includes(s) && (
                              <span className="text-[7px] text-emerald-500/60 font-bold border border-emerald-500/20 px-1 rounded uppercase">AP</span>
                            )}
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 leading-none mt-1.5 overflow-hidden">
              <AnimatePresence mode="wait">
                {isFallback ? (
                  <motion.span 
                    key="fallback"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1"
                  >
                    <Info className="h-2.5 w-2.5" /> Using average India rates
                  </motion.span>
                ) : (
                  <motion.div 
                    key="live"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 items-center"
                  >
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                      <MapPin className="h-2 w-2" /> {debouncedCity}
                    </span>
                    {cityInfo && (
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 transition-all">
                        <span className="text-[10px]">{cityInfo.icon}</span>
                        <span className="opacity-40">|</span>
                        <span>{cityInfo.label}:</span>
                        <span className="text-muted-foreground font-bold tracking-tight lowercase italic">{cityInfo.note}</span>
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-2xl border">
            <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Manual Rates</Label>
            <Switch checked={manualMode} onCheckedChange={setManualMode} />
          </div>

          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 justify-end text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <Clock className="h-3 w-3" />
              Last Updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 justify-end">
              <TrendingUp className="h-3 w-3" /> {manualMode ? 'Manual Override Active' : 'Live Market Data'}
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

      {/* Manual Rate Override Panel */}
      <AnimatePresence>
        {manualMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary/5 border-2 border-primary/20 rounded-[2rem] p-6 space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-primary" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Manual Price Overrides (Rate/Gram)</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Gold 24K (₹/g)</Label>
                <Input 
                  type="number" 
                  value={manualGold24} 
                  onChange={(e) => setManualGold24(e.target.value)}
                  className="h-10 border-2 rounded-xl font-black bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Gold 22K (₹/g)</Label>
                <Input 
                  type="number" 
                  value={manualGold22} 
                  onChange={(e) => setManualGold22(e.target.value)}
                  className="h-10 border-2 rounded-xl font-black bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Silver (₹/g)</Label>
                <Input 
                  type="number" 
                  value={manualSilver} 
                  onChange={(e) => setManualSilver(e.target.value)}
                  className="h-10 border-2 rounded-xl font-black bg-background"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Status Notification */}
      <AnimatePresence>
        {!currentData.metalsSynced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className={`p-4 rounded-3xl border-2 flex items-center gap-4 ${
              currentData.source === 'fallback' 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-700' 
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}>
              <div className={`p-2 rounded-xl shrink-0 ${
                currentData.source === 'fallback' ? 'bg-amber-500 text-white' : 'bg-destructive text-white'
              }`}>
                <Info className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                  {currentData.source === 'fallback' ? 'Sync Notice: Metals Info' : 'Metal Synchronization Error'}
                </p>
                <p className="text-sm font-medium leading-tight">
                  {currentData.metalsError || 'Metals synchronization unavailable'}. Using internal fallback logic.
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshRates} 
                disabled={loading}
                className="rounded-2xl h-10 px-4 font-black uppercase tracking-widest text-[10px] hover:bg-black/5"
              >
                Retry Sync
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <div className="flex flex-col gap-1">
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5 leading-none">
                        <Zap className={`h-3 w-3 ${currentData.source === 'api' ? 'text-amber-500' : 'text-muted-foreground/30'}`} /> 
                        {currentData.source === 'api' ? 'Live Market Sync' : 'Fallback Mode'}
                      </CardDescription>
                      <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">
                        {currentData.error ? currentData.error : `Last Updated: ${new Date(currentData.lastUpdated).toLocaleTimeString()}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">24K Gold</span>
                    <span className="text-xl font-black text-amber-600 leading-none">{formatCurrency(rates.gold24)}/g</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">22K Gold</span>
                    <span className="text-lg font-black text-amber-500 leading-none">{formatCurrency(rates.gold22)}/g</span>
                  </div>
                  <span className="text-[7px] font-bold text-muted-foreground/40 uppercase tracking-tight mt-1">Prices vary by location</span>
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
                    {goldCalc.isValid && (
                      <div className="mt-4 p-3 bg-primary/5 rounded-2xl border-2 border-primary/10 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Purity Comparison</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-primary">Price Difference</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-[10px] font-bold text-muted-foreground">
                            {goldPurity === '24K' ? '22K Total' : '24K Total'}
                          </div>
                          <div className="text-[10px] font-black">
                            {formatCurrency(goldPurity === '24K' ? goldCalc.price22K : goldCalc.price24K)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-primary/10">
                          <div className={`text-[10px] font-black ${goldPurity === '24K' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {goldPurity === '24K' ? 'Potential Saving' : 'Extra for 24K'}
                          </div>
                          <div className={`text-[10px] font-black ${goldPurity === '24K' ? 'text-emerald-500' : 'text-amber-500'} flex items-center gap-1`}>
                            {goldPurity === '24K' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            {formatCurrency(goldCalc.difference)}
                          </div>
                        </div>
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
                          className={`text-3xl font-black tracking-tighter ${goldCalc.isValid ? 'text-emerald-500' : 'text-muted-foreground/30'}`}
                        >
                          {goldCalc.isValid ? formatCurrency(goldCalc.totalPrice) : (parseFloat(goldWeight) > 0 ? 'Rate Missing' : '--')}
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
                      className={`text-5xl font-black tracking-tighter ${silverCalc.isValid ? 'text-emerald-500' : 'text-muted-foreground/30'}`}
                    >
                      {silverCalc.isValid ? formatCurrency(silverCalc.totalPrice) : (parseFloat(silverWeight) > 0 ? 'Rate Missing' : '--')}
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
