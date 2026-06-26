"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useDashboardAggregates } from '@/services/healthDataService';

const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const COLORS = ['#00d9ff', '#10b981', '#f59e0b', '#8b5cf6'];

interface DistributionSectionProps {
  compact?: boolean;
  distributionData?: Array<{ name: string; value: number }>;
}

export default function DistributionSection({ compact, distributionData }: DistributionSectionProps) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const aggregates = useDashboardAggregates();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentData = distributionData || aggregates?.distribution;

  if (!isMounted || (!currentData && !aggregates)) {
    return <div className="h-full flex items-center justify-center animate-pulse bg-[var(--surface-2)] text-[8px] font-bold uppercase tracking-widest opacity-20">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex-1 min-h-[140px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={currentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={6}
              dataKey="value"
              stroke="transparent"
            >
              {currentData?.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

      <div className="mt-2 grid grid-cols-2 gap-2">
         {currentData?.map((d: any, index: number) => (
           <div key={d.name} className="flex items-center gap-1.5 bg-secondary/40 p-2 rounded-xl border border-border/60">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-muted-foreground truncate font-semibold uppercase">{d.name}</div>
                <div className="text-xs font-black text-foreground">{d.value}</div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
