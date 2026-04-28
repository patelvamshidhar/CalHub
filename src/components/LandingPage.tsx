import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { 
  LayoutGrid, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Moon,
  Sun
} from 'lucide-react';

interface LandingPageProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className={`desktop-only-landing min-h-screen font-sans selection:bg-blue-500/20 ${isDarkMode ? 'dark' : ''}`}>
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-[60px] py-[25px] bg-white/50 dark:bg-black/20 backdrop-blur-md border-b border-gray-200 dark:border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter cursor-pointer text-foreground" onClick={() => navigate('/')}>
          CAL<span className="text-blue-600">HUB</span>
        </div>

        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/')} className="nav-link active">Home</button>
          <button onClick={() => navigate('/finance')} className="nav-link">Finance</button>
          <button onClick={() => navigate('/gold-silver')} className="nav-link">Gold</button>
          <button onClick={() => navigate('/vehicle')} className="nav-link">Vehicle</button>
          <button onClick={() => navigate('/land')} className="nav-link">Land</button>
          <button className="nav-link">About</button>
          <button className="nav-link">Contact</button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:scale-110 transition-all border border-transparent hover:border-blue-500/20 text-foreground"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button 
            onClick={() => navigate('/admin')}
            variant="outline" 
            className="rounded-xl border-gray-200 dark:border-white/10 font-bold text-xs uppercase tracking-widest px-6 bg-card text-foreground"
          >
            Portal Login
          </Button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex justify-between items-center px-[80px] py-[100px] max-w-7xl mx-auto gap-20">
        {/* HERO LEFT */}
        <div className="max-w-[600px] space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/20 px-4 py-2 rounded-full text-blue-600 dark:text-blue-400 font-bold text-xs tracking-tight"
          >
            <Zap size={14} className="fill-current" />
            ⚡ All-in-One Calculation Platform
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[64px] font-black leading-[1.1] tracking-tight uppercase px-0 text-foreground"
          >
            CalHub – All-in-One <br />
            <span className="gradient-text italic">Smart Calculator</span> <br />
            Platform
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg opacity-80 max-w-[500px] leading-relaxed font-medium hero-subtext"
          >
            Experience next-gen financial, metallic, vehicle, and land calculations 
            with precision, speed, and confidence. Engineered for pro power.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 pt-4"
          >
            <Button 
              onClick={() => navigate('/finance')}
              className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 btn-primary"
            >
              Start Calculating
            </Button>
            <Button 
              variant="outline"
              className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-foreground btn-secondary"
            >
              Explore Features
            </Button>
          </motion.div>
        </div>

        {/* HERO RIGHT - DASHBOARD PREVIEW */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Decorative Blur Background */}
          <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full -z-10" />
          
          <div className="dashboard-card w-[480px] space-y-8 shadow-2xl relative overflow-hidden bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl">
             <div className="flex justify-between items-start gap-10">
                {/* PROTOCOLS COLUMN */}
                <div className="flex-1 space-y-4">
                  <h4 className="label-text">Protocols</h4>
                  <div className="space-y-3">
                    <div className="dashboard-item flex items-center gap-3">
                      <span className="text-blue-600">📊</span> Finance Matrix
                    </div>
                    <div className="dashboard-item flex items-center gap-3">
                      <span className="text-amber-500">🪙</span> Metals Terminal
                    </div>
                    <div className="dashboard-item flex items-center gap-3">
                      <span className="text-emerald-500">🚗</span> Vehicle Hub
                    </div>
                    <div className="dashboard-item flex items-center gap-3">
                      <span className="text-rose-500">🏢</span> Estate Suite
                    </div>
                  </div>
                </div>

                {/* CORE COLUMN */}
                <div className="w-[120px] space-y-4">
                  <h4 className="label-text">Core</h4>
                  <div className="space-y-3">
                    <div className="dashboard-item flex items-center justify-center">
                      💬 <span className="sr-only">Feedback</span>
                    </div>
                    <div className="dashboard-item flex items-center justify-center">
                      🔒 <span className="sr-only">Admin</span>
                    </div>
                  </div>
                </div>
             </div>

             {/* SYSTEM STATUS AREA */}
             <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <h4 className="label-text">System Status</h4>
                <div className="flex gap-4">
                   <div className="status-badge flex-1 flex flex-col gap-1 items-start">
                      <div className="flex items-center gap-2 font-black uppercase tracking-tighter">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         ✅ Operational
                      </div>
                      <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">All Systems Active</span>
                   </div>
                   <div className="flex flex-col gap-2">
                       <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-black text-blue-600 dark:text-blue-400">
                         AES-256
                       </div>
                       <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                         99.9%
                       </div>
                   </div>
                </div>
             </div>

             {/* DASHBOARD FOOTER */}
             <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col items-center gap-2">
                 <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] footer-text">
                    <ShieldCheck size={12} />
                    AES-256 ENCRYPTED MATRIX
                 </div>
                 <div className="text-[8px] font-black uppercase tracking-[0.2em] footer-text">
                    CRAFTED BY <span className="text-blue-600 font-bold">PATEL VAMSHI</span> ❤️
                 </div>
             </div>

             {/* Decorative Corner */}
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl" />
          </div>
        </motion.div>
      </section>

      {/* FOOTER BAR */}
      <footer className="mt-20 py-8 border-t border-gray-100 dark:border-white/5 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] footer-text">
           &copy; 2026 CALHUB PLATFORM V2.4 • ALL RIGHTS RESERVED
         </p>
      </footer>
    </div>
  );
};
