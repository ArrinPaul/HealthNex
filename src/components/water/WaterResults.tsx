"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, AlertTriangle, CheckCircle, Shield, Thermometer, CloudRain, Droplets } from 'lucide-react';

interface WaterResultsProps {
  results: any;
}

export default function WaterResults({ results }: WaterResultsProps) {
  const { t } = useTranslation();

  const statusConfig = results.status === 'Safe'
    ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', icon: CheckCircle }
    : results.status === 'Warning'
    ? { bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', icon: AlertTriangle }
    : { bg: 'bg-rose-500/10', border: 'border-rose-500/25', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30', icon: AlertTriangle };

  const fallbackRecommendations = [];
  const ph = results.parameters.ph;
  const turbidity = results.parameters.turbidity;
  if (ph < 6.5) fallbackRecommendations.push('Water is too acidic (pH below 6.5). Avoid drinking until treated.');
  if (ph > 8.5) fallbackRecommendations.push('Water is too alkaline (pH above 8.5). Consider filtration before use.');
  if (turbidity >= 5) fallbackRecommendations.push('High turbidity detected (≥5 NTU). Water should be filtered or boiled before consumption.');
  if (results.status === 'Warning') fallbackRecommendations.push('Elevated health risk detected. Boil water before use or seek an alternative source.');
  if (results.status === 'Safe') fallbackRecommendations.push('Water quality parameters are within safe limits. Regular monitoring is recommended.');
  if (fallbackRecommendations.length === 0) fallbackRecommendations.push('No immediate action required. Continue routine monitoring.');

  const recommendations = results.recommendations.length > 0 ? results.recommendations : fallbackRecommendations;

  const StatusIcon = statusConfig.icon;

  const params = [
    { label: t('ph'), value: results.parameters.ph, unit: '', icon: Droplet, safe: results.parameters.ph >= 6.5 && results.parameters.ph <= 8.5, color: 'text-blue-400', bg: 'bg-blue-500/15' },
    { label: t('turbidity'), value: results.parameters.turbidity, unit: 'NTU', icon: Droplets, safe: results.parameters.turbidity < 5, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    { label: t('temperature'), value: results.parameters.temperature, unit: '°C', icon: Thermometer, safe: true, color: 'text-rose-400', bg: 'bg-rose-500/15' },
    { label: t('rainfall'), value: results.parameters.rainfall, unit: 'mm', icon: CloudRain, safe: true, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    { label: t('humidity'), value: results.parameters.humidity, unit: '%', icon: Droplet, safe: true, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  ];

  return (
    <>
      {/* Status Card */}
      <Card className={`bg-card border ${statusConfig.border} rounded-2xl overflow-hidden shadow-lg`}>
        <div className={`${statusConfig.bg} p-5`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center`}>
              <StatusIcon className={`w-7 h-7 ${statusConfig.text}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-foreground">{results.location}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Lat: {results.coordinates.lat}, Lng: {results.coordinates.lng}
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${statusConfig.badge}`}>
                  <StatusIcon className="w-3 h-3" />
                  {results.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Parameters Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
        {params.map((param, index) => (
          <Card key={index} className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${param.bg} flex items-center justify-center`}>
                  <param.icon className={`w-4 h-4 ${param.color}`} />
                </div>
                {!param.safe && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="text-xl font-black text-foreground">{param.value}<span className="text-xs text-muted-foreground font-medium ml-0.5">{param.unit}</span></div>
              <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{param.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
        <CardHeader className="border-b border-border/60 bg-secondary/30 py-4 px-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <CardTitle className="text-sm font-bold text-foreground">Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-2.5">
            {recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{rec}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
