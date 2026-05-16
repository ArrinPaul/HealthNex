"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const diseaseDistribution = [
  { name: 'Waterborne', value: 45, color: '#00d9ff' },
  { name: 'Vector', value: 35, color: '#10b981' },
  { name: 'Respiratory', value: 30, color: '#f59e0b' },
  { name: 'Others', value: 22, color: '#8b5cf6' }
];

export default function DistributionSection({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-full flex items-center justify-center animate-pulse bg-[var(--surface-2)] text-[8px] font-bold uppercase tracking-widest opacity-20">Loading Stats...</div>;
  }

  const ChartContent = (
    <div className="flex-1 flex flex-col h-full">
      {!compact && (
        <CardHeader className="border-b border-[var(--border-soft)] mb-6">
          <CardTitle className="uppercase tracking-tight">{t('diseaseDistribution', 'Disease Distribution')}</CardTitle>
        </CardHeader>
      )}
      
      {compact && (
        <div className="p-5 border-b border-[var(--border-soft)] flex items-center gap-3 shrink-0 bg-[var(--surface-2)]/50 backdrop-blur">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-500 flex items-center justify-center border border-violet-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-tight">Disease Distribution</h3>
        </div>
      )}

      <div className="flex-1 min-h-0 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={diseaseDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={compact ? 45 : 60}
              outerRadius={compact ? 70 : 80}
              paddingAngle={5}
              dataKey="value"
              stroke="transparent"
            >
              {diseaseDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="p-5 pt-0 grid grid-cols-2 gap-2">
         {diseaseDistribution.map((d) => (
           <div key={d.name} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[8px] font-bold uppercase text-muted-foreground truncate">{d.name}</span>
           </div>
         ))}
      </div>
    </div>
  );

  if (compact) return ChartContent;

  return (
    <Card className="bg-card border border-[var(--border-soft)] shadow-[0_24px_50px_-40px_rgba(0,0,0,0.7)] theme-transition h-full flex flex-col">
      <CardContent className="flex-1 p-0 flex flex-col">
        {ChartContent}
      </CardContent>
    </Card>
  );
}
