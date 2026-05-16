"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

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

export default function ChartsSection() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  
  const casesTrendData: any[] = [];
  const waterQualityData: any[] = [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="grid gap-6 lg:grid-cols-2 h-[300px] animate-pulse bg-[var(--surface-2)]"></div>;
  }

  const EmptyState = ({ message }: { message: string }) => (
    <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-[var(--surface-2)] border border-dashed border-[var(--border-soft)] rounded-2xl">
      <p className="font-semibold uppercase tracking-widest text-xs">{message}</p>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="bg-card border border-[var(--border-soft)] shadow-[0_24px_50px_-40px_rgba(0,0,0,0.7)] theme-transition">
        <CardHeader className="border-b border-[var(--border-soft)] mb-6">
          <CardTitle className="uppercase tracking-tight">{t('casesTrend', 'Cases Trend')}</CardTitle>
        </CardHeader>
        <CardContent>
          {casesTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={casesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cases" stroke="#00d9ff" strokeWidth={2} name="Actual Cases" />
                <Line type="monotone" dataKey="predictions" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Historical case data not available" />
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border border-[var(--border-soft)] shadow-[0_24px_50px_-40px_rgba(0,0,0,0.7)] theme-transition">
        <CardHeader className="border-b border-[var(--border-soft)] mb-6">
          <CardTitle className="uppercase tracking-tight">{t('waterQualityTrend', 'Water Quality Trend')}</CardTitle>
        </CardHeader>
        <CardContent>
          {waterQualityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={waterQualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pH" fill="#00d9ff" name="pH Level" />
                <Bar dataKey="turbidity" fill="#f59e0b" name="Turbidity (NTU)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Historical water quality data not available" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
