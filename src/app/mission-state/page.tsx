"use client";

import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Globe2, Users2, HeartPulse, Sparkles } from 'lucide-react';

export default function MissionStatePage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              Foundational Mission
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight uppercase leading-none">Standardizing Global <br /><span className="text-primary">Health Response</span></h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Standardizing the world's health response through unified intelligence and distributed collaboration. Our mission is to eliminate the latency between local health reporting and global action.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
               <h2 className="text-3xl font-bold uppercase tracking-tight border-l-4 border-primary pl-6">Our Vision</h2>
               <p className="text-muted-foreground leading-relaxed text-lg">
                  We believe that health data is a global common good. By building a zero-trust, high-fidelity intelligence protocol, we empower every regional health node to contribute to a unified global surveillance layer. 
               </p>
               <div className="space-y-4">
                  {[
                    { title: 'Global Transparency', icon: Globe2 },
                    { title: 'Decentralized Support', icon: Users2 },
                    { title: 'Medical-Grade Accuracy', icon: HeartPulse }
                  ].map(item => (
                    <div key={item.title} className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-soft)]">
                       <item.icon className="w-5 h-5 text-primary" />
                       <span className="text-xs font-bold uppercase tracking-widest">{item.title}</span>
                    </div>
                  ))}
               </div>
            </div>
            <div className="relative rounded-[3rem] overflow-hidden bg-primary/5 border border-primary/20 p-12 flex flex-col justify-center items-center text-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10" />
               <Sparkles className="w-20 h-20 text-primary mb-8 animate-pulse" />
               <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">Built for Humanity</h3>
               <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  HealthNex is more than a platform; it is a collaborative protocol designed to protect communities from the future of public health challenges.
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
