"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useDashboardAggregates } from '@/services/healthDataService';

const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const COLORS = ['#00d9ff', '#10b981', '#f59e0b', '#8b5cf6'];

export default function DistributionSection({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const aggregates = useDashboardAggregates();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !aggregates) {
    return <div className="h-full flex items-center justify-center animate-pulse bg-[var(--surface-2)] text-[8px] font-bold uppercase tracking-widest opacity-20">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={aggregates.distribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              stroke="transparent"
            >
              {aggregates.distribution.map((entry: any, index: number) => (
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

      <div className="mt-4 grid grid-cols-2 gap-3">
         {aggregates.distribution.map((d: any, index: number) => (
           <div key={d.name} className="flex items-center gap-2 bg-secondary p-2.5 rounded-lg border border-border">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground truncate">{d.name}</div>
                <div className="text-sm font-semibold">{d.value}</div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
