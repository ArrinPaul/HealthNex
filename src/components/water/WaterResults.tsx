"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, AlertTriangle, CheckCircle } from 'lucide-react';

interface WaterResultsProps {
  results: any;
}

export default function WaterResults({ results }: WaterResultsProps) {
  const { t } = useTranslation();

  return (
    <>
      <Card className={`backdrop-blur-xl ${
        results.status === 'Safe' ? 'bg-green-500/10 border-green-500/20' :
        results.status === 'Warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
        'bg-red-500/10 border-red-500/20'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {results.status === 'Safe' ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-yellow-600" />
            )}
            <div>
              <h3 className="text-xl font-bold">{results.location}</h3>
              <p className="text-muted-foreground">
                Lat: {results.coordinates.lat}, Lng: {results.coordinates.lng}
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  results.status === 'Safe' ? 'bg-green-500 text-white' :
                  results.status === 'Warning' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {results.status}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t('ph'), value: results.parameters.ph, unit: '', icon: Droplet, safe: results.parameters.ph >= 6.5 && results.parameters.ph <= 8.5 },
          { label: t('turbidity'), value: results.parameters.turbidity, unit: 'NTU', icon: Droplet, safe: results.parameters.turbidity < 5 },
          { label: t('temperature'), value: results.parameters.temperature, unit: '°C', icon: Droplet, safe: true },
          { label: t('rainfall'), value: results.parameters.rainfall, unit: 'mm', icon: Droplet, safe: true },
          { label: t('humidity'), value: results.parameters.humidity, unit: '%', icon: Droplet, safe: true }
        ].map((param, index) => (
          <Card key={index} className="backdrop-blur-xl bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <param.icon className="w-5 h-5 text-muted-foreground" />
                {!param.safe && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
              </div>
              <div className="text-2xl font-bold">{param.value}{param.unit}</div>
              <div className="text-sm text-muted-foreground">{param.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="backdrop-blur-xl bg-card/50">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {results.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
