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
        <Card key={index} className="bg-card border border-border hover:border-primary/40 transition-all rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${stat.bg}`}>
                 <stat.icon className={`w-5 h-5 ${stat.color}`} />
               </div>
               <div>
                  <div className="text-xs text-muted-foreground mb-0.5">
                    {stat.title}
                  </div>
                  <div className="text-lg font-bold">
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
