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
}

// Fallback data for Andhra Pradesh / India Average
const FALLBACK_PRICES: LivePrices = {
  gold24: 6500,
  gold22: 5950,
  silver: 75,
  petrol: 111.50,
  diesel: 99.40,
  lastUpdated: new Date().toISOString(),
  source: 'fallback'
};

export const fetchAllPrices = async (): Promise<LivePrices> => {
  try {
    const metalsKey = (import.meta as any).env.VITE_METALS_API_KEY;
    const fuelUrl = (import.meta as any).env.VITE_FUEL_API_URL;

    let goldData: any = null;
    let fuelData: any = null;

    // 1. Fetch Gold/Silver (Example using Metals-API)
    if (metalsKey) {
      try {
        const res = await fetch(`https://metals-api.com/api/latest?access_key=${metalsKey}&base=INR&symbols=XAU,XAG`);
        const json = await res.json();
        if (json.success) {
          // XAU is per ounce. 1 ounce = 31.1035 grams.
          const pricePerGram24k = json.rates.INR / 31.1035;
          goldData = {
            gold24: Math.round(pricePerGram24k),
            gold22: Math.round(pricePerGram24k * 0.916), // 22k is ~91.6% purity
            silver: Math.round(json.rates.INR_SILVER / 31.1035 || 75) // Metals API often has symbols for silver too
          };
        }
      } catch (e) {
        console.error('Gold API failed', e);
      }
    }

    // 2. Fetch Fuel Prices (Example placeholder)
    if (fuelUrl) {
      try {
        const res = await fetch(fuelUrl);
        fuelData = await res.json();
      } catch (e) {
        console.error('Fuel API failed', e);
      }
    }

    // Aggregate Data
    const liveData: LivePrices = {
      gold24: goldData?.gold24 || FALLBACK_PRICES.gold24,
      gold22: goldData?.gold22 || FALLBACK_PRICES.gold22,
      silver: goldData?.silver || FALLBACK_PRICES.silver,
      petrol: fuelData?.petrol || FALLBACK_PRICES.petrol,
      diesel: fuelData?.diesel || FALLBACK_PRICES.diesel,
      lastUpdated: new Date().toISOString(),
      source: (goldData || fuelData) ? 'api' : 'fallback'
    };

    // Cache locally for offline use
    localStorage.setItem(PRICES_CACHE_KEY, JSON.stringify(liveData));

    // Update Admin/System Health in Firestore (Server-side tracking)
    await updateSystemHealth(true);

    return liveData;

  } catch (error) {
    console.error('Error in fetchAllPrices:', error);
    await updateSystemHealth(false);
    
    // Load from cache or fallback
    const cached = localStorage.getItem(PRICES_CACHE_KEY);
    return cached ? JSON.parse(cached) : FALLBACK_PRICES;
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
