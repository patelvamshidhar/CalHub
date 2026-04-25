import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Fuel, Navigation, RefreshCw, Zap, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';
import { useLocalStorage } from '@/lib/pwa';
import { getCachedPrices, fetchAllPrices } from '@/services/priceService';

const FALLBACK_FUEL_PRICES = {
  petrol: {
    delhi: 129.50, mumbai: 139.40, bangalore: 133.80, chennai: 135.20, hyderabad: 136.20, andhra: 137.80
  },
  diesel: {
    delhi: 115.30, mumbai: 123.50, bangalore: 119.85, chennai: 121.90, hyderabad: 121.50, andhra: 122.40
  }
};

export const VehicleHub = () => {
  const [fuelCity, setFuelCity] = useLocalStorage<string>('vh-fuel-city', 'Hyderabad');
  const [fuelType, setFuelType] = useLocalStorage<'petrol' | 'diesel' | null>('vh-fuel-type', null);
  const [fuelDistance, setFuelDistance] = useLocalStorage<string>('vh-fuel-distance', '');
  const [fuelMileage, setFuelMileage] = useLocalStorage<string>('vh-fuel-mileage', '');
  const [manualFuelPrice, setManualFuelPrice] = useLocalStorage<string>('vh-fuel-price', '');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('vh-history', []);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    fuelReq: number;
    enteredPrice: number;
    totalCost: number;
    costPerKm: number;
  } | null>(null);

  const updatePriceByCity = (city: string, type: 'petrol' | 'diesel' | null) => {
    if (!type) return;
    const normalized = city.toLowerCase().trim();
    const cityRates = FALLBACK_FUEL_PRICES[type] as Record<string, number>;
    if (cityRates[normalized]) {
      setManualFuelPrice(cityRates[normalized].toString());
    }
  };

  const refreshFuelPrices = async () => {
    setLoading(true);
    try {
      const updated = await fetchAllPrices(fuelCity || 'Andhra Pradesh');
      if (fuelType) {
        setManualFuelPrice(fuelType === 'petrol' ? updated.petrol.toString() : updated.diesel.toString());
      }
    } catch (e) {
      console.error('Failed to refresh fuel prices', e);
    } finally {
      setLoading(false);
    }
  };

  const calculate = () => {
    if (!fuelType || !fuelDistance || !fuelMileage || !manualFuelPrice) {
      setResults(null);
      return null;
    }

    const dist = Number(fuelDistance);
    const mil = Number(fuelMileage);
    const price = Number(manualFuelPrice);

    if (isNaN(dist) || isNaN(mil) || isNaN(price) || dist <= 0 || mil <= 0 || price <= 0) {
      setResults(null);
      return null;
    }

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
      setHistory([newItem, ...history].slice(0, 10));
    }
  };

  const handleReuse = (item: HistoryItem) => {
    setFuelDistance(item.inputs.distance);
    setFuelMileage(item.inputs.mileage);
    setFuelType(item.inputs.fuelType || null);
    setManualFuelPrice(item.inputs.fuelPrice || '');
  };

  const clearHistory = () => setHistory([]);
  const reset = () => {
    setFuelDistance('');
    setFuelMileage('');
    setManualFuelPrice('');
    setFuelType(null);
    setResults(null);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 sm:space-y-8 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em]">
                <Navigation className="h-3 w-3" />
                Vehicle Hub
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic leading-none mb-1">
                Vehicle <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-600">Hub</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">Precision vehicle & fuel efficiency matrix. Engineered for accuracy.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-900 dark:bg-white p-2 px-4 rounded-xl shadow-lg border border-gray-700 dark:border-gray-100">
               <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                 <Zap className="h-5 w-5" />
               </div>
               <div>
                 <div className="text-[8px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest opacity-60 leading-none mb-1">Status</div>
                 <div className="text-[10px] font-black text-white dark:text-gray-900 uppercase tracking-tighter leading-none">Operational</div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <Card className="relative border-none shadow-xl bg-white dark:bg-gray-800 overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
                <CardHeader className="pb-2 pt-6 px-6">
                  <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-900 dark:text-white uppercase tracking-tight">
                    <Fuel className="h-4 w-4 text-blue-600" />
                    Fuel Logic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pb-6 px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Location Node</Label>
                       <Input
                         value={fuelCity}
                         onChange={(e) => {
                           setFuelCity(e.target.value);
                           updatePriceByCity(e.target.value, fuelType);
                         }}
                         className="h-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-xl font-black text-sm outline-none"
                         placeholder="City"
                       />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Type</Label>
                      <div className="flex gap-2 h-10">
                        {['petrol', 'diesel'].map((f) => (
                          <button
                            key={f}
                            onClick={() => {
                              setFuelType(f as any);
                              updatePriceByCity(fuelCity, f as any);
                            }}
                            className={`flex-1 rounded-xl text-[9px] font-black uppercase border-2 transition-all duration-500 ${
                              fuelType === f ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-400'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Pump Rate (₹)</Label>
                    <div className="relative group">
                      <Input
                         type="number"
                         value={manualFuelPrice}
                         onChange={(e) => setManualFuelPrice(e.target.value)}
                         placeholder="110.00"
                         className="h-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-xl px-4 text-xl font-black outline-none transition-all"
                       />
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         disabled={loading}
                         onClick={refreshFuelPrices} 
                         className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded-lg bg-blue-600 text-white font-black uppercase text-[8px] tracking-widest hover:bg-blue-700 disabled:opacity-50"
                       >
                         {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Sync'}
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative border-none shadow-xl bg-white dark:bg-gray-800 overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
                <CardContent className="p-6 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Distance (KM)</Label>
                       <Input
                         type="number"
                         value={fuelDistance}
                         onChange={(e) => setFuelDistance(e.target.value)}
                         className="h-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-xl font-black text-xl outline-none"
                         placeholder="500"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Economy (KMPL)</Label>
                       <Input
                         type="number"
                         value={fuelMileage}
                         onChange={(e) => setFuelMileage(e.target.value)}
                         className="h-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-xl font-black text-xl outline-none"
                         placeholder="18"
                       />
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <Button 
                       onClick={reset}
                       variant="ghost" 
                       className="h-10 flex-1 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-black uppercase tracking-widest"
                     >Reset</Button>
                     <Button 
                       onClick={handleSaveTrip} 
                       disabled={!results}
                       className="h-10 flex-1 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest"
                     >Archive</Button>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
               <Card className="relative border-none shadow-2xl bg-white dark:bg-gray-800 overflow-hidden rounded-[2.5rem]">
                 <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-violet-600" />
                 <CardContent className="p-6 sm:p-8 space-y-6 text-center">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">Est. Expenditure</span>
                      <div className="relative">
                        <div className="absolute inset-0 blur-2xl bg-blue-500/10 rounded-full" />
                        <h3 className="relative text-5xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 dark:from-white via-blue-700 to-blue-900 italic leading-none py-2">
                          ₹{results ? Math.round(results.totalCost).toLocaleString() : '0'}
                        </h3>
                      </div>
                      <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest opacity-80">
                        {results ? results.fuelReq.toFixed(1) : '0.0'} Liters Required
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Unit Cost</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">₹{results ? results.costPerKm.toFixed(2) : '0.00'}</p>
                          <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase opacity-50">Per KM</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Volume</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">{results ? results.fuelReq.toFixed(1) : '0.0'}L</p>
                          <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase opacity-50">Total</span>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-center">
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
                    </div>
                 </CardContent>
               </Card>
            </div>
          </div>
        </motion.section>

        <CalculationHistory 
          history={history} 
          onClear={clearHistory} 
          onReuse={handleReuse} 
          title="Audit Log: Vehicle Ledger"
        />
      </div>
    </TooltipProvider>
  );
};
