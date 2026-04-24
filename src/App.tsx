/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Sun, Calculator, Navigation, Map as MapIcon, IndianRupee, BookOpen, LayoutGrid, ArrowRight, History, Home, Construction, Clock, ShieldCheck, MessageSquarePlus, Github, Coins, Download, WifiOff, Wifi, User, Star, QrCode, Smartphone, Laptop, X } from 'lucide-react';
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
import { QRCodeCanvas } from 'qrcode.react';
const LAST_UPDATED = "14-04-2026 09:30";
const IS_MAINTENANCE = false; // Set to true to show maintenance banner

const DownloadModal = ({ isOpen, onClose, onInstall }: { isOpen: boolean, onClose: () => void, onInstall: () => void }) => {
  const currentUrl = window.location.origin;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-card border-2 border-border p-8 sm:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute right-8 top-8 p-3 bg-muted rounded-2xl hover:bg-muted/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                    <Laptop className="h-4 w-4" /> Cross-Platform Sync
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
                    Get <span className="text-blue-500">CalHub</span>
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                    Access precision computations on any device. Install the app for the full zero-latency experience.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={onInstall}
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 transition-all"
                  >
                    Download Web App
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-2 border-border bg-transparent hover:bg-muted font-black uppercase tracking-widest text-[10px] transition-all"
                    onClick={() => alert('Play Store listing coming soon. Use the Web App for now!')}
                  >
                    Direct Android Link
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 p-8 bg-muted rounded-[2.5rem] border-2 border-dashed border-border/50">
                <div className="p-4 bg-white rounded-3xl shadow-2xl">
                  <QRCodeCanvas value={currentUrl} size={160} level="H" />
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground">
                    <QrCode className="h-4 w-4 text-blue-500" /> Scan to Mobile
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                    Open camera on your phone to install instantly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isInstallable, installApp } = usePWAInstall();

  const handleDownloadClick = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      setIsRedirecting(true);
      // Simulate/Trigger PWA install or store redirect
      setTimeout(() => {
        const installBtn = document.getElementById('pwa-install-trigger');
        if (installBtn) {
          installBtn.click();
          setIsRedirecting(false);
        } else {
          setIsRedirecting(false);
          alert('Initializing Download... Please check your browser menu for "Install App" if the prompt doesn\'t appear.');
        }
      }, 1500);
    } else {
      setIsDownloadModalOpen(true);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <DownloadModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
        onInstall={() => {
          installApp();
          setIsDownloadModalOpen(false);
        }}
      />

      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center space-y-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-muted border-t-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Smartphone className="h-10 w-10 text-blue-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Analyzing System...</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Preparing Mobile Installation Packet</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-6 max-w-4xl mx-auto pt-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          Neural Computation Engine V2.0
        </motion.div>
        <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.8] text-foreground uppercase italic transition-colors">
          CAL<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-violet-500 to-purple-600 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">HUB</span>
        </h2>
        <p className="text-muted-foreground text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto pt-4">
          The definitive fintech utility suite. Precision analytics for <span className="text-foreground font-bold">finance</span>, <span className="text-foreground font-bold">bullion</span>, and <span className="text-foreground font-bold">estate</span>. 
        </p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6 flex items-center justify-center gap-8"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-foreground">100%</span>
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Accuracy</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-foreground">Zero</span>
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Latency</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-foreground">SSL</span>
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Encryption</span>
          </div>
        </motion.div>
 
         <div className="pt-12 flex justify-center">
           <Button 
             onClick={handleDownloadClick}
             className="h-16 px-10 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-700 hover:from-blue-500 hover:to-violet-600 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 group transition-all"
           >
             <Download className="h-5 w-5 mr-3 group-hover:bounce group-hover:-translate-y-1 transition-transform" />
             Download Desktop / Mobile App
           </Button>
         </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
        {[
          { id: 'finance', title: 'Finance Hub', icon: IndianRupee, desc: 'Dynamic Yield & Rate Matrix', color: 'from-blue-500 via-indigo-600 to-purple-700', shadow: 'shadow-blue-500/40', delay: 0.1, accent: 'bg-blue-500/20' },
          { id: 'gold-silver', title: 'Gold & Silver Hub', icon: Coins, desc: 'Real-time Precious Metals Hub', color: 'from-amber-400 via-orange-500 to-yellow-600', shadow: 'shadow-orange-500/40', delay: 0.15, accent: 'bg-orange-500/20' },
          { id: 'vehicle', title: 'Vehicle Hub', icon: Navigation, desc: 'Logistics & Fuel Optimization', color: 'from-emerald-400 via-teal-500 to-cyan-600', shadow: 'shadow-emerald-500/40', delay: 0.2, accent: 'bg-emerald-500/20' },
          { id: 'land', title: 'Estate Hub', icon: MapIcon, desc: 'Spatial Valuation & Metrics', color: 'from-rose-400 via-pink-500 to-purple-600', shadow: 'shadow-pink-500/40', delay: 0.3, accent: 'bg-rose-500/20' },
        ].map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -16, scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="h-full group perspective-1000"
          >
            <Card 
              className={`cursor-pointer border-none transition-all duration-500 group h-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:${item.shadow} bg-card dark:bg-zinc-950/80 backdrop-blur-xl relative overflow-hidden rounded-[3.5rem] p-1 border border-white/5`}
              onClick={() => navigate(`/${item.id}`)}
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${item.color} shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] z-20`} />
              
              <CardHeader className="pb-4 pt-12 px-10 relative z-10">
                <div className="relative mb-10 group-hover:transform-style-3d group-hover:rotate-y-12 transition-transform duration-700">
                  {/* 3D Icon Container */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-3xl opacity-20 group-hover:opacity-60 transition-opacity rounded-full`} />
                  <div className={`relative w-28 h-28 rounded-[2.5rem] bg-muted/50 dark:bg-zinc-900 border-2 border-white/10 dark:border-zinc-800/50 flex items-center justify-center text-foreground dark:text-zinc-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] group-hover:shadow-[0_40px_60px_-12px_rgba(0,0,0,0.7)] group-hover:-translate-y-2 transition-all duration-500 overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <item.icon className="h-14 w-14 text-foreground/80 dark:text-zinc-100 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" />
                    
                    {/* Glass Reflect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 skew-y-[-15deg] translate-y-[-50%] group-hover:translate-y-[-30%] transition-transform duration-1000" />
                  </div>
                </div>

                <div className="space-y-3">
                  <CardTitle className="text-4xl font-black tracking-tighter text-foreground dark:text-zinc-100 uppercase italic leading-none">
                    {item.title.split(' ')[0]} <br />
                    <span className="text-blue-500 group-hover:text-blue-400 transition-colors">{item.title.split(' ').slice(1).join(' ')}</span>
                  </CardTitle>
                  <CardDescription className="text-[13px] font-bold leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors uppercase tracking-tight">
                    {item.desc}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-10 pb-12 relative z-10">
                <div className="flex items-center text-muted-foreground/60 dark:text-zinc-500 font-black text-[11px] uppercase tracking-[0.3em] group-hover:translate-x-4 transition-all duration-500">
                  Enter Hub <ArrowRight className="h-4 w-4 ml-4 text-blue-500 group-hover:translate-x-2 transition-transform" />
                </div>
              </CardContent>

              {/* Abstract 3D depth shapes */}
              <div className={`absolute -bottom-16 -right-16 w-56 h-56 bg-gradient-to-br ${item.color} opacity-[0.03] rounded-full blur-[80px] group-hover:opacity-[0.12] transition-all duration-700 group-hover:scale-125`} />
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
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLaunching, setIsLaunching] = useState(true);
  const isOnline = useOfflineStatus();
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
          <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-2xl shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
              <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="bg-gradient-to-br from-blue-500 to-violet-600 text-white p-2.5 rounded-2xl shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black tracking-tighter leading-none text-foreground italic">
                    CAL<span className="text-blue-500">HUB</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse shadow-[0_0_8px_red]'}`} />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      {isOnline ? 'Active Link' : 'Standby Mode'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isInstallable && (
                  <Button
                    id="pwa-install-trigger"
                    variant="outline"
                    size="sm"
                    onClick={installApp}
                    className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 px-4 h-10 border-2 border-border bg-background hover:bg-muted text-foreground"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Initialize Local Install</span>
                  </Button>
                )}

                {activeTab !== 'home' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 px-4 h-10 hover:bg-muted border border-transparent hover:border-border transition-all text-muted-foreground"
                  >
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Mortal Root</span>
                  </Button>
                )}

                <div className="w-px h-8 bg-border mx-2" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="rounded-xl w-10 h-10 bg-muted/50 border border-border hover:bg-muted transition-colors text-primary"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
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
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-20"
            >
              <div className="flex justify-center">
                <Tabs value={activeTab} onValueChange={(v) => navigate(`/${v}`)} className="w-full max-w-5xl">
                  <TabsList className="grid grid-cols-4 w-full h-24 p-2 bg-muted/30 backdrop-blur-3xl rounded-[2.5rem] border border-border/50 shadow-2xl">
                    <TabsTrigger value="finance" className="rounded-[1.8rem] font-black uppercase tracking-widest text-[9px] sm:text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all flex flex-col items-center justify-center gap-2 group border border-transparent data-[state=active]:border-white/20">
                      <IndianRupee className="h-5 w-5 group-data-[state=active]:scale-110 group-hover:rotate-12 transition-all" />
                      <span>Finance Hub</span>
                    </TabsTrigger>
                    <TabsTrigger value="gold-silver" className="rounded-[1.8rem] font-black uppercase tracking-widest text-[9px] sm:text-[10px] data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-[0_15px_40px_rgba(245,158,11,0.4)] transition-all flex flex-col items-center justify-center gap-2 group border border-transparent data-[state=active]:border-white/20">
                      <Coins className="h-5 w-5 group-data-[state=active]:scale-110 group-hover:rotate-12 transition-all" />
                      <span>Metals Hub</span>
                    </TabsTrigger>
                    <TabsTrigger value="vehicle" className="rounded-[1.8rem] font-black uppercase tracking-widest text-[9px] sm:text-[10px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-[0_15px_40px_rgba(5,150,105,0.4)] transition-all flex flex-col items-center justify-center gap-2 group border border-transparent data-[state=active]:border-white/20">
                      <Navigation className="h-5 w-5 group-data-[state=active]:scale-110 group-hover:rotate-12 transition-all" />
                      <span>Transit Hub</span>
                    </TabsTrigger>
                    <TabsTrigger value="land" className="rounded-[1.8rem] font-black uppercase tracking-widest text-[9px] sm:text-[10px] data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-[0_15px_40px_rgba(225,29,72,0.4)] transition-all flex flex-col items-center justify-center gap-2 group border border-transparent data-[state=active]:border-white/20">
                      <MapIcon className="h-5 w-5 group-data-[state=active]:scale-110 group-hover:rotate-12 transition-all" />
                      <span>Estate Hub</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="mt-12 min-h-[600px]">
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

                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Star className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="YOUR AWESOME NAME"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="w-full h-14 bg-muted/50 border-2 border-transparent focus:border-primary/50 focus:bg-background rounded-2xl pl-12 pr-4 font-black uppercase tracking-wider transition-all outline-none"
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Get Started
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
