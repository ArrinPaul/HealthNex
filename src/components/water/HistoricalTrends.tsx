"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Droplet } from 'lucide-react';

const historicalData = [
  { month: 'Jan', pH: 7.2, turbidity: 3.5, temp: 22 },
  { month: 'Feb', pH: 7.1, turbidity: 4.2, temp: 24 },
  { month: 'Mar', pH: 6.9, turbidity: 5.1, temp: 26 },
  { month: 'Apr', pH: 7.0, turbidity: 4.8, temp: 28 },
  { month: 'May', pH: 6.8, turbidity: 6.2, temp: 30 },
  { month: 'Jun', pH: 6.7, turbidity: 7.5, temp: 29 },
  { month: 'Jul', pH: 6.8, turbidity: 5.2, temp: 28 }
];

const tooltipStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #333333',
  borderRadius: '0.75rem',
  fontSize: '11px',
  fontWeight: 'bold' as const,
  textTransform: 'uppercase' as const,
  color: '#e2e8f0',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  padding: '10px 14px',
};

const axisStyle = { fontSize: 11, fontWeight: 'bold' as const, fill: '#b0b0b0' };

export default function HistoricalTrends() {
  const { t } = useTranslation();

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
      <CardHeader className="border-b border-border/60 bg-secondary/30 py-4 px-5 flex flex-row items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
          <Droplet className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <CardTitle className="text-sm font-bold text-foreground">Water Quality Trend</CardTitle>
          <p className="text-[10px] text-muted-foreground mt-0.5">pH, Turbidity & Temperature over time</p>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-[320px] w-full bg-secondary/20 rounded-xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#333333" 
                strokeOpacity={0.6} 
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                tick={axisStyle}
                axisLine={{ stroke: '#333333', strokeWidth: 1 }}
                tickLine={false}
              />
              <YAxis 
                tick={axisStyle}
                axisLine={{ stroke: '#333333', strokeWidth: 1 }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                itemStyle={{ color: '#e2e8f0', padding: '2px 0' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '6px', fontSize: '10px' }}
                cursor={{ stroke: '#00d9ff', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  paddingTop: '16px',
                  color: '#b0b0b0'
                }}
                iconType="circle"
                iconSize={10}
                formatter={(value: string) => <span style={{ color: '#b0b0b0', fontSize: '11px', fontWeight: 'bold' }}>{value}</span>}
              />
              <ReferenceLine y={7} stroke="#64748b" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: 'pH 7', fill: '#64748b', fontSize: 9, position: 'right' }} />
              <Line 
                type="monotone" 
                dataKey="pH" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                name="pH Level" 
                dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#0a0a0a' }}
                activeDot={{ r: 7, strokeWidth: 0, stroke: '#3b82f6', fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="turbidity" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                name="Turbidity (NTU)" 
                dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#0a0a0a' }}
                activeDot={{ r: 7, strokeWidth: 0, stroke: '#f59e0b', fill: '#f59e0b' }}
              />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#10b981" 
                strokeWidth={3} 
                name="Temperature (°C)" 
                dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#0a0a0a' }}
                activeDot={{ r: 7, strokeWidth: 0, stroke: '#10b981', fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
