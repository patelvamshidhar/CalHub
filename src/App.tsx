/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Sun, Calculator, Navigation, Map as MapIcon, IndianRupee, BookOpen, LayoutGrid, ArrowRight, History, Home, Construction, Clock, ShieldCheck, MessageSquarePlus, Github, Coins, Download, WifiOff, Wifi, User, Star, Search, ArrowUp } from 'lucide-react';
import { VehicleHub } from './components/VehicleHub';
import { LandCalculator } from './components/LandCalculator';
import { RateConverter } from './components/RateConverter';
import { InterestCalculator } from './components/InterestCalculator';
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

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const calculators = [
    { id: 'finance', title: 'Finance', icon: IndianRupee, desc: 'Yield & Fiscal Matrix', color: 'from-blue-500 via-indigo-600 to-purple-700', shadow: 'shadow-blue-500/30', delay: 0.1 },
    { id: 'gold-silver', title: 'Metals', icon: Coins, desc: 'Bullion Appraisal Suite', color: 'from-amber-400 via-orange-500 to-yellow-600', shadow: 'shadow-orange-500/30', delay: 0.15 },
    { id: 'vehicle', title: 'Transit', icon: Navigation, desc: 'Logistics & Fuel Logic', color: 'from-emerald-400 via-teal-500 to-cyan-600', shadow: 'shadow-emerald-500/30', delay: 0.2 },
    { id: 'land', title: 'Estate', icon: MapIcon, desc: 'Spatial Valuation Matrix', color: 'from-rose-400 via-pink-500 to-purple-600', shadow: 'shadow-pink-500/30', delay: 0.3 },
  ];

  const filteredCalcs = calculators.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center space-y-4 max-w-5xl mx-auto pt-12 sm:pt-16 uppercase">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-text-primary text-background text-[11px] font-black uppercase tracking-[0.4em] mb-4 shadow-2xl"
        >
          Institutional Grade Utility Suite
        </motion.div>
        <h1 className="text-7xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.75] text-text-primary uppercase italic">
          CAL<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-violet-600 to-fuchsia-700">HUB</span>
        </h1>
        <p className="text-xl sm:text-2xl font-bold leading-tight max-w-4xl mx-auto pt-4 text-text-secondary">
          The sovereign utility matrix. Engineered for <span className="text-text-primary">precision and speed</span>. 
        </p>
        
        <div className="pt-8 max-w-xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search utility protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-6 rounded-2xl bg-card border-2 border-border focus:border-primary/50 outline-none transition-all font-bold text-text-primary placeholder:text-text-muted placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
            />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-10 flex items-center justify-center gap-4 sm:gap-12"
        >
          <div className="flex flex-col items-center group">
            <span className="text-2xl sm:text-4xl font-black text-text-primary group-hover:text-blue-500 transition-colors">100%</span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">Accuracy</span>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex flex-col items-center group">
            <span className="text-2xl sm:text-4xl font-black text-text-primary group-hover:text-violet-500 transition-colors">Zero</span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">Latency</span>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex flex-col items-center group">
            <span className="text-2xl sm:text-4xl font-black text-text-primary group-hover:text-emerald-500 transition-colors">AES</span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">Ready</span>
          </div>
        </motion.div>
      </div>

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
                
                <div className="p-8 pb-10 space-y-10">
                  <div className="relative inline-block">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity rounded-full`} />
                    <div className={`relative w-20 h-20 rounded-2xl bg-secondary dark:bg-zinc-900 border-2 border-border flex items-center justify-center text-text-primary shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <item.icon className="h-10 w-10 opacity-80" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-text-primary">
                      {item.title}
                    </h2>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="px-8 pb-10 flex items-center justify-between mt-auto">
                  <div className="inline-flex items-center text-[9px] font-black uppercase tracking-[0.4em] text-text-muted group-hover:text-text-primary transition-all">
                    Initialize <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCalcs.length === 0 && (
        <div className="text-center py-20 animate-in fade-in zoom-in-95">
          <div className="text-text-muted text-xs font-black uppercase tracking-[0.5em] mb-4">No utility protocol found</div>
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
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useState('');
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

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem('calhub_user_name', userName.trim());
      setShowNameModal(false);
      trackVisitor(userName.trim());
    }
  };

  // Background Sync for Feedback
  useEffect(() => {
    const savedName = localStorage.getItem('calhub_user_name');
    if (!savedName) {
      setShowNameModal(true);
    } else {
      trackVisitor(savedName);
    }

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

    return () => {};
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
        <motion.div
          key="app-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-blue-500 selection:text-white"
        >
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
          <header className={`border-b sticky top-0 z-[100] bg-background/80 backdrop-blur-2xl transition-all duration-300 ${showScrollTop ? 'shadow-lg py-2' : 'py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="bg-gradient-to-br from-blue-500 to-violet-600 text-white p-2 rounded-xl shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black tracking-tighter leading-none text-text-primary italic m-0">
                    CAL<span className="text-blue-500">HUB</span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                {isInstallable && (
                  <Button
                    id="pwa-install-trigger"
                    variant="outline"
                    size="sm"
                    onClick={installApp}
                    className="rounded-xl font-bold uppercase tracking-widest text-[8px] gap-2 px-3 h-9 border-2 border-border bg-background hover:bg-muted text-text-primary"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Install</span>
                  </Button>
                )}

                {activeTab !== 'home' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="rounded-xl font-bold uppercase tracking-widest text-[8px] gap-2 px-3 h-9 hover:bg-muted border border-transparent hover:border-border transition-all text-text-muted"
                  >
                    <Home className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Root</span>
                  </Button>
                )}

                <div className="w-px h-6 bg-border mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="rounded-xl w-9 h-9 bg-muted/50 border border-border hover:bg-muted transition-colors text-primary"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-[90rem] mx-auto">
                      <div className="space-y-4">
                        <RateConverter onBack={() => navigate('/')} />
                      </div>
                      <div className="space-y-4">
                        <InterestCalculator />
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

      {/* Floating Bottom Navigation (Mobile/Tablet) */}
      <AnimatePresence>
        {activeTab !== 'home' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[420px] sm:hidden"
          >
            <div className="bg-text-primary text-background backdrop-blur-3xl rounded-full p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between border border-white/10">
              {[
                { id: 'finance', icon: IndianRupee, color: 'text-blue-500' },
                { id: 'gold-silver', icon: Coins, color: 'text-amber-500' },
                { id: 'home', icon: Home, color: 'text-zinc-500' },
                { id: 'vehicle', icon: Navigation, color: 'text-emerald-500' },
                { id: 'land', icon: MapIcon, color: 'text-rose-500' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id === 'home' ? '/' : `/${item.id}`)}
                  className={`relative p-4 rounded-full transition-all group ${
                    activeTab === item.id 
                    ? 'bg-white dark:bg-zinc-950 shadow-2xl scale-110' 
                    : 'hover:bg-white/10'
                  }`}
                >
                  <item.icon className={`h-6 w-6 ${activeTab === item.id ? item.color : 'text-muted-foreground/60'}`} />
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full border-2 border-white/20"
                    />
                  )}
                </button>
              ))}
            </div>
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

      {/* Name Capture Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-card border-2 border-primary/20 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/10 relative overflow-hidden"
            >
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
              
              <div className="relative space-y-6">
                <div className="flex justify-center">
                  <div className="bg-primary/10 p-4 rounded-3xl">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black tracking-tighter uppercase">Welcome to CalHub!</h2>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Please enter your name to personalize your experience.</p>
                </div>

                <form onSubmit={handleNameSubmit} className="space-y-6">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors z-10">
                      <Star className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter Identification Name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="w-full h-16 bg-white dark:bg-zinc-950 border-2 border-border focus:border-blue-500/50 rounded-[1.8rem] pl-14 pr-6 font-black uppercase tracking-wider transition-all outline-none shadow-xl group-hover:shadow-2xl group-hover:-translate-y-1 dark:text-white dark:placeholder:text-zinc-600"
                    />
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-[1.8rem] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-500/30 hover:scale-[1.05] active:scale-[0.95] transition-all">
                    Establish Protocol
                  </Button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </motion.div>
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
