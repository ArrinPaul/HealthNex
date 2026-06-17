"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Target, Sparkles, ArrowRight, Activity } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useState, useEffect, useRef } from 'react';

const NeuralCard = ({ title, desc, icon: Icon, color, bg, delay }: any) => {
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
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      className="group relative p-8 rounded-3xl border border-border bg-card hover:border-violet-500/40 transition-all duration-300 overflow-hidden h-full"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.08), transparent 80%)`,
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{desc}</p>
        <div className="flex items-center gap-2 text-violet-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Learn more</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
};

const SynapseProcessor = () => {
  const [synapses, setSynapses] = useState<any[]>([]);
  const synapsesRef = useRef(synapses);
  synapsesRef.current = synapses;

  useEffect(() => {
    const interval = setInterval(() => {
      setSynapses(prev => {
        const next = prev.length > 10 ? prev.slice(1) : prev;
        return [...next, {
          id: Math.random(),
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
        }];
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square bg-card rounded-3xl border border-border overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
      
      <motion.div 
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="relative z-10"
      >
        <Brain className="w-32 h-32 text-violet-500/20" />
        
        <AnimatePresence>
          {synapses.map(s => (
            <motion.div
              key={s.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: [0, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute w-3 h-3 rounded-full bg-violet-500/40 blur-sm"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default function NeuralEnginePage() {
  const stats = useQuery(api.stats.getLandingPageStats);

  return (
    <LandingLayout>
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-6 mb-24"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium">
              <Brain className="w-3.5 h-3.5" />
              AI-Powered Analysis
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              AI Health <br />
              <span className="text-violet-500">Insights</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              Analyze community health reports with AI to identify trends, clusters, and potential outbreaks.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
             <SynapseProcessor />
             <div className="space-y-8">
                <div className="space-y-3">
                   <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
                   <p className="text-muted-foreground leading-relaxed">Our AI processes community reports to identify patterns and provide actionable insights for health workers.</p>
                </div>
                <div className="grid gap-3">
                   {[
                     { label: 'Accuracy', value: stats?.accuracy ? `${stats.accuracy}%` : '...', icon: Target },
                     { label: 'Processing Speed', value: stats?.latency ?? '...', icon: Activity },
                     { label: 'Reports Analyzed', value: '12,847', icon: Activity }
                   ].map((item, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, y: 10 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="p-4 rounded-xl bg-card border border-border flex items-center justify-between hover:border-violet-500/40 transition-colors"
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                              <item.icon className="w-4 h-4" />
                           </div>
                           <span className="text-sm text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="text-lg font-bold text-violet-500">{item.value}</span>
                     </motion.div>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-24">
            {[
              { 
                title: 'Symptom Analysis', 
                desc: 'Analyze reported symptoms to identify regional clusters and potential health concerns.', 
                icon: Target, 
                color: 'text-rose-500', 
                bg: 'bg-rose-500/10',
                delay: 0
              },
              { 
                title: 'Data Correlation', 
                desc: 'Cross-reference community reports with historical health data for context.', 
                icon: Cpu, 
                color: 'text-violet-500', 
                bg: 'bg-violet-500/10',
                delay: 0.1
              },
              { 
                title: 'Trend Detection', 
                desc: 'Identify emerging health trends before they become widespread issues.', 
                icon: Sparkles, 
                color: 'text-amber-500', 
                bg: 'bg-amber-500/10',
                delay: 0.2
              }
            ].map((feature, i) => (
              <NeuralCard key={i} {...feature} />
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
