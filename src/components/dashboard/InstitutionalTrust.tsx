"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, Globe, Activity, ShieldAlert, Award } from 'lucide-react';
import { useGlobalInstitutionalData } from '@/services/healthDataService';
import { formatDistanceToNow } from 'date-fns';

export default function InstitutionalTrust() {
  const globalData = useGlobalInstitutionalData();

  if (!globalData) {
    return (
       <div className="h-full flex items-center justify-center opacity-30 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          Syncing Global Trust Layer...
       </div>
    );
  }

  const stats = [
    { label: 'Global Cases', value: globalData.data.cases?.toLocaleString(), icon: Activity, color: 'text-primary' },
    { label: 'Active Reports', value: globalData.data.active?.toLocaleString(), icon: ShieldAlert, color: 'text-amber-500' },
    { label: 'Global Recovery', value: globalData.data.recovered?.toLocaleString(), icon: ShieldCheck, color: 'text-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
               <Award className="w-5 h-5" />
            </div>
            <div>
               <h4 className="text-[10px] font-bold uppercase tracking-widest">Institutional Trust Layer</h4>
               <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight">Source: {globalData.source}</p>
            </div>
         </div>
         <div className="text-right">
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Last Verified</div>
            <div className="text-[10px] font-bold text-foreground font-mono">{formatDistanceToNow(globalData.lastUpdated)} ago</div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
         {stats.map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
             className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)] flex items-center justify-between group hover:border-primary/40 transition-colors"
           >
              <div className="flex items-center gap-3">
                 <stat.icon className={`w-4 h-4 ${stat.color}`} />
                 <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">{stat.label}</span>
              </div>
              <span className="text-sm font-bold font-mono">{stat.value}</span>
           </motion.div>
         ))}
      </div>

      <div className="pt-4 border-t border-[var(--border-soft)]">
         <div className="flex items-center gap-3 text-emerald-500 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
            <Globe className="w-4 h-4 animate-pulse" />
            <p className="text-[9px] font-bold uppercase leading-relaxed tracking-tight">
               Local HealthNex reports are being cross-referenced with global institutional metrics for optimal reliability.
            </p>
         </div>
      </div>
    </div>
  );
}
