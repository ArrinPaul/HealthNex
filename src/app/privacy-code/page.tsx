"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Shield, Lock, EyeOff, FileCheck, ShieldCheck, Fingerprint, Key, Globe, CheckCircle2, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const SecurityLayerVisualizer = () => {
  const [activeLayer, setActiveTab] = useState(0);

  const layers = [
    {
      title: 'Encryption Layer',
      desc: 'All community reports and medical telemetry are synchronized using high-level encryption standards during transmission.',
      icon: Lock,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Anonymization Engine',
      desc: 'Ground-level intelligence is stripped of personal identifiers at the node edge, ensuring privacy-first trend analysis.',
      icon: EyeOff,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10'
    },
    {
      title: 'Access Management',
      desc: 'Multi-factor authentication and role-based access ensure that sensitive health insights are only visible to authorized personnel.',
      icon: Fingerprint,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10'
    }
  ];

  return (
    <div className="py-12">
      <div className="grid lg:grid-cols-2 gap-12 items-center p-10 md:p-16 rounded-[4rem] bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-5" />
        
        <div className="space-y-12 relative z-10">
          <div className="space-y-4">
             <h3 className="text-4xl font-bold uppercase tracking-tight">Security Stack</h3>
             <p className="text-muted-foreground">The HealthNex Intelligence Protocol utilizes a multi-layered security approach to protect every byte of regional health telemetry.</p>
          </div>
          
          <div className="flex flex-col gap-4">
             {layers.map((layer, i) => (
               <button
                 key={i}
                 onMouseEnter={() => setActiveTab(i)}
                 onClick={() => setActiveTab(i)}
                 className={`p-6 rounded-3xl border text-left transition-all duration-300 ${
                   activeLayer === i 
                     ? 'bg-[var(--surface-2)] border-primary shadow-lg scale-[1.02]' 
                     : 'border-transparent opacity-50 hover:opacity-100 hover:bg-[var(--surface-2)]'
                 }`}
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${layer.bg} ${layer.color} flex items-center justify-center`}>
                           <layer.icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold uppercase tracking-tight text-sm">{layer.title}</span>
                     </div>
                     <ChevronRight className={`w-4 h-4 transition-transform ${activeLayer === i ? 'rotate-90 text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <AnimatePresence>
                     {activeLayer === i && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                          <p className="pt-4 text-xs text-muted-foreground leading-relaxed pl-14">{layer.desc}</p>
                       </motion.div>
                     )}
                  </AnimatePresence>
               </button>
             ))}
          </div>
        </div>

        <div className="relative aspect-square hidden lg:flex items-center justify-center relative z-10">
           {/* Visual stacking representation */}
           {layers.map((layer, i) => (
             <motion.div
               key={i}
               animate={{ 
                 y: (i - activeLayer) * 40,
                 scale: 1 - Math.abs(i - activeLayer) * 0.1,
                 opacity: activeLayer === i ? 1 : 0.2,
                 rotateX: activeLayer === i ? 0 : 45,
                 zIndex: activeLayer === i ? 20 : 10 - i
               }}
               className={`absolute w-64 h-64 rounded-[3rem] ${layer.bg} border-2 ${activeLayer === i ? 'border-primary shadow-[0_0_30px_rgba(2,132,199,0.3)]' : 'border-white/5'} backdrop-blur-xl flex items-center justify-center theme-transition`}
             >
                <motion.div
                  animate={{ 
                    opacity: activeLayer === i ? 1 : 0,
                    scale: activeLayer === i ? 1 : 0.5
                  }}
                  transition={{ duration: 0.3 }}
                >
                   <layer.icon className={`w-16 h-16 ${layer.color}`} />
                </motion.div>
                
                {activeLayer === i && (
                  <motion.div 
                    layoutId="glow"
                    className="absolute inset-0 rounded-[3rem] bg-primary/20 blur-2xl -z-10"
                  />
                )}
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

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
            className="max-w-4xl mx-auto text-center space-y-8 mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Data Protocol
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              Privacy Code <br />
              <span className="text-emerald-500">Protocol</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl mx-auto">
              Medical-grade security and commitment to data privacy. At HealthNex, we prioritize the protection of regional health data through secure synchronization and distributed node management.
            </p>
          </motion.div>

          <SecurityLayerVisualizer />

          <div className="grid md:grid-cols-2 gap-8 mb-32 mt-20">
            <PrivacyCard 
              title="Secure Synchronization" 
              desc="Community reports and medical telemetry are synchronized using encrypted communication channels to our distributed Convex backend, ensuring data integrity across all nodes."
              icon={Lock}
              delay={0}
            />
            <PrivacyCard 
              title="Information Privacy" 
              desc="The protocol is designed to handle sensitive health data with care, utilizing authorized access controls to ensure that information is only accessible to verified health leads."
              icon={EyeOff}
              delay={0.1}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {[
              { title: 'Data Sovereignty', icon: Globe, desc: 'Maintaining control over regional health data through distributed intelligence hubs.' },
              { title: 'Identity Protection', icon: Fingerprint, desc: 'Secure authentication layers to protect the identity of community reporters and health workers.' },
              { title: 'Access Control', icon: Key, desc: 'Role-based access management to ensure data is only visible to personnel with proper authorization.' }
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
               <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">Security Standards</h2>
               <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.4em]">Aligned with global health data protection practices</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
               {[
                 { label: 'Data Integrity', desc: 'Ensuring reports remain unchanged during transmission.' },
                 { label: 'Authorized Access', desc: 'Multi-layer verification for administrative actions.' },
                 { label: 'Privacy First', desc: 'Architected to minimize data exposure and maximize security.' }
               ].map((cert, i) => (
                 <div key={i} className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-[var(--surface-2)] border border-[var(--border-soft)] group hover:border-emerald-500/40 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-background border border-[var(--border-soft)] flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                       <FileCheck className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                       <span className="text-xs font-bold uppercase tracking-widest block mb-2">{cert.label}</span>
                       <p className="text-[10px] text-muted-foreground leading-tight">{cert.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
