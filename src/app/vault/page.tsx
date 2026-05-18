"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Activity, Droplet, Heart, 
  Plus, History, TrendingUp, Lock, 
  FileText, Calendar, ChevronRight, Zap
} from 'lucide-react';
import { useState } from 'react';

const MetricCard = ({ label, value, unit, icon: Icon, color, trend }: any) => (
  <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] hover:border-primary/30 transition-all group">
    <CardContent className="p-6">
       <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
             <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px] uppercase">
             <TrendingUp className="w-3 h-3" /> {trend}
          </div>
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value} <span className="text-sm font-medium opacity-40">{unit}</span></h3>
       </div>
    </CardContent>
  </Card>
);

export default function HealthVaultPage() {
  const [activeTab, setActiveTab] = useState('metrics');

  return (
    <ProtectedRoute>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">Personal Health Vault</h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Encrypted personal health records and vitals tracking</p>
          </div>
          <div className="flex gap-4">
             <Button className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 bg-primary text-primary-foreground">
                <Plus className="w-4 h-4" /> Log Vital Sign
             </Button>
             <Button variant="outline" className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 border-[var(--border-soft)]">
                <FileText className="w-4 h-4" /> Upload Document
             </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
           <MetricCard label="Average BP" value="120/80" unit="mmHg" icon={Activity} color="text-rose-500" trend="+2%" />
           <MetricCard label="Heart Rate" value="72" unit="BPM" icon={Heart} color="text-rose-400" trend="-1%" />
           <MetricCard label="Blood Sugar" value="98" unit="mg/dL" icon={Zap} color="text-amber-500" trend="Stable" />
           <MetricCard label="Hydration" value="2.4" unit="Liters" icon={Droplet} color="text-sky-400" trend="+12%" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           {/* Timeline */}
           <div className="lg:col-span-8">
              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] shadow-xl overflow-hidden">
                <CardHeader className="border-b border-[var(--border-soft)]">
                   <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold uppercase tracking-tight">Protocol History</CardTitle>
                      <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest">View All</Button>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-[var(--border-soft)]">
                      {[
                        { event: 'Symptom Analysis', date: 'May 18, 2026', status: 'Verified', color: 'text-emerald-500' },
                        { event: 'Blood Test Result', date: 'May 14, 2026', status: 'Analyzed', color: 'text-primary' },
                        { event: 'Vital Signs Log', date: 'May 12, 2026', status: 'Stable', color: 'text-sky-400' },
                        { event: 'Registration', date: 'May 10, 2026', status: 'Initialized', color: 'text-muted-foreground' }
                      ].map((item, i) => (
                        <div key={i} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-colors">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border-soft)]">
                                 <Calendar className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-sm uppercase tracking-tight">{item.event}</h4>
                                 <p className="text-xs text-muted-foreground">{item.date}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <Badge variant="outline" className={`rounded-lg uppercase text-[8px] font-bold ${item.color} border-current bg-transparent`}>
                                 {item.status}
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
              </Card>
           </div>

           {/* Security Status */}
           <div className="lg:col-span-4 space-y-6">
              <Card className="bg-slate-950 border border-white/5 shadow-2xl overflow-hidden relative">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_70%)] opacity-10" />
                 <CardContent className="p-8 space-y-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                       <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xl font-bold uppercase tracking-tight text-white">Vault Security</h4>
                       <p className="text-xs text-slate-400 leading-relaxed">Your personal health data is end-to-end encrypted. HealthNex leads cannot access your private records without your explicit cryptographic key.</p>
                    </div>
                    <ul className="space-y-3">
                       {['AES-256 Encryption', 'Biometric Lock Active', 'Zero-Trust Protocol'].map(check => (
                         <li key={check} className="flex items-center gap-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <Shield className="w-3 h-3" /> {check}
                         </li>
                       ))}
                    </ul>
                 </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
                <CardContent className="p-8 text-center space-y-4">
                   <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Authorized Sharing</p>
                   <p className="text-sm">Quickly share your health history with a verified professional during emergencies.</p>
                   <Button variant="outline" className="w-full h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest">Generate Access QR</Button>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
