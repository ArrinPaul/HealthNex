"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Activity, Shield, BarChart3, Users, ArrowRight, CheckCircle2, 
  Brain, Database, Globe2, Zap, Clock, Menu, X, 
  ChevronDown, Server, Network, Lock, Droplet, Sparkles, 
  Search, Settings, Bell, Plus, MessageSquare, Layout, 
  FileText, Database as SqlIcon, Mail, Map as MapIcon, 
  Layers, Cpu, Radio, ChevronRight, Smartphone, Wifi, 
  ShieldCheck, Terminal, LineChart, Target, HeartPulse,
  Microscope, Stethoscope, Waves, DownloadCloud
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Logo from '@/components/layout/Logo';
import LandingLayout from '@/components/layout/LandingLayout';

// --- Sub-components ---

const Counter = ({ value, duration = 2 }: { value: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const numericMatch = value.match(/\d+/);
  const numericValue = numericMatch ? parseInt(numericMatch[0]) : 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    if (isInView && numericValue > 0) {
      let start = 0;
      const end = numericValue;
      const stepTime = Math.abs(Math.floor(duration * 1000 / end));
      const timer = setInterval(() => {
        start += Math.ceil(end / 50);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, stepTime || 20);
      return () => clearInterval(timer);
    }
  }, [isInView, numericValue, duration]);

  if (!numericValue || isNaN(numericValue)) {
    return <span>{value}</span>;
  }

  return (
    <span ref={ref}>
      {count > 0 ? count.toLocaleString() : '0'}{suffix}
    </span>
  );
};

const PipelineStage = ({ icon: Icon, title, desc, delay, children }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    viewport={{ once: true }}
    className="group relative flex flex-col p-10 bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-[2.5rem] shadow-[0_30px_70px_-50px_rgba(0,0,0,0.7)] hover:shadow-[0_40px_90px_-55px_rgba(0,0,0,0.8)] hover:border-primary/40 theme-transition overflow-hidden"
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] scale-[2]" />
    </div>

    <div className="relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-primary flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-10">{desc}</p>
      
      <div className="pt-8 border-t border-[var(--border-soft)]">
         {children}
      </div>
    </div>
  </motion.div>
);

const FeatureCard = ({ title, desc, icon: Icon, color, delay }: any) => {
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
      className="group relative p-8 md:p-10 lg:p-12 rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] border border-[var(--border-soft)] bg-[var(--surface-1)] shadow-[0_30px_70px_-50px_rgba(0,0,0,0.7)] hover:border-primary/50 transition-all duration-500 overflow-hidden flex flex-col text-left h-full"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(0, 217, 255, 0.08), transparent 80%)`,
        }}
      />
      
      <div className="relative z-10 w-full flex-1 flex flex-col">
        <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center mb-8 md:mb-10 bg-[var(--surface-2)] ${color} group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700 shadow-inner group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-500 group-hover:scale-110" />
        </div>

        <div className="space-y-3 md:space-y-4 mb-8">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight group-hover:text-primary transition-colors duration-500">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            {desc}
          </p>
        </div>
        
        <div className="mt-auto pt-6 md:pt-8 border-t border-[var(--border-soft)] w-full flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Protocol Active</span>
           <ArrowRight className="w-5 h-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
};

const InteractiveDashboardMockup = ({ stats }: { stats?: any }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mt-16 md:mt-24 max-w-6xl mx-auto bg-[var(--surface-1)] rounded-[3rem] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.75)] border border-[var(--border-soft)] overflow-hidden group/window"
    >
      <div className="bg-[var(--surface-2)]/80 h-14 border-b border-[var(--border-soft)] flex items-center px-8 justify-between shrink-0">
        <div className="flex gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] shadow-inner hover:opacity-80 transition-opacity cursor-pointer" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] shadow-inner hover:opacity-80 transition-opacity cursor-pointer" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] shadow-inner hover:opacity-80 transition-opacity cursor-pointer" />
        </div>
        <div className="flex items-center gap-3 bg-[var(--surface-1)] px-6 py-2 rounded-xl border border-[var(--border-soft)] shadow-sm">
           <Search className="w-3 h-3 text-muted-foreground" />
           <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest min-w-[150px]">
             portal.healthnex.io
           </div>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex flex-col md:flex-row min-h-[750px] md:h-[800px]">
        <div className="hidden md:flex flex-col w-72 border-r border-[var(--border-soft)] bg-[var(--surface-2)]/50 p-8 gap-10">
           <Logo size="sm" />
           <div className="space-y-6">
              {[LineChart, Globe2, Brain, Waves, Bell].map((Icon, i) => (
                 <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${i === 0 ? 'bg-[var(--surface-1)] shadow-sm border border-[var(--border-soft)] text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                   <Icon className="w-5 h-5" />
                   <div className={`h-2 rounded-full bg-current opacity-20 ${i === 0 ? 'w-28' : 'w-20'}`} />
                </div>
              ))}
           </div>
              <div className="mt-auto p-6 rounded-[2rem] bg-primary/10 border border-primary/20 relative overflow-hidden group/ad">
              <Sparkles className="w-10 h-10 text-primary/30 absolute -right-2 -top-2" />
              <div className="h-2 w-20 bg-primary/40 rounded-full mb-3" />
              <div className="h-1.5 w-full bg-primary/20 rounded-full mb-2" />
              <div className="h-1.5 w-3/4 bg-primary/20 rounded-full" />
           </div>
        </div>

            <div className="flex-1 p-10 bg-[var(--surface-1)] overflow-hidden">
           <div className="flex justify-between items-center mb-12">
              <div className="space-y-1">
                 <h4 className="text-2xl font-bold tracking-tight">System Core</h4>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Real-time Synchronization Active
                 </div>
              </div>
              <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer shadow-sm">
                    <Settings className="w-5 h-5" />
                 </div>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)] flex items-center justify-center relative text-muted-foreground hover:text-primary transition-colors cursor-pointer shadow-sm">
                    <Bell className="w-5 h-5" />
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[var(--surface-1)]" />
                 </div>
              </div>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div whileHover={{ y: -8 }} className="p-8 rounded-[2rem] bg-[var(--surface-2)] border border-[var(--border-soft)] shadow-sm group/widget theme-transition">
                 <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                       <Users className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-bold">{stats?.activeUsers?.toLocaleString() ?? '0'}</div>
                       <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Users</div>
                    </div>
                 </div>
                 <div className="h-16 flex items-end gap-1.5 px-1">
                    {[40, 60, 45, 80, 50, 95, 70, 85].map((h, i) => (
                      <motion.div key={i} animate={{ height: `${h}%` }} className="flex-1 bg-primary/20 rounded-t-lg group-hover/widget:bg-primary/40 transition-colors" />
                    ))}
                 </div>
              </motion.div>

              <motion.div whileHover={{ y: -8 }} className="p-8 rounded-[2rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20 group/widget overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
                 <Shield className="w-24 h-24 absolute -right-4 -bottom-4 text-white/10" />
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Verified</span>
                 </div>
                 <h5 className="text-2xl font-bold tracking-tight relative z-10">Core Integrity</h5>
                 <p className="text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">100% Operational</p>
              </motion.div>

              <motion.div whileHover={{ y: -8 }} className="p-8 rounded-[2rem] bg-[var(--surface-2)] border border-[var(--border-soft)] shadow-sm group/widget theme-transition">
                 <div className="flex items-center gap-5 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                       <Brain className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="text-xl font-bold">{stats?.dataNodes?.toLocaleString() ?? '0'}</div>
                       <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Health Nodes</div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-full bg-[var(--surface-1)] border border-[var(--border-soft)]" />
                         <div className="flex-1 h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                            <motion.div animate={{ width: i === 1 ? '70%' : '40%' }} className="h-full bg-violet-500/40" />
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>

                  <div className="lg:col-span-3 p-10 rounded-[2.5rem] bg-[var(--surface-2)] border border-[var(--border-soft)] relative overflow-hidden group/chart theme-transition">
                 <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                       <h5 className="text-xl font-bold tracking-tight">Regional Trend Analysis</h5>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Live Synchronization Analysis</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-soft)] text-[10px] font-bold uppercase shadow-sm">Weekly</div>
                       <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase shadow-md shadow-primary/20">Real-time</div>
                    </div>
                 </div>
                 <div className="h-40 flex items-end gap-3 px-2 relative z-10">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <motion.div 
                        key={i} 
                        animate={{ height: `${20 + Math.random() * 80}%` }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror', delay: i * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-primary/10 via-primary/50 to-primary rounded-t-lg shadow-[0_0_10px_rgba(2,132,199,0.1)]"
                      />
                    ))}
                 </div>
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:30px_30px]" />
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const ModuleShowcase = () => {
  const [active, setActive] = useState(0);
  
  const modules = [
    { 
      id: 0, 
      title: 'Surveillance Hub', 
      tag: 'Live Monitoring',
      icon: LineChart, 
      color: 'text-sky-400', 
      href: '/surveillance',
      desc: 'Centralized command center for real-time regional health tracking and community reports.',
      features: ['Automated Anomaly Detection', 'Geospatial Heatmaps', 'Node Health Audits']
    },
    { 
      id: 1, 
      title: 'Neural Engine', 
      tag: 'Predictive AI',
      icon: Target, 
      color: 'text-violet-400', 
      href: '/neural-engine',
      desc: 'Gemini-powered processing to identify emerging health trends and analyze reported symptoms.',
      features: ['Symptom Analysis', 'Risk Factor Correlation', 'Trend Projections']
    },
    { 
      id: 2, 
      title: 'Response Network', 
      tag: 'Collaborative',
      icon: Stethoscope, 
      color: 'text-emerald-400', 
      href: '/organization',
      desc: 'Bridging the gap between community reporting and professional health organization response.',
      features: ['Verified Field Reports', 'Regional Alert Broadcasts', 'Water Quality Tracking']
    }
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-16 py-20 items-center">
      <div className="lg:col-span-5 space-y-6">
        {modules.map((m, i) => (
          <Link key={m.id} href={m.href}>
            <motion.div 
              onMouseEnter={() => setActive(i)}
              whileHover={{ x: 10 }}
              className={`cursor-pointer p-10 rounded-[3rem] border transition-all duration-500 mb-6 ${
                active === i 
                  ? 'bg-[var(--surface-1)] border-primary shadow-2xl shadow-primary/10 scale-105' 
                  : 'border-transparent opacity-40 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-8">
                <div className={`w-20 h-20 shrink-0 rounded-[1.5rem] bg-[var(--surface-2)] flex items-center justify-center ${active === i ? m.color : 'text-muted-foreground'} shadow-sm`}>
                  <m.icon className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-2xl tracking-tight">{m.title}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-[var(--surface-2)] ${active === i ? m.color : 'text-muted-foreground'}`}>{m.tag}</span>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="lg:col-span-7 relative bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-[4rem] overflow-hidden shadow-2xl group/preview flex flex-col min-h-[700px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="w-full flex-1 p-12 md:p-16 lg:p-20 flex flex-col justify-start bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_50%)] bg-opacity-5"
          >
             <div className="mb-12">
                <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.4em] mb-4">
                   <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                   {modules[active].title} Interface
                </div>
                <h4 className="text-3xl font-bold tracking-tight mb-4">Unified Visualization</h4>
                <p className="text-muted-foreground leading-relaxed max-w-md text-sm md:text-base">Real-time simulation of the {modules[active].title} control layer, optimized for regional visibility.</p>
             </div>
             
             <div className="grid gap-5 md:gap-6">
               {modules[active].features.map((f, i) => (
                 <motion.div 
                   key={f}
                   initial={{ opacity: 0, x: -30 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.2 + i * 0.1 }}
                   className="flex items-center justify-between p-6 md:p-8 rounded-[2rem] bg-[var(--surface-2)]/60 border border-[var(--border-soft)] backdrop-blur-sm group-hover/preview:border-primary/30 transition-colors shadow-sm"
                 >
                   <div className="flex items-center gap-6 md:gap-8">
                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[var(--surface-1)] flex items-center justify-center text-primary shadow-sm shrink-0">
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <span className="font-bold tracking-tight text-base md:text-lg">{f}</span>
                   </div>
                   <div className="flex gap-1.5 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_var(--emerald-500)]" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-30 shadow-[0_0_5px_var(--emerald-500)]" />
                   </div>
                 </motion.div>
               ))}
             </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const LegacyToolCollision = () => {
  const legacyTools = [
    { name: 'Paper Logs', icon: FileText, delay: 0 },
    { name: 'Siloed Database', icon: SqlIcon, delay: 0.5 },
    { name: 'Manual Alerts', icon: Mail, delay: 1 },
    { name: 'Static Reports', icon: MapIcon, delay: 1.5 },
    { name: 'Form Stacks', icon: Layers, delay: 2 }
  ];

  return (
    <div className="py-32 relative overflow-hidden">
      <div className="text-center mb-32">
         <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.5em] mb-6">
            <Zap className="w-4 h-4" />
            Consolidation
         </div>
         <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-8 text-balance leading-none">Evolve beyond <br />the chaos.</h2>
         <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">Regional health data is often scattered across legacy silos. HealthNex unifies these reports into a single, synchronized intelligence protocol.</p>
      </div>

      <div className="relative h-[550px] flex items-center justify-center">
        <div className="relative z-20 transition-transform hover:scale-110 duration-700 cursor-pointer">
          <Logo iconOnly size="xl" />
          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 border-4 border-primary/30 rounded-[4rem]" />
        </div>

        {legacyTools.map((tool, i) => (
          <motion.div
            key={tool.name}
            animate={{ 
              x: [Math.cos(i * (360/5) * (Math.PI/180)) * 500, 0],
              y: [Math.sin(i * (360/5) * (Math.PI/180)) * 500, 0],
              opacity: [0, 1, 0],
              scale: [0.6, 1.1, 0.7]
            }}
            transition={{ duration: 7, repeat: Infinity, delay: tool.delay, ease: "circIn" }}
            className="absolute z-10 p-8 rounded-[2rem] bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-2xl flex flex-col items-center gap-4 opacity-0"
          >
            <tool.icon className="w-12 h-12 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tool.name}</span>
          </motion.div>
        ))}

        {[1, 2, 3].map(i => (
          <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 6, opacity: [0, 0.08, 0] }} transition={{ duration: 5, repeat: Infinity, delay: i * 1.5 }} className="absolute inset-0 border-2 border-primary/20 rounded-full" />
        ))}
      </div>
    </div>
  );
};

const ComparisonSection = () => (
  <section className="py-20">
    <div className="max-w-4xl mx-auto bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-[3rem] overflow-hidden shadow-2xl">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-[var(--surface-2)]/70 border-b border-[var(--border-soft)] text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <th className="p-8 w-1/3 text-left">Protocol Metric</th>
            <th className="p-8 w-1/3 text-left">Legacy Systems</th>
            <th className="p-8 w-1/3 text-right text-primary">HealthNex Protocol</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[
            { label: 'Alert Latency', legacy: 'Delayed', next: 'Real-time' },
            { label: 'Data Synchronization', legacy: 'Manual Entry', next: 'Convex Sync' },
            { label: 'Community Feedback', legacy: 'Limited', next: 'Distributed' },
            { label: 'System Uptime', legacy: 'Variable', next: 'High-Availability' },
            { label: 'Reporting Model', legacy: 'Reactive', next: 'Proactive' },
          ].map((row, i) => (
            <motion.tr 
              key={row.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="hover:bg-[var(--surface-2)]/60 transition-all group cursor-default"
            >
              <td className="p-8">
                <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{row.label}</span>
              </td>
              <td className="p-8">
                <span className="text-sm font-medium opacity-30 line-through decoration-[var(--text-subtle)]">{row.legacy}</span>
              </td>
              <td className="p-8 text-right">
                <div className="inline-flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_var(--primary)]" />
                   <span className="text-lg font-bold text-primary tracking-tight">
                     {row.next}
                   </span>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/60 py-10">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left group">
        <span className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{question}</span>
        <div className={`w-12 h-12 rounded-full border border-border flex items-center justify-center transition-all ${isOpen ? 'bg-primary border-primary text-white rotate-180 shadow-lg shadow-primary/20' : 'group-hover:border-primary group-hover:text-primary'}`}>
           <ChevronDown className="w-6 h-6" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pt-8 text-lg text-muted-foreground leading-relaxed max-w-4xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page ---

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const statsData = useQuery(api.stats.getLandingPageStats);
  
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  if (!mounted) return <div className="min-h-screen bg-background" />;

  const features = [
    { title: "Real-time Surveillance", desc: "Monitor regional health data instantly with low-latency synchronization for anomaly detection.", icon: Activity, color: "text-sky-400" },
    { title: "Gemini AI Insights", desc: "Utilize advanced AI to analyze symptom reports and identify regional health trends.", icon: Brain, color: "text-violet-400" },
    { title: "Community Reporting", desc: "Enable verified reporting to empower local communities as first responders.", icon: Users, color: "text-emerald-400" },
    { title: "Water Quality Tracking", desc: "Monitor water source quality data to help prevent waterborne disease spread.", icon: Waves, color: "text-cyan-400" },
    { title: "Secure Data Management", desc: "Role-based access and secure data synchronization for regional health telemetry.", icon: ShieldCheck, color: "text-muted-foreground" },
    { title: "Interactive Analytics", desc: "Rich visualizations that transform complex community data into actionable intelligence.", icon: BarChart3, color: "text-amber-400" }
  ];

  return (
    <LandingLayout>
      <section className="pt-24 pb-20 md:pb-32 bg-[var(--surface-2)]/70 border-b border-[var(--border-soft)] relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-12">
              <Zap className="w-3.5 h-3.5" />
              <span>Next Generation Intelligence Protocol</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-12 text-foreground leading-[0.8]">
              Predict. Protect. <br />
              <span className="text-primary">Redefine.</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed font-medium text-balance">
              Distributed surveillance and predictive intelligence built for the future of public health. Safeguard communities with real-time analysis and neural foresight.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Button onClick={() => router.push('/register')} className="h-20 px-16 text-xl rounded-[2rem] font-bold bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Get Started Free
              </Button>
              <Button asChild variant="ghost" className="h-20 px-12 text-xl font-bold group rounded-[2rem]">
                <Link href="/documentation" className="flex items-center gap-3">
                  View Docs <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>
          <InteractiveDashboardMockup stats={statsData} />
        </div>
      </section>

      <section id="how-it-works" className="py-32 md:py-48 bg-background border-b border-border relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-32 text-center">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 text-balance">The Intelligence Pipeline</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">A high-fidelity telemetry stream, processed through Gemini AI for regional actionability.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-12 relative text-left">
            <PipelineStage icon={DownloadCloud} title="Data Ingestion" desc="Real-time ingestion of reports and telemetry via Convex synchronization." delay={0}>
              <div className="grid grid-cols-3 gap-4">
                 {[Smartphone, Wifi, Database].map((I, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)] shadow-sm group-hover:bg-[var(--surface-1)] transition-colors">
                      <I className="w-5 h-5 text-primary" />
                      <span className="text-[8px] font-bold uppercase opacity-60">Node {idx+1}</span>
                   </div>
                 ))}
              </div>
            </PipelineStage>
            <PipelineStage icon={Brain} title="Neural Analysis" desc="Gemini-powered models identify regional anomalies and analyze symptom clusters." delay={0.2}>
              <div className="space-y-5">
                 <div className="flex items-center justify-between text-[10px] font-bold text-primary tracking-widest">
                    <span>PROCESSING_DATA...</span>
                    <span>AI ANALYZING</span>
                 </div>
                 <div className="h-2 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <motion.div animate={{ width: ['20%', '85%', '60%', '95%', '40%'] }} transition={{ duration: 10, repeat: Infinity }} className="h-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                 </div>
                 <div className="flex gap-3">
                   <div className="h-7 w-1/2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-soft)] flex items-center justify-center shadow-sm">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_5px_var(--emerald-500)]" />
                       <span className="text-[9px] font-bold uppercase opacity-60">Neural</span>
                    </div>
                   <div className="h-7 w-1/2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-soft)] flex items-center justify-center shadow-sm">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 shadow-[0_0_5px_var(--primary)]" />
                       <span className="text-[9px] font-bold uppercase opacity-60">Heuristic</span>
                    </div>
                 </div>
              </div>
            </PipelineStage>
            <PipelineStage icon={ShieldCheck} title="Alert Broadcast" desc="Automated broadcasting of high-priority alerts to verified health leads." delay={0.4}>
              <div className="space-y-4">
                 {[ { label: "Secure Sync", icon: Lock }, { label: "Broadcast", icon: Radio }, { label: "Verification", icon: Target } ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)]/60 shadow-sm">
                      <item.icon className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                   </div>
                 ))}
              </div>
            </PipelineStage>
          </div>
        </div>
      </section>

          <section id="modules" className="py-32 border-t border-border bg-[var(--surface-2)]/40">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-24 leading-none uppercase">Engineered for <br /><span className="text-muted-foreground">regional visibility.</span></h2>
          <ModuleShowcase />
        </div>
      </section>

      <section id="features" className="py-32 bg-background border-b border-border overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-32">
            <div className="inline-flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.5em] mb-8">
              <Sparkles className="w-4 h-4" />
              Feature Protocol
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-none uppercase">Stay ahead of <br /><span className="text-primary">the curve.</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, i) => <FeatureCard key={i} {...feature} delay={i * 0.1} />)}
          </div>
        </div>
      </section>


      <section id="performance" className="py-32 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-32">
            <div className="text-primary font-bold uppercase tracking-[0.5em] text-[10px] mb-8 text-balance">Operational Benchmark</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none uppercase">Superior by design.</h2>
          </div>
          <ComparisonSection />
        </div>
      </section>

      <section id="faq" className="py-32 bg-[var(--surface-2)]/70">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-20 text-center">
            <div className="text-primary font-bold text-xs uppercase tracking-[0.5em] mb-6">Support Protocol</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase leading-none">Common Inquiries.</h2>
          </div>
          <div className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-[3rem] p-10 md:p-14 shadow-xl shadow-black/10">
            <FAQItem question="How does HealthNex identify disease clusters?" answer="Our intelligence engine utilizes Gemini AI to analyze community symptom reports and correlate them with regional data, helping identify potential clusters in real-time." />
            <FAQItem question="Is medical data synchronized securely?" answer="Yes. We implement secure synchronization protocols where all reports are transmitted through encrypted channels to our distributed Convex backend." />
            <FAQItem question="Can local health workers use this offline?" answer="Yes. HealthNex is built as a PWA with intelligent caching. It maintains a local data cache and synchronizes telemetry as soon as a secure connection is established." />
            <FAQItem question="How do I report health issues?" answer="Authorized users and community members can submit verified reports through the Community Reporting interface, providing critical ground-level data to the protocol." />
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
