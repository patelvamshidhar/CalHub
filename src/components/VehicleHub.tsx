import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Fuel, MapPin, IndianRupee, Navigation, RefreshCcw, Info, ChevronDown, ChevronUp, Loader2, Car, Truck, History, Map, Clock, WifiOff, Zap, Share2, TrendingUp, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';
import { useLocalStorage } from '@/lib/pwa';
import { getCachedPrices, fetchAllPrices } from '@/services/priceService';

const FALLBACK_FUEL_PRICES = {
  petrol: {
    delhi: 129.50,
    mumbai: 139.40,
    bangalore: 133.80,
    chennai: 135.20,
    hyderabad: 136.20,
    andhra: 137.80
  },
  diesel: {
    delhi: 115.30,
    mumbai: 123.50,
    bangalore: 119.85,
    chennai: 121.90,
    hyderabad: 121.50,
    andhra: 122.40
  }
};

export const VehicleHub = () => {
  // Fuel Cost Calculator State
  const [fuelCity, setFuelCity] = useLocalStorage<string>('vh-fuel-city', 'Hyderabad');
  const [fuelType, setFuelType] = useLocalStorage<'petrol' | 'diesel' | null>('vh-fuel-type', null);

  const updatePriceByCity = (city: string, type: 'petrol' | 'diesel' | null) => {
    if (!type) return;
    const normalized = city.toLowerCase().trim();
    const cityRates = FALLBACK_FUEL_PRICES[type] as Record<string, number>;
    if (cityRates[normalized]) {
      setManualFuelPrice(cityRates[normalized].toString());
    }
  };
  const [fuelDistance, setFuelDistance] = useLocalStorage<string>('vh-fuel-distance', '');
  const [fuelMileage, setFuelMileage] = useLocalStorage<string>('vh-fuel-mileage', '');
  const [manualFuelPrice, setManualFuelPrice] = useLocalStorage<string>('vh-fuel-price', '');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('vh-history', []);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<{
    fuelReq: number;
    enteredPrice: number;
    totalCost: number;
    costPerKm: number;
  } | null>(null);
  const [lastSavedTrip, setLastSavedTrip] = useState<HistoryItem | null>(null);

  const [prices, setPrices] = useState(getCachedPrices());
  const [loading, setLoading] = useState(false);

  const refreshFuelPrices = async () => {
    setLoading(true);
    try {
      const updated = await fetchAllPrices(fuelCity || 'Andhra Pradesh');
      setPrices(updated);
      if (fuelType) {
        setManualFuelPrice(fuelType === 'petrol' ? updated.petrol.toString() : updated.diesel.toString());
      }
    } catch (e) {
      console.error('Failed to refresh fuel prices', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listen for storage changes if multiple tabs open, or just local updates
    const handleStorage = () => setPrices(getCachedPrices());
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 5000); // Check local state every 5s
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const calculate = () => {
    if (!fuelType || !fuelDistance || !fuelMileage || !manualFuelPrice) {
      setError("Enter all details to see results");
      setResults(null);
      return null;
    }

    const dist = Number(fuelDistance);
    const mil = Number(fuelMileage);
    const price = Number(manualFuelPrice);

    if (isNaN(dist) || isNaN(mil) || isNaN(price)) {
      setError("Please enter valid numeric values");
      setResults(null);
      return null;
    }

    if (dist <= 0) {
      setError("Distance must be greater than zero");
      setResults(null);
      return null;
    }

    if (mil <= 0) {
      setError("Mileage must be greater than zero");
      setResults(null);
      return null;
    }

    if (price <= 0) {
      setError("Fuel price must be greater than zero");
      setResults(null);
      return null;
    }

    setError(null);
    const fr = dist / mil;
    const tc = fr * price;
    const cpkm = tc / dist;
    const res = { fuelReq: fr, enteredPrice: price, totalCost: tc, costPerKm: cpkm };
    setResults(res);
    return res;
  };

  useEffect(() => {
    calculate();
  }, [fuelDistance, fuelMileage, fuelType, manualFuelPrice]);

  const handleSaveTrip = () => {
    const res = calculate();
    if (res && fuelType) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        type: 'Vehicle',
        inputs: {
          distance: fuelDistance,
          mileage: fuelMileage,
          fuelType,
          fuelPrice: manualFuelPrice
        },
        result: `Cost: ₹${res.totalCost.toFixed(0)} (${res.fuelReq.toFixed(1)}L)`,
        timestamp: new Date().toISOString()
      };
      const newHistory = [newItem, ...history].slice(0, 10);
      setHistory(newHistory);
      setLastSavedTrip(newItem);
    }
  };

  const handleReuse = (item: HistoryItem) => {
    setFuelDistance(item.inputs.distance);
    setFuelMileage(item.inputs.mileage);
    setFuelType(item.inputs.fuelType || null);
    setManualFuelPrice(item.inputs.fuelPrice || '');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const reset = () => {
    setFuelDistance('');
    setFuelMileage('');
    setManualFuelPrice('');
    setFuelType(null);
    setResults(null);
    setError(null);
  };

  return (
    <TooltipProvider>
      <div className="space-y-12 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* VehicleHub Trip Planner Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <AnimatePresence>
            {/* Sync logic replaced with premium static status */}
          </AnimatePresence>

          <div className="flex flex-col md:flex-row items-end justify-between gap-6 pb-2">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg">
                <Navigation className="h-4 w-4" />
                Transit Logistics Protocol
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-[0.8] mb-4">
                Vehicle <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-600">Hub</span>
              </h2>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-tight opacity-50">Fuel expenditure and distance analytics terminal.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-950 dark:bg-white p-3 rounded-2xl shadow-2xl border-2 border-border/50">
               <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                 <ShieldCheck className="h-6 w-6" />
               </div>
               <div className="px-2">
                 <div className="text-[10px] font-black text-muted-foreground dark:text-zinc-400 uppercase tracking-widest opacity-60">System Ready</div>
                 <div className="text-xs font-black text-white dark:text-zinc-950 uppercase tracking-tighter">Operational</div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Side */}
            <div className="lg:col-span-12 space-y-8">
              <Card className="relative border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] bg-card dark:bg-zinc-950 overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-600 shadow-[0_0_20px_blue]" />
                
                <CardHeader className="pb-4 pt-10 px-10">
                  <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground dark:text-zinc-100 uppercase tracking-tight">
                    <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <Fuel className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Fuel Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pb-10 px-10">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'petrol', label: 'Petrol', icon: Car },
                      { id: 'diesel', label: 'Diesel', icon: Truck },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFuelType(f.id as any)}
                        className={`h-24 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all group ${
                          fuelType === f.id 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' 
                            : 'bg-muted dark:bg-zinc-900 border-border dark:border-zinc-800 text-muted-foreground dark:text-zinc-500 hover:border-blue-500/50 hover:text-foreground dark:hover:text-zinc-300 transition-colors'
                        }`}
                      >
                        <f.icon className={`h-6 w-6 transition-transform ${fuelType === f.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{f.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Live Pump Rate</Label>
                      <span className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">₹ Per Liter</span>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground/30 dark:text-zinc-800 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors">₹</div>
                      <Input
                         type="number"
                         value={manualFuelPrice}
                         onChange={(e) => setManualFuelPrice(e.target.value)}
                         placeholder="110.00"
                         className="h-16 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-[2rem] pl-16 pr-28 text-xl font-black text-foreground dark:text-zinc-100 outline-none shadow-2xl transition-all"
                       />
                      <button 
                        onClick={() => {
                          const live = getCachedPrices();
                          if (fuelType) setManualFuelPrice(fuelType === 'petrol' ? live.petrol.toString() : live.diesel.toString());
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[9px] tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        Get Live
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] bg-card dark:bg-zinc-950 overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_20px_emerald]" />
                <CardContent className="p-10 space-y-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <div className="space-y-3">
                       <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Journey Track</Label>
                       <div className="relative group">
                         <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground/30 dark:text-zinc-800 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors uppercase">KM</div>
                         <Input
                           type="number"
                           value={fuelDistance}
                           onChange={(e) => setFuelDistance(e.target.value)}
                           className="h-16 pl-14 pr-4 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl font-black text-2xl text-foreground dark:text-zinc-100 outline-none transition-all"
                           placeholder="500"
                         />
                       </div>
                     </div>
                     <div className="space-y-3">
                       <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Consumption</Label>
                       <div className="relative group">
                         <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground/30 dark:text-zinc-800 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors uppercase">M</div>
                         <Input
                           type="number"
                           value={fuelMileage}
                           onChange={(e) => setFuelMileage(e.target.value)}
                           className="h-16 pl-14 pr-4 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl font-black text-2xl text-foreground dark:text-zinc-100 outline-none transition-all"
                           placeholder="18"
                         />
                       </div>
                     </div>
                   </div>

                   <div className="space-y-3">
                     <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Geographical Node</Label>
                     <div className="relative group">
                       <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 dark:text-zinc-800 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
                       <Input
                         value={fuelCity}
                         onChange={(e) => {
                           setFuelCity(e.target.value);
                           updatePriceByCity(e.target.value, fuelType);
                         }}
                         className="h-16 pl-16 pr-4 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl font-black text-xl text-foreground dark:text-zinc-100 outline-none transition-all"
                         placeholder="City Matrix"
                       />
                     </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                     <Button 
                       onClick={reset}
                       variant="ghost" 
                       className="h-14 flex-1 rounded-2xl border border-border bg-secondary dark:bg-zinc-900 text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:text-foreground dark:hover:bg-white/5"
                     >
                       <RefreshCw className="h-4 w-4 mr-2" />
                       Flush
                     </Button>
                     <Button 
                       onClick={handleSaveTrip} 
                       disabled={!results}
                       className="h-14 flex-1 rounded-2xl bg-emerald-600 dark:bg-emerald-500 hover:opacity-90 transition-opacity text-white dark:text-zinc-950 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                     >
                       Archive Trip
                     </Button>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Side */}
            <div className="lg:col-span-12 space-y-8">
               <Card className="relative border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] bg-card dark:bg-zinc-950 overflow-hidden rounded-[3.5rem] text-foreground dark:text-zinc-100">
                 <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-violet-600" />
                 
                 <CardContent className="p-12 sm:p-20 space-y-12">
                   <div className="flex flex-col items-center text-center space-y-6">
                     <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                       <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400 shadow-[0_0_15px_blue]" />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Total Expenditure</span>
                     </div>
                     
                     <div className="relative">
                       <div className="absolute inset-0 blur-3xl bg-blue-500/20 rounded-full" />
                       <h3 className="relative text-5xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground dark:from-zinc-100 via-blue-700 dark:via-blue-300 to-blue-900 dark:to-blue-600 drop-shadow-2xl">
                         ₹{results ? Math.round(results.totalCost).toLocaleString() : '0'}
                       </h3>
                     </div>

                     <div className="flex items-center gap-2 p-3 bg-muted dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl w-fit">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest">
                          Requires {results ? results.fuelReq.toFixed(2) : '0.0'} Liters
                        </p>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                     <div className="p-8 rounded-[2.5rem] bg-muted/20 dark:bg-zinc-900 border border-border dark:border-zinc-800/50 hover:border-blue-500/30 transition-colors group">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-600 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Cost Efficiency</p>
                       <p className="text-2xl font-black text-foreground dark:text-zinc-100">
                         ₹{results ? results.costPerKm.toFixed(2) : '0.00'}
                       </p>
                       <span className="text-[9px] font-black text-muted-foreground dark:text-zinc-700 uppercase tracking-widest">Per Kilometer</span>
                     </div>
                     <div className="p-8 rounded-[2.5rem] bg-muted/20 dark:bg-zinc-900 border border-border dark:border-zinc-800/50 hover:border-emerald-500/30 transition-colors group text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-600 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Fuel Index</p>
                       <p className="text-2xl font-black text-foreground dark:text-zinc-100">
                         {results ? results.fuelReq.toFixed(1) : '0.0'}L
                       </p>
                       <span className="text-[9px] font-black text-muted-foreground dark:text-zinc-700 uppercase tracking-widest">Total Volume</span>
                     </div>
                   </div>

                   <div className="pt-8 border-t border-border dark:border-zinc-800 flex flex-wrap justify-between items-center gap-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted dark:bg-zinc-900 rounded-xl">
                          <Info className="h-4 w-4 text-muted-foreground dark:text-zinc-700" />
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground dark:text-zinc-600 uppercase tracking-widest leading-tight max-w-[180px]">
                          Derived using market standard consumption algorithms.
                        </p>
                     </div>
                     
                     <div className="flex gap-3 ml-auto">
                        {results && fuelType && (
                          <ExportActions
                            title="VehicleHub Trip Plan"
                            inputs={[
                              { label: 'Type', value: fuelType.toUpperCase() },
                              { label: 'Dist', value: `${fuelDistance} km` },
                              { label: 'M', value: `${fuelMileage} km/L` },
                            ]}
                            results={[
                              { label: 'Cost', value: `₹${results.totalCost.toFixed(0)}` },
                              { label: 'Fuel', value: `${results.fuelReq.toFixed(2)} L` },
                            ]}
                          />
                        )}
                        <Button variant="ghost" className="h-14 px-6 rounded-2xl border border-border dark:border-zinc-800 text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-100 font-black uppercase text-[10px] tracking-widest bg-muted/10 dark:bg-zinc-950/50">
                          <Share2 className="h-4 w-4" />
                        </Button>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <div className="p-8 rounded-[2rem] bg-card dark:bg-zinc-900/40 border border-border dark:border-zinc-800 flex items-start gap-4 backdrop-blur-sm">
                 <div className="p-3 bg-blue-500/10 rounded-2xl shrink-0">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground dark:text-zinc-100">Advanced Insights</p>
                   <p className="text-xs text-muted-foreground dark:text-zinc-500 leading-relaxed font-medium">
                     Your trip cost index is <span className="text-emerald-600 dark:text-emerald-400 font-black">₹{results ? results.costPerKm.toFixed(2) : '0.00'}/KM</span>. Optimize your mileage by maintaining steady speeds and checking tire pressure Matrix regularly.
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </motion.section>

        <CalculationHistory 
          history={history} 
          onClear={clearHistory} 
          onReuse={handleReuse} 
          title="Audit Log: Transit Ledger"
        />
      </div>
    </TooltipProvider>
  );
};
