"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Shield, Zap, Cpu, Network, 
  Layers, Globe, CheckCircle2, 
  Activity, Info, Terminal, Search, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

const ProtocolExplorer = () => {
  const [activeTab, setActiveTab] = useState('intelligence');
  const [isHovering, setIsHovering] = useState(false);
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const layers = {
    intelligence: {
      title: 'AI Analytics',
      desc: 'Data processing and analysis pipelines powered by Gemini AI.',
      features: ['Automated data sync', 'Predictive outbreak forecasting', 'Multi-source correlation'],
      color: 'text-violet-500',
      bg: 'bg-violet-500/10'
    },
    distributed: {
      title: 'Distributed Network',
      desc: 'Structure of the health surveillance network across regions.',
      features: ['Regional data framework', 'Offline local caching', 'Background synchronization'],
      color: 'text-sky-400',
      bg: 'bg-sky-400/10'
    },
    security: {
      title: 'Security & Privacy',
      desc: 'A zero-trust architecture protecting every byte of health data.',
      features: ['End-to-end encryption', 'Data anonymization', 'Role-based access control'],
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  };

  const keys = Object.keys(layers);

  useEffect(() => {
    if (isHovering) {
      cycleIntervalRef.current = setInterval(() => {
        setActiveTab((prev) => {
          const currentIndex = keys.indexOf(prev);
          const nextIndex = (currentIndex + 1) % keys.length;
          return keys[nextIndex];
        });
      }, 3000);
    } else {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    }

    return () => {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    };
  }, [isHovering, keys]);

  return (
    <div 
      className="grid lg:grid-cols-12 gap-12 items-start py-12"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="lg:col-span-4 flex flex-col gap-4">
        {Object.entries(layers).map(([key, layer]) => (
          <button
            key={key}
            onMouseEnter={() => setActiveTab(key)}
            onClick={() => {
              setActiveTab(key);
              setIsHovering(false); // Disable auto-cycle on manual click
            }}
            className={`p-6 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden ${
              activeTab === key 
                ? 'bg-[var(--surface-1)] border-primary shadow-xl scale-105' 
                : 'border-transparent opacity-40 hover:opacity-100 hover:bg-[var(--surface-2)]'
            }`}
          >
            {activeTab === key && isHovering && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-primary/20"
              />
            )}
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl ${layer.bg} ${layer.color} flex items-center justify-center shrink-0`}>
                  {key === 'intelligence' && <Cpu className="w-6 h-6" />}
                  {key === 'distributed' && <Network className="w-6 h-6" />}
                  {key === 'security' && <Shield className="w-6 h-6" />}
               </div>
               <span className="font-bold tracking-tight text-sm">{layer.title}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="lg:col-span-8 p-10 md:p-16 bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl shadow-2xl relative overflow-hidden min-h-[450px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_50%)] opacity-5" />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 space-y-10"
          >
             <div className="space-y-4">
                <h3 className="text-3xl font-bold tracking-tight">{layers[activeTab as keyof typeof layers].title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">{layers[activeTab as keyof typeof layers].desc}</p>
             </div>
             
             <div className="flex flex-col gap-4">
                {layers[activeTab as keyof typeof layers].features.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)] hover:border-primary/30 transition-colors">
                     <CheckCircle2 className={`w-5 h-5 ${layers[activeTab as keyof typeof layers].color}`} />
                     <span className="font-bold text-sm tracking-tight">{f}</span>
                  </div>
                ))}
             </div>

             <div className="pt-10 border-t border-[var(--border-soft)] flex items-center justify-between">
                <div className="flex gap-2">
                   {[1, 2, 3].map(i => <div key={i} className={`w-2 h-2 rounded-full ${activeTab === keys[i-1] ? 'bg-primary' : 'bg-primary/20'}`} />)}
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Active</span>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function DocumentationPage() {
  return (
    <LandingLayout>
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.03] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-8 mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Terminal className="w-3.5 h-3.5" />
              Technical Documentation
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Platform <br />
              <span className="text-primary">& Standards</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
              A comprehensive overview of the HealthNex platform. Explore our core architecture, security standards, and operational guidelines.
            </p>
          </motion.div>

          <ProtocolExplorer />

          <div className="max-w-5xl mx-auto mt-24">
             <div className="grid md:grid-cols-2 gap-8">
                <div className="p-10 rounded-3xl bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-xl space-y-8">
                   <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Layers className="w-7 h-7" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-2xl font-bold tracking-tight">Deployment Guide</h3>
                      <p className="text-muted-foreground leading-relaxed">Guidelines for health organizations to set up regional visibility and coordinate rollout.</p>
                   </div>
                   <ul className="space-y-4">
                      {['Network coverage mapping', 'Organization verification', 'Field worker onboarding'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-sm font-bold opacity-80">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                           {item}
                        </li>
                      ))}
                   </ul>
                </div>

                <div className="p-10 rounded-3xl bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-xl space-y-8">
                   <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Globe className="w-7 h-7" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-2xl font-bold tracking-tight">Operational Alerts</h3>
                      <p className="text-muted-foreground leading-relaxed">Guidance for responding to predictive warnings and system-generated health anomalies.</p>
                   </div>
                   <ul className="space-y-4">
                      {['Regional alert thresholds', 'Priority triage guidelines', 'Verification workflows'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-sm font-bold opacity-80">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                           {item}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mt-32 p-12 md:p-20 rounded-3xl bg-[var(--surface-2)] border border-[var(--border-soft)] relative overflow-hidden text-center"
          >
             <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                   <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Need Assistance?</h2>
                   <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.3em]">Our team is ready to support your organization</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                   <Button asChild className="h-12 px-8 rounded-xl font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
                      <Link href="/help">Visit Help Center</Link>
                   </Button>
                </div>
             </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
