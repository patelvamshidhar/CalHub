import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy Route for Prices to avoid CORS and hide keys
  app.get('/api/prices', async (req, res) => {
    const city = req.query.city as string || 'Andhra Pradesh';
    const metalsKey = process.env.VITE_METALS_API_KEY || process.env.METALS_API_KEY;
    const forexKey = process.env.VITE_FOREX_API_KEY || process.env.FOREX_API_KEY || '6ea7c3569c7308ca3d5806c9';
    const rapidApiKey = process.env.VITE_RAPID_API_KEY || process.env.RAPID_API_KEY;

    let goldData: any = null;
    let fuelData: any = null;
    let inrRate = 83.5;

    try {
      // 1. Fetch Exchange Rate
      try {
        const forexRes = await fetch(`https://v6.exchangerate-api.com/v6/${forexKey}/latest/USD`);
        const forexJson = await forexRes.json();
        if (forexJson.result === 'success') {
          inrRate = forexJson.conversion_rates.INR;
        }
      } catch (e) {
        console.warn('Forex API proxy failed');
      }

      // 2. Fetch Metals
      try {
        const [goldRes, silverRes] = await Promise.all([
          fetch('https://api.gold-api.com/price/XAU'),
          fetch('https://api.gold-api.com/price/XAG')
        ]);
        if (goldRes.ok && silverRes.ok) {
          const gJ = await goldRes.json();
          const sJ = await silverRes.json();
          const OUNCE = 31.1035;
          const IND = 1.05;
          const gGram = (gJ.price / OUNCE) * inrRate * IND;
          const sGram = (sJ.price / OUNCE) * inrRate;
          goldData = {
            gold24: Math.round(gGram),
            gold22: Math.round(gGram * 0.916),
            silver: Number((sGram * 1.05).toFixed(2))
          };
        }
      } catch (e) {
        console.warn('Gold-API proxy failed, trying fallback');
        if (metalsKey) {
          try {
            const res = await fetch(`https://metals-api.com/api/latest?access_key=${metalsKey}&base=USD&symbols=XAU,XAG`);
            const json = await res.json();
            if (json.success && json.rates) {
              const OUNCE = 31.1035;
              const IND = 1.05;
              const gGram = (json.rates.XAU * inrRate) / OUNCE * IND;
              const sGram = (json.rates.XAG * inrRate) / OUNCE * 1.05;
              goldData = {
                gold24: Math.round(gGram),
                gold22: Math.round(gGram * 0.916),
                silver: Number(sGram.toFixed(2))
              };
            }
          } catch (e2) {
            console.error('MetalPrice API proxy failed');
          }
        }
      }

      // 3. Fetch Fuel
      if (rapidApiKey) {
        try {
          const fuelRes = await fetch(`https://fuel-prices-india.p.rapidapi.com/fuel/${encodeURIComponent(city)}`, {
            headers: {
              'x-rapidapi-key': rapidApiKey,
              'x-rapidapi-host': 'fuel-prices-india.p.rapidapi.com'
            }
          });
          const fRes = await fuelRes.json();
          if (fRes && fRes.petrol) {
            fuelData = {
              petrol: parseFloat(fRes.petrol),
              diesel: parseFloat(fRes.diesel)
            };
          }
        } catch (e) {
          console.error('Fuel RapidAPI proxy failed');
        }
      }

      res.json({ goldData, fuelData, inrRate });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
