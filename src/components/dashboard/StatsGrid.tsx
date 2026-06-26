"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, AlertTriangle, Droplet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDashboardAggregates } from '@/services/healthDataService';
import { motion } from 'framer-motion';

interface StatsGridProps {
  statsData?: {
    totalCases: number;
    activeAlerts: number;
    aiInsightsCount: number;
    totalNodes: number;
  };
}

export default function StatsGrid({ statsData }: StatsGridProps) {
  const { t } = useTranslation();
  const aggregates = useDashboardAggregates();

  const currentStats = statsData || aggregates?.stats;

  const stats = [
    {
      title: t('activeCases', 'Active Cases'),
      value: currentStats?.totalCases?.toString() || '0',
      icon: Activity,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      trend: "+4.2%",
      isPositive: false,
      glow: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
    },
    {
      title: t('activeAlerts', 'Active Alerts'),
      value: currentStats?.activeAlerts?.toString() || '0',
      icon: Droplet,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      trend: "-2.1%",
      isPositive: true,
      glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    },
    {
      title: t('aiInsights', 'Anomalies'),
      value: currentStats?.aiInsightsCount?.toString() || '0',
      icon: TrendingUp,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
      trend: "+12%",
      isPositive: false,
      glow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
    },
    {
      title: t('totalNodes', 'System Nodes'),
      value: currentStats?.totalNodes?.toString() || '0',
      icon: AlertTriangle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      trend: "Stable",
      isPositive: true,
      glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
          className="group"
        >
          <Card className={`bg-card/70 border border-border/80 backdrop-blur-md hover:border-primary/45 transition-all duration-300 rounded-2xl overflow-hidden hover:-translate-y-1 ${stat.glow}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </div>
                  <div className="text-2xl font-black text-foreground tracking-tight">
                    {currentStats ? stat.value : '...'}
                  </div>
                </div>
                
                <div className={`w-11 h-11 flex items-center justify-center rounded-xl border ${stat.bg} shadow-sm group-hover:scale-105 transition-all duration-300`}>
                  <stat.icon className={`w-5.5 h-5.5 ${stat.color}`} />
                </div>
              </div>

              {/* Dynamic Footer with trend */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold">
                <div className="flex items-center gap-1">
                  {stat.trend !== "Stable" && (
                    stat.isPositive ? (
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                    )
                  )}
                  <span className={stat.trend === "Stable" ? "text-muted-foreground" : stat.isPositive ? "text-emerald-500" : "text-red-500"}>
                    {stat.trend}
                  </span>
                </div>
                <span className="text-muted-foreground font-mono text-[9px] uppercase">Telemetry</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  );
}
