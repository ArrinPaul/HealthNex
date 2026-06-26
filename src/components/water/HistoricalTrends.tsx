"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const historicalData = [
  { month: 'Jan', pH: 7.2, turbidity: 3.5, temp: 22 },
  { month: 'Feb', pH: 7.1, turbidity: 4.2, temp: 24 },
  { month: 'Mar', pH: 6.9, turbidity: 5.1, temp: 26 },
  { month: 'Apr', pH: 7.0, turbidity: 4.8, temp: 28 },
  { month: 'May', pH: 6.8, turbidity: 6.2, temp: 30 },
  { month: 'Jun', pH: 6.7, turbidity: 7.5, temp: 29 },
  { month: 'Jul', pH: 6.8, turbidity: 5.2, temp: 28 }
];

export default function HistoricalTrends() {
  const { t } = useTranslation();

  return (
    <Card className="backdrop-blur-xl bg-card/50">
      <CardHeader>
        <CardTitle>Historical Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" strokeOpacity={0.2} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="pH" stroke="#3b82f6" strokeWidth={2} name="pH Level" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} name="Turbidity (NTU)" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={2} name="Temperature (°C)" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
