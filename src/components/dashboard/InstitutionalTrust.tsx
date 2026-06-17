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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium">Global Data</h4>
         </div>
         <span className="text-xs text-muted-foreground">{formatDistanceToNow(globalData.lastUpdated)} ago</span>
      </div>

      <div className="space-y-3">
         {stats.map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
             className="p-3 rounded-xl bg-secondary border border-border flex items-center justify-between hover:border-primary/40 transition-colors"
           >
              <div className="flex items-center gap-2">
                 <stat.icon className={`w-4 h-4 ${stat.color}`} />
                 <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-sm font-semibold font-mono">{stat.value}</span>
           </motion.div>
         ))}
      </div>

      <div className="pt-3 border-t border-border">
         <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
            <Globe className="w-3.5 h-3.5" />
            <p className="text-xs">
               Local data is cross-referenced with global health metrics.
            </p>
         </div>
      </div>
    </div>
  );
}
