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
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">{t('dashboard', 'Dashboard')}</h1>
          <p className="text-muted-foreground">
            Real-time overview of public health metrics.
          </p>
        </div>

        {/* AI-Powered Suggestions */}
        <AISuggestions />

        {/* Stats Grid */}
        <StatsGrid />

        {/* Map and Disease Distribution */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 backdrop-blur-xl bg-card/50">
            <CardHeader>
              <CardTitle>{t('diseaseHotspots', 'Disease Hotspots')}</CardTitle>
            </CardHeader>
            <CardContent>
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
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading map...</div>
              )}
            </CardContent>
          </Card>

          <DistributionSection />
        </div>

        {/* Charts */}
        <ChartsSection />
      </div>
    </ProtectedRoute>
  );
}
