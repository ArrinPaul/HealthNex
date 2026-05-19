"use client";

import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useDiseaseData, useDashboardAggregates } from '@/services/healthDataService';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ChartsSection from '@/components/dashboard/ChartsSection';
import DistributionSection from '@/components/dashboard/DistributionSection';
import { Globe, Map as MapIcon, Zap, LayoutGrid, Bell, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import InstitutionalTrust from '@/components/dashboard/InstitutionalTrust';

const DiseaseMap = dynamic(() => import('@/components/DiseaseMap'), { ssr: false });

export default function DashboardPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const diseaseData = useDiseaseData();
  const aggregates = useDashboardAggregates();
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker', 'community-user']}>
      <div className="h-full flex flex-col gap-8 p-2 md:p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Simple Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 px-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">System Live</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase">
              {t('dashboard', 'Core Command')}
            </h1>
          </div>
          
          <div className="flex items-center gap-6 text-muted-foreground">
             <div className="text-right">
                <div className="text-[8px] font-bold uppercase tracking-widest">Global Nodes</div>
                <div className="text-sm font-bold text-foreground">{aggregates?.stats.totalNodes || '...'}</div>
             </div>
             <div className="w-[1px] h-8 bg-[var(--border-soft)]" />
             <div className="text-right">
                <div className="text-[8px] font-bold uppercase tracking-widest">Active Access</div>
                <div className="text-sm font-bold text-primary uppercase">{user?.role?.replace('-', ' ')}</div>
             </div>
          </div>
        </div>

        {/* Simplified 2-Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
          
          {/* Main Workspace (Left Column) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Primary Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
               <StatsGrid />
            </div>

            {/* Main Visualizer (Map) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 min-h-[400px] bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl relative group"
            >
              <div className="p-6 border-b border-[var(--border-soft)] flex items-center justify-between shrink-0 bg-[var(--surface-2)]/30">
                <div className="flex items-center gap-3">
                  <MapIcon className="w-4 h-4 text-primary" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Regional Intelligence Map</h3>
                </div>
                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--border-soft)]">
                  Live Telemetry
                </div>
              </div>
              
              <div className="flex-1 relative">
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
                  <div className="absolute inset-0 flex items-center justify-center font-bold uppercase opacity-30 text-[10px] tracking-[0.4em]">Initializing Map...</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Intelligence Sidebar (Right Column) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Institutional Trust Layer */}
            <div className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-[2.5rem] p-8 shadow-lg flex-1 min-h-[300px] overflow-hidden">
               <InstitutionalTrust />
            </div>

            {/* Simplified Data Insights */}
            <div className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-[2.5rem] p-8 h-[350px] shadow-lg overflow-hidden flex flex-col">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20">
                   <Activity className="w-4 h-4" />
                 </div>
                 <h3 className="text-[10px] font-bold uppercase tracking-widest">Outbreak Distribution</h3>
               </div>
               <div className="flex-1 min-h-0">
                  <DistributionSection compact />
               </div>
            </div>

            {/* Quick Actions / Status */}
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-center justify-between group hover:bg-primary/10 transition-colors cursor-pointer">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Protocol Status</div>
                    <div className="text-xs font-bold">Optimal Integrity</div>
                  </div>
               </div>
               <Bell className="w-4 h-4 text-primary animate-pulse" />
            </div>

          </div>
        </div>

        {/* Trends Row - Simplified at bottom */}
        <div className="grid grid-cols-1 gap-8 px-2 pb-4">
           <ChartsSection />
        </div>

      </div>
    </ProtectedRoute>
  );
}
