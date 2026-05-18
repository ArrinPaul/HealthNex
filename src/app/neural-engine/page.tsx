"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Target, Sparkles, Network, Zap, ArrowRight, Microscope, Fingerprint, Activity } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useState, useEffect } from 'react';

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
      transition={{ delay, duration: 0.8 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      className="group relative p-10 rounded-[3rem] border border-[var(--border-soft)] bg-[var(--surface-1)] shadow-xl hover:border-violet-500/40 transition-all duration-500 overflow-hidden h-full"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.08), transparent 80%)`,
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className={`w-16 h-16 rounded-2xl ${bg} ${color} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white transition-all duration-500 shadow-sm`}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-8 flex-1">{desc}</p>
        <div className="flex items-center gap-2 text-violet-500 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span>Analyze Protocol</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};

const SynapseProcessor = () => {
  const [synapses, setSynapses] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (synapses.length > 15) {
        setSynapses(prev => prev.slice(1));
      }
      setSynapses(prev => [...prev, {
        id: Math.random(),
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        delay: Math.random() * 2
      }]);
    }, 400);
    return () => clearInterval(interval);
  }, [synapses]);

  return (
    <div className="relative w-full aspect-square bg-[var(--surface-1)] rounded-[3rem] border border-[var(--border-soft)] shadow-2xl overflow-hidden flex items-center justify-center group/brain">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="relative z-10"
      >
        <Brain className="w-48 h-48 text-violet-500/20 group-hover:text-violet-500/40 transition-colors duration-700" />
        
        {/* Interactive synapse pulses */}
        <AnimatePresence>
          {synapses.map(s => (
            <motion.div
              key={s.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: [0, 0.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute w-4 h-4 rounded-full bg-violet-500/40 blur-sm"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Floating HUD status */}
      <div className="absolute top-8 left-8 p-4 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl">
         <div className="flex items-center gap-2 mb-2">
            <Fingerprint className="w-3 h-3 text-violet-500" />
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Neural Identity</span>
         </div>
         <div className="font-mono text-[10px] text-violet-300">GHN-NODE-0012-AX</div>
      </div>

      <div className="absolute bottom-8 right-8 flex flex-col gap-2">
         {[1, 2, 3].map(i => (
           <div key={i} className="h-1 w-12 bg-violet-500/20 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '100%'] }} 
                transition={{ duration: 2 + i, repeat: Infinity, ease: 'linear' }}
                className="h-full w-1/2 bg-violet-500" 
              />
           </div>
         ))}
      </div>
    </div>
  );
};

export default function NeuralEnginePage() {
  const stats = useQuery(api.stats.getLandingPageStats);

  return (
    <LandingLayout>
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.05)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.05)_0%,transparent_50%)] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-8 mb-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-[10px] font-bold uppercase tracking-widest">
              <Brain className="w-3.5 h-3.5" />
              Advanced Neural Layer
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              Neural Engine <br />
              <span className="text-violet-500">Intelligence</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl mx-auto">
              Advanced AI architecture built for public health analysis. Our neural layer utilizes Gemini-powered processing to analyze multi-modal community data and identify emerging health trends.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
             <div>
                <SynapseProcessor />
             </div>
             <div className="space-y-12">
                <div className="space-y-4">
                   <h2 className="text-4xl font-bold uppercase tracking-tight">Synaptic Insights</h2>
                   <p className="text-muted-foreground text-lg">The Neural Engine processes thousands of community reports per second, correlating symptoms with regional vectors to provide high-confidence alerts.</p>
                </div>
                <div className="grid gap-4">
                   {[
                     { label: 'Intelligence Accuracy', value: stats?.accuracy ? `${stats.accuracy}%` : '...', icon: Target },
                     { label: 'Processing Latency', value: stats?.latency ?? '...', icon: Zap },
                     { label: 'Active Synapses', value: '1.2M', icon: Activity }
                   ].map((item, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, y: 10 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border-soft)] flex items-center justify-between group hover:border-violet-500/40 transition-colors"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                              <item.icon className="w-5 h-5" />
                           </div>
                           <span className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="text-xl font-bold text-violet-500">{item.value}</span>
                     </motion.div>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {[
              { 
                title: 'Symptom Analysis', 
                desc: 'Real-time analysis of reported symptoms to identify regional clusters and potential outbreak vectors.', 
                icon: Target, 
                color: 'text-rose-500', 
                bg: 'bg-rose-500/10',
                delay: 0
              },
              { 
                title: 'Data Correlation', 
                desc: 'Automated ingestion and cross-correlation of community reports with historical regional health data.', 
                icon: Cpu, 
                color: 'text-violet-500', 
                bg: 'bg-violet-500/10',
                delay: 0.1
              },
              { 
                title: 'Pattern Identification', 
                desc: 'Identifying micro-trends in regional health telemetry through distributed neural processing.', 
                icon: Sparkles, 
                color: 'text-amber-500', 
                bg: 'bg-amber-500/10',
                delay: 0.2
              }
            ].map((feature, i) => (
              <NeuralCard key={i} {...feature} />
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-12 md:p-20 rounded-[4rem] bg-[var(--surface-2)] border border-[var(--border-soft)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative z-10 text-center space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-bold uppercase tracking-tight">Neural Protocol Status: <span className="text-violet-500">Optimal</span></h2>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.4em]">Continuous Model Recalibration Active</p>
               </div>
               <div className="max-w-3xl mx-auto p-1 rounded-3xl bg-[var(--surface-1)] border border-[var(--border-soft)] overflow-hidden shadow-2xl">
                  <div className="h-2 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                     <motion.div animate={{ width: ['40%', '98%', '65%', '85%'] }} transition={{ duration: 10, repeat: Infinity }} className="h-full bg-violet-500 shadow-[0_0_10px_var(--violet-500)]" />
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
