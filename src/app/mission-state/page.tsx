"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion } from 'framer-motion';
import { Globe2, Users2, HeartPulse, Sparkles, Target, Zap, Shield } from 'lucide-react';

export default function MissionStatePage() {
  return (
    <LandingLayout>
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.03] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto text-center space-y-12 mb-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Foundational Mission
            </div>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.85]">
              Standardizing Global <br />
              <span className="text-primary">Health Response</span>
            </h1>
            <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-medium">
              Eliminating the latency between local health reporting and global action through unified intelligence and distributed collaboration.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-24 items-center mb-48">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
               <div className="space-y-6">
                  <h2 className="text-4xl font-bold uppercase tracking-tight border-l-4 border-primary pl-8">Our Vision</h2>
                  <p className="text-muted-foreground leading-relaxed text-xl">
                    We believe that health data is a global common good. By building a zero-trust, high-fidelity intelligence protocol, we empower every regional health node to contribute to a unified global surveillance layer. 
                  </p>
               </div>
               
               <div className="grid gap-6">
                  {[
                    { title: 'Global Transparency', icon: Globe2, desc: 'Real-time visibility into health trends across borders.' },
                    { title: 'Decentralized Support', icon: Users2, desc: 'Empowering local communities as first responders.' },
                    { title: 'Medical-Grade Accuracy', icon: HeartPulse, desc: 'Uncompromising precision in threat detection.' }
                  ].map((item, i) => (
                    <div key={item.title} className="flex items-center gap-6 p-6 rounded-[2rem] bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-sm hover:border-primary/40 transition-colors group">
                       <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <item.icon className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-bold uppercase tracking-widest text-sm">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[4rem] overflow-hidden bg-primary/5 border border-primary/20 p-16 flex flex-col justify-center items-center text-center group"
            >
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10 group-hover:opacity-20 transition-opacity" />
               <div className="relative z-10 space-y-8">
                  <div className="relative">
                    <Sparkles className="w-24 h-24 text-primary mx-auto animate-pulse" />
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }} 
                      transition={{ duration: 4, repeat: Infinity }} 
                      className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" 
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold uppercase tracking-tight">Built for Humanity</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                      HealthNex is more than a platform; it is a collaborative protocol designed to protect communities from the future of public health challenges.
                    </p>
                  </div>
               </div>
            </motion.div>
          </div>

          <div className="text-center space-y-24">
             <div className="space-y-4">
                <h2 className="text-4xl font-bold uppercase tracking-tight">Our Core Values</h2>
                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.4em]">The pillars of the HealthNex Protocol</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-12">
                {[
                  { title: 'Integrity', icon: Shield, desc: 'Upholding the highest standards of data privacy and security.' },
                  { title: 'Agility', icon: Zap, desc: 'Responding to emerging threats with sub-second latency.' },
                  { title: 'Precision', icon: Target, desc: 'Leveraging advanced AI for unmatched predictive foresight.' }
                ].map((value, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="space-y-6 p-10 rounded-[3rem] bg-[var(--surface-1)] border border-[var(--border-soft)] hover:border-primary/40 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center mx-auto text-primary">
                      <value.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-bold uppercase tracking-tight">{value.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
