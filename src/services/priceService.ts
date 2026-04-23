import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PRICES_CACHE_KEY = 'calhub_prices_cache';
const STATS_DOC_PATH = 'system/price_health';

export interface LivePrices {
  gold24: number;
  gold22: number;
  silver: number;
  petrol: number;
  diesel: number;
  lastUpdated: string;
  source: 'api' | 'fallback';
  metalsSynced: boolean;
  fuelSynced: boolean;
  metalsError?: string;
  fuelError?: string;
  error?: string; // Legacy field for overall status
}

const OUNCE_TO_GRAM = 31.1035;
const INDIA_ADJUSTMENT = 1.05; // 5% adjustment for India

// Fallback data for Andhra Pradesh / India Average (Updated for Today: April 23, 2026)
const FALLBACK_PRICES: LivePrices = {
  gold24: 8650,
  gold22: 7930,
  silver: 115,
  petrol: 136.20,
  diesel: 121.50,
  lastUpdated: new Date().toISOString(),
  source: 'fallback',
  metalsSynced: false,
  fuelSynced: false
};

export const fetchAllPrices = async (city: string = 'Andhra Pradesh'): Promise<LivePrices> => {
  let metalsErrorMessage = '';
  let fuelErrorMessage = '';
  try {
    const metalsKey = (import.meta as any).env.VITE_METALS_API_KEY;
    const forexKey = (import.meta as any).env.VITE_FOREX_API_KEY || '6ea7c3569c7308ca3d5806c9';
    const rapidApiKey = (import.meta as any).env.VITE_RAPID_API_KEY;
    
    let goldData: any = null;
    let fuelData: any = null;
    let inrRate = 83.5;

    // 1. Fetch Exchange Rate (USD to INR)
    try {
      const forexRes = await fetch(`https://v6.exchangerate-api.com/v6/${forexKey}/latest/USD`);
      if (forexRes.ok && forexRes.headers.get('content-type')?.includes('application/json')) {
        const forexJson = await forexRes.json();
        if (forexJson.result === 'success') {
          inrRate = forexJson.conversion_rates.INR;
        }
      }
    } catch (e) {
      console.warn('Forex API failed, using fallback rate');
    }

    // 2. Fetch Gold/Silver from gold-api.com (New Requirement)
    try {
      const [goldRes, silverRes] = await Promise.all([
        fetch('https://api.gold-api.com/price/XAU'),
        fetch('https://api.gold-api.com/price/XAG')
      ]);

      if (goldRes.ok && silverRes.ok) {
        const goldJson = await goldRes.json();
        const silverJson = await silverRes.json();

        // Formula: gold_inr = (usd_price / 31.1035) * usd_to_inr * 1.05
        const goldGramInr = (goldJson.price / OUNCE_TO_GRAM) * inrRate * INDIA_ADJUSTMENT;
        const silverGramInr = (silverJson.price / OUNCE_TO_GRAM) * inrRate; // Silver usually has less premium or different logic, but following per-gram req

        goldData = {
          gold24: Math.round(goldGramInr),
          gold22: Math.round(goldGramInr * 0.916),
          silver: Number((silverGramInr * 1.05).toFixed(2))
        };
      }
    } catch (e) {
      console.warn('Gold-API.com failed, attempting MetalPrice API fallback');
      metalsErrorMessage = 'Metals API unavailable. ';
      if (metalsKey) {
        try {
          const res = await fetch(`https://metals-api.com/api/latest?access_key=${metalsKey}&base=USD&symbols=XAU,XAG`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.rates) {
              const goldGramInr = (json.rates.XAU * inrRate) / OUNCE_TO_GRAM * INDIA_ADJUSTMENT;
              const silverGramInr = (json.rates.XAG * inrRate) / OUNCE_TO_GRAM * 1.05;
              goldData = {
                gold24: Math.round(goldGramInr),
                gold22: Math.round(goldGramInr * 0.916),
                silver: Number(silverGramInr.toFixed(2))
              };
            }
          }
        } catch (e2) {
          console.error('MetalPrice API failed', e2);
          metalsErrorMessage = 'Metal price sync failed. ';
        }
      }
    }

    // 3. Fetch Fuel Prices (India City Level)
    if (rapidApiKey) {
      try {
        // Using a representative Indian Fuel API on RapidAPI
        const fuelRes = await fetch(`https://fuel-prices-india.p.rapidapi.com/fuel/${encodeURIComponent(city)}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': 'fuel-prices-india.p.rapidapi.com'
          }
        });
        
        if (fuelRes.ok && fuelRes.headers.get('content-type')?.includes('application/json')) {
          const fuelResJson = await fuelRes.json();
          if (fuelResJson && fuelResJson.petrol) {
            fuelData = {
              petrol: parseFloat(fuelResJson.petrol) || FALLBACK_PRICES.petrol,
              diesel: parseFloat(fuelResJson.diesel) || FALLBACK_PRICES.diesel
            };
          }
        }
      } catch (e) {
        console.error('Fuel RapidAPI failed', e);
        fuelErrorMessage = 'Fuel API connection error. ';
      }
    } else {
      fuelErrorMessage = 'RapidAPI Key missing. ';
    }

    // Secondary Fuel Fallback (State level or current configured URL)
    if (!fuelData) {
      const fuelUrl = (import.meta as any).env.VITE_FUEL_API_URL;
      if (fuelUrl && fuelUrl.startsWith('http')) {
        try {
          const res = await fetch(fuelUrl);
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            fuelData = await res.json();
          }
        } catch (e) {
          console.warn('Secondary fuel API failed');
        }
      }
    }

    // Aggregate Data
    const isMetalsLive = !!goldData;
    const isFuelLive = !!fuelData;

    const liveData: LivePrices = {
      gold24: goldData?.gold24 || FALLBACK_PRICES.gold24,
      gold22: goldData?.gold22 || FALLBACK_PRICES.gold22,
      silver: goldData?.silver || FALLBACK_PRICES.silver,
      petrol: fuelData?.petrol || FALLBACK_PRICES.petrol,
      diesel: fuelData?.diesel || FALLBACK_PRICES.diesel,
      lastUpdated: new Date().toISOString(),
      source: (isMetalsLive || isFuelLive) ? 'api' : 'fallback',
      metalsSynced: isMetalsLive,
      fuelSynced: isFuelLive,
      metalsError: isMetalsLive ? undefined : (metalsErrorMessage || 'Metals sync unsuccessful'),
      fuelError: isFuelLive ? undefined : (fuelErrorMessage || 'Fuel sync unsuccessful'),
      error: (!isMetalsLive || !isFuelLive) ? 'Partial data unavailable' : undefined
    };

    // Cache locally for offline use
    localStorage.setItem(PRICES_CACHE_KEY, JSON.stringify(liveData));
    await updateSystemHealth(true);
    return liveData;

  } catch (error) {
    console.error('Error in fetchAllPrices:', error);
    await updateSystemHealth(false);
    
    const cached = localStorage.getItem(PRICES_CACHE_KEY);
    const result = cached ? JSON.parse(cached) : { ...FALLBACK_PRICES };
    result.error = 'Unable to fetch live data - Showing last cached values';
    return result;
  }
};

const updateSystemHealth = async (success: boolean) => {
  try {
    const healthRef = doc(db, STATS_DOC_PATH);
    const healthDoc = await getDoc(healthRef);
    
    const data = {
      lastFetchTime: serverTimestamp(),
      status: success ? 'Success' : 'Failed',
      updatedBy: 'PriceService'
    };

    if (!healthDoc.exists()) {
      await setDoc(healthRef, data);
    } else {
      await updateDoc(healthRef, data);
    }
  } catch (e) {
    console.error('Failed to update system health:', e);
  }
};

export const getCachedPrices = (): LivePrices => {
  const cached = localStorage.getItem(PRICES_CACHE_KEY);
  return cached ? JSON.parse(cached) : FALLBACK_PRICES;
};
