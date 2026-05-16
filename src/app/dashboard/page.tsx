"use client";

import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AISuggestions from '@/components/AISuggestions';
import { useDiseaseData } from '@/services/healthDataService';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ChartsSection from '@/components/dashboard/ChartsSection';
import DistributionSection from '@/components/dashboard/DistributionSection';
import { Activity, ShieldCheck, Globe, Info } from 'lucide-react';

const DiseaseMap = dynamic(() => import('@/components/DiseaseMap'), { ssr: false });

export default function DashboardPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const diseaseData = useDiseaseData();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin', 'health-worker']}>
      <div className="space-y-12 animate-in fade-in duration-500">
        
        {/* Dashboard Header - Solid Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-[var(--border-soft)]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full border border-primary/30 text-[10px] uppercase tracking-[0.3em] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Intelligence Protocol Active</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground uppercase">
              {t('dashboard', 'System Overview')}
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed font-semibold">
              Welcome to the HealthNex Control Center. Monitor real-time disease telemetry, 
              analyze AI-driven predictive insights, and manage regional health safety protocols from this unified interface.
            </p>
          </div>
          
          <div className="flex items-center gap-6 p-6 bg-[var(--surface-2)] text-foreground border border-[var(--border-soft)] rounded-2xl theme-transition">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Global Status</span>
              <span className="text-lg font-semibold uppercase">All Nodes Operational</span>
            </div>
            <div className="w-14 h-14 bg-[var(--surface-1)] flex items-center justify-center text-primary border border-primary/40 rounded-2xl shadow-[0_0_20px_rgba(0,217,255,0.35)]">
              <Globe className="w-8 h-8 animate-pulse" />
            </div>
          </div>
        </div>

        {/* System Notification - Solid Style */}
        <div className="p-8 bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-2xl flex items-start gap-6 theme-transition">
          <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center shrink-0 rounded-xl shadow-[0_0_18px_rgba(0,217,255,0.25)]">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-lg uppercase tracking-tight">Real-time Intelligence Sync</h4>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              The system is currently aggregating data from 500+ regional nodes. AI predictions are updated every 30 minutes to ensure 
              maximum precision for early outbreak detection and water quality monitoring.
            </p>
          </div>
        </div>

        {/* AI-Powered Suggestions */}
        <AISuggestions />

        {/* Stats Grid */}
        <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-lg shadow-[0_0_14px_rgba(0,217,255,0.35)]">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight uppercase">Key Performance Indicators</h2>
           </div>
           <StatsGrid />
        </div>

        {/* Map and Disease Distribution */}
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-[var(--surface-1)] border border-[var(--border-soft)] p-8 rounded-2xl theme-transition">
            <div className="mb-8">
                <h3 className="text-2xl font-bold uppercase tracking-tight">{t('diseaseHotspots', 'Regional Disease Hotspots')}</h3>
                <p className="text-xs font-semibold uppercase text-muted-foreground mt-1">Geospatial visualization of confirmed cases across active monitoring zones.</p>
            </div>
            <div className="border border-[var(--border-soft)] rounded-2xl overflow-hidden">
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
                <div className="h-[400px] flex items-center justify-center font-bold uppercase opacity-50">Loading map...</div>
              )}
            </div>
          </div>

          <DistributionSection />
        </div>

        {/* Charts */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-lg shadow-[0_0_14px_rgba(0,217,255,0.35)]">
                <BarChart className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight uppercase">Historical Trend Analysis</h2>
           </div>
           <ChartsSection />
        </div>
      </div>
    </ProtectedRoute>
  );
}
