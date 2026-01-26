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

const casesTrendData = [
  { month: 'Jan', cases: 45, predictions: 48 },
  { month: 'Feb', cases: 52, predictions: 55 },
  { month: 'Mar', cases: 48, predictions: 50 },
  { month: 'Apr', cases: 61, predictions: 65 },
  { month: 'May', cases: 75, predictions: 80 },
  { month: 'Jun', cases: 88, predictions: 95 },
  { month: 'Jul', cases: 132, predictions: 140 }
];

const waterQualityData = [
  { month: 'Jan', pH: 7.2, turbidity: 3.5 },
  { month: 'Feb', pH: 7.1, turbidity: 4.2 },
  { month: 'Mar', pH: 6.9, turbidity: 5.1 },
  { month: 'Apr', pH: 7.0, turbidity: 4.8 },
  { month: 'May', pH: 6.8, turbidity: 6.2 },
  { month: 'Jun', pH: 6.7, turbidity: 7.5 },
  { month: 'Jul', pH: 6.9, turbidity: 6.8 }
];

export default function ChartsSection() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="grid gap-6 lg:grid-cols-2 h-[300px] animate-pulse bg-muted rounded-xl"></div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="backdrop-blur-xl bg-card/50">
        <CardHeader>
          <CardTitle>{t('casesTrend', 'Cases Trend')}</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-card/50">
        <CardHeader>
          <CardTitle>{t('waterQualityTrend', 'Water Quality Trend')}</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
