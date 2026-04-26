import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  key?: string;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background select-none overflow-hidden"
    >
      {/* Background Gradient Accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl aspect-square bg-primary/5 blur-[120px] rounded-full -z-10" />

      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo Wrapper */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for a "pop" effect
            delay: 0.2
          }}
          className="relative"
        >
          {/* Logo Frame */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary flex items-center justify-center rounded-3xl shadow-2xl shadow-primary/30 relative">
            <Calculator className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground stroke-[2.5]" />
            
            {/* Subtle pulsate effect */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl -z-10"
            />
          </div>
          
          {/* Decorative accents */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary"
          />
        </motion.div>

        {/* Text Content */}
        <div className="text-center space-y-1">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-foreground"
          >
            Cal<span className="text-primary">Hub</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground"
          >
            Smart Tools for Modern India
          </motion.p>
        </div>
      </div>

      {/* Loading Progress Bar */}
      <div className="absolute bottom-16 w-48 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2.8, ease: "linear" }}
          className="w-full h-full bg-primary"
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40"
      >
        Initializing Secure Environment...
      </motion.p>
    </motion.div>
  );
};
