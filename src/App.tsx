/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Sun, Calculator, Navigation, Map as MapIcon, IndianRupee, LayoutGrid, ArrowRight, Home, Construction, ShieldCheck, MessageSquarePlus, Coins, Download, WifiOff, ArrowUp } from 'lucide-react';
import { VehicleHub } from './components/VehicleHub';
import { LandCalculator } from './components/LandCalculator';
import { RateConverter } from './components/RateConverter';
import { InterestCalculator } from './components/InterestCalculator';
import { DiscountCalculator } from './components/finance/DiscountCalculator';
import { GoldSilverHub } from './components/GoldSilverHub';
import { FeedbackForm } from './components/FeedbackForm';
import { AdminDashboard } from './components/AdminDashboard';
import { SplashScreen } from './components/SplashScreen';
import { motion, AnimatePresence } from 'motion/react';
import { useOfflineStatus, usePWAInstall } from '@/lib/pwa';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { trackVisitor } from '@/services/analyticsService';
const LAST_UPDATED = "14-04-2026 09:30";
const IS_MAINTENANCE = false; // Set to true to show maintenance banner

const CALCULATOR_PROTOCOLS = [
  { id: 'finance', title: 'Finance', icon: IndianRupee, desc: 'Yield & Fiscal Matrix', color: 'from-blue-500 via-indigo-600 to-purple-700', shadow: 'shadow-blue-500/30', delay: 0.1, category: 'finance' },
  { id: 'gold-silver', title: 'Metals', icon: Coins, desc: 'Bullion Appraisal Suite', color: 'from-amber-400 via-orange-500 to-yellow-600', shadow: 'shadow-orange-500/30', delay: 0.15, category: 'metals' },
  { id: 'vehicle', title: 'Vehicle', icon: Navigation, desc: 'Logistics & Fuel Logic', color: 'from-emerald-400 via-teal-500 to-cyan-600', shadow: 'shadow-emerald-500/30', delay: 0.2, category: 'vehicle' },
  { id: 'land', title: 'Estate', icon: MapIcon, desc: 'Spatial Valuation Matrix', color: 'from-rose-400 via-pink-500 to-purple-600', shadow: 'shadow-pink-500/30', delay: 0.3, category: 'estate' },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Protocols' },
  { id: 'finance', label: 'Finance' },
  { id: 'metals', label: 'Gold & Silver' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'estate', label: 'Land' },
];

const AboutSection = () => (
  <div className="max-w-2xl mx-auto px-4 pt-4">
    <div className="bg-card rounded-2xl shadow-sm p-4 space-y-3 transition-all border border-border relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl" />
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          SMART CALCULATION HUB
        </p>
        <h1 className="text-xl font-bold text-foreground m-0">
          CalHub
        </h1>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">
        All-in-one platform for finance, gold & silver valuation, vehicle cost analysis, and land calculations. Designed for accuracy, speed, and simplicity.
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        {['Finance Tools', 'Gold & Silver', 'Vehicle Cost', 'Land Value'].map((tag) => (
          <span key={tag} className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-muted text-muted-foreground border border-border">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredCalcs = CALCULATOR_PROTOCOLS.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
      <AboutSection />
      <div className="calculator-grid pt-12">
        <AnimatePresence mode="popLayout">
          {filteredCalcs.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Card 
                className={`calculator-card cursor-pointer h-full border-none relative overflow-hidden group p-0`}
                onClick={() => navigate(`/${item.id}`)}
              >
                <div className={`absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r ${item.color} z-20`} />
                
                <div className="p-6 sm:p-8 space-y-6 sm:space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="relative inline-block">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity rounded-full`} />
                      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted border-2 border-border flex items-center justify-center text-foreground shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <item.icon className="h-8 w-8 sm:h-10 sm:w-10 opacity-80" />
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-muted border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                      {item.category}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic leading-none text-foreground">
                      {item.title}
                    </h2>
                    <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="px-6 sm:px-8 pb-8 sm:pb-10 flex items-center justify-between mt-auto">
                  <div className="inline-flex items-center text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground group-hover:text-foreground transition-all">
                    Initialize <ArrowRight className="h-4 w-4 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform" />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl font-black text-[8px] uppercase tracking-widest px-3 sm:px-4 border border-border text-foreground bg-card hover:bg-muted transition-colors duration-200"
                  >
                    Open Protocol
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCalcs.length === 0 && (
        <div className="text-center py-20 animate-in fade-in zoom-in-95">
          <div className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.5em] mb-4">No utility protocol found</div>
          <Button variant="outline" onClick={() => setSearchQuery('')} className="rounded-full px-8">Reset Directory</Button>
        </div>
      )}
    </div>
  );
};

const MainApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isLaunching, setIsLaunching] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isOnline = useOfflineStatus();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const { isInstallable, installApp } = usePWAInstall();

  // Background Sync for Feedback
  useEffect(() => {
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
    <AnimatePresence mode="wait">
      {isLaunching ? (
        <SplashScreen key="splash" onComplete={() => setIsLaunching(false)} />
      ) : (
        <div id="app" className={`theme-container ${isDarkMode ? 'dark' : ''}`}>
          <motion.div
            key="app-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full overflow-x-hidden bg-background text-foreground transition-all duration-300 selection:bg-blue-500 selection:text-white"
          >
            
            {/* Theme Toggle */}
            <button 
              id="themeToggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          
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
                🚧 System Maintenance in Progress - Modules may be unstable
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
                🔴 Neural Link Offline. Accessing Cached Core.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <header className={`border-b sticky top-0 z-[100] bg-background/80 backdrop-blur-3xl transition-colors duration-500 ${showScrollTop ? 'shadow-lg py-1' : 'py-3'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black tracking-tighter leading-none text-gray-900 dark:text-white italic m-0">
                  CAL<span className="text-blue-600">HUB</span>
                </h2>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-2">
                <button onClick={() => navigate('/')} className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}>Home</button>
                <button onClick={() => navigate('/finance')} className={`nav-link ${activeTab === 'finance' ? 'active' : ''}`}>Finance</button>
                <button onClick={() => navigate('/gold-silver')} className={`nav-link ${activeTab === 'gold-silver' ? 'active' : ''}`}>Gold</button>
                <button onClick={() => navigate('/vehicle')} className={`nav-link ${activeTab === 'vehicle' ? 'active' : ''}`}>Vehicle</button>
                <button onClick={() => navigate('/land')} className={`nav-link ${activeTab === 'land' ? 'active' : ''}`}>Land</button>
              </nav>

              <div className="flex items-center gap-2 sm:gap-4">
                {isInstallable && (
                  <Button
                    id="pwa-install-trigger"
                    variant="outline"
                    size="sm"
                    onClick={installApp}
                    className="rounded-xl font-bold uppercase tracking-widest text-[8px] gap-2 px-3 h-9 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:flex transition-all duration-200"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Install</span>
                  </Button>
                )}

                {/* Dark mode button placeholder to maintain header layout while the real one is fixed */}
                <div className="w-10 h-10 hidden sm:block" />
              </div>
            </div>
          </header>



          {/* Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-3xl border-t border-border md:hidden pb-safe transition-all duration-300">
            <div className="flex items-center justify-around h-16 px-4">
              {[
                { id: 'home', icon: Home, path: '/', label: 'Home' },
                { id: 'finance', icon: IndianRupee, path: '/finance', label: 'Finance' },
                { id: 'gold-silver', icon: Coins, path: '/gold-silver', label: 'Gold' },
                { id: 'vehicle', icon: Navigation, path: '/vehicle', label: 'Vehicle' },
                { id: 'land', icon: MapIcon, path: '/land', label: 'Land' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all p-0 bg-transparent ${
                    activeTab === item.id ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${activeTab === item.id ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <main id="main-content" className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 outline-none pb-24 md:pb-10" tabIndex={-1}>
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.6 }}
            >
              <HomePage />
            </motion.div>
          ) : (
            <motion.div
              key="calculators"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="min-h-[400px]">
                {activeTab === 'finance' && (
                  <div className="animate-in fade-in zoom-in-95 duration-1000">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-12 items-start max-w-[120rem] mx-auto">
                      <div className="space-y-4">
                        <RateConverter onBack={() => navigate('/')} />
                      </div>
                      <div className="space-y-4">
                        <InterestCalculator />
                      </div>
                      <div className="space-y-4">
                        <DiscountCalculator />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'gold-silver' && (
                  <div className="animate-in fade-in zoom-in-95 duration-700">
                    <GoldSilverHub />
                  </div>
                )}
                {activeTab === 'vehicle' && (
                  <div className="animate-in fade-in zoom-in-95 duration-700">
                    <VehicleHub />
                  </div>
                )}
                {activeTab === 'land' && (
                  <div className="animate-in fade-in zoom-in-95 duration-700">
                    <LandCalculator currency="₹" />
                  </div>
                )}
                {activeTab === 'feedback' && (
                  <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <FeedbackForm />
                  </div>
                )}
                {activeTab === 'admin' && (
                  <div className="animate-in fade-in zoom-in-95 duration-700">
                    <AdminDashboard />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-8 z-[60]"
          >
            <Button
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full shadow-2xl bg-primary text-white hover:scale-110 active:scale-95 transition-all p-0"
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Feedback Button (Desktop) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        className="fixed bottom-8 right-8 z-[60] hidden sm:block"
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

      <footer className="border-t bg-slate-900 dark:bg-zinc-950 py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-xl">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black tracking-tighter text-white italic">CAL<span className="text-blue-500">HUB</span></h3>
              </div>
              <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xs">
                The world's most advanced utility matrix for professional-grade calculations. Built for speed, precision, and privacy.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Protocols</h4>
                <div className="flex flex-col gap-2">
                  {CALCULATOR_PROTOCOLS.map(c => (
                    <button key={c.id} onClick={() => navigate(`/${c.id}`)} className="text-xs font-bold text-slate-400 hover:text-white transition-colors text-left truncate p-0 bg-transparent">
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core</h4>
                <div className="flex flex-col gap-2">
                  <button onClick={() => navigate('/feedback')} className="text-xs font-bold text-slate-400 hover:text-white transition-colors text-left uppercase tracking-tighter p-0 bg-transparent">Feedback</button>
                  <button onClick={() => navigate('/admin')} className="text-xs font-bold text-slate-400 hover:text-white transition-colors text-left uppercase tracking-tighter p-0 bg-transparent">Admin</button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Status</h4>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">Operational</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Core Link Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
            <div>&copy; 2026 CALHUB - All Protocols Reserved</div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3" />
              <span>AES-256 Encrypted Matrix</span>
            </div>
            <div>Crafted by PATEL VAMSHIDHAR REDDY</div>
          </div>
        </div>
      </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
