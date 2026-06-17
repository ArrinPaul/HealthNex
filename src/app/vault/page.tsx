"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, Droplet, Heart, 
  Plus, TrendingUp, Lock, 
  FileText, Calendar, ChevronRight, Zap
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const MetricCard = ({ label, value, unit, icon: Icon, color, trend }: any) => (
  <Card className="bg-card border border-border hover:border-primary/30 transition-all">
    <CardContent className="p-4">
       <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color} bg-opacity-10`}>
             <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
             <TrendingUp className="w-3 h-3" /> {trend}
          </div>
       </div>
       <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{label}</p>
          <h3 className="text-xl font-bold">{value} <span className="text-xs font-normal opacity-40">{unit}</span></h3>
       </div>
    </CardContent>
  </Card>
);

export default function HealthVaultPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Health Vault</h1>
            <p className="text-muted-foreground text-sm mt-1">Your personal health records and vitals.</p>
          </div>
          <div className="flex gap-2">
             <Button size="sm" className="gap-2" onClick={() => toast.info('Feature coming soon')}>
                <Plus className="w-4 h-4" /> Log Vitals
             </Button>
             <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Feature coming soon')}>
                <FileText className="w-4 h-4" /> Upload
             </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
           <MetricCard label="Blood Pressure" value="120/80" unit="mmHg" icon={Activity} color="text-rose-500" trend="+2%" />
           <MetricCard label="Heart Rate" value="72" unit="BPM" icon={Heart} color="text-rose-400" trend="-1%" />
           <MetricCard label="Blood Sugar" value="98" unit="mg/dL" icon={Zap} color="text-amber-500" trend="Stable" />
           <MetricCard label="Hydration" value="2.4" unit="L" icon={Droplet} color="text-sky-400" trend="+12%" />
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
           <div className="lg:col-span-8">
              <Card className="bg-card border border-border">
                <CardHeader className="border-b border-border py-3">
                   <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                      <Button variant="ghost" size="sm" className="text-xs h-7">View All</Button>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-border">
                      {[
                        { event: 'Symptom Report', date: 'May 18, 2026', status: 'Verified', color: 'text-emerald-500' },
                        { event: 'Blood Test', date: 'May 14, 2026', status: 'Analyzed', color: 'text-primary' },
                        { event: 'Vitals Check', date: 'May 12, 2026', status: 'Normal', color: 'text-sky-400' },
                        { event: 'Account Created', date: 'May 10, 2026', status: 'Complete', color: 'text-muted-foreground' }
                      ].map((item, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                                 <Calendar className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                 <h4 className="font-medium text-sm">{item.event}</h4>
                                 <p className="text-xs text-muted-foreground">{item.date}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${item.color}`}>{item.status}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-4">
              <Card className="bg-card border border-border">
                 <CardContent className="p-5 space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                       <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-semibold text-sm">Data Security</h4>
                       <p className="text-xs text-muted-foreground leading-relaxed">Your health data is encrypted and only accessible by you.</p>
                    </div>
                    <ul className="space-y-2">
                       {['Encrypted storage', 'Private by default', 'You control sharing'].map(item => (
                         <li key={item} className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {item}
                         </li>
                       ))}
                    </ul>
                 </CardContent>
              </Card>

              <Card className="bg-card border border-border">
                <CardContent className="p-5 text-center space-y-3">
                   <p className="text-xs text-muted-foreground font-medium">Share with a Doctor</p>
                   <p className="text-xs text-muted-foreground">Generate a temporary link to share your health history.</p>
                   <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info('Feature coming soon')}>
                      Generate Link
                   </Button>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
