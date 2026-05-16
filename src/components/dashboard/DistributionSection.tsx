"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const diseaseDistribution = [
  { name: 'Waterborne', value: 45, color: '#3b82f6' },
  { name: 'Vector-borne', value: 35, color: '#10b981' },
  { name: 'Respiratory', value: 30, color: '#f59e0b' },
  { name: 'Others', value: 22, color: '#8b5cf6' }
];

export default function DistributionSection() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[300px] animate-pulse bg-[var(--surface-2)]"></div>;
  }

  return (
    <Card className="bg-card border border-[var(--border-soft)] shadow-[0_24px_50px_-40px_rgba(0,0,0,0.7)] theme-transition">
      <CardHeader className="border-b border-[var(--border-soft)] mb-6">
        <CardTitle className="uppercase tracking-tight">{t('diseaseDistribution', 'Disease Distribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={diseaseDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              stroke="var(--border)"
              strokeWidth={2}
            >
              {diseaseDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
