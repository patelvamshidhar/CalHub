import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Map as MapIcon, Percent, ArrowRight, Fuel, Gauge, LayoutGrid, IndianRupee, Navigation } from 'lucide-react';

interface WelcomePageProps {
  onStart: () => void;
}

export const WelcomePage = ({ onStart }: WelcomePageProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="inline-flex items-center justify-center p-4 bg-primary text-primary-foreground rounded-3xl shadow-2xl mb-4">
            <LayoutGrid className="h-12 w-12" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground uppercase">
            CAL<span className="text-primary">HUB</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            The ultimate utility toolkit for India. Finance, Vehicle, and Land calculations made easy.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            { icon: IndianRupee, title: "Finance", desc: "Rate Converter & Interest Planner", color: "text-purple-500", bg: "bg-purple-500/10" },
            { icon: Navigation, title: "Vehicle", desc: "Fuel, Mileage & Travel Cost", color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: MapIcon, title: "Land", desc: "Indian Units & Costing", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-muted/50 border border-border/50 backdrop-blur-sm hover:border-primary/20 transition-colors duration-500 group">
              <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6"
        >
          <Button 
            size="lg" 
            onClick={onStart}
            className="h-16 px-12 text-xl font-black rounded-full shadow-2xl hover:scale-105 transition-transform duration-500 gap-3 group"
          >
            Get Started
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-500" />
          </Button>

          <div className="flex items-center justify-center gap-6 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest">Crafted by PATEL VAMSHIDHAR REDDY</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
