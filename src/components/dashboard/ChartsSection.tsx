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
  
  // Historical data should be fetched from Convex/API in production.
  // Removing hardcoded mock data.
  const casesTrendData: any[] = [];
  const waterQualityData: any[] = [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="grid gap-6 lg:grid-cols-2 h-[300px] animate-pulse bg-muted rounded-xl"></div>;
  }

  const EmptyState = ({ message }: { message: string }) => (
    <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">
      <p>{message}</p>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="backdrop-blur-xl bg-card/50">
        <CardHeader>
          <CardTitle>{t('casesTrend', 'Cases Trend')}</CardTitle>
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
                <Line type="monotone" dataKey="cases" stroke="#3b82f6" strokeWidth={2} name="Actual Cases" />
                <Line type="monotone" dataKey="predictions" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Historical case data not available" />
          )}
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-card/50">
        <CardHeader>
          <CardTitle>{t('waterQualityTrend', 'Water Quality Trend')}</CardTitle>
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
                <Bar dataKey="pH" fill="#3b82f6" name="pH Level" />
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
