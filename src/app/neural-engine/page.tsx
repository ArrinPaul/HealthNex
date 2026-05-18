"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Brain, Cpu, Target, Sparkles, Network, Zap, ArrowRight, Microscope } from 'lucide-react';

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
          <span>Explore Architecture</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};

export default function NeuralEnginePage() {
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
              Proprietary AI architecture built for predictive public health. Our neural layer analyzes multi-modal telemetry to project threat vectors with unmatched precision.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {[
              { 
                title: 'Predictive Vectors', 
                desc: 'Forecasting outbreak expansion using regional environmental factors and historical telemetry patterns.', 
                icon: Target, 
                color: 'text-rose-500', 
                bg: 'bg-rose-500/10',
                delay: 0
              },
              { 
                title: 'Neural Sync', 
                desc: 'Automated ingestion and cross-correlation of community symptom reports at the network edge.', 
                icon: Cpu, 
                color: 'text-violet-500', 
                bg: 'bg-violet-500/10',
                delay: 0.1
              },
              { 
                title: 'Pattern Vision', 
                desc: 'Identifying micro-trends in regional health data before they manifest as clinical spikes.', 
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
            className="grid lg:grid-cols-2 gap-12 items-center p-12 md:p-20 rounded-[4rem] bg-[var(--surface-2)] border border-[var(--border-soft)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            <div className="relative z-10 space-y-10">
               <div className="space-y-4">
                  <h2 className="text-4xl font-bold uppercase tracking-tight">AI Confidence Level: <span className="text-violet-500">99.8%</span></h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-md">Our models are continuously recalibrating for seasonal regional variation every 30 minutes, ensuring the highest fidelity in threat projection.</p>
               </div>
               
               <div className="flex flex-col gap-6">
                  {[
                    { label: 'Synaptic Processing', value: '1.2M req/sec', icon: Zap },
                    { label: 'Vector Resolution', value: 'Sub-regional', icon: Network },
                    { label: 'Data Fidelity', icon: Microscope, value: 'High' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-sm">
                       <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                          <item.icon className="w-6 h-6" />
                       </div>
                       <div>
                          <div className="text-lg font-bold">{item.value}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="relative z-10 hidden lg:block">
               <div className="relative w-full aspect-square bg-[var(--surface-1)] rounded-[3rem] border border-[var(--border-soft)] shadow-2xl overflow-hidden flex items-center justify-center group/brain">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                  >
                    <Brain className="w-48 h-48 text-violet-500/20 group-hover:text-violet-500/40 transition-colors duration-700" />
                  </motion.div>
                  
                  {/* Floating particles */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                      className="absolute w-2 h-2 rounded-full bg-violet-500/40"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                      }}
                    />
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
