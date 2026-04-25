import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, BookOpen, Ruler, Map as MapIcon, Landmark, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const TERMS = [
  {
    title: 'Acre',
    icon: MapIcon,
    desc: 'A large unit of land measurement. 1 Acre is equal to 43,560 square feet or 4,047 square meters.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Gunta',
    icon: Ruler,
    desc: 'A unit commonly used in South India (especially Karnataka, Telangana, and Andhra Pradesh). 1 Gunta = 1,089 sq ft.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'Cent',
    icon: Ruler,
    desc: 'A small plot unit common in South India. 1 Cent = 435.6 square feet.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    title: 'Plot Area',
    icon: MapIcon,
    desc: 'The total area of the land plot as per the legal documents.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    title: 'Built-up Area',
    icon: Landmark,
    desc: 'The total area covered by the building, including the thickness of inner and outer walls.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    title: 'Carpet Area',
    icon: BookOpen,
    desc: 'The actual usable space inside the walls of a house. Think of it as the area where you can spread a carpet.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    title: 'Super Built-up Area',
    icon: Landmark,
    desc: 'Includes the built-up area plus common areas like lobbies, lifts, stairs, and clubhouse facilities.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    title: 'Stamp Duty',
    icon: ShieldCheck,
    desc: 'A government tax paid during the purchase of a property to legalize the transaction.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    title: 'Registration Charges',
    icon: ShieldCheck,
    desc: 'The fee paid to the government to register the property in the new owner\'s name.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

export const LandTerminology = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
          Land <span className="text-primary">Terminology</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-base">
          Understand common units and legal terms used in Indian real estate
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TERMS.map((term, i) => (
          <motion.div
            key={term.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -8 }}
          >
            <Card className="h-full border-2 hover:border-primary/30 transition-all hover:shadow-2xl group rounded-[2rem] bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3 pt-6 px-6">
                <div className={`w-12 h-12 rounded-2xl ${term.bg} ${term.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-inner`}>
                  <term.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-black tracking-tight text-gray-900 dark:text-white">{term.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {term.desc}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-primary/5 border-2 border-primary/10 overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl shrink-0">
            <Info className="h-6 w-6" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Expert Tip for Buyers</h3>
            <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Always verify the <span className="font-bold text-foreground">RERA registration</span> of a project and check the <span className="font-bold text-foreground">Encumbrance Certificate (EC)</span> of the land to ensure a clear title and legal ownership.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
