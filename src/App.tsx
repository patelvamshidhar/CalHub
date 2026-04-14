/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Sun, Calculator, Navigation, Map as MapIcon, IndianRupee, BookOpen, LayoutGrid, ArrowRight, History, Home, Construction, Clock, ShieldCheck, MessageSquarePlus, Github } from 'lucide-react';
import { VehicleHub } from './components/VehicleHub';
import { LandCalculator } from './components/LandCalculator';
import { RateConverter } from './components/RateConverter';
import { InterestCalculator } from './components/InterestCalculator';
import { AdminDashboard } from './components/AdminDashboard';
import { FeedbackModal } from './components/FeedbackSystem';
import { motion, AnimatePresence } from 'motion/react';
import { logSecurityEvent } from '@/lib/firebase';

const LAST_UPDATED = "14-04-2026 09:30";
const IS_MAINTENANCE = false; // Set to true to show maintenance banner

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure & Private Calculations
        </motion.div>
        <h2 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] text-foreground">
          SMART TOOLS FOR <span className="text-primary">MODERN INDIA.</span>
        </h2>
        <p className="text-muted-foreground text-lg sm:text-xl font-medium leading-relaxed">
          Professional-grade calculators for finance, travel, and land. 
          Built for precision, designed for clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {[
          { id: 'finance', title: 'Finance Hub', icon: IndianRupee, desc: 'Interest, EMI & Rate Conversion', color: 'from-blue-500 to-indigo-600', delay: 0.1 },
          { id: 'vehicle', title: 'Vehicle Hub', icon: Navigation, desc: 'Fuel, Trip & Travel Planning', color: 'from-orange-500 to-red-600', delay: 0.2 },
          { id: 'land', title: 'Land Hub', icon: MapIcon, desc: 'Area, Plot & Terminology', color: 'from-emerald-500 to-teal-600', delay: 0.3 },
        ].map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.delay }}
            whileHover={{ y: -12 }}
            className="h-full"
          >
            <Card 
              className="cursor-pointer border-2 hover:border-primary/30 transition-all group h-full shadow-xl hover:shadow-2xl bg-card relative overflow-hidden"
              onClick={() => navigate(`/${item.id}`)}
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${item.color}`} />
              <CardHeader className="pb-4 pt-8">
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-black tracking-tight mb-2">{item.title}</CardTitle>
                <CardDescription className="text-base font-medium leading-snug">{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-primary font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Explore Tools <ArrowRight className="h-4 w-4 ml-2" />
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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSuggestion, setIsSuggestion] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [hasShownFeedback, setHasShownFeedback] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Global error handler for security monitoring
    const handleError = (event: ErrorEvent) => {
      logSecurityEvent('SYSTEM_ERROR', `Runtime error: ${event.message} at ${event.filename}:${event.lineno}`, 'MEDIUM');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [isDarkMode]);

  const getActiveTab = () => {
    const path = location.pathname.substring(1);
    return ['finance', 'vehicle', 'land'].includes(path) ? path : 'home';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    if (interactionCount >= 20 && !hasShownFeedback && activeTab !== 'home') {
      setIsFeedbackOpen(true);
      setHasShownFeedback(true);
    }
  }, [interactionCount, hasShownFeedback, activeTab]);

  const incrementInteraction = () => setInteractionCount(prev => prev + 1);

  const openFeedback = () => {
    setIsSuggestion(false);
    setIsFeedbackOpen(true);
  };

  const openSuggestion = () => {
    setIsSuggestion(true);
    setIsFeedbackOpen(true);
  };

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

      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-primary text-primary-foreground p-2.5 rounded-2xl shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter leading-none">
                CAL<span className="text-primary">HUB</span>
              </h1>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Pro Tools</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={openFeedback}
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 px-4 h-10 border shadow-sm"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>

            {activeTab !== 'home' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 px-4 h-10 border-2 animate-in slide-in-from-right-4 duration-300"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-2xl w-10 h-10 hover:bg-muted transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
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
                <Tabs value={activeTab} onValueChange={(v) => navigate(`/${v}`)} className="w-full max-w-2xl">
                  <TabsList className="grid grid-cols-3 w-full h-16 p-2 bg-muted/50 rounded-3xl border shadow-inner">
                    <TabsTrigger value="finance" className="rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all">
                      <IndianRupee className="h-4 w-4 mr-2 hidden sm:block" />
                      <span>Finance</span>
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

              <div className="mt-12">
                {activeTab === 'finance' && (
                  <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <section className="space-y-10">
                      <div className="text-center space-y-2">
                        <h3 className="text-3xl font-black tracking-tighter uppercase">Rate Conversion</h3>
                        <p className="text-muted-foreground font-medium">Convert between different interest rate formats</p>
                      </div>
                      <RateConverter onBack={() => navigate('/')} />
                    </section>
                    <div className="relative py-12">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t-2 border-dashed border-muted" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-6 text-muted-foreground/30">
                          <Calculator className="h-8 w-8" />
                        </span>
                      </div>
                    </div>
                    <section className="space-y-10">
                      <div className="text-center space-y-2">
                        <h3 className="text-3xl font-black tracking-tighter uppercase">Interest Planning</h3>
                        <p className="text-muted-foreground font-medium">Calculate simple and compound interest with ease</p>
                      </div>
                      <InterestCalculator onSuggest={openSuggestion} />
                    </section>
                  </div>
                )}
                {activeTab === 'vehicle' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <VehicleHub onSuggest={openSuggestion} />
                  </div>
                )}
                {activeTab === 'land' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <LandCalculator currency="₹" onSuggest={openSuggestion} />
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-12">
                <Button variant="ghost" onClick={() => navigate('/')} className="rounded-full font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-primary/5 hover:text-primary transition-colors">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-10">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-primary text-primary-foreground px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
              Crafted By
            </div>
            <p className="text-3xl font-black tracking-tighter text-foreground">
              Patelvamshidhar Reddy
            </p>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
              Building high-precision tools for the next generation of Indian professionals.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-2">
              <Clock className="h-3 w-3" />
              Last Updated: {LAST_UPDATED}
            </div>
          </div>
          
          <div className="flex justify-center gap-8">
            <Button variant="link" onClick={openFeedback} className="font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              Feedback
            </Button>
            <Link to="/admin-dashboard" className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              <ShieldCheck className="h-4 w-4" />
              Admin Access
            </Link>
          </div>

          <div className="pt-10 border-t border-border/50 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Systems Operational</span>
              <span className="text-[10px] text-muted-foreground/30 mx-2">•</span>
              <div className="flex items-center gap-1.5">
                <Github className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">GitHub Auto-Sync Active</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-bold">
              CALHUB &copy; {new Date().getFullYear()}
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-2 font-black uppercase tracking-[0.3em]">
              PRECISION • PRIVACY • PERFORMANCE
            </p>
          </div>
        </div>
      </footer>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        isSuggestion={isSuggestion}
        section={activeTab === 'finance' ? 'Interest' : activeTab === 'vehicle' ? 'Vehicle' : activeTab === 'land' ? 'Land' : undefined}
      />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/finance" element={<MainApp />} />
        <Route path="/vehicle" element={<MainApp />} />
        <Route path="/land" element={<MainApp />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/calc" element={<Navigate to="/" replace />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
