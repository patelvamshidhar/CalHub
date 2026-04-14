import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Fuel, MapPin, IndianRupee, Navigation, RefreshCcw, Info, ChevronDown, ChevronUp, Loader2, Car, Truck, History, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';

const FALLBACK_FUEL_PRICES = {
  petrol: {
    delhi: 96.72,
    mumbai: 106.31,
    bangalore: 101.94,
    chennai: 102.63,
    hyderabad: 109.66,
    andhra: 111.50
  },
  diesel: {
    delhi: 89.62,
    mumbai: 94.27,
    bangalore: 87.89,
    chennai: 94.24,
    hyderabad: 97.82,
    andhra: 99.40
  }
};

export const VehicleHub = () => {
  // Fuel Cost Calculator State
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | null>(null);
  const [fuelDistance, setFuelDistance] = useState<string>('');
  const [fuelMileage, setFuelMileage] = useState<string>('');
  const [manualFuelPrice, setManualFuelPrice] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<{
    fuelReq: number;
    enteredPrice: number;
    totalCost: number;
    costPerKm: number;
  } | null>(null);
  const [lastSavedTrip, setLastSavedTrip] = useState<HistoryItem | null>(null);

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
      <div className="space-y-12 w-full max-w-7xl mx-auto">
        {/* VehicleHub Trip Planner Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-black tracking-tighter uppercase flex items-center justify-center gap-4">
              <Navigation className="h-10 w-10 text-primary" />
              VehicleHub <span className="text-primary/40">Trip Planner</span>
            </h2>
            <p className="text-muted-foreground font-medium text-lg">Plan your journey with manual fuel price input and reference data</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Inputs & Fuel Selection */}
            <div className="lg:col-span-5 space-y-8">
              <Card className="border-2 shadow-2xl overflow-hidden rounded-3xl">
                <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
                <CardHeader className="pb-6 pt-8">
                  <CardTitle className="text-2xl font-black flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Fuel className="h-6 w-6 text-primary" />
                      Trip Details
                    </div>
                    <Button variant="ghost" size="sm" onClick={reset} className="h-9 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl hover:bg-primary/5">
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Reset
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pb-10">
                  {/* Fuel Type Selection */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Select Fuel Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={fuelType === 'petrol' ? 'default' : 'outline'}
                        onClick={() => setFuelType('petrol')}
                        className={`h-16 font-black uppercase tracking-widest gap-3 border-2 rounded-2xl transition-all ${fuelType === 'petrol' ? 'shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:border-primary/30'}`}
                      >
                        <Car className="h-6 w-6" />
                        Petrol
                      </Button>
                      <Button
                        variant={fuelType === 'diesel' ? 'default' : 'outline'}
                        onClick={() => setFuelType('diesel')}
                        className={`h-16 font-black uppercase tracking-widest gap-3 border-2 rounded-2xl transition-all ${fuelType === 'diesel' ? 'shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:border-primary/30'}`}
                      >
                        <Truck className="h-6 w-6" />
                        Diesel
                      </Button>
                    </div>
                  </div>

                  {/* Distance & Mileage Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Distance (km)</Label>
                      <div className="relative group">
                        <Input
                          type="number"
                          value={fuelDistance}
                          onChange={(e) => setFuelDistance(e.target.value)}
                          placeholder="e.g. 500"
                          autoComplete="off"
                          className="h-14 border-2 font-black text-lg pl-12 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                        />
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mileage (km/L)</Label>
                      <div className="relative group">
                        <Input
                          type="number"
                          value={fuelMileage}
                          onChange={(e) => setFuelMileage(e.target.value)}
                          placeholder="e.g. 18"
                          autoComplete="off"
                          className="h-14 border-2 font-black text-lg pl-12 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                        />
                        <RefreshCcw className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Manual Fuel Price Input */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Enter Fuel Price (₹/liter)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-[10px] font-bold">Select fuel type and enter price based on your city.</p>
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
                        className="h-14 border-2 font-black text-lg pl-12 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                      />
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest text-center animate-pulse">
                      Select fuel type and enter price based on your city.
                    </p>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`text-[10px] font-black uppercase tracking-widest text-center py-3 rounded-xl border ${error === "Enter all details to see results" ? "text-primary/60 bg-primary/5 border-primary/10" : "text-destructive bg-destructive/5 border-destructive/20"}`}
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">⚡ Auto Calculation Enabled</span>
                  </div>

                  <Button 
                    onClick={handleSaveTrip} 
                    disabled={!results}
                    className="w-full font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                    💾 Save Trip
                  </Button>
                </CardContent>
              </Card>

              {/* Last Saved Trip Preview */}
              <AnimatePresence>
                {lastSavedTrip && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-primary/5 border-2 border-primary/10 rounded-3xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Last Saved Trip</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{new Date(lastSavedTrip.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-black">{lastSavedTrip.inputs.distance} km</span>
                      </div>
                      <span className="text-sm font-black text-primary">{lastSavedTrip.result}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reference Price List Card */}
              <AnimatePresence>
                {fuelType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
                      <CardHeader className="pb-4 pt-6 bg-muted/30">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                          <Map className="h-4 w-4 text-primary" />
                          {fuelType} Prices (Reference)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(FALLBACK_FUEL_PRICES[fuelType]).map(([city, price]) => (
                            <div key={city} className={`p-4 rounded-2xl border-2 flex flex-col transition-all hover:scale-[1.02] ${city === 'andhra' ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' : 'bg-muted/30 border-transparent hover:bg-muted/50'}`}>
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{city}</span>
                              <span className="text-xl font-black text-foreground tracking-tight">₹{(price as number).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-4 text-center font-bold uppercase tracking-widest opacity-60">
                          *Reference only. Enter local price above.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Results Display */}
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-1 gap-8">
                {/* Main Result Card */}
                <Card className="border-2 shadow-2xl bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden rounded-[2.5rem]">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Navigation className="h-64 w-64 rotate-12" />
                  </div>
                  <CardContent className="p-10 sm:p-16 space-y-12">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Estimated Trip Cost</p>
                      <h3 className="text-8xl sm:text-9xl font-black text-primary tracking-tighter leading-none">
                        ₹{results ? results.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="p-6 bg-background rounded-[2rem] border-2 shadow-sm space-y-2 hover:border-primary/20 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Fuel Used</p>
                        <p className="text-3xl font-black tracking-tight">{results ? results.fuelReq.toFixed(2) : '0.00'} <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">L</span></p>
                      </div>
                      <div className="p-6 bg-background rounded-[2rem] border-2 shadow-sm space-y-2 hover:border-primary/20 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Cost</p>
                        <p className="text-3xl font-black tracking-tight">₹{results ? results.totalCost.toFixed(0) : '0'}</p>
                      </div>
                      <div className="p-6 bg-background rounded-[2rem] border-2 shadow-sm space-y-2 hover:border-primary/20 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Cost per KM</p>
                        <p className="text-3xl font-black tracking-tight">₹{results ? results.costPerKm.toFixed(2) : '0.00'}</p>
                      </div>
                    </div>

                    {results && fuelType && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center pt-4"
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
                <div className="p-8 bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted-foreground/20 flex items-start gap-6">
                  <div className="p-4 bg-primary/10 rounded-2xl shadow-inner">
                    <Info className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.2em]">Calculation Logic</p>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      Costs are calculated based on your <span className="font-black text-foreground underline decoration-primary/30 underline-offset-4">manually entered fuel price</span>. 
                      Use the reference card on the left to see current prices in major cities.
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
