"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BarChart2, TrendingUp, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useDashboardAggregates } from '@/services/healthDataService';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const COLORS = ['#00d9ff', '#10b981', '#f59e0b', '#8b5cf6'];

interface ChartsSectionProps {
  compact?: boolean;
  trendsData?: Array<{ month: string; actual: number; predicted?: number }>;
  distributionData?: Array<{ name: string; value: number }>;
}

export default function ChartsSection({ compact, trendsData, distributionData }: ChartsSectionProps) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const aggregates = useDashboardAggregates();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentTrends = trendsData || aggregates?.trends;
  const currentDistribution = distributionData || aggregates?.distribution;

  if (!isMounted || (!currentTrends && !aggregates)) {
    return <div className="h-full flex items-center justify-center animate-pulse bg-[var(--surface-2)] text-[8px] font-bold uppercase tracking-widest opacity-20">Syncing Telemetry...</div>;
  }

  // Generate dynamic line or bar based on chartType setting
  const renderTrendChart = () => {
    if (chartType === "bar") {
      return (
        <BarChart data={currentTrends}>
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
          <Bar dataKey="actual" fill="#00d9ff" radius={[4, 4, 0, 0]} name="Confirmed Cases" />
        </BarChart>
      );
    }

    return (
      <LineChart data={currentTrends}>
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
    );
  };

  const ChartContent = (
    <div className="flex-1 min-h-0 w-full p-2 h-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderTrendChart()}
      </ResponsiveContainer>
    </div>
  );

  if (compact) return ChartContent;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Dynamic Line/Bar Trend Chart */}
      <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg hover:border-primary/20 transition-all duration-300">
        <CardHeader className="border-b border-border/60 bg-secondary/20 py-4 px-5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-primary" />
            <CardTitle className="text-sm font-bold text-foreground">{t('casesTrend', 'Epidemiological Case Trends')}</CardTitle>
          </div>
          
          {/* Interactive Chart Type Toggle */}
          <div className="flex bg-secondary p-0.5 rounded-lg border border-border/85 text-[10px] font-bold">
            <button 
              onClick={() => setChartType("line")}
              className={`px-2 py-1 rounded-md transition-all ${chartType === "line" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Line
            </button>
            <button 
              onClick={() => setChartType("bar")}
              className={`px-2 py-1 rounded-md transition-all ${chartType === "bar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Bar
            </button>
          </div>
        </CardHeader>
        <CardContent className="h-[300px] p-4">
          {ChartContent}
        </CardContent>
      </Card>

      {/* Distribution categories Bar Chart */}
      <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg hover:border-primary/20 transition-all duration-300">
        <CardHeader className="border-b border-border/60 bg-secondary/20 py-4 px-5 flex flex-row items-center gap-2">
          <BarChart2 className="w-4.5 h-4.5 text-violet-400" />
          <CardTitle className="text-sm font-bold text-foreground">{t('waterQualityTrend', 'Regional Hazard Categories')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] p-4">
          <div className="flex-1 min-h-0 w-full p-2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
                <XAxis 
                  dataKey="name" 
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
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]} 
                  name="Active Incidents"
                >
                  {currentDistribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
