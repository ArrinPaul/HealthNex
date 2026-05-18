"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { LineChart, Shield, Zap, Search, Activity, Globe, Satellite, BarChart3, ArrowRight, ShieldAlert, Radar, Network } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useState, useEffect } from 'react';

const SurveillanceCard = ({ title, desc, icon: Icon, delay }: any) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      className="group relative p-10 rounded-[3rem] border border-[var(--border-soft)] bg-[var(--surface-1)] shadow-xl hover:border-primary/40 transition-all duration-500 overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(0, 217, 255, 0.05), transparent 80%)`,
        }}
      />
      
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-primary flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-8">{desc}</p>
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span>Initialize Protocol</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};

const LiveNodeNetwork = () => {
  const [activeNodes, setActiveNodes] = useState<any[]>([]);

  useEffect(() => {
    const generateNode = () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      opacity: 0.1 + Math.random() * 0.5
    });

    setActiveNodes(Array.from({ length: 40 }, generateNode));
    
    const interval = setInterval(() => {
      setActiveNodes(prev => {
        const next = [...prev];
        const indexToUpdate = Math.floor(Math.random() * next.length);
        next[indexToUpdate] = { ...next[indexToUpdate], opacity: 0.8 };
        setTimeout(() => {
          setActiveNodes(p => p.map(n => n.id === next[indexToUpdate].id ? { ...n, opacity: 0.2 } : n));
        }, 1000);
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] bg-slate-950/90 dark:bg-black/40 rounded-[3rem] border border-white/10 dark:border-white/5 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_80%)] opacity-15 dark:opacity-10" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      {/* Grid scanning effect */}
      <motion.div 
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-sm z-10"
      />

      <div className="relative w-full h-full p-12">
        {activeNodes.map(node => (
          <motion.div
            key={node.id}
            animate={{ opacity: node.opacity, scale: node.opacity > 0.5 ? 1.5 : 1 }}
            className="absolute rounded-full bg-primary shadow-[0_0_15px_var(--primary)]"
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`, 
              width: node.size, 
              height: node.size 
            }}
          />
        ))}

        {/* Floating UI HUD elements */}
        <div className="absolute bottom-10 left-10 space-y-2 p-6 bg-slate-900/80 dark:bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">
           <div className="flex items-center gap-3 text-[10px] font-bold text-primary uppercase tracking-widest">
              <Radar className="w-3 h-3 animate-spin" />
              <span>Scanning Regional Nodes...</span>
           </div>
           <div className="flex gap-4">
              <div className="space-y-1">
                 <div className="text-xl font-bold text-white tracking-tighter">12.8k</div>
                 <div className="text-[8px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Verified Units</div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="space-y-1">
                 <div className="text-xl font-bold text-emerald-400 tracking-tighter">99.9%</div>
                 <div className="text-[8px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Sync Integrity</div>
              </div>
           </div>
        </div>

        <div className="absolute top-10 right-10 flex flex-col gap-3">
           {[1, 2, 3].map(i => (
             <motion.div 
               key={i}
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: i * 0.2 }}
               className="p-3 bg-primary/20 dark:bg-primary/10 border border-primary/30 dark:border-primary/20 backdrop-blur-md rounded-xl flex items-center gap-3"
             >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="h-1 w-20 bg-primary/30 dark:bg-primary/20 rounded-full overflow-hidden">
                   <motion.div animate={{ width: ['20%', '90%', '40%'] }} transition={{ duration: 3, repeat: Infinity }} className="h-full bg-primary shadow-[0_0_5px_var(--primary)]" />
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default function SurveillancePage() {
  const stats = useQuery(api.stats.getLandingPageStats);

  return (
    <LandingLayout>
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.03] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-8 mb-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5" />
              Intelligence Layer
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              Global Surveillance <br />
              <span className="text-primary">Hub Protocol</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl mx-auto">
              Real-time telemetry and regional health monitoring. HealthNex aggregates community reports and medical data to provide instant visibility into emerging public health trends.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
             <div className="space-y-12 order-2 lg:order-1">
                <div className="space-y-4">
                   <h2 className="text-4xl font-bold uppercase tracking-tight">Active Visibility</h2>
                   <p className="text-muted-foreground text-lg leading-relaxed">Our protocol establishes a high-fidelity surveillance layer across every regional node, ensuring no anomaly goes undetected.</p>
                </div>
                <div className="grid gap-6">
                   {[
                     { title: 'Ground Intelligence', icon: Network, desc: 'Decentralized reports from verified community nodes.' },
                     { title: 'Protocol Integrity', icon: Shield, desc: 'End-to-end encrypted health data synchronization.' },
                     { title: 'Anomaly Alerts', icon: ShieldAlert, desc: 'Real-time broadcasting of detected health risks.' }
                   ].map((item, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="flex items-center gap-6 p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-sm hover:border-primary/40 transition-colors group"
                     >
                        <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                           <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="font-bold uppercase tracking-widest text-sm">{item.title}</h4>
                           <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                     </motion.div>
                   ))}
                </div>
             </div>
             <div className="order-1 lg:order-2">
                <LiveNodeNetwork />
             </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            <SurveillanceCard 
              title="Community Reporting" 
              desc="Verified decentralized reporting allowing community members to act as first responders and provide ground-level health intelligence."
              icon={Search}
              delay={0}
            />
            <SurveillanceCard 
              title="Trend Analysis" 
              desc="Identification of reporting patterns to visualize potential health anomalies across different regional demographics."
              icon={Zap}
              delay={0.1}
            />
            <SurveillanceCard 
              title="Geospatial Insights" 
              desc="Visualization of health data mapped against regional locations to identify distribution patterns and alert requirements."
              icon={Globe}
              delay={0.2}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-12 md:p-20 rounded-[4rem] bg-[var(--surface-2)] border border-[var(--border-soft)] relative overflow-hidden text-center group"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative z-10 space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-bold uppercase tracking-tight">Protocol Status: <span className="text-emerald-500">Active</span></h2>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.4em]">Real-time Telemetry Synchronization</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto">
                  {[
                    { label: 'Intelligence Latency', value: stats?.latency ?? '...', icon: Activity },
                    { label: 'Community Reports', value: stats?.communityReports ?? 0, icon: BarChart3 }
                  ].map((stat, i) => (
                    <div key={stat.label} className="space-y-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-background border border-[var(--border-soft)] flex items-center justify-center mx-auto text-primary shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <stat.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-4xl font-bold">{stat.value}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
