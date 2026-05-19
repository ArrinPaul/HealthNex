"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, AlertTriangle, Droplet, TrendingUp } from 'lucide-react';
import { useDashboardAggregates } from '@/services/healthDataService';

export default function StatsGrid() {
  const { t } = useTranslation();
  const aggregates = useDashboardAggregates();

  const stats = [
    {
      title: t('activeCases', 'Active Cases'),
      value: aggregates?.stats.totalCases.toString() || '0',
      icon: Activity,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: t('activeAlerts', 'Active Alerts'),
      value: aggregates?.stats.activeAlerts.toString() || '0',
      icon: Droplet,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10'
    },
    {
      title: t('aiInsights', 'Anomalies'),
      value: aggregates?.stats.aiInsightsCount.toString() || '0',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: t('totalNodes', 'System Nodes'),
      value: aggregates?.stats.totalNodes.toString() || '0',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-sm theme-transition group hover:border-primary/40 rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${stat.bg} border border-[var(--border-soft)] group-hover:scale-110 transition-transform`}>
                 <stat.icon className={`w-6 h-6 ${stat.color}`} />
               </div>
               <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    {stat.title}
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {aggregates ? stat.value : '...'}
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
