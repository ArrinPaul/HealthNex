"use client";

import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Brain, Cpu, Target, Sparkles } from 'lucide-react';

export default function NeuralEnginePage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-[10px] font-bold uppercase tracking-widest">
              Advanced Neural Layer
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase">Neural Engine Protocol</h1>
            <p className="text-muted-foreground text-xl max-w-3xl leading-relaxed">
              Proprietary AI architecture built for predictive public health. Our neural layer analyzes multi-modal telemetry to project threat vectors with unmatched precision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Predictive Vectors', 
                desc: 'Forecasting outbreak expansion using regional environmental factors and historical telemetry.', 
                icon: Target, 
                color: 'text-rose-500', 
                bg: 'bg-rose-500/10' 
              },
              { 
                title: 'Neural Sync', 
                desc: 'Automated ingestion and cross-correlation of community symptom reports at the network edge.', 
                icon: Cpu, 
                color: 'text-violet-500', 
                bg: 'bg-violet-500/10' 
              },
              { 
                title: 'Pattern Vision', 
                desc: 'Identifying micro-trends in regional health data before they manifest as clinical spikes.', 
                icon: Sparkles, 
                color: 'text-amber-500', 
                bg: 'bg-amber-500/10' 
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-xl hover:border-primary/40 transition-all group">
                <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-12 rounded-[3rem] bg-[var(--surface-2)] border border-[var(--border-soft)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="space-y-4 text-center md:text-left">
                   <h2 className="text-3xl font-bold uppercase tracking-tight">AI Confidence Level: 99.8%</h2>
                   <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Recalibrating for seasonal regional variation every 30 minutes.</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_var(--emerald-500)]" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Synapse Active</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
