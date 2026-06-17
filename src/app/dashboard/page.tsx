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
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-500 font-medium">System Live</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('dashboard', 'Dashboard')}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <div className="text-right">
                <div className="text-xs">Nodes</div>
                <div className="font-semibold">{aggregates?.stats.totalNodes || '...'}</div>
             </div>
             <div className="w-px h-6 bg-border" />
             <div className="text-right">
                <div className="text-xs">Role</div>
                <div className="font-semibold text-primary capitalize">{user?.role?.replace('-', ' ')}</div>
             </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
               <StatsGrid />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 min-h-[400px] bg-card border border-border rounded-2xl overflow-hidden flex flex-col relative"
            >
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium">Regional Map</h3>
                </div>
                <div className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  Live
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
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">Loading map...</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div className="bg-card border border-border rounded-2xl p-6 flex-1 min-h-[250px] overflow-hidden">
               <InstitutionalTrust />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 h-[300px] overflow-hidden flex flex-col">
               <div className="flex items-center gap-2 mb-4">
                 <Activity className="w-4 h-4 text-violet-500" />
                 <h3 className="text-sm font-medium">Outbreak Distribution</h3>
               </div>
               <div className="flex-1 min-h-0">
                  <DistributionSection compact />
               </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between hover:bg-primary/10 transition-colors cursor-pointer">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-primary">System Status</div>
                    <div className="text-sm font-semibold">Operational</div>
                  </div>
               </div>
               <Bell className="w-4 h-4 text-primary animate-pulse" />
            </div>

          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 pb-4">
           <ChartsSection />
        </div>

      </div>
    </ProtectedRoute>
  );
}
