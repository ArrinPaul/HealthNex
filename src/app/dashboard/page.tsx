"use client";

import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AISuggestions from '@/components/AISuggestions';
import { useDiseaseData } from '@/services/healthDataService';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ChartsSection from '@/components/dashboard/ChartsSection';
import DistributionSection from '@/components/dashboard/DistributionSection';
import { Activity, ShieldCheck, Globe, Info, BarChart3, Map as MapIcon, Zap, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import IntelligencePulse from '@/components/dashboard/IntelligencePulse';
import CommunityImpact from '@/components/dashboard/CommunityImpact';

const DiseaseMap = dynamic(() => import('@/components/DiseaseMap'), { ssr: false });

export default function DashboardPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const diseaseData = useDiseaseData();
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker', 'community-user']}>
      <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Compact Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase flex items-center gap-3">
                {t('dashboard', 'System Core')}
                <span className="hidden md:inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[8px] uppercase tracking-widest font-bold">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time Synchronization Active
                </span>
              </h1>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{user?.role?.replace('-', ' ')} Layer Access</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-xl">
             <div className="text-right">
                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Session Uptime</div>
                <div className="text-[10px] font-bold text-foreground font-mono">04:22:15</div>
             </div>
             <div className="w-[1px] h-6 bg-[var(--border-soft)] mx-2" />
             <Globe className="w-5 h-5 text-primary animate-pulse" />
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 grid-rows-none md:grid-rows-6 gap-6 min-h-0">
          
          {/* Main Map Visualization - 8x4 Grid */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-8 md:row-span-4 bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl overflow-hidden flex flex-col shadow-xl shadow-black/10 relative group"
          >
            <div className="p-5 border-b border-[var(--border-soft)] flex items-center justify-between shrink-0 bg-[var(--surface-2)]/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
                  <MapIcon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-tight">{t('diseaseHotspots', 'Geospatial Hotspots')}</h3>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
            
            <div className="flex-1 relative bg-black/5">
              {isMounted ? (
                <DiseaseMap 
                  hotspots={Array.isArray(diseaseData) ? diseaseData.map((d: any) => ({
                    lat: d.latitude || 0,
                    lng: d.longitude || 0,
                    cases: d.confirmedCases || d.cases || 0,
                    location: d.location || 'Unknown'
                  })) : []} 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-bold uppercase opacity-30 text-[10px] tracking-[0.4em]">Initializing Global Map...</div>
              )}
              
              {/* Floating Status Overlay */}
              <div className="absolute bottom-6 right-6 p-4 bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl pointer-events-none space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Analyzing 512 Nodes</span>
                 </div>
                 <div className="w-32 h-1 bg-[var(--border-soft)] rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: [-128, 128] }} 
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" 
                    />
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Column - 4x4 Grid */}
          <div className="md:col-span-4 md:row-span-4 flex flex-col gap-6">
            <div className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl p-6 flex-1 shadow-lg shadow-black/5 overflow-hidden">
               <IntelligencePulse />
            </div>
            <div className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl p-6 h-80 shadow-lg shadow-black/5 overflow-hidden">
               <CommunityImpact />
            </div>
          </div>

          {/* AI Insights & Notifications - 4x2 Bottom Left */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 md:row-span-2 bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl overflow-hidden flex flex-col shadow-lg shadow-black/5"
          >
            <div className="p-5 border-b border-[var(--border-soft)] flex items-center gap-3 shrink-0 bg-[var(--surface-2)]/50 backdrop-blur">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-tight">Active Protocol Notifications</h3>
            </div>
            <div className="flex-1 overflow-auto p-5 custom-scrollbar bg-[var(--surface-1)]">
               <div className="space-y-4">
                  {[
                    { type: 'Alert', text: 'Spike in respiratory symptoms detected in Zone 4 (Confidence: 88%)', color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { type: 'Update', text: 'Water quality data synced from 24 regional stations', color: 'text-sky-500', bg: 'bg-sky-500/10' },
                    { type: 'System', text: 'AI Prediction engine recalibrated for seasonal variation', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
                  ].map((note, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-soft)] items-start group hover:border-primary/30 transition-colors">
                       <div className={`w-2 h-2 rounded-full mt-1 ${note.bg} border border-current shrink-0 ${note.color}`} />
                       <div className="space-y-1">
                          <div className={`text-[8px] font-bold uppercase tracking-widest ${note.color}`}>{note.type}</div>
                          <p className="text-[10px] font-semibold leading-relaxed text-muted-foreground">{note.text}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>

          {/* Distribution - 4x2 Bottom Middle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-4 md:row-span-2 overflow-hidden bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl shadow-lg shadow-black/5 flex flex-col"
          >
             <DistributionSection compact />
          </motion.div>

          {/* Charts Section - 4x2 Bottom Right */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-4 md:row-span-2 overflow-hidden bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl shadow-lg shadow-black/5 flex flex-col"
          >
             <div className="p-5 border-b border-[var(--border-soft)] flex items-center gap-3 shrink-0 bg-[var(--surface-2)]/50 backdrop-blur">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-tight">Telemetry Trends</h3>
             </div>
             <div className="flex-1 min-h-0">
                <ChartsSection compact />
             </div>
          </motion.div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
