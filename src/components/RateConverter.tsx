import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent, IndianRupee, ArrowRight, Info, Home, ArrowLeftRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RateConverterProps {
  onBack?: () => void;
}

export const RateConverter = ({ onBack }: RateConverterProps) => {
  const [mode, setMode] = useState<'pctToRate' | 'rateToPct'>('pctToRate');
  const [inputValue, setInputValue] = useState<string>('6');
  const [rateUnit, setRateUnit] = useState<'rupees' | 'paise'>('paise');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    if (!inputValue || isNaN(Number(inputValue))) {
      setResult(null);
      return;
    }

    const val = Number(inputValue);

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
    // Keep it automatic but also allow manual trigger
    calculate();
  }, [inputValue, mode, rateUnit]);

  const reset = () => {
    setInputValue('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl mx-auto border-2 shadow-xl overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Percent className="h-6 w-6 text-primary" />
              Smart Rate Converter
            </CardTitle>
            <CardDescription className="mt-1">
              India Special: <span className="font-bold text-primary">12% = ₹1</span>
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
                  <div className="flex gap-1 bg-muted p-1 rounded-lg border">
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
                  placeholder={mode === 'pctToRate' ? "e.g. 6" : "e.g. 50"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="text-5xl h-24 px-8 font-black border-4 focus-visible:ring-primary text-center rounded-2xl transition-all group-hover:border-primary/50"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-3xl opacity-30">
                  {mode === 'pctToRate' ? '%' : rateUnit === 'rupees' ? '₹' : 'P'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="bg-muted p-3 rounded-full border-2 shadow-sm">
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

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={reset} className="font-bold uppercase tracking-widest gap-2">
              <RefreshCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
