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
  };

  return (
    <div className="w-full">
      <Card className="w-full border-2 shadow-lg overflow-hidden rounded-3xl">
        <div className="bg-primary/5 p-6 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Percent className="h-6 w-6 text-primary" />
              Smart Rate Converter
            </CardTitle>
            <CardDescription className="mt-1 flex justify-between items-center">
              <span>India Special: <span className="font-bold text-primary">12% = ₹1</span></span>
              <span className="text-[10px] font-bold text-destructive uppercase tracking-tighter">Fields empty on load</span>
            </CardDescription>
          </div>
          
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-2 h-9 border-2">
              <TabsTrigger value="pctToRate" className="text-[10px] font-black uppercase tracking-widest">% → ₹/P</TabsTrigger>
              <TabsTrigger value="rateToPct" className="text-[10px] font-black uppercase tracking-widest">₹/P → %</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <CardContent className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="input" className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  {mode === 'pctToRate' ? 'Enter Percentage (%)' : 'Enter Rate'}
                </Label>
                {mode === 'rateToPct' && (
                  <div className="flex gap-1 bg-muted p-1 rounded-lg border ml-4">
                    <Button 
                      variant={rateUnit === 'paise' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setRateUnit('paise')}
                      className="h-6 text-[9px] font-black uppercase px-2"
                    >
                      Paise
                    </Button>
                    <Button 
                      variant={rateUnit === 'rupees' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setRateUnit('rupees')}
                      className="h-6 text-[9px] font-black uppercase px-2"
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
                  className="text-5xl h-24 px-8 font-black border-4 text-center rounded-2xl transition-all group-hover:border-primary/50 focus-visible:ring-primary"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-3xl opacity-30">
                  {mode === 'pctToRate' ? '%' : rateUnit === 'rupees' ? '₹' : 'P'}
                </div>
              </div>
              {error && (
                <p className={`text-center text-[10px] font-black uppercase tracking-widest py-2 rounded-lg border ${error === "Enter all details to see results" ? "text-primary/60 bg-primary/5 border-primary/10" : "text-destructive bg-destructive/5 border-destructive/20"}`}>
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600">⚡ Auto Calculation Enabled</span>
              </div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Results update automatically as you enter values</p>
              <div className="bg-muted p-3 rounded-full border-2 shadow-sm mt-2">
                <ArrowLeftRight className="text-primary h-6 w-6" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                {mode === 'pctToRate' ? 'Paise/Rupees' : 'Percentage (%)'}
              </Label>
              
              <div className={`h-24 flex flex-col items-center justify-center rounded-2xl border-4 border-dashed transition-all duration-300 ${result ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'}`}>
                {result ? (
                  <div className="text-center animate-in zoom-in-95">
                    <span className="text-5xl font-black text-primary">
                      {result}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground font-bold italic">Enter value above</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-xl border border-dashed flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              {mode === 'pctToRate' 
                ? "Converts annual percentage to monthly rate per ₹100." 
                : "Converts monthly rate per ₹100 back to annual percentage."}
              {" "}Traditional Indian calculation: <span className="font-bold text-foreground">12% = ₹1</span>.
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
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
            <Button variant="outline" onClick={reset} className="font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl border-2">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
