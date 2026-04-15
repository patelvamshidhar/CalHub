import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent, IndianRupee, ArrowRight, Info, Home, ArrowLeftRight, RefreshCcw, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportActions } from './ExportActions';

interface RateConverterProps {
  onBack?: () => void;
}

export const RateConverter = ({ onBack }: RateConverterProps) => {
  const [mode, setMode] = useState<'pctToRate' | 'rateToPct'>('pctToRate');
  const [inputValue, setInputValue] = useState<string>('');
  const [rateUnit, setRateUnit] = useState<'rupees' | 'paise'>('paise');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce logic
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const calculate = () => {
    if (!debouncedValue) {
      setResult(null);
      setError("Enter all details to see results");
      return;
    }

    const val = Number(debouncedValue);
    if (isNaN(val)) {
      setResult(null);
      setError("Please enter a valid numeric value");
      return;
    }

    if (val < 0) {
      setResult(null);
      setError("Value cannot be negative");
      return;
    }

    setError(null);

    if (mode === 'pctToRate') {
      const rupees = val / 12;
      if (val >= 12) {
        setResult(`₹${rupees.toFixed(2)}`);
      } else {
        const paise = Math.round(rupees * 100);
        setResult(`${paise} Paise`);
      }
    } else {
      if (rateUnit === 'rupees') {
        const pct = val * 12;
        setResult(`${pct.toFixed(2)}%`);
      } else {
        const pct = (val / 100) * 12;
        setResult(`${pct.toFixed(2)}%`);
      }
    }
  };

  useEffect(() => {
    calculate();
  }, [debouncedValue, mode, rateUnit]);

  const reset = () => {
    setMode('pctToRate');
    setInputValue('');
    setRateUnit('paise');
    setResult(null);
    setError(null);
  };  return (
    <div className="w-full">
      <Card className="w-full border-2 shadow-xl overflow-hidden rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
        <div className="bg-primary/5 p-6 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">
                Rate Converter
              </CardTitle>
              <CardDescription className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                12% = ₹1 (India Standard)
              </CardDescription>
            </div>
          </div>
          
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-2 h-9 border-2 rounded-xl p-1">
              <TabsTrigger value="pctToRate" className="text-[9px] font-black uppercase tracking-widest rounded-lg">% → ₹/P</TabsTrigger>
              <TabsTrigger value="rateToPct" className="text-[9px] font-black uppercase tracking-widest rounded-lg">₹/P → %</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="input" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                  {mode === 'pctToRate' ? 'Enter Percentage (%)' : 'Enter Rate'}
                </Label>
                {mode === 'rateToPct' && (
                  <div className="flex gap-1 bg-muted p-1 rounded-lg border ml-4">
                    <Button 
                      variant={rateUnit === 'paise' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setRateUnit('paise')}
                      className="h-6 text-[8px] font-black uppercase px-2 rounded-md"
                    >
                      Paise
                    </Button>
                    <Button 
                      variant={rateUnit === 'rupees' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setRateUnit('rupees')}
                      className="h-6 text-[8px] font-black uppercase px-2 rounded-md"
                    >
                      Rupees
                    </Button>
                  </div>
                )}
              </div>
              <div className="relative group">
                <Input
                  id="input"
                  type="number"
                  placeholder="e.g. 12"
                  autoComplete="off"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="text-4xl h-20 px-6 font-black border-2 text-center rounded-2xl transition-all group-hover:border-primary/30 focus-visible:ring-primary"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-2xl opacity-20">
                  {mode === 'pctToRate' ? '%' : rateUnit === 'rupees' ? '₹' : 'P'}
                </div>
              </div>
              {error && (
                <p className={`text-center text-[9px] font-black uppercase tracking-widest py-2 rounded-lg border ${error === "Enter all details to see results" ? "text-primary/60 bg-primary/5 border-primary/10" : "text-destructive bg-destructive/5 border-destructive/20"}`}>
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-green-600">⚡ Auto Calculation</span>
              </div>
              <div className="bg-muted p-2 rounded-full border-2 shadow-sm mt-1">
                <ArrowLeftRight className="text-primary h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                {mode === 'pctToRate' ? 'Paise/Rupees' : 'Percentage (%)'}
              </Label>
              
              <div className={`h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${result ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'}`}>
                {result ? (
                  <div className="text-center animate-in zoom-in-95">
                    <span className="text-4xl font-black text-primary tracking-tight">
                      {result}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40 italic">Enter value above</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl border-2 border-dashed flex items-start gap-3">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
              {mode === 'pctToRate' 
                ? "Converts annual percentage to monthly rate per ₹100." 
                : "Converts monthly rate per ₹100 back to annual percentage."}
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex-1">
              {result && (
                <ExportActions
                  title="Rate Conversion"
                  inputs={[
                    { label: 'Mode', value: mode === 'pctToRate' ? 'Percentage to Rate' : 'Rate to Percentage' },
                    { label: 'Input Value', value: `${inputValue}${mode === 'pctToRate' ? '%' : rateUnit === 'rupees' ? '₹' : 'P'}` },
                  ]}
                  results={[
                    { label: 'Converted Result', value: result },
                  ]}
                />
              )}
            </div>
            <Button variant="outline" onClick={reset} className="font-black uppercase tracking-widest text-[9px] h-9 px-4 rounded-xl border-2">
              <RefreshCcw className="h-3.5 w-3.5 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
