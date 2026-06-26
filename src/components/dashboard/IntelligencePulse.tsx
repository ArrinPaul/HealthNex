"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Globe, Zap, Users, MessageSquare, Droplet, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const initialEvents = [
  { id: 1, type: 'VERIFICATION', text: 'Regional Node HN-ZONE-04 Verified', time: new Date(), icon: ShieldCheck, color: 'text-emerald-500' },
  { id: 2, type: 'REPORT', text: 'New Ground Intelligence: Water Quality Alert (S-01)', time: new Date(Date.now() - 1000 * 60 * 5), icon: Droplet, color: 'text-sky-400' },
  { id: 3, type: 'NEURAL', text: 'Gemini v1.5 Pro: Forecast Recalibrated (Zone 7)', time: new Date(Date.now() - 1000 * 60 * 12), icon: Zap, color: 'text-violet-500' },
  { id: 4, type: 'NETWORK', text: '512 Community Nodes Synchronized', time: new Date(Date.now() - 1000 * 60 * 25), icon: Globe, color: 'text-primary' },
  { id: 5, type: 'ACTION', text: 'Symptom Cluster Analyzed (Confidence: 98%)', time: new Date(Date.now() - 1000 * 60 * 45), icon: Activity, color: 'text-rose-500' }
];

const randomEventTemplates = [
  { type: 'NETWORK', text: 'Protocol Heartbeat: Sync Success', icon: Globe, color: 'text-primary' },
  { type: 'VERIFICATION', text: 'Credential Audit Complete (Node ID: 882)', icon: CheckCircle2, color: 'text-emerald-500' },
  { type: 'REPORT', text: 'Symptom Upload Received (Confidential)', icon: MessageSquare, color: 'text-amber-500' }
];

export default function IntelligencePulse() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    setEvents(initialEvents);
    
    const interval = setInterval(() => {
      const random = randomEventTemplates[Math.floor(Math.random() * randomEventTemplates.length)];
      setEvents(prev => [{ ...random, id: Date.now(), time: new Date() }, ...prev].slice(0, 10));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 h-full flex flex-col">
       <div className="flex items-center justify-between px-2">
          <h3 className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Protocol Heartbeat</h3>
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live Stream</span>
          </div>
       </div>

       <div className="flex-1 overflow-auto custom-scrollbar space-y-3 pr-2">
          <AnimatePresence mode="popLayout">
             {events.map((event) => (
               <motion.div
                 key={event.id}
                 layout
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)] hover:border-primary/30 transition-colors group relative overflow-hidden"
               >
                  <div className="flex items-start gap-4 relative z-10">
                     <div className={`w-8 h-8 rounded-lg ${event.color} bg-opacity-10 flex items-center justify-center shrink-0`}>
                        <event.icon className="w-4 h-4" />
                     </div>
                     <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                           <span className={`text-[8px] font-bold uppercase tracking-widest ${event.color}`}>{event.type}</span>
                           <span className="text-[8px] font-mono text-muted-foreground">{format(event.time, 'HH:mm:ss')}</span>
                        </div>
                        <p className="text-[10px] font-semibold text-foreground truncate leading-relaxed">{event.text}</p>
                     </div>
                  </div>
                  {/* Subtle background progress for pulse */}
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 15, ease: 'linear' }}
                    className="absolute bottom-0 left-0 h-[1px] bg-primary/20"
                  />
               </motion.div>
             ))}
          </AnimatePresence>
       </div>

       <div className="pt-4 border-t border-[var(--border-soft)] text-center">
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Institutional Grade Telemetry</p>
       </div>
    </div>
  );
}
