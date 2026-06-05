"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  BookOpen, Video, FileText, 
  Droplet, AlertTriangle, ShieldCheck, 
  Brain, Microscope, ArrowRight,
  PlayCircle, Download, CheckCircle2,
  Lock, Globe, Heart, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const ModuleCard = ({ title, type, duration, desc, icon: Icon, color, delay }: any) => {
  const startModule = () => {
    toast.success(`Protocol Initialized: ${title}`, {
      description: `Loading ${type.toLowerCase()} stream. Expected duration: ${duration}.`
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="p-8 rounded-[2.5rem] bg-[var(--surface-1)] border border-[var(--border-soft)] hover:border-primary/40 transition-all group shadow-sm hover:shadow-2xl overflow-hidden relative"
    >
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_50%)] opacity-0 group-hover:opacity-5 transition-opacity" />
       
       <div className="flex items-start justify-between mb-8 relative z-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} bg-opacity-10`}>
             <Icon className={`w-7 h-7 ${color}`} />
          </div>
          <div className="text-right">
             <Badge variant="secondary" className="rounded-lg uppercase text-[8px] font-bold tracking-widest">
                {type}
             </Badge>
             <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">{duration}</p>
          </div>
       </div>

       <div className="space-y-3 mb-8 relative z-10">
          <h4 className="text-xl font-bold uppercase tracking-tight">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
       </div>

       <div className="flex items-center justify-between pt-6 border-t border-[var(--border-soft)] relative z-10">
          <Button 
            onClick={startModule}
            variant="ghost" 
            size="sm" 
            className="h-10 gap-2 font-bold uppercase text-[10px] tracking-widest px-0 hover:bg-transparent hover:text-primary transition-colors"
          >
             <PlayCircle className="w-4 h-4" /> Start Module
          </Button>
          <div 
            onClick={startModule}
            className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border-soft)] group-hover:bg-primary group-hover:text-primary-foreground transition-all cursor-pointer"
          >
             <ArrowRight className="w-4 h-4" />
          </div>
       </div>
    </motion.div>
  );
};

export default function EducationHubPage() {
  const categories = [
    { title: 'Water Safety', icon: Droplet, count: 4 },
    { title: 'Disease Prevention', icon: ShieldCheck, count: 6 },
    { title: 'Protocol Training', icon: Brain, count: 3 },
    { title: 'Emergency Response', icon: AlertTriangle, count: 2 }
  ];

  const modules = [
    { title: 'Identifying Water Contamination', type: 'Video', duration: '12 min', desc: 'Learn the heuristic visual and chemical signs of regional water source compromise.', icon: Droplet, color: 'text-sky-400', delay: 0 },
    { title: 'Ground Intelligence Reporting', type: 'Interactive', duration: '15 min', desc: 'Standard protocols for high-fidelity community health reporting and data capture.', icon: FileText, color: 'text-primary', delay: 0.1 },
    { title: 'Neural Forecast Interpretation', type: 'Technical', duration: '20 min', desc: 'How to understand and act upon high-confidence AI outbreak projections.', icon: Brain, color: 'text-violet-500', delay: 0.2 },
    { title: 'Bio-hazard Containment 101', type: 'Manual', duration: '10 min', desc: 'Immediate local measures for verified symptom clusters and outbreak zones.', icon: Microscope, color: 'text-rose-500', delay: 0.3 }
  ];

  const startCertification = () => {
    toast.info("Certification Protocol Initiated", {
      description: "Analyzing current clearance level and completed nodes..."
    });
  };

  return (
    <ProtectedRoute>
      <div className="space-y-10 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold uppercase tracking-tight">Intelligence Education Hub</h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Master the protocols of global health surveillance</p>
          </div>
          <div className="flex items-center gap-4 bg-[var(--surface-2)] p-2 rounded-2xl border border-[var(--border-soft)]">
             <div className="px-4 py-2 text-center border-r border-[var(--border-soft)]">
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Completed</p>
                <p className="text-lg font-bold">12/15</p>
             </div>
             <div className="px-4 py-2 text-center">
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Protocol Score</p>
                <p className="text-lg font-bold text-emerald-500">920</p>
             </div>
          </div>
        </div>

        {/* Quick Discovery */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
           {categories.map((cat, i) => (
             <motion.div 
               key={cat.title}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="p-6 rounded-[2rem] bg-[var(--surface-1)] border border-[var(--border-soft)] hover:border-primary/40 transition-all cursor-pointer group flex flex-col items-center text-center gap-4 shadow-sm"
               onClick={() => toast(`Filtering by: ${cat.title}`)}
             >
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                   <cat.icon className="w-6 h-6" />
                </div>
                <div>
                   <h5 className="font-bold text-sm uppercase tracking-tight">{cat.title}</h5>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">{cat.count} Modules</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Main Feed */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Certified Learning Protocols</h3>
              <Button 
                onClick={() => toast.info("Exporting protocol transcript...")}
                variant="ghost" 
                className="text-[10px] font-bold uppercase tracking-widest gap-2"
              >
                View Transcript <ArrowRight className="w-3 h-3" />
              </Button>
           </div>
           <div className="grid md:grid-cols-2 gap-8">
              {modules.map((m, i) => (
                <ModuleCard key={m.title} {...m} />
              ))}
           </div>
        </div>

        {/* Gamification / Certification Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-12 md:p-16 rounded-[4rem] bg-gradient-to-br from-violet-900/40 to-primary/10 border border-violet-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12"
        >
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_70%)] opacity-10" />
           <div className="relative z-10 space-y-6 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-[10px] font-bold uppercase tracking-widest">
                 <CheckCircle2 className="w-3.5 h-3.5" /> Institutional Certification
              </div>
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-white leading-none">Become a Verified <br />Intelligence Node.</h2>
              <p className="text-violet-100/60 text-lg">Complete all 15 core learning protocols to upgrade your clearance level and gain access to advanced neural forecasting tools.</p>
           </div>
           <Button 
             onClick={startCertification}
             className="h-20 px-12 rounded-[2rem] bg-white text-violet-900 font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-xl relative z-10 shrink-0"
           >
              Start Certification
           </Button>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
