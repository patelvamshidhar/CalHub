import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Maximize, Banknote, RefreshCcw, Info, Share2, Target } from 'lucide-react';
import { CalculationHistory, HistoryItem } from './CalculationHistory';
import { ExportActions } from './ExportActions';
import { formatCurrency } from '@/lib/calculations';

type AreaUnit = 'SQ_FT' | 'SQ_M' | 'ACRE' | 'GUNTA' | 'HECTARE';

export const LandCalculator = () => {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [inputUnit, setInputUnit] = useState<AreaUnit>('SQ_FT');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [priceUnit, setPriceUnit] = useState<AreaUnit>('SQ_FT');
  const [currency] = useState('₹');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    area: number;
    totalPrice: number;
    conversions: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lc_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const calculate = () => {
    if (!length || !width || !pricePerUnit) {
      setResults(null);
      return;
    }

    const l = parseFloat(length);
    const w = parseFloat(width);
    const p = parseFloat(pricePerUnit);

    if (isNaN(l) || isNaN(w) || isNaN(p)) {
      setError('Please enter valid numeric values');
      return;
    }

    setError(null);
    let areaInSqFt = 0;
    if (inputUnit === 'SQ_FT') areaInSqFt = l * w;
    else if (inputUnit === 'SQ_M') areaInSqFt = (l * w) * 10.7639;

    let totalArea = l * w;
    let totalPrice = 0;

    if (priceUnit === 'SQ_FT') totalPrice = areaInSqFt * p;
    else if (priceUnit === 'SQ_M') totalPrice = (areaInSqFt / 10.7639) * p;
    else if (priceUnit === 'ACRE') totalPrice = (areaInSqFt / 43560) * p;

    setResults({
      area: totalArea,
      totalPrice,
      conversions: {
        sqFt: areaInSqFt,
        sqM: areaInSqFt / 10.7639,
        acre: areaInSqFt / 43560,
        gunta: areaInSqFt / 1089,
        hectare: areaInSqFt / 107639
      }
    });
  };

  useEffect(() => {
    calculate();
  }, [length, width, inputUnit, pricePerUnit, priceUnit]);

  const handleSaveToHistory = () => {
    if (!results) return;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      type: 'Land',
      inputs: { length, width, unit: inputUnit, price: pricePerUnit, priceUnit },
      result: `Valuation: ${formatCurrency(results.totalPrice, currency)} (${results.area.toLocaleString()} ${inputUnit})`,
      timestamp: new Date().toISOString()
    };
    const newHistory = [newItem, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('lc_history', JSON.stringify(newHistory));
  };

  const handleReuse = (item: HistoryItem) => {
    setLength(item.inputs.length);
    setWidth(item.inputs.width);
    if (item.inputs.unit) setInputUnit(item.inputs.unit);
    if (item.inputs.price) setPricePerUnit(item.inputs.price);
    if (item.inputs.priceUnit) setPriceUnit(item.inputs.priceUnit);
  };

  const reset = () => {
    setLength('');
    setWidth('');
    setPricePerUnit('');
    setResults(null);
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('lc_history');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em]">
              <MapPin className="h-3 w-3" />
              Estate Protocol
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic leading-none">
              Estate <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500">Hub</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">Precision spatial valuation terminal. Rates indexed locally.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="relative border-none shadow-xl bg-white dark:bg-gray-800 overflow-hidden rounded-[2rem] transition-colors duration-500">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight text-gray-900 dark:text-white">
                  <Maximize className="h-4 w-4 text-emerald-600" />
                  Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pb-6 px-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Length</Label>
                    <Input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="h-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-xl font-black text-xl outline-none transition-all duration-500"
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Width</Label>
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="h-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-xl font-black text-xl outline-none transition-all duration-500"
                      placeholder="30"
                    />
                  </div>
                </div>
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl h-10">
                  {['SQ_FT', 'SQ_M'].map((u) => (
                    <button
                      key={u}
                      onClick={() => setInputUnit(u as any)}
                      className={`flex-1 rounded-lg text-[9px] font-black uppercase transition-all duration-500 ${
                        inputUnit === u ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {u === 'SQ_FT' ? 'Feet' : 'Meters'}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="relative border-none shadow-xl bg-white dark:bg-gray-800 overflow-hidden rounded-[2rem] transition-colors duration-500">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight text-gray-900 dark:text-white">
                  <Banknote className="h-4 w-4 text-amber-500" />
                  Valuation Logic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-6 px-6">
                 <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-2">
                   <Input
                     type="number"
                     value={pricePerUnit}
                     onChange={(e) => setPricePerUnit(e.target.value)}
                     className="h-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-xl font-black text-xl outline-none"
                     placeholder="Rate"
                   />
                   <Select value={priceUnit} onValueChange={(v: any) => setPriceUnit(v)}>
                     <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 rounded-xl font-black text-xs transition-all duration-500">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                       <SelectItem value="SQ_FT">Sq. Ft</SelectItem>
                       <SelectItem value="SQ_M">Sq. M</SelectItem>
                       <SelectItem value="ACRE">Acre</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" onClick={reset} className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-500">
                    Reset
                  </Button>
                  <Button onClick={handleSaveToHistory} disabled={!results} className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white transition-all duration-500">
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
            <Card className="relative border-none shadow-2xl bg-white dark:bg-gray-800 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] transition-colors duration-500">
             <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-amber-500" />
             <CardHeader className="pb-4 pt-8 sm:pt-10 px-6 sm:px-10 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Target className="h-5 w-5 text-emerald-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">Est. Valuation</span>
                </div>
                <CardTitle className="text-4xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 dark:from-white via-emerald-600 to-emerald-800 italic leading-none">
                 {results ? formatCurrency(results.totalPrice, currency) : '---'}
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6 px-6 sm:px-10 pb-8 sm:pb-10">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 transition-all duration-500">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">Coverage</span>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{results ? results.area.toLocaleString() : '0'} <small className="text-[9px] opacity-50 uppercase">{inputUnit === 'SQ_FT' ? 'ft²' : 'm²'}</small></p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 transition-all duration-500">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">Index</span>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{currency}{parseFloat(pricePerUnit || '0').toLocaleString()}</p>
                </div>
              </div>

              {results && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <ExportActions
                    title="EstateHub Valuation"
                    inputs={[
                      { label: 'Area', value: `${results.area} ${inputUnit}` },
                      { label: 'Rate', value: `${currency}${pricePerUnit}/${priceUnit}` },
                    ]}
                    results={[
                      { label: 'Total', value: formatCurrency(results.totalPrice, currency) },
                      { label: 'Acreage', value: `${results.conversions.acre.toFixed(4)} Ac` },
                    ]}
                  />
                  <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <LocalLandTerminology />
        </div>
      </div>

      <div className="mt-12">
        <CalculationHistory 
          history={history} 
          onClear={clearHistory} 
          onReuse={handleReuse} 
          title="Audit Log: Spatial Ledger"
        />
      </div>
    </div>
  );
};

const LocalLandTerminology = () => {
  return (
    <Card className="border-none bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="pt-8 px-8 pb-4">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Unit Lexicon
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8 space-y-4">
        {[
          { term: 'Acre', def: '43,560 sq. ft or 4047 sq. m' },
          { term: 'Hectare', def: '10,000 sq. m or 2.47 acres' },
          { term: 'Gunta', def: '1,089 sq. ft (Standard in India)' },
          { term: 'Cent', def: '435.6 sq. ft (1/100 of an acre)' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.term}</span>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{item.def}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
