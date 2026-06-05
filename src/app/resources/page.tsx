"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MapPin, Phone, Search, 
  Hospital, Pill, ClipboardCheck, 
  ArrowRight, Globe, Star, Navigation, 
  Activity, ShieldCheck, Clock
} from 'lucide-react';
import { useState } from 'react';

const FacilityCard = ({ name, type, address, phone, rating, status, distance, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="p-8 rounded-[2.5rem] bg-[var(--surface-1)] border border-[var(--border-soft)] hover:border-primary/40 transition-all group shadow-sm hover:shadow-2xl"
  >
     <div className="flex items-start justify-between mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${type === 'hospital' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'}`}>
           {type === 'hospital' ? <Hospital className="w-7 h-7" /> : <Pill className="w-7 h-7" />}
        </div>
        <div className="text-right">
           <Badge variant="outline" className={`rounded-lg uppercase text-[8px] font-bold ${status === 'Open' ? 'text-emerald-500 border-emerald-500/20' : 'text-rose-500 border-rose-500/20'}`}>
              {status}
           </Badge>
           <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">{distance} Away</p>
        </div>
     </div>

     <div className="space-y-2 mb-8">
        <h4 className="text-xl font-bold uppercase tracking-tight">{name}</h4>
        <div className="flex items-center gap-2 text-muted-foreground">
           <MapPin className="w-3.5 h-3.5" />
           <p className="text-sm">{address}</p>
        </div>
     </div>

     <div className="flex items-center justify-between pt-6 border-t border-[var(--border-soft)]">
        <div className="flex items-center gap-2">
           <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
           <span className="text-sm font-bold">{rating}</span>
        </div>
        <Button size="sm" className="rounded-xl h-10 gap-2 font-bold uppercase text-[10px] tracking-widest px-4">
           <Navigation className="w-3 h-3" /> Navigate
        </Button>
     </div>
  </motion.div>
);

export default function ResourcesPage() {
  const [search, setSearch] = useState('');

  const facilities = [
    { name: 'City Central Hospital', type: 'hospital', address: '42 Protocol Way, SF', phone: '1-800-HN-CORE', rating: 4.8, status: 'Open', distance: '0.8km' },
    { name: 'Regional Health Node 4', type: 'hospital', address: 'Intelligence District', phone: '1-800-HN-ZONE', rating: 4.9, status: 'Open', distance: '1.2km' },
    { name: 'Protocol Pharmacy', type: 'pharmacy', address: 'Bento Grid Square', phone: '1-800-HN-MEDS', rating: 4.7, status: 'Open', distance: '1.5km' },
    { name: 'Community Care Center', type: 'hospital', address: 'Decentralized Lane', phone: '1-800-HN-CARE', rating: 4.5, status: 'Closing Soon', distance: '2.4km' },
    { name: 'HealthNex Lab Node', type: 'pharmacy', address: 'Neural Avenue', phone: '1-800-HN-DATA', rating: 4.9, status: 'Open', distance: '3.1km' },
    { name: 'Emergency Response Unit', type: 'hospital', address: 'Shield Sector', phone: '1-800-HN-EMER', rating: 5.0, status: 'Open', distance: '4.5km' }
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">Health Hub Discovery</h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Verified regional health facilities & medical resources</p>
          </div>
          <div className="relative w-full md:w-80 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <Input 
                placeholder="Search resources..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-12 rounded-xl bg-[var(--surface-1)] border-[var(--border-soft)]" 
             />
          </div>
        </div>

        {/* Local Pulse HUD */}
        <div className="grid md:grid-cols-3 gap-6">
           <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-16 h-16" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Local Safety Score</p>
              <h3 className="text-4xl font-bold tracking-tighter">Optimal</h3>
              <div className="h-1.5 w-full bg-white/10 rounded-full mt-4 overflow-hidden">
                 <motion.div animate={{ width: '92%' }} className="h-full bg-primary" />
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-[var(--surface-2)] border border-[var(--border-soft)] flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Active Nodes Nearby</p>
              </div>
              <h3 className="text-4xl font-bold tracking-tighter text-foreground">24 <span className="text-sm font-bold uppercase opacity-40">Online</span></h3>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-[var(--surface-2)] border border-[var(--border-soft)] flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-2">
                 <Clock className="w-4 h-4 text-amber-500" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Avg Response Time</p>
              </div>
              <h3 className="text-4xl font-bold tracking-tighter text-foreground">12m <span className="text-sm font-bold uppercase opacity-40">Local</span></h3>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                 {facilities.map((f, i) => (
                   <FacilityCard key={f.name} {...f} delay={i * 0.1} />
                 ))}
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card className="bg-rose-500/10 border border-rose-500/20 shadow-xl overflow-hidden group">
                 <CardHeader className="bg-rose-500/10 border-b border-rose-500/20">
                    <CardTitle className="flex items-center gap-3 text-rose-500 text-sm uppercase font-bold tracking-[0.2em]">
                       <ShieldCheck className="w-4 h-4 animate-pulse" />
                       Emergency Protocols
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    <Button className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] gap-3">
                       <Phone className="w-4 h-4" /> Call Immediate Response
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                       <Button variant="outline" className="h-12 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 uppercase text-[8px] font-bold tracking-widest">Symptom SOS</Button>
                       <Button variant="outline" className="h-12 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 uppercase text-[8px] font-bold tracking-widest">Water Halt</Button>
                    </div>
                 </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
                 <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest">Protocol Navigation</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    {[
                      { label: 'Nearest Lab', value: '0.4km', node: 'Lab-A1' },
                      { label: 'Supply Point', value: '1.2km', node: 'Pharma-02' }
                    ].map((node, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-soft)]">
                         <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{node.label}</p>
                            <p className="text-sm font-bold">{node.node}</p>
                         </div>
                         <Badge className="bg-primary/20 text-primary border-0">{node.value}</Badge>
                      </div>
                    ))}
                 </CardContent>
              </Card>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="p-12 md:p-16 rounded-[4rem] bg-slate-900 border border-white/5 relative overflow-hidden text-center mt-12"
        >
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10" />
           <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                 <h2 className="text-3xl font-bold uppercase tracking-tight text-white">Missing a verified resource?</h2>
                 <p className="text-slate-400 max-w-lg mx-auto">Help the protocol grow by submitting new health nodes, pharmacies, or community help centers for institutional verification.</p>
              </div>
              <Button className="h-16 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 gap-3">
                 <ClipboardCheck className="w-5 h-5" /> Submit Resource Node
              </Button>
           </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
