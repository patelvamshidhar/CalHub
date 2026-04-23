import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Fuel, MapPin, IndianRupee, Navigation, RefreshCcw, Info, ChevronDown, ChevronUp, Loader2, Car, Truck, History, Map, Clock, WifiOff } from 'lucide-react';
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
      <div className="space-y-8 w-full max-w-7xl mx-auto">
        {/* VehicleHub Trip Planner Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Fuel Data Status Notification */}
          <AnimatePresence>
            {prices.fuelSyncStatus === 'error' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="p-4 rounded-3xl border-2 flex items-center gap-4 bg-destructive/10 border-destructive/20 text-destructive">
                  <div className="p-2 rounded-xl shrink-0 bg-destructive text-white">
                    <WifiOff className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                      Hub Connection Lost
                    </p>
                    <p className="text-sm font-medium leading-tight">
                      {prices.fuelError || 'Connection lost to fuel services'}. Please check your internet.
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={refreshFuelPrices} 
                    disabled={loading}
                    className="rounded-2xl h-10 px-4 font-black uppercase tracking-widest text-[10px] hover:bg-black/5"
                  >
                    Retry Sync
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center space-y-2">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase flex items-center justify-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Navigation className="h-8 w-8 text-primary" />
              </div>
              VehicleHub <span className="text-primary/40">Trip Planner</span>
            </h2>
            <p className="text-muted-foreground font-medium text-base">Plan your journey with precision fuel cost estimation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Inputs & Fuel Selection */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-2 shadow-xl overflow-hidden rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 opacity-80" />
                <CardHeader className="pb-4 pt-6 px-6">
                  <div className="flex items-center justify-between mb-4 sm:hidden">
                     <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <Clock className="h-2.5 w-2.5" />
                        Updated: {new Date(prices.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                     <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${prices.source === 'api' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} /> 
                          {prices.source === 'api' ? 'Daily Sync Active' : 'Fallback Mode'}
                        </div>
                        <span className="text-[6px] font-bold text-muted-foreground/40 text-right">Prices may slightly vary by location</span>
                     </div>
                  </div>
                  <CardTitle className="text-xl font-black flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Fuel className="h-5 w-5 text-primary" />
                      </div>
                      Trip Details
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshFuelPrices}
                          disabled={loading}
                          className="h-8 text-[9px] font-black uppercase tracking-widest gap-2 rounded-xl hover:bg-primary/5 text-emerald-600"
                        >
                          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
                          Live Sync
                        </Button>
                        <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-[9px] font-black uppercase tracking-widest gap-2 rounded-xl hover:bg-primary/5">
                          <RefreshCcw className="h-3 w-3" />
                          Reset
                        </Button>
                      </div>
                      <div className="hidden sm:flex flex-col items-end mt-1">
                        <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest leading-tight">Last Sync: {new Date(prices.lastUpdated).toLocaleDateString()} {new Date(prices.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[6px] font-bold text-muted-foreground/30 uppercase tracking-tighter">Prices may slightly vary by location</span>
                        {prices.error && <span className="text-[6px] font-black text-red-500/60 uppercase tracking-widest mt-0.5">{prices.error}</span>}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pb-8 px-6">
                  {/* Fuel Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Select Fuel Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={fuelType === 'petrol' ? 'default' : 'outline'}
                        onClick={() => setFuelType('petrol')}
                        className={`h-14 font-black uppercase tracking-widest gap-2 border-2 rounded-2xl transition-all ${fuelType === 'petrol' ? 'shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:border-primary/30'}`}
                      >
                        <Car className="h-5 w-5" />
                        Petrol
                      </Button>
                      <Button
                        variant={fuelType === 'diesel' ? 'default' : 'outline'}
                        onClick={() => setFuelType('diesel')}
                        className={`h-14 font-black uppercase tracking-widest gap-2 border-2 rounded-2xl transition-all ${fuelType === 'diesel' ? 'shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:border-primary/30'}`}
                      >
                        <Truck className="h-5 w-5" />
                        Diesel
                      </Button>
                    </div>
                  </div>

                  {/* Distance & Mileage Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Distance (km)</Label>
                      <div className="relative group">
                        <Input
                          type="number"
                          value={fuelDistance}
                          onChange={(e) => setFuelDistance(e.target.value)}
                          placeholder="e.g. 500"
                          autoComplete="off"
                          className="h-12 border-2 font-black text-base pl-10 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                        />
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Mileage (km/L)</Label>
                      <div className="relative group">
                        <Input
                          type="number"
                          value={fuelMileage}
                          onChange={(e) => setFuelMileage(e.target.value)}
                          placeholder="e.g. 18"
                          autoComplete="off"
                          className="h-12 border-2 font-black text-base pl-10 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                        />
                        <RefreshCcw className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* City Selection */}
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Enter City</Label>
                    <div className="relative group">
                      <Input
                        value={fuelCity}
                        onChange={(e) => {
                          setFuelCity(e.target.value);
                          updatePriceByCity(e.target.value, fuelType);
                        }}
                        placeholder="e.g. Hyderabad"
                        className="h-12 border-2 font-black text-base pl-10 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                      />
                      <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      
                      {fuelType && FALLBACK_FUEL_PRICES[fuelType][fuelCity.toLowerCase()] && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest">
                          City Rate Found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Fuel Price Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Fuel Price (₹/L)</Label>
                      <Tooltip>
                        <TooltipTrigger render={<Info className="h-3 w-3 text-muted-foreground cursor-help" />} />
                        <TooltipContent>
                          <p className="text-[9px] font-bold">Enter the current fuel price in your area.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative group">
                      <Input
                        type="number"
                        value={manualFuelPrice}
                        onChange={(e) => setManualFuelPrice(e.target.value)}
                        placeholder="Enter price manually"
                        autoComplete="off"
                        className="h-12 border-2 font-black text-base pl-10 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                      />
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      
                      <AnimatePresence>
                        {fuelType && (
                          <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => {
                              const live = getCachedPrices();
                              setManualFuelPrice(fuelType === 'petrol' ? live.petrol.toString() : live.diesel.toString());
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2 bg-primary/10 text-primary rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-1"
                          >
                            Use Live
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`text-[9px] font-black uppercase tracking-widest text-center py-2 rounded-lg border ${error === "Enter all details to see results" ? "text-primary/60 bg-primary/5 border-primary/10" : "text-destructive bg-destructive/5 border-destructive/20"}`}
                    >
                      {error}
                    </motion.p>
                  )}

                  <Button 
                    onClick={handleSaveTrip} 
                    disabled={!results}
                    className="w-full font-black uppercase tracking-widest text-[10px] h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                  >
                    💾 Save Trip
                  </Button>
                </CardContent>
              </Card>

            </div>

            {/* Right Column: Results Display */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Main Result Card */}
                <Card className="border-2 shadow-2xl bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden rounded-[2.5rem]">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                    <Navigation className="h-48 w-48 rotate-12" />
                  </div>
                  <CardContent className="p-8 sm:p-12 space-y-8">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Estimated Trip Cost</p>
                      <h3 className="text-7xl sm:text-8xl font-black text-primary tracking-tighter leading-none">
                        ₹{results ? results.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 bg-background rounded-[1.5rem] border-2 shadow-sm space-y-1 hover:border-primary/20 transition-colors">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Fuel Used</p>
                        <p className="text-2xl font-black tracking-tight">{results ? results.fuelReq.toFixed(2) : '0.00'} <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-0.5">L</span></p>
                      </div>
                      <div className="p-5 bg-background rounded-[1.5rem] border-2 shadow-sm space-y-1 hover:border-primary/20 transition-colors">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Total Cost</p>
                        <p className="text-2xl font-black tracking-tight">₹{results ? results.totalCost.toFixed(0) : '0'}</p>
                      </div>
                      <div className="p-5 bg-background rounded-[1.5rem] border-2 shadow-sm space-y-1 hover:border-primary/20 transition-colors">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Cost / KM</p>
                        <p className="text-2xl font-black tracking-tight">₹{results ? results.costPerKm.toFixed(2) : '0.00'}</p>
                      </div>
                    </div>

                    {results && fuelType && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center pt-2"
                      >
                        <ExportActions
                          title="VehicleHub Trip Plan"
                          inputs={[
                            { label: 'Fuel Type', value: fuelType.toUpperCase() },
                            { label: 'Distance', value: `${fuelDistance} km` },
                            { label: 'Mileage', value: `${fuelMileage} km/L` },
                            { label: 'Entered Price', value: `₹${results.enteredPrice}/L` },
                          ]}
                          results={[
                            { label: 'Fuel Needed', value: `${results.fuelReq.toFixed(2)} L` },
                            { label: 'Total Trip Cost', value: `₹${results.totalCost.toFixed(2)}` },
                          ]}
                        />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Info Card */}
                <div className="p-6 bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted-foreground/20 flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl shadow-inner shrink-0">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Calculation Logic</p>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      Costs are calculated based on your <span className="font-black text-foreground underline decoration-primary/30 underline-offset-4">manually entered fuel price</span>. 
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>


      <CalculationHistory 
        history={history} 
        onClear={clearHistory} 
        onReuse={handleReuse} 
      />
    </TooltipProvider>
  );
};
