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

const CALCULATOR_PROTOCOLS = [
  { id: 'finance', title: 'Finance', icon: IndianRupee, desc: 'Yield & Fiscal Matrix', color: 'from-blue-500 via-indigo-600 to-purple-700', shadow: 'shadow-blue-500/30', delay: 0.1, category: 'finance' },
  { id: 'gold-silver', title: 'Metals', icon: Coins, desc: 'Bullion Appraisal Suite', color: 'from-amber-400 via-orange-500 to-yellow-600', shadow: 'shadow-orange-500/30', delay: 0.15, category: 'metals' },
  { id: 'vehicle', title: 'Transit', icon: Navigation, desc: 'Logistics & Fuel Logic', color: 'from-emerald-400 via-teal-500 to-cyan-600', shadow: 'shadow-emerald-500/30', delay: 0.2, category: 'transit' },
  { id: 'land', title: 'Estate', icon: MapIcon, desc: 'Spatial Valuation Matrix', color: 'from-rose-400 via-pink-500 to-purple-600', shadow: 'shadow-pink-500/30', delay: 0.3, category: 'estate' },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Protocols' },
  { id: 'finance', label: 'Finance' },
  { id: 'metals', label: 'Metals' },
  { id: 'transit', label: 'Transit' },
  { id: 'estate', label: 'Estate' },
];

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
                  <div className="flex items-center justify-between">
                    <div className="relative inline-block">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity rounded-full`} />
                      <div className={`relative w-20 h-20 rounded-2xl bg-secondary dark:bg-zinc-900 border-2 border-border flex items-center justify-center text-text-primary shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <item.icon className="h-10 w-10 opacity-80" />
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-muted border border-border text-[8px] font-black uppercase tracking-widest text-text-muted">
                      {item.category}
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
                  <Button variant="outline" size="sm" className="rounded-xl font-black text-[8px] uppercase tracking-widest px-4 border-2">
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <a href="#main-content" className="skip-link">Skip to Content</a>
          
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
          <header className={`border-b sticky top-0 z-[100] bg-background/80 backdrop-blur-3xl transition-all duration-300 ${showScrollTop ? 'shadow-lg py-2' : 'py-4'}`}>
            <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>
                <div className="bg-blue-600 text-white p-2 rounded-xl shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black tracking-tighter leading-none text-text-primary italic m-0">
                  CAL<span className="text-blue-600">HUB</span>
                </h2>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-2">
                <button onClick={() => navigate('/')} className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}>Root</button>
                <button onClick={() => navigate('/finance')} className={`nav-link ${activeTab === 'finance' ? 'active' : ''}`}>Finance</button>
                <button onClick={() => navigate('/gold-silver')} className={`nav-link ${activeTab === 'gold-silver' ? 'active' : ''}`}>Metals</button>
                <button onClick={() => navigate('/vehicle')} className={`nav-link ${activeTab === 'vehicle' ? 'active' : ''}`}>Transit</button>
                <button onClick={() => navigate('/land')} className={`nav-link ${activeTab === 'land' ? 'active' : ''}`}>Estate</button>
              </nav>

              <div className="flex items-center gap-2 sm:gap-4">
                {isInstallable && (
                  <Button
                    id="pwa-install-trigger"
                    variant="outline"
                    size="sm"
                    onClick={installApp}
                    className="rounded-xl font-bold uppercase tracking-widest text-[8px] gap-2 px-3 h-9 border-2 border-border bg-background hover:bg-muted text-text-primary hidden sm:flex"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Install</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="rounded-xl w-9 h-9 bg-muted/50 border border-border hover:bg-muted transition-colors text-primary"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-xl w-9 h-9 border border-border"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden border-t bg-background overflow-hidden"
                >
                  <div className="p-4 space-y-2">
                    {[
                      { id: 'home', label: 'Root System', path: '/' },
                      { id: 'finance', label: 'Finance Protocol', path: '/finance' },
                      { id: 'gold-silver', label: 'Metals Evaluation', path: '/gold-silver' },
                      { id: 'vehicle', label: 'Transit Logistics', path: '/vehicle' },
                      { id: 'land', label: 'Estate Valuation', path: '/land' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                        className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeTab === item.id ? 'bg-primary text-white' : 'hover:bg-muted text-text-secondary'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {/* Main Content */}
          <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 outline-none" tabIndex={-1}>
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
                    <button key={c.id} onClick={() => navigate(`/${c.id}`)} className="text-xs font-bold text-slate-400 hover:text-white transition-colors text-left truncate">
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core</h4>
                <div className="flex flex-col gap-2">
                  <button onClick={() => navigate('/feedback')} className="text-xs font-bold text-slate-400 hover:text-white transition-colors text-left uppercase tracking-tighter">Feedback</button>
                  <button onClick={() => navigate('/admin')} className="text-xs font-bold text-slate-400 hover:text-white transition-colors text-left uppercase tracking-tighter">Admin</button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Identification</h4>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-[10px]">
                  {localStorage.getItem('calhub_user_name')?.charAt(0) || <User className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">{localStorage.getItem('calhub_user_name') || 'Guest User'}</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Operator</span>
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
