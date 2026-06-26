"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Shield, Search, Activity, Globe, BarChart3, ArrowRight, ShieldAlert, Network } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useState, useEffect, useRef } from 'react';

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
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      className="group relative p-8 rounded-3xl border border-border bg-card hover:border-primary/40 transition-all duration-300 overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(0, 217, 255, 0.05), transparent 80%)`,
        }}
      />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{desc}</p>
        <div className="flex items-center gap-2 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Learn more</span>
          <ArrowRight className="w-3.5 h-3.5" />
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
      size: 2 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.4
    });

    setActiveNodes(Array.from({ length: 30 }, generateNode));
    
    const interval = setInterval(() => {
      setActiveNodes(prev => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = { ...next[idx], opacity: 0.7 };
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[400px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_80%)] opacity-10" />
      
      <div className="relative w-full h-full p-8">
        {activeNodes.map(node => (
          <motion.div
            key={node.id}
            animate={{ opacity: node.opacity }}
            className="absolute rounded-full bg-primary"
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`, 
              width: node.size, 
              height: node.size 
            }}
          />
        ))}

        <div className="absolute bottom-6 left-6 p-4 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-xl">
           <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Activity className="w-3 h-3" />
              <span>Live Monitoring</span>
           </div>
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
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-6 mb-24"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <Activity className="w-3.5 h-3.5" />
              Real-time Monitoring
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Health <br />
              <span className="text-primary">Surveillance</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              Monitor community health data in real-time. Track reports, identify trends, and respond to emerging issues quickly.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
             <div className="space-y-8 order-2 lg:order-1">
                <div className="space-y-3">
                   <h2 className="text-3xl font-bold tracking-tight">Real-time Visibility</h2>
                   <p className="text-muted-foreground leading-relaxed">Get instant visibility into health data across your region with live monitoring and automated alerts.</p>
                </div>
                <div className="grid gap-4">
                   {[
                     { title: 'Community Reports', icon: Network, desc: 'Ground-level health reports from verified community members.' },
                     { title: 'Secure Data', icon: Shield, desc: 'Encrypted data synchronization across all nodes.' },
                     { title: 'Smart Alerts', icon: ShieldAlert, desc: 'Automatic alerts when health risks are detected.' }
                   ].map((item, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                     >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                           <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                           <h4 className="font-semibold text-sm">{item.title}</h4>
                           <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                     </motion.div>
                   ))}
                </div>
             </div>
             <div className="order-1 lg:order-2">
                <LiveNodeNetwork />
             </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-24">
            <SurveillanceCard 
              title="Community Reporting" 
              desc="Enable community members to report health issues and serve as first responders."
              icon={Search}
              delay={0}
            />
            <SurveillanceCard 
              title="Trend Analysis" 
              desc="Identify patterns in health reports to spot potential issues early."
              icon={Globe}
              delay={0.1}
            />
            <SurveillanceCard 
              title="Regional Mapping" 
              desc="Visualize health data geographically to understand distribution patterns."
              icon={BarChart3}
              delay={0.2}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-10 rounded-3xl bg-secondary/50 border border-border text-center"
          >
             <div className="space-y-8">
                <h2 className="text-3xl font-bold tracking-tight">System Status: <span className="text-emerald-500">Active</span></h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-lg mx-auto">
                   {[
                     { label: 'Active Alerts', value: stats?.alertsSent ?? 0, icon: Activity },
                     { label: 'Total Reports', value: stats?.communityReports ?? 0, icon: BarChart3 }
                   ].map((stat) => (
                     <div key={stat.label} className="space-y-2 text-center">
                       <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mx-auto text-primary">
                         <stat.icon className="w-5 h-5" />
                       </div>
                       <div>
                         <div className="text-2xl font-bold">{stat.value}</div>
                         <div className="text-xs text-muted-foreground">{stat.label}</div>
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
