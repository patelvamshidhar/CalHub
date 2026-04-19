/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Sun, Calculator, Navigation, Map as MapIcon, IndianRupee, BookOpen, LayoutGrid, ArrowRight, History, Home, Construction, Clock, ShieldCheck, MessageSquarePlus, Github, Coins, Download, WifiOff, Wifi } from 'lucide-react';
import { VehicleHub } from './components/VehicleHub';
import { LandCalculator } from './components/LandCalculator';
import { RateConverter } from './components/RateConverter';
import { InterestCalculator } from './components/InterestCalculator';
import { GoldSilverHub } from './components/GoldSilverHub';
import { FeedbackForm } from './components/FeedbackForm';
import { AdminDashboard } from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { useOfflineStatus, usePWAInstall } from '@/lib/pwa';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { trackVisitor } from '@/services/analyticsService';
import { fetchAllPrices } from '@/services/priceService';

const LAST_UPDATED = "14-04-2026 09:30";
const IS_MAINTENANCE = false; // Set to true to show maintenance banner

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-2"
        >
          <ShieldCheck className="h-3 w-3" />
          Secure & Private Calculations
        </motion.div>
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.85] text-foreground uppercase">
          CAL<span className="text-primary">HUB</span>
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
          Precision calculators for finance, travel, and land. 
          Built for accuracy, designed for clarity.
        </p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-2"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center justify-center gap-2">
            Trusted by users for accurate calculations 🚀
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {[
          { id: 'finance', title: 'Finance Hub', icon: IndianRupee, desc: 'Interest, EMI & Rate Conversion', color: 'from-blue-500 to-indigo-600', delay: 0.1 },
          { id: 'gold-silver', title: 'Gold Hub', icon: Coins, desc: 'Live Rates & Auto-Calculator', color: 'from-amber-500 to-orange-600', delay: 0.15 },
          { id: 'vehicle', title: 'Vehicle Hub', icon: Navigation, desc: 'Fuel, Trip & Travel Planning', color: 'from-orange-500 to-red-600', delay: 0.2 },
          { id: 'land', title: 'Land Hub', icon: MapIcon, desc: 'Area, Plot & Terminology', color: 'from-emerald-500 to-teal-600', delay: 0.3 },
        ].map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.delay }}
            whileHover={{ y: -8 }}
            className="h-full"
          >
            <Card 
              className="cursor-pointer border-2 hover:border-primary/40 transition-all group h-full shadow-lg hover:shadow-2xl bg-card relative overflow-hidden rounded-[2.5rem]"
              onClick={() => navigate(`/${item.id}`)}
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${item.color} opacity-80`} />
              <CardHeader className="pb-3 pt-8 px-8">
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full`} />
                  <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <item.icon className="h-10 w-10" />
                  </div>
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{item.title}</CardTitle>
                <CardDescription className="text-sm sm:text-base font-medium leading-snug text-muted-foreground/80">{item.desc}</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="flex items-center text-primary font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Explore Tools <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const MainApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const isOnline = useOfflineStatus();
  const { isInstallable, installApp } = usePWAInstall();

  // Background Sync for Feedback
  useEffect(() => {
    trackVisitor();
    
    // Initial Price Fetch
    fetchAllPrices();

    // Auto-Update Prices every 2 hours
    const priceTimer = setInterval(() => {
      if (navigator.onLine) {
        fetchAllPrices();
      }
    }, 2 * 60 * 60 * 1000);

    if (isOnline) {
      const syncFeedback = async () => {
        const pending = JSON.parse(localStorage.getItem('pending-feedback') || '[]');
        if (pending.length === 0) return;

        console.log(`Syncing ${pending.length} feedback items...`);
        for (const item of pending) {
          try {
            await addDoc(collection(db, 'feedback'), {
              ...item,
              createdAt: serverTimestamp(),
              syncedAt: serverTimestamp(),
              isOfflineSubmitted: true
            });
          } catch (e) {
            console.error('Failed to sync item:', e);
          }
        }
        localStorage.removeItem('pending-feedback');
      };
      syncFeedback();
    }

    return () => clearInterval(priceTimer);
  }, [isOnline]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const getActiveTab = () => {
    const path = location.pathname.substring(1);
    return ['finance', 'gold-silver', 'vehicle', 'land', 'feedback', 'admin'].includes(path) ? path : 'home';
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 selection:bg-primary selection:text-primary-foreground">
      {/* Maintenance Banner */}
      <AnimatePresence>
        {IS_MAINTENANCE && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 overflow-hidden"
          >
            <Construction className="h-3.5 w-3.5" />
            🚧 Application Under Maintenance - Some features may be temporarily disabled
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 text-white px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 overflow-hidden"
          >
            <WifiOff className="h-3.5 w-3.5" />
            🔴 You are offline. Showing saved data from local storage.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter leading-none group-hover:text-primary transition-colors">
                CAL<span className="text-primary">HUB</span>
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isInstallable && (
              <Button
                variant="outline"
                size="sm"
                onClick={installApp}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 px-3 h-9 border-2 border-primary/20 hover:bg-primary/5 text-primary animate-pulse"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download App</span>
              </Button>
            )}

            {activeTab !== 'home' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 px-3 h-9 hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-xl w-9 h-9 hover:bg-muted transition-colors"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <HomePage />
            </motion.div>
          ) : (
            <motion.div
              key="calculators"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-16"
            >
              <div className="flex justify-center">
                <Tabs value={activeTab} onValueChange={(v) => navigate(`/${v}`)} className="w-full max-w-4xl">
                  <TabsList className="grid grid-cols-4 w-full h-16 p-2 bg-muted/50 rounded-3xl border shadow-inner">
                    <TabsTrigger value="finance" className="rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all">
                      <IndianRupee className="h-4 w-4 mr-2 hidden sm:block" />
                      <span>Finance</span>
                    </TabsTrigger>
                    <TabsTrigger value="gold-silver" className="rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all">
                      <Coins className="h-4 w-4 mr-2 hidden sm:block" />
                      <span>Gold & Silver</span>
                    </TabsTrigger>
                    <TabsTrigger value="vehicle" className="rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all">
                      <Navigation className="h-4 w-4 mr-2 hidden sm:block" />
                      <span>Vehicle</span>
                    </TabsTrigger>
                    <TabsTrigger value="land" className="rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all">
                      <MapIcon className="h-4 w-4 mr-2 hidden sm:block" />
                      <span>Land</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="mt-8">
                {activeTab === 'finance' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                      <section className="space-y-6">
                        <div className="text-center lg:text-left space-y-2 px-4">
                          <h3 className="text-3xl font-black tracking-tighter uppercase">Rate Conversion</h3>
                          <p className="text-muted-foreground font-medium text-sm">Convert between different interest rate formats</p>
                        </div>
                        <RateConverter onBack={() => navigate('/')} />
                      </section>

                      <section className="space-y-6">
                        <div className="text-center lg:text-left space-y-2 px-4">
                          <h3 className="text-3xl font-black tracking-tighter uppercase">Interest Planning</h3>
                          <p className="text-muted-foreground font-medium text-sm">Calculate simple and compound interest with ease</p>
                        </div>
                        <InterestCalculator />
                      </section>
                    </div>
                  </div>
                )}
                {activeTab === 'gold-silver' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <GoldSilverHub />
                  </div>
                )}
                {activeTab === 'vehicle' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <VehicleHub />
                  </div>
                )}
                {activeTab === 'land' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <LandCalculator currency="₹" />
                  </div>
                )}
                {activeTab === 'feedback' && (
                  <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <FeedbackForm />
                  </div>
                )}
                {activeTab === 'admin' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <AdminDashboard />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Feedback Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        className="fixed bottom-6 right-6 z-[60]"
      >
        <Button
          onClick={() => navigate('/feedback')}
          className="w-14 h-14 rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center p-0 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-primary group-hover:bg-primary/90 transition-colors" />
          <MessageSquarePlus className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform" />
          <span className="sr-only">Feedback</span>
        </Button>
      </motion.div>

      {/* Footer */}
      <footer className="border-t bg-background py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          <div>
            &copy; 2026 CALHUB
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/feedback')} 
              className="hover:text-primary transition-colors"
            >
              Feedback
            </button>
            <span className="opacity-20">|</span>
            <button 
              onClick={() => navigate('/admin')} 
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <ShieldCheck className="h-3 w-3" />
              Admin Access
            </button>
          </div>

          <div className="hidden sm:block">
            Crafted by PATEL VAMSHIDHAR REDDY
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/finance" element={<MainApp />} />
        <Route path="/gold-silver" element={<MainApp />} />
        <Route path="/vehicle" element={<MainApp />} />
        <Route path="/land" element={<MainApp />} />
        <Route path="/feedback" element={<MainApp />} />
        <Route path="/admin" element={<MainApp />} />
        <Route path="/calc" element={<Navigate to="/" replace />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
