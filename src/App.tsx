/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Sun, Calculator, Navigation, Map as MapIcon, IndianRupee, BookOpen, LayoutGrid, ArrowRight, History, Home } from 'lucide-react';
import { VehicleHub } from './components/VehicleHub';
import { LandCalculator } from './components/LandCalculator';
import { RateConverter } from './components/RateConverter';
import { InterestCalculator } from './components/InterestCalculator';
import { AdminDashboard } from './components/AdminDashboard';
import { FeedbackModal } from './components/FeedbackSystem';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquarePlus, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    const vh = localStorage.getItem('vh_last_result');
    const ic = localStorage.getItem('ic_last_result');
    const lc = localStorage.getItem('lc_last_result');
    
    if (vh) setLastResult(`Vehicle: ₹${vh}`);
    else if (ic) setLastResult(`Interest: ₹${ic}`);
    else if (lc) setLastResult(`Land: ₹${lc}`);
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
          Professional tools for Indian finance, travel, and land calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'finance', title: 'Interest Calculator', icon: IndianRupee, desc: 'Simple & Compound Interest', color: 'bg-purple-500' },
          { id: 'vehicle', title: 'Vehicle Hub', icon: Navigation, desc: 'Fuel & Travel Cost', color: 'bg-blue-500' },
          { id: 'land', title: 'Land Calculator', icon: MapIcon, desc: 'Area & Plot Costing', color: 'bg-emerald-500' },
        ].map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <Card 
              className="cursor-pointer border-2 hover:border-primary/50 transition-all group h-full shadow-lg hover:shadow-xl bg-card/50 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${item.id}`);
              }}
            >
              <CardHeader className="pb-2">
                <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-${item.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">{item.title}</CardTitle>
                <CardDescription className="text-sm font-medium">{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-primary font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                  Start Calculating <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {lastResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <Card className="bg-muted/50 border-dashed border-2">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Calculation</p>
                <p className="font-black text-foreground">{lastResult}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
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
  }, [isDarkMode]);

  const getActiveTab = () => {
    const path = location.pathname.substring(1);
    return ['finance', 'vehicle', 'land'].includes(path) ? path : 'home';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    if (interactionCount >= 3 && !hasShownFeedback && activeTab !== 'home') {
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
    <div className="min-h-screen bg-background transition-colors duration-300" onClick={incrementInteraction}>
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block">
              EasyCalc Hub
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={openFeedback}
              className="rounded-full font-bold border-2 gap-2 px-2 sm:px-4"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>

            {activeTab !== 'home' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="rounded-full font-bold border-2 gap-2 px-2 sm:px-4 animate-in slide-in-from-right-4 duration-300"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            )}

            <div className="hidden sm:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full border">
              <IndianRupee className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">INR Only</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage />
            </motion.div>
          ) : (
            <motion.div
              key="calculators"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex justify-center">
                <Tabs value={activeTab} onValueChange={(v) => navigate(`/${v}`)} className="w-full max-w-3xl">
                  <TabsList className="grid grid-cols-3 w-full h-14 p-1.5 bg-muted rounded-2xl">
                    <TabsTrigger value="finance" className="rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-md">
                      <IndianRupee className="h-4 w-4 mr-2 hidden sm:block" />
                      <span>Finance</span>
                    </TabsTrigger>
                    <TabsTrigger value="vehicle" className="rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-md">
                      <Navigation className="h-4 w-4 mr-2 hidden sm:block" />
                      <span>Vehicle</span>
                    </TabsTrigger>
                    <TabsTrigger value="land" className="rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-md">
                      <MapIcon className="h-4 w-4 mr-2 hidden sm:block" />
                      <span>Land</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="mt-8">
                {activeTab === 'finance' && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <section className="space-y-8">
                      <div className="text-center">
                        <h3 className="text-2xl font-black uppercase tracking-widest text-primary/40">Rate Conversion</h3>
                      </div>
                      <RateConverter onBack={() => navigate('/')} />
                    </section>
                    <div className="relative py-8">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-dashed" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-4 text-muted-foreground">
                          <Calculator className="h-6 w-6 opacity-20" />
                        </span>
                      </div>
                    </div>
                    <section className="space-y-8">
                      <div className="text-center">
                        <h3 className="text-2xl font-black uppercase tracking-widest text-primary/40">Interest Planning</h3>
                      </div>
                      <InterestCalculator onSuggest={openSuggestion} />
                    </section>
                  </div>
                )}
                {activeTab === 'vehicle' && (
                  <div className="animate-in fade-in duration-500">
                    <VehicleHub onSuggest={openSuggestion} />
                  </div>
                )}
                {activeTab === 'land' && (
                  <div className="animate-in fade-in duration-500">
                    <LandCalculator currency="₹" onSuggest={openSuggestion} />
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-8">
                <Button variant="outline" onClick={() => navigate('/')} className="rounded-full font-bold uppercase tracking-widest text-xs">
                  Back to Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Author
            </div>
            <p className="text-xl font-black tracking-tight text-foreground">
              Patelvamshidhar Reddy
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button variant="link" onClick={openFeedback} className="font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
              Give Feedback
            </Button>
            <Link to="/admin-dashboard" className="flex items-center gap-1 font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
              <ShieldCheck className="h-3 w-3" />
              Admin
            </Link>
          </div>

          <div className="pt-4 border-t border-border/50 max-w-xs mx-auto">
            <p className="text-sm text-muted-foreground font-bold">
              EasyCalc Hub &copy; {new Date().getFullYear()}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 font-black uppercase tracking-widest">
              Precision tools for the modern India.
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
