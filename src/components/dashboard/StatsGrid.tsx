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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: t('aiPredictions', 'AI Predictions'),
      value: '94.7%',
      change: 'Accurate',
      icon: AlertTriangle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: t('waterQualityAlerts', 'Water Quality Alerts'),
      value: waterAlerts.toString(),
      change: '-2',
      icon: Droplet,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      title: t('aiInsights', 'AI Insights Today'),
      value: '247',
      change: '+28%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="backdrop-blur-xl bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
