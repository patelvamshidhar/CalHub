import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Fuel, MapPin, IndianRupee, Navigation, RefreshCcw, Info, ChevronDown, ChevronUp, Loader2, Car, Truck, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculationHistory, HistoryItem } from './CalculationHistory';

interface VehicleHubProps {
  onSuggest?: () => void;
}

export const VehicleHub = ({ onSuggest }: VehicleHubProps) => {
  // Fuel Cost Calculator State
  const [petrolPrice, setPetrolPrice] = useState<string>('');
  const [dieselPrice, setDieselPrice] = useState<string>('');
  const [fuelDistance, setFuelDistance] = useState<string>('');
  const [fuelMileage, setFuelMileage] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<{
    fuelReq: number;
    petrolTotal: number;
    dieselTotal: number;
  } | null>(null);

  const calculate = () => {
    if (!fuelDistance || !fuelMileage || !petrolPrice || !dieselPrice) {
      setError("Please enter all required values");
      setResults(null);
      return null;
    }

    const dist = Number(fuelDistance);
    const mil = Number(fuelMileage) || 1;
    const pPrice = Number(petrolPrice);
    const dPrice = Number(dieselPrice);

    if (dist > 0 && mil > 0) {
      setError(null);
      const fr = dist / mil;
      const pt = fr * pPrice;
      const dt = fr * dPrice;
      const res = { fuelReq: fr, petrolTotal: pt, dieselTotal: dt };
      setResults(res);
      return res;
    }
    setError("Invalid inputs. Ensure distance and mileage are greater than 0.");
    setResults(null);
    return null;
  };

  const handleCalculate = () => {
    const res = calculate();
    if (res) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        type: 'Vehicle',
        inputs: {
          distance: fuelDistance,
          mileage: fuelMileage,
          petrolPrice,
          dieselPrice
        },
        result: `Petrol: ₹${res.petrolTotal.toFixed(0)} | Diesel: ₹${res.dieselTotal.toFixed(0)}`,
        timestamp: new Date().toISOString()
      };
      const newHistory = [newItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('vh_history', JSON.stringify(newHistory));

      // Reset after calculation
      setFuelDistance('0');
      setFuelMileage('0');
      setPetrolPrice('0');
      setDieselPrice('0');
    }
  };

  const handleReuse = (item: HistoryItem) => {
    setFuelDistance(item.inputs.distance);
    setFuelMileage(item.inputs.mileage);
    setPetrolPrice(item.inputs.petrolPrice);
    setDieselPrice(item.inputs.dieselPrice);
    // Trigger calculation
    setTimeout(() => calculate(), 100);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const reset = () => {
    setPetrolPrice('');
    setDieselPrice('');
    setFuelDistance('');
    setFuelMileage('');
    setResults(null);
    setError(null);
  };

  useEffect(() => {
    calculate();
  }, [petrolPrice, dieselPrice, fuelDistance, fuelMileage]);

  return (
    <TooltipProvider>
      <div className="space-y-12 w-full max-w-7xl mx-auto">
        {/* Fuel Cost Calculator Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase">Fuel Cost Calculator</h2>
            <p className="text-muted-foreground font-medium">Calculate and compare Petrol vs Diesel costs for your trip</p>
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Fields empty on load</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-primary" />
                  Trip Parameters
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-[10px] font-black uppercase tracking-widest gap-1">
                  <RefreshCcw className="h-3 w-3" />
                  Reset
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">
                      Distance (km)
                    </Label>
                    <Input 
                      type="number" 
                      value={fuelDistance} 
                      onChange={(e) => setFuelDistance(e.target.value)}
                      placeholder="e.g. 500"
                      autoComplete="off"
                      className="h-12 border-2 font-bold focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">
                      Mileage (km/L)
                    </Label>
                    <Input 
                      type="number" 
                      value={fuelMileage} 
                      onChange={(e) => setFuelMileage(e.target.value)}
                      placeholder="e.g. 18"
                      autoComplete="off"
                      className="h-12 border-2 font-bold focus-visible:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">
                      Petrol Price (₹/L)
                    </Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={petrolPrice} 
                        onChange={(e) => setPetrolPrice(e.target.value)}
                        placeholder="106.31"
                        autoComplete="off"
                        className="h-12 border-2 font-bold pl-8 focus-visible:ring-primary"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">
                      Diesel Price (₹/L)
                    </Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={dieselPrice} 
                        onChange={(e) => setDieselPrice(e.target.value)}
                        placeholder="94.27"
                        autoComplete="off"
                        className="h-12 border-2 font-bold pl-8 focus-visible:ring-primary"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                    </div>
                  </div>
                </div>
                {error && <p className="text-[10px] font-bold text-destructive text-center">{error}</p>}
                <Button onClick={handleCalculate} className="w-full font-bold uppercase tracking-widest text-xs h-10">
                  Calculate & Save
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-primary/5 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Fuel Required</p>
                <p className="text-4xl font-black text-primary">{results ? results.fuelReq.toFixed(2) : '0.00'} <span className="text-lg">L</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 bg-blue-500/5 border-blue-500/20 overflow-hidden">
                  <div className="p-4 space-y-1">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Car className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Petrol Cost</span>
                    </div>
                    <p className="text-2xl font-black text-blue-700">₹{results ? results.petrolTotal.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</p>
                  </div>
                </Card>
                <Card className="border-2 bg-orange-500/5 border-orange-500/20 overflow-hidden">
                  <div className="p-4 space-y-1">
                    <div className="flex items-center gap-2 text-orange-600">
                      <Truck className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Diesel Cost</span>
                    </div>
                    <p className="text-2xl font-black text-orange-700">₹{results ? results.dieselTotal.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {onSuggest && (
            <div className="flex justify-center pt-4">
              <Button variant="link" onClick={onSuggest} className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                Suggest Improvement
              </Button>
            </div>
          )}
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
