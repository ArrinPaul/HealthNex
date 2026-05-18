"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion } from 'framer-motion';
import { Building2, Globe, Users, Award, ShieldCheck, Heart, Handshake, Network, ArrowRight } from 'lucide-react';

const PartnerCard = ({ name, type, desc, icon: Icon, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="p-8 rounded-[2.5rem] bg-[var(--surface-1)] border border-[var(--border-soft)] hover:border-primary/40 transition-all group"
  >
     <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
           <Icon className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{type}</span>
     </div>
     <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">{name}</h4>
     <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
  </motion.div>
);

const GlobalNetworkVisualizer = () => (
  <div className="relative w-full h-[600px] bg-[var(--surface-2)] rounded-[4rem] border border-[var(--border-soft)] overflow-hidden group">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-5" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:50px_50px]" />
    
    <div className="absolute inset-0 flex items-center justify-center">
       <div className="relative">
          <Globe className="w-64 h-64 text-primary/10 animate-pulse" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-40px] border-2 border-dashed border-primary/20 rounded-full"
          />
          
          {/* Simulated Active Points */}
          {[
            { t: 20, l: 30 }, { t: 40, l: 60 }, { t: 70, l: 20 }, 
            { t: 30, l: 80 }, { t: 60, l: 70 }, { t: 15, l: 55 }
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.5] }}
              transition={{ delay: i * 0.5, duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_var(--primary)]"
              style={{ top: `${pos.t}%`, left: `${pos.l}%` }}
            />
          ))}
       </div>
    </div>

    <div className="absolute bottom-12 left-12 p-8 bg-background/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl space-y-4">
       <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-white">Global Network Active</span>
       </div>
       <div className="grid grid-cols-2 gap-8">
          <div>
             <div className="text-2xl font-bold text-white tracking-tight">42</div>
             <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Partner Nations</div>
          </div>
          <div>
             <div className="text-2xl font-bold text-white tracking-tight">850+</div>
             <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Health Orgs</div>
          </div>
       </div>
    </div>
  </div>
);

export default function OrganizationPage() {
  return (
    <LandingLayout>
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,217,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-8 mb-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5" />
              Institutional Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              Organization <br />
              <span className="text-primary">& Partnerships</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl mx-auto">
              HealthNex is powered by a global network of health organizations, governmental agencies, and technical partners dedicated to unified health intelligence.
            </p>
          </motion.div>

          <div className="mb-48">
             <GlobalNetworkVisualizer />
          </div>

          <div className="space-y-24 mb-48">
             <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold uppercase tracking-tight">Our Ecosystem</h2>
                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.4em]">Strategic collaboration for global impact</p>
             </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <PartnerCard 
                  name="Global Health Alliance" 
                  type="Inter-governmental"
                  desc="Coordinating international response protocols and data standards for cross-border surveillance."
                  icon={Globe}
                  delay={0}
                />
                <PartnerCard 
                  name="SafeWater Initiative" 
                  type="Non-Profit"
                  desc="Driving the adoption of automated water quality monitoring in high-risk regional zones."
                  icon={Heart}
                  delay={0.1}
                />
                <PartnerCard 
                  name="TechGov Systems" 
                  type="Infrastructure"
                  desc="Providing secure edge-computing hardware for regional intelligence node deployment."
                  icon={Network}
                  delay={0.2}
                />
                <PartnerCard 
                  name="MedSync Protocol" 
                  type="Standardization"
                  desc="Developing universal health data schemas for seamless legacy system integration."
                  icon={Award}
                  delay={0.3}
                />
                <PartnerCard 
                  name="CyberShield Health" 
                  type="Security"
                  desc="Auditing zero-trust architecture and E2EE implementations across the protocol."
                  icon={ShieldCheck}
                  delay={0.4}
                />
                <PartnerCard 
                  name="Unified Field Network" 
                  type="Operations"
                  desc="Coordinating on-the-ground field worker training and node initialization protocols."
                  icon={Users}
                  delay={0.5}
                />
             </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-12 md:p-20 rounded-[4rem] bg-primary text-primary-foreground relative overflow-hidden group shadow-2xl"
          >
             <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="space-y-6 max-w-xl">
                   <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none">Partner with the <br />Protocol.</h2>
                   <p className="text-primary-foreground/80 text-lg">Join the world's most advanced health intelligence network. Establish visibility in your region today.</p>
                </div>
                <button className="h-20 px-12 rounded-[2rem] bg-white text-primary font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-4">
                   Initialize Integration <ArrowRight className="w-6 h-6" />
                </button>
             </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
