"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Shield, Lock, EyeOff, FileCheck, ShieldCheck, Fingerprint, Key, Globe } from 'lucide-react';

const PrivacyCard = ({ title, desc, icon: Icon, delay }: any) => {
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
      className="group relative p-12 rounded-[3rem] border border-[var(--border-soft)] bg-[var(--surface-1)] shadow-xl hover:border-emerald-500/40 transition-all duration-500 overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(16, 185, 129, 0.05), transparent 80%)`,
        }}
      />
      
      <div className="relative z-10 space-y-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
          <Icon className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold uppercase tracking-tight">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function PrivacyCodePage() {
  return (
    <LandingLayout>
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-8 mb-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero-Trust Architecture
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              Privacy Code <br />
              <span className="text-emerald-500">Protocol</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl mx-auto">
              Medical-grade security and uncompromising data sovereignty. At HealthNex, your regional health data is end-to-end encrypted at the edge, ensuring total privacy for every community node.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-32">
            <PrivacyCard 
              title="E2EE Synchronization" 
              desc="All community reports and medical telemetry are encrypted on the reporting device before being synchronized with our distributed backend. Only verified health leads hold the decryption keys."
              icon={Lock}
              delay={0}
            />
            <PrivacyCard 
              title="Anonymization Layer" 
              desc="Personal identifiers are automatically stripped from surveillance data at the network edge. We monitor health trends, not individuals, maintaining 100% data privacy."
              icon={EyeOff}
              delay={0.1}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {[
              { title: 'Data Sovereignty', icon: Globe, desc: 'Your regional data stays under your control, synchronized only with verified health protocols.' },
              { title: 'Biometric Integrity', icon: Fingerprint, desc: 'Multi-factor authentication and biometric verification for all high-level health node access.' },
              { title: 'Key Management', icon: Key, desc: 'Decentralized key management ensuring that no single point of failure can compromise the network.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-[var(--surface-2)] border border-[var(--border-soft)] text-center space-y-6"
              >
                 <div className="w-12 h-12 rounded-2xl bg-background border border-[var(--border-soft)] flex items-center justify-center mx-auto text-emerald-500">
                    <item.icon className="w-6 h-6" />
                 </div>
                 <h4 className="text-lg font-bold uppercase tracking-tight">{item.title}</h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-12 md:p-20 rounded-[4rem] bg-[var(--surface-1)] border border-[var(--border-soft)] text-center space-y-12 shadow-2xl"
          >
            <div className="space-y-4">
               <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">Global Compliance</h2>
               <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.4em]">Meeting the world's most rigorous standards</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {['HIPAA', 'GDPR', 'ISO 27001', 'SOC 2 Type II'].map((cert, i) => (
                 <div key={cert} className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-[var(--surface-2)] border border-[var(--border-soft)] group hover:border-emerald-500/40 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-background border border-[var(--border-soft)] flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                       <FileCheck className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">{cert}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
