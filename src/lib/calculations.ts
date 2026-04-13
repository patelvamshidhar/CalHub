/**
 * Calculation utilities for Interest Calculator
 */

export const calculateSimpleInterest = (principal: number, rate: number, time: number) => {
  const interest = (principal * rate * time) / 100;
  const total = principal + interest;
  return { interest, total };
};

export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  frequency: number
) => {
  // Formula: A = P * (1 + r/n)^(n*t)
  // r is annual interest rate (decimal)
  // n is compounding frequency per year
  // t is time in years
  const r = rate / 100;
  const n = frequency;
  const t = time;
  
  const total = principal * Math.pow(1 + r / n, n * t);
  const interest = total - principal;
  
  return { interest, total };
};

export const getGrowthData = (
  principal: number,
  rate: number,
  time: number,
  type: 'simple' | 'compound',
  frequency: number = 1
) => {
  const data = [];
  for (let i = 0; i <= time; i++) {
    let total = 0;
    if (type === 'simple') {
      total = principal + (principal * rate * i) / 100;
    } else {
      const r = rate / 100;
      total = principal * Math.pow(1 + r / frequency, frequency * i);
    }
    data.push({
      year: i,
      amount: Math.round(total * 100) / 100,
    });
  }
  return data;
};

export const formatCurrency = (amount: number, symbol: string) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: symbol === '₹' ? 'INR' : symbol === '$' ? 'USD' : 'EUR',
    currencyDisplay: 'symbol',
  }).format(amount).replace('INR', '₹').replace('USD', '$').replace('EUR', '€');
};

// Land Area Constants (Base unit: Square Feet)
export const LAND_UNITS = {
  SQ_FT: 1,
  SQ_M: 10.7639,
  SQ_YD: 9,
  ACRE: 43560,
  HECTARE: 107639,
  GUNTA: 1089,
  CENT: 435.6,
};

export const convertLandArea = (value: number, fromUnit: keyof typeof LAND_UNITS) => {
  const sqFt = value * LAND_UNITS[fromUnit];
  return {
    sqFt: sqFt / LAND_UNITS.SQ_FT,
    sqM: sqFt / LAND_UNITS.SQ_M,
    sqYd: sqFt / LAND_UNITS.SQ_YD,
    acre: sqFt / LAND_UNITS.ACRE,
    hectare: sqFt / LAND_UNITS.HECTARE,
    gunta: sqFt / LAND_UNITS.GUNTA,
    cent: sqFt / LAND_UNITS.CENT,
  };
};
