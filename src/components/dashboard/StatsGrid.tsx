"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Droplet, TrendingUp } from 'lucide-react';
import { useDiseaseData, useAlerts } from '@/services/healthDataService';

export default function StatsGrid() {
  const { t } = useTranslation();
  const diseaseData = useDiseaseData();
  const alertsData = useAlerts();

  // Calculate dynamic stats
  const totalCases = Array.isArray(diseaseData) 
    ? diseaseData.reduce((sum: number, item: any) => sum + (item.confirmedCases || item.cases || 0), 0)
    : 0;
  
  const waterAlerts = Array.isArray(alertsData)
    ? alertsData.filter((a: any) => a.type === 'water').length
    : 0;

  const stats = [
    {
      title: t('activeCases', 'Active Cases'),
      value: totalCases.toString(),
      change: '+12%',
      icon: Activity,
      color: 'text-primary',
      bg: 'bg-primary/15'
    },
    {
      title: t('aiPredictions', 'AI Predictions'),
      value: 'N/A',
      change: 'Pending',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/15'
    },
    {
      title: t('waterQualityAlerts', 'Water Quality Alerts'),
      value: waterAlerts.toString(),
      change: 'Live',
      icon: Droplet,
      color: 'text-sky-400',
      bg: 'bg-sky-500/15'
    },
    {
      title: t('aiInsights', 'AI Insights Today'),
      value: 'N/A',
      change: 'Live',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15'
    }
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-card border border-[var(--border-soft)] shadow-[0_24px_50px_-40px_rgba(0,0,0,0.7)] theme-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-[var(--border-soft)] mb-6">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {stat.title}
            </CardTitle>
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--border-soft)] ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold tracking-tight uppercase">{stat.value}</div>
            <div className="flex items-center gap-2 mt-4">
                <div className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${stat.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-[var(--surface-3)] text-muted-foreground border-[var(--border-soft)]'}`}>
                  {stat.change}
                </div>
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">Trend</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
