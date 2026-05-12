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
      bg: 'bg-primary/10 border-primary/20'
    },
    {
      title: t('aiPredictions', 'AI Predictions'),
      value: 'N/A',
      change: 'Pending',
      icon: AlertTriangle,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10 border-violet-500/20'
    },
    {
      title: t('waterQualityAlerts', 'Water Quality Alerts'),
      value: waterAlerts.toString(),
      change: 'Live',
      icon: Droplet,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: t('aiInsights', 'AI Insights Today'),
      value: 'N/A',
      change: 'Live',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="glass border-0 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground font-display">
              {stat.title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl border ${stat.bg} transition-colors group-hover:bg-opacity-20`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold font-display tracking-tight">{stat.value}</div>
            <p className={`text-xs font-medium mt-1 ${stat.change.startsWith('+') || stat.change === 'Accurate' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stat.change} <span className="text-muted-foreground/60">from last month</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
