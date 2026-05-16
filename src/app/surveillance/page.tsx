"use client";

import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { LineChart, Shield, Zap, Search } from 'lucide-react';

export default function SurveillancePage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              Intelligence Layer
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase">Global Surveillance Hub</h1>
            <p className="text-muted-foreground text-xl max-w-3xl leading-relaxed">
              Real-time telemetry and regional health monitoring protocol. HealthNex aggregates distributed node data to provide sub-second visibility into emerging public health threats.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">Active Node Monitoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automated status verification across 10,000+ regional health nodes. Our system ensures constant connectivity and data integrity for all field units.
              </p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">Anomaly Detection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Heuristic analysis of reporting patterns to identify statistical outliers and potential early-stage outbreaks before they are clinically confirmed.
              </p>
            </div>
          </div>

          <div className="p-12 rounded-[3rem] bg-[var(--surface-2)] border border-[var(--border-soft)] text-center space-y-8">
             <h2 className="text-3xl font-bold uppercase tracking-tight">Protocol Status: Optimal</h2>
             <div className="flex justify-center gap-12">
                {[
                  { label: 'Active Nodes', value: '12,482' },
                  { label: 'Latency', value: '142ms' },
                  { label: 'Uptime', value: '99.99%' }
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-4xl font-bold text-primary">{stat.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
             </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
