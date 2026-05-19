"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useDashboardAggregates } from '@/services/healthDataService';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic<any>(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

export default function ChartsSection({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const aggregates = useDashboardAggregates();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !aggregates) {
    return <div className="h-full flex items-center justify-center animate-pulse bg-[var(--surface-2)] text-[8px] font-bold uppercase tracking-widest opacity-20">Syncing Telemetry...</div>;
  }

  const ChartContent = (
    <div className="flex-1 min-h-0 w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={aggregates.trends}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold', fill: 'var(--muted-foreground)' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold', fill: 'var(--muted-foreground)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--surface-2)', 
              borderColor: 'var(--border-soft)',
              borderRadius: '1rem',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#00d9ff" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#00d9ff', strokeWidth: 2, stroke: 'var(--surface-1)' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Confirmed"
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#10b981" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
            name="Predicted"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  if (compact) return ChartContent;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="bg-card border border-[var(--border-soft)] shadow-md theme-transition">
        <CardHeader className="border-b border-[var(--border-soft)] mb-6">
          <CardTitle className="uppercase tracking-tight">{t('casesTrend', 'Protocol Intelligence Trends')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {ChartContent}
        </CardContent>
      </Card>

      <Card className="bg-card border border-[var(--border-soft)] shadow-md theme-transition">
        <CardHeader className="border-b border-[var(--border-soft)] mb-6">
          <CardTitle className="uppercase tracking-tight">{t('waterQualityTrend', 'Regional Coverage')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
           <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-[var(--surface-2)] border border-dashed border-[var(--border-soft)] rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Activity className="w-6 h-6" />
              </div>
              <p className="font-semibold uppercase tracking-widest text-[10px]">Synchronizing regional coverage data from {aggregates.stats.totalNodes} nodes...</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
