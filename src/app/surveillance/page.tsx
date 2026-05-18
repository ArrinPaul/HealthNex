"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { LineChart, Shield, Zap, Search, Activity, Globe, Satellite, BarChart3, ArrowRight } from 'lucide-react';

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
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-primary flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
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

export default function SurveillancePage() {
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
              Real-time telemetry and regional health monitoring. HealthNex aggregates distributed node data to provide sub-second visibility into emerging public health threats across the globe.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            <SurveillanceCard 
              title="Node Monitoring" 
              desc="Automated status verification across 10,000+ regional health nodes. Ensuring constant connectivity and data integrity for all field units."
              icon={Search}
              delay={0}
            />
            <SurveillanceCard 
              title="Anomaly Detection" 
              desc="Heuristic analysis of reporting patterns to identify statistical outliers and potential early-stage outbreaks before clinical confirmation."
              icon={Zap}
              delay={0.1}
            />
            <SurveillanceCard 
              title="Geospatial Mapping" 
              desc="High-fidelity visualization of health trends mapped against regional demographics and environmental data points."
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
                  <h2 className="text-4xl font-bold uppercase tracking-tight">Protocol Status: <span className="text-emerald-500">Optimal</span></h2>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.4em]">Real-time Telemetry Active</p>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                  {[
                    { label: 'Active Nodes', value: '12,482', icon: Satellite },
                    { label: 'Avg Latency', value: '142ms', icon: Activity },
                    { label: 'Uptime', value: '99.99%', icon: Shield },
                    { label: 'Data Points', value: '1.2B', icon: BarChart3 }
                  ].map((stat, i) => (
                    <div key={stat.label} className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-background border border-[var(--border-soft)] flex items-center justify-center mx-auto text-primary shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{stat.value}</div>
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
