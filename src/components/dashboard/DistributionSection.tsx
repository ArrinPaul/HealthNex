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
    <div className="flex items-center justify-between h-full gap-4 min-h-0">
      {/* Chart Section */}
      <div className="w-[140px] h-[140px] relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={currentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={38}
              outerRadius={58}
              paddingAngle={4}
              dataKey="value"
              stroke="transparent"
            >
              {currentData?.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.2))' }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#fff',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Total</span>
          <span className="text-sm font-black text-foreground">
            {currentData?.reduce((acc: number, item: any) => acc + (item.value || 0), 0) || 0}
          </span>
        </div>
      </div>

      {/* Legend / Status List Section */}
      <div className="flex-1 flex flex-col gap-1.5 justify-center py-1 max-h-full overflow-y-auto pr-1">
         {currentData?.map((d: any, index: number) => (
           <div 
             key={d.name} 
             className="flex items-center justify-between gap-2 bg-secondary/20 hover:bg-secondary/40 p-2 rounded-xl border border-border/30 hover:border-border/60 transition-all"
           >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">{d.name}</span>
              </div>
              <span className="text-xs font-black text-foreground font-mono bg-background/50 px-2 py-0.5 rounded border border-border/20">{d.value}</span>
           </div>
         ))}
      </div>
    </div>
  );
}
