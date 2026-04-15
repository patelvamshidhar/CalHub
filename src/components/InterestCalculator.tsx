import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, TrendingUp, DollarSign, Clock, Info, ChevronDown, ChevronUp, RefreshCcw, History, FileText, Share2 } from 'lucide-react';
import { format, differenceInDays, addMonths, addYears, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';

interface CalculationStep {
  period: string;
  interest: number;
  balance: number;
}

export const InterestCalculator = () => {
  const [principal, setPrincipal] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(addYears(new Date(), 1), 'yyyy-MM-dd'));
  const [compounding, setCompounding] = useState<'monthly' | 'yearly'>('yearly');
  const [showSteps, setShowSteps] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<{
    siInterest: number;
    siTotal: number;
    ciInterest: number;
    ciTotal: number;
    duration: { years: number; months: number; days: number };
    siSteps: CalculationStep[];
    ciSteps: CalculationStep[];
  } | null>(null);

  // Debounce logic
  const [debouncedValues, setDebouncedValues] = useState({ principal, rate });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValues({ principal, rate });
    }, 300);
    return () => clearTimeout(timer);
  }, [principal, rate]);

  const calculate = () => {
    if (!principal || !rate) {
      setError("Enter all details to see results");
      setResults(null);
      return null;
    }

    const P = Number(principal);
    const R = Number(rate);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(P) || P <= 0) {
      setError("Principal amount must be a positive number");
      setResults(null);
      return null;
    }

    if (isNaN(R) || R < 0) {
      setError("Interest rate cannot be negative");
      setResults(null);
      return null;
    }

    if (!isAfter(end, start)) {
      setError("End date must be after the start date");
      setResults(null);
      return null;
    }

    setError(null);

    const totalDays = differenceInDays(end, start);
    const T = totalDays / 365; // Time in years

    // Duration breakdown
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;

    // Simple Interest
    const siInterest = (P * R * T) / 100;
    const siTotal = P + siInterest;

    // SI Steps (Yearly breakdown)
    const siSteps: CalculationStep[] = [];
    for (let i = 1; i <= Math.ceil(T); i++) {
      const time = Math.min(i, T);
      const interest = (P * R * time) / 100;
      siSteps.push({
         period: `Year ${i}`,
         interest: interest,
         balance: P + interest
      });
    }

    // Compound Interest
    const n = compounding === 'monthly' ? 12 : 1;
    const ciTotal = P * Math.pow(1 + (R / 100) / n, n * T);
    const ciInterest = ciTotal - P;

    // CI Steps
    const ciSteps: CalculationStep[] = [];
    let currentBalance = P;
    const periods = Math.ceil(T * n);
    for (let i = 1; i <= periods; i++) {
      const interest = currentBalance * ((R / 100) / n);
      currentBalance += interest;
      ciSteps.push({
        period: compounding === 'monthly' ? `Month ${i}` : `Year ${i}`,
        interest: interest,
        balance: currentBalance
      });
    }

    const res = {
      siInterest,
      siTotal,
      ciInterest,
      ciTotal,
      duration: { years, months, days },
      siSteps,
      ciSteps
    };
    setResults(res);

    return res;
  };

  const handleSaveToHistory = () => {
    const res = calculate();
    if (res) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        type: 'Finance',
        inputs: {
          principal,
          rate,
          startDate,
          endDate,
          compounding
        },
        result: `₹${res.ciTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} (CI)`,
        timestamp: new Date().toISOString()
      };
      const newHistory = [newItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('ic_history', JSON.stringify(newHistory));
    }
  };

  const handleReuse = (item: HistoryItem) => {
    setPrincipal(item.inputs.principal);
    setRate(item.inputs.rate);
    setStartDate(item.inputs.startDate);
    setEndDate(item.inputs.endDate);
    setCompounding(item.inputs.compounding);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ic_history');
  };

  useEffect(() => {
    calculate();
  }, [debouncedValues, startDate, endDate, compounding]);

  const reset = () => {
    setPrincipal('');
    setRate('');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate(format(addYears(new Date(), 1), 'yyyy-MM-dd'));
    setCompounding('yearly');
    setResults(null);
    setError(null);
  };

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
        <Card className="w-full border-2 shadow-lg overflow-hidden bg-card rounded-3xl">
          <div className="h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500" />
          <CardHeader className="p-6 border-b border-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Interest Planner
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Principal Amount (₹)
                  </Label>
                  <div className="relative group">
                    <Input
                      id="principal"
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      placeholder="e.g. 50000"
                      className="text-lg h-12 pl-10 font-black border-2 rounded-2xl focus-visible:ring-purple-500 transition-all"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground group-focus-within:text-purple-500 transition-colors">₹</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Interest Rate (% P.A.)
                  </Label>
                  <div className="relative group">
                    <Input
                      id="rate"
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="e.g. 12"
                      className="text-lg h-12 pr-10 font-black border-2 rounded-2xl focus-visible:ring-purple-500 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground group-focus-within:text-purple-500 transition-colors">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 font-bold border-2 rounded-2xl focus-visible:ring-purple-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 font-bold border-2 rounded-2xl focus-visible:ring-purple-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Compounding</Label>
                <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl border-2 shadow-inner">
                  <Button
                    variant={compounding === 'yearly' ? 'default' : 'ghost'}
                    onClick={() => setCompounding('yearly')}
                    className="flex-1 font-black uppercase tracking-widest text-[9px] rounded-xl h-9 transition-all"
                  >
                    Yearly
                  </Button>
                  <Button
                    variant={compounding === 'monthly' ? 'default' : 'ghost'}
                    onClick={() => setCompounding('monthly')}
                    className="flex-1 font-black uppercase tracking-widest text-[9px] rounded-xl h-9 transition-all"
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-3 border rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${error === "Enter all details to see results" ? "bg-primary/5 border-primary/10 text-primary/60" : "bg-destructive/5 border-destructive/20 text-destructive"}`}
              >
                {error}
              </motion.div>
            )}

            <div className="flex items-center justify-between gap-4 pt-6 border-t">
              <Button variant="outline" onClick={reset} className="font-black uppercase tracking-widest text-[10px] h-10 rounded-xl border-2 px-4">
                <RefreshCcw className="h-3.5 w-3.5 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleSaveToHistory} 
                disabled={!results}
                className="font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                💾 Save
              </Button>
            </div>

            <AnimatePresence>
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 pt-4"
                >
                  {/* Duration Info */}
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border-2 border-dashed">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {results.duration.years}Y {results.duration.months}M {results.duration.days}D
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Compound Interest Result */}
                    <Card className="border-2 border-purple-500/20 bg-purple-500/5 rounded-2xl overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-purple-600">Compound Interest</CardTitle>
                          <Tooltip>
                            <TooltipTrigger render={<Info className="h-3 w-3 text-purple-400" />} />
                            <TooltipContent>
                              <p className="text-[10px]">A = P(1 + r/n)^(nt)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interest</span>
                          <span className="text-xl font-black text-purple-700">₹{results.ciInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-purple-500/10">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                          <span className="text-2xl font-black text-purple-800">₹{results.ciTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Simple Interest Result */}
                    <Card className="border-2 border-blue-500/20 bg-blue-500/5 rounded-2xl overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-blue-600">Simple Interest</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interest</span>
                          <span className="text-xl font-black text-blue-700">₹{results.siInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-blue-500/10">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                          <span className="text-2xl font-black text-blue-800">₹{results.siTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Export Actions */}
                  <div className="pt-4 flex flex-col gap-4">
                    <ExportActions
                      title="Interest Calculation"
                      inputs={[
                        { label: 'Principal', value: `₹${principal}` },
                        { label: 'Rate', value: `${rate}%` },
                        { label: 'Duration', value: `${results.duration.years}y ${results.duration.months}m ${results.duration.days}d` },
                      ]}
                      results={[
                        { label: 'CI Total', value: `₹${results.ciTotal.toFixed(2)}` },
                        { label: 'SI Total', value: `₹${results.siTotal.toFixed(2)}` },
                      ]}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSteps(!showSteps)}
                      className="w-full flex items-center justify-between p-3 h-auto hover:bg-muted rounded-xl border border-dashed text-[10px] font-black uppercase tracking-widest"
                    >
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-purple-500" />
                        <span>Calculation Steps</span>
                      </div>
                      {showSteps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>

                    <AnimatePresence>
                      {showSteps && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">CI Breakdown ({compounding})</h4>
                              <div className="max-h-40 overflow-y-auto rounded-xl border bg-background shadow-inner">
                                <table className="w-full text-[10px]">
                                  <thead className="sticky top-0 bg-muted z-10">
                                    <tr>
                                      <th className="p-2 text-left font-black uppercase tracking-tighter">Period</th>
                                      <th className="p-2 text-right font-black uppercase tracking-tighter">Interest</th>
                                      <th className="p-2 text-right font-black uppercase tracking-tighter">Balance</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {results.ciSteps.slice(0, 12).map((step, i) => (
                                      <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="p-2 font-bold">{step.period}</td>
                                        <td className="p-2 text-right">₹{step.interest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                        <td className="p-2 text-right font-black">₹{step.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                      </tr>
                                    ))}
                                    {results.ciSteps.length > 12 && (
                                      <tr>
                                        <td colSpan={3} className="p-2 text-center text-muted-foreground italic">... and {results.ciSteps.length - 12} more periods</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <CalculationHistory 
          history={history} 
          onClear={clearHistory} 
          onReuse={handleReuse} 
        />
      </div>
    </TooltipProvider>
  );
};
