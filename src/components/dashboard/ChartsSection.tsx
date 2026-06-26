"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BarChart2, TrendingUp, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useDashboardAggregates } from '@/services/healthDataService';

import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

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

  const defaultTrends = [
    { month: 'Jan', actual: 45, predicted: 40 },
    { month: 'Feb', actual: 52, predicted: 48 },
    { month: 'Mar', actual: 49, predicted: 50 },
    { month: 'Apr', actual: 63, predicted: 58 },
    { month: 'May', actual: 58, predicted: 62 },
    { month: 'Jun', actual: 74, predicted: 68 },
  ];

  const defaultDistribution = [
    { name: 'Waterborne', value: 12 },
    { name: 'Vector', value: 19 },
    { name: 'Respiratory', value: 25 },
    { name: 'Environmental', value: 8 },
  ];

  const currentTrends = trendsData || aggregates?.trends || defaultTrends;
  const currentDistribution = distributionData || aggregates?.distribution || defaultDistribution;

  if (!isMounted) {
    return <div className="h-full flex items-center justify-center animate-pulse bg-[var(--surface-2)] text-[8px] font-bold uppercase tracking-widest opacity-20">Syncing Telemetry...</div>;
  }

  // Generate dynamic line or bar based on chartType setting
  const renderTrendChart = () => {
    if (chartType === "bar") {
      return (
        <BarChart data={currentTrends} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" strokeOpacity={0.6} vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={{ stroke: '#333333', strokeWidth: 1 }}
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#b0b0b0' }}
          />
          <YAxis 
            axisLine={{ stroke: '#333333', strokeWidth: 1 }}
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#b0b0b0' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #333333',
              borderRadius: '0.75rem',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#e2e8f0',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              padding: '10px 14px'
            }}
            itemStyle={{ color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            cursor={{ stroke: '#00d9ff', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Bar dataKey="actual" fill="#00d9ff" radius={[6, 6, 0, 0]} name="Confirmed Cases" />
        </BarChart>
      );
    }

    return (
        <LineChart data={currentTrends} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" strokeOpacity={0.6} vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={{ stroke: '#333333', strokeWidth: 1 }}
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#b0b0b0' }}
          />
          <YAxis 
            axisLine={{ stroke: '#333333', strokeWidth: 1 }}
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#b0b0b0' }}
          />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333333',
            borderRadius: '0.75rem',
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: '#e2e8f0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            padding: '10px 14px'
          }}
          itemStyle={{ color: '#e2e8f0' }}
          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          cursor={{ stroke: '#00d9ff', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Line 
          type="monotone" 
          dataKey="actual" 
          stroke="#00d9ff" 
          strokeWidth={3} 
          dot={{ r: 4, fill: '#00d9ff', strokeWidth: 2, stroke: '#0a0a0a' }}
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
    <div className="flex-1 min-h-0 w-full p-2 h-full bg-secondary/20 rounded-xl">
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
          <div className="flex-1 min-h-0 w-full p-2 h-full bg-secondary/20 rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" strokeOpacity={0.6} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#333333', strokeWidth: 1 }}
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 'bold', fill: '#b0b0b0' }}
                />
                <YAxis 
                  axisLine={{ stroke: '#333333', strokeWidth: 1 }}
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 'bold', fill: '#b0b0b0' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333333',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: '#e2e8f0',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    padding: '10px 14px'
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
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
