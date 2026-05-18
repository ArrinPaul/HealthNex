"use client";

import { motion } from 'framer-motion';
import { Users, Heart, Award, Star, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function CommunityImpact() {
  return (
    <div className="space-y-6 h-full flex flex-col">
       <div className="flex items-center justify-between px-2">
          <h3 className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Community Impact</h3>
          <Badge variant="outline" className="text-[8px] font-bold border-primary/30 text-primary uppercase">Top Nodes</Badge>
       </div>

       <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center text-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                   <div className="text-xl font-bold">1.2k</div>
                   <p className="text-[8px] font-bold text-muted-foreground uppercase">Reporters</p>
                </div>
             </div>
             <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div>
                   <div className="text-xl font-bold">850</div>
                   <p className="text-[8px] font-bold text-muted-foreground uppercase">Resolved</p>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest px-2">Leading Contributors</p>
             {[
               { name: 'Dr. Arrin', role: 'Health Lead', points: 2840, icon: Award, color: 'text-amber-500' },
               { name: 'Node-SF-01', role: 'Community', points: 1920, icon: Star, color: 'text-sky-400' },
               { name: 'GreenWatch', role: 'NGO', points: 1560, icon: Heart, color: 'text-rose-400' }
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-soft)] group hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-tight">{item.name}</p>
                        <p className="text-[8px] text-muted-foreground font-medium uppercase">{item.role}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-foreground">{item.points}</p>
                     <p className="text-[8px] text-muted-foreground uppercase">Intel Pts</p>
                  </div>
               </div>
             ))}
          </div>
       </div>

       <div className="pt-4 border-t border-[var(--border-soft)] flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-emerald-500">
             <TrendingUp className="w-3 h-3" />
             <span className="text-[8px] font-bold uppercase tracking-widest">+12% This Week</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-[8px] font-bold uppercase tracking-widest px-2">Leaderboard</Button>
       </div>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
