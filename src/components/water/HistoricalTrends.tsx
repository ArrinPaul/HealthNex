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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pH" stroke="#3b82f6" strokeWidth={2} name="pH Level" />
              <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} name="Turbidity (NTU)" />
              <Line type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={2} name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
