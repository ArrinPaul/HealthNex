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
    <div className="flex flex-col gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-card border border-[var(--border-soft)] shadow-md theme-transition group hover:border-primary/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
               <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
                 {stat.title}
               </CardTitle>
               <div className={`w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border-soft)] ${stat.bg} shadow-inner`}>
                 <stat.icon className={`w-5 h-5 ${stat.color}`} />
               </div>
            </div>
            <div className="flex items-baseline justify-between">
               <div className="text-3xl font-bold tracking-tight uppercase text-foreground">{stat.value}</div>
               <div className={`px-2.5 py-1 text-[8px] font-bold uppercase rounded-lg border ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[var(--surface-3)] text-muted-foreground border-[var(--border-soft)]'}`}>
                 {stat.change}
               </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
