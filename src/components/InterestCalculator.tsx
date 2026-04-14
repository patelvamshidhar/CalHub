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

interface InterestCalculatorProps {
  onSuggest?: () => void;
}

export const InterestCalculator = ({ onSuggest }: InterestCalculatorProps) => {
  const [principal, setPrincipal] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(addYears(new Date(), 1), 'yyyy-MM-dd'));
  const [compounding, setCompounding] = useState<'monthly' | 'yearly'>('yearly');
  const [autoCalculate, setAutoCalculate] = useState<boolean>(false);
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

  const calculate = () => {
    const P = Number(principal);
    const R = Number(rate);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!principal || !rate) {
      setError("Please enter all required values");
      setResults(null);
      return;
    }

    if (isNaN(P) || isNaN(R) || !isAfter(end, start)) {
      setError(isNaN(P) || isNaN(R) ? "Invalid numbers entered" : "End date must be after start date");
      setResults(null);
      return;
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

    setResults({
      siInterest,
      siTotal,
      ciInterest,
      ciTotal,
      duration: { years, months, days },
      siSteps,
      ciSteps
    });
    localStorage.setItem('ic_last_result', ciTotal.toFixed(2));

    // Save to history if triggered by button (not auto)
    return {
      siInterest,
      siTotal,
      ciInterest,
      ciTotal,
      duration: `${years}y ${months}m ${days}d`
    };
  };

  const handleCalculate = () => {
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

      // Reset after calculation
      setPrincipal('0');
      setRate(0);
      // We don't necessarily reset dates to 0 as they are dates, but maybe default?
      // User said "Numbers -> 0, Text fields -> empty"
    }
  };

  const handleReuse = (item: HistoryItem) => {
    setPrincipal(item.inputs.principal);
    setRate(item.inputs.rate);
    setStartDate(item.inputs.startDate);
    setEndDate(item.inputs.endDate);
    setCompounding(item.inputs.compounding);
    // Trigger calculation for the reused values
    setTimeout(() => calculate(), 100);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ic_history');
  };

  useEffect(() => {
    if (autoCalculate) {
      calculate();
    }
  }, [principal, rate, startDate, endDate, compounding, autoCalculate]);

  const reset = () => {
    setPrincipal('');
    setRate('');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate(format(addYears(new Date(), 1), 'yyyy-MM-dd'));
    setCompounding('yearly');
    setAutoCalculate(false);
    setResults(null);
    setError(null);
  };

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto border-2 shadow-2xl overflow-hidden bg-card rounded-[2.5rem]">
        <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
        <CardHeader className="p-8 sm:p-10 border-b border-primary/5">
          <CardTitle className="text-3xl font-black flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            Interest Calculator
          </CardTitle>
            <CardDescription className="flex justify-between items-center font-medium text-base">
              <span>Calculate Simple and Compound interest with ease</span>
              <span className="text-[10px] font-black text-destructive uppercase tracking-widest bg-destructive/5 px-3 py-1 rounded-full">Pro Mode</span>
            </CardDescription>
        </CardHeader>

        <CardContent className="p-8 sm:p-10 space-y-10">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="principal" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Principal Amount (₹)
                </Label>
                <div className="relative group">
                  <Input
                    id="principal"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    placeholder="e.g. 50000"
                    autoComplete="off"
                    className="text-xl h-14 pl-12 font-black border-2 rounded-2xl focus-visible:ring-purple-500 transition-all"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg text-muted-foreground group-focus-within:text-purple-500 transition-colors">₹</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="rate" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Interest Rate (% P.A.)
                </Label>
                <div className="relative group">
                  <Input
                    id="rate"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="e.g. 12"
                    autoComplete="off"
                    className="text-xl h-14 pr-12 font-black border-2 rounded-2xl focus-visible:ring-purple-500 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-lg text-muted-foreground group-focus-within:text-purple-500 transition-colors">%</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-14 font-black border-2 rounded-2xl focus-visible:ring-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-14 font-black border-2 rounded-2xl focus-visible:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Compounding Frequency</Label>
                <div className="flex gap-2 p-2 bg-muted/50 rounded-2xl border-2 shadow-inner">
                  <Button
                    variant={compounding === 'yearly' ? 'default' : 'ghost'}
                    onClick={() => setCompounding('yearly')}
                    className="flex-1 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 transition-all"
                  >
                    Yearly
                  </Button>
                  <Button
                    variant={compounding === 'monthly' ? 'default' : 'ghost'}
                    onClick={() => setCompounding('monthly')}
                    className="flex-1 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 transition-all"
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl text-destructive text-[10px] font-black uppercase tracking-widest text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t">
            <div className="flex items-center gap-3">
              <Switch
                id="auto-calc-ic"
                checked={autoCalculate}
                onCheckedChange={setAutoCalculate}
                className="data-[state=checked]:bg-purple-500"
              />
              <Label htmlFor="auto-calc-ic" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-muted-foreground">Auto Calculate</Label>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={reset} className="font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl border-2 flex-1 sm:flex-none">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              {!autoCalculate && (
                <Button onClick={handleCalculate} className="font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-500/20 flex-1 sm:flex-none">
                  Calculate
                </Button>
              )}
            </div>
          </div>

          {onSuggest && (
            <div className="flex justify-center">
              <Button variant="link" onClick={onSuggest} className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                Suggest Improvement
              </Button>
            </div>
          )}

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Duration Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border-2 border-dashed">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration:</span>
                    <span className="text-sm font-black">
                      {results.duration.years} Years, {results.duration.months} Months, {results.duration.days} Days
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Simple Interest Result */}
                  <Card className="border-2 border-blue-500/20 bg-blue-500/5 rounded-3xl overflow-hidden group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600">Simple Interest</CardTitle>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-blue-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-[10px]">Formula: (P × R × T) / 100</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-muted-foreground">Interest Earned</span>
                        <span className="text-2xl font-black text-blue-700">₹{results.siInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-end pt-2 border-t border-blue-500/10">
                        <span className="text-xs font-bold text-muted-foreground">Total Amount</span>
                        <span className="text-3xl font-black text-blue-800">₹{results.siTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compound Interest Result */}
                  <Card className="border-2 border-purple-500/20 bg-purple-500/5 rounded-3xl overflow-hidden group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-purple-600">Compound Interest</CardTitle>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-purple-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-[10px]">Formula: P(1 + r/n)^(nt)</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-muted-foreground">Interest Earned</span>
                        <span className="text-2xl font-black text-purple-700">₹{results.ciInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-end pt-2 border-t border-purple-500/10">
                        <span className="text-xs font-bold text-muted-foreground">Total Amount</span>
                        <span className="text-3xl font-black text-purple-800">₹{results.ciTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Export & Share Actions */}
                <ExportActions
                  title="Interest Calculation"
                  inputs={[
                    { label: 'Principal', value: `₹${principal}` },
                    { label: 'Rate', value: `${rate}%` },
                    { label: 'Start Date', value: startDate },
                    { label: 'End Date', value: endDate },
                    { label: 'Compounding', value: compounding },
                  ]}
                  results={[
                    { label: 'Simple Interest', value: `₹${results.siInterest.toFixed(2)}` },
                    { label: 'SI Total', value: `₹${results.siTotal.toFixed(2)}` },
                    { label: 'Compound Interest', value: `₹${results.ciInterest.toFixed(2)}` },
                    { label: 'CI Total', value: `₹${results.ciTotal.toFixed(2)}` },
                    { label: 'Duration', value: `${results.duration.years}y ${results.duration.months}m ${results.duration.days}d` },
                  ]}
                />

                {/* Step-by-Step Toggle */}
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowSteps(!showSteps)}
                    className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted rounded-2xl border-2 border-dashed"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-purple-500" />
                      <span className="font-black uppercase tracking-widest text-xs">Show Calculation Steps</span>
                    </div>
                    {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  <AnimatePresence>
                    {showSteps && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">SI Breakdown (Yearly)</h4>
                            <div className="max-h-60 overflow-y-auto rounded-2xl border-2 bg-background shadow-inner">
                              <table className="w-full text-[11px]">
                                <thead className="sticky top-0 bg-muted z-10">
                                  <tr>
                                    <th className="p-3 text-left font-black uppercase tracking-tighter">Period</th>
                                    <th className="p-3 text-right font-black uppercase tracking-tighter">Interest</th>
                                    <th className="p-3 text-right font-black uppercase tracking-tighter">Balance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {results.siSteps.map((step, i) => (
                                    <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                                      <td className="p-3 font-bold">{step.period}</td>
                                      <td className="p-3 text-right">₹{step.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                      <td className="p-3 text-right font-black">₹{step.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">CI Breakdown ({compounding})</h4>
                            <div className="max-h-60 overflow-y-auto rounded-2xl border-2 bg-background shadow-inner">
                              <table className="w-full text-[11px]">
                                <thead className="sticky top-0 bg-muted z-10">
                                  <tr>
                                    <th className="p-3 text-left font-black uppercase tracking-tighter">Period</th>
                                    <th className="p-3 text-right font-black uppercase tracking-tighter">Interest</th>
                                    <th className="p-3 text-right font-black uppercase tracking-tighter">Balance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {results.ciSteps.map((step, i) => (
                                    <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                                      <td className="p-3 font-bold">{step.period}</td>
                                      <td className="p-3 text-right">₹{step.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                      <td className="p-3 text-right font-black">₹{step.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                    </tr>
                                  ))}
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
    </TooltipProvider>
  );
};
