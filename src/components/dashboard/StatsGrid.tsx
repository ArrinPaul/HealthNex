"use client";

import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, Droplet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDashboardAggregates } from '@/services/healthDataService';
import { motion } from 'framer-motion';
import NumberFlow from '@number-flow/react';

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
      value: currentStats?.totalCases || 0,
      icon: Activity,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      trend: "+4.2%",
      isPositive: false,
    },
    {
      title: t('activeAlerts', 'Active Alerts'),
      value: currentStats?.activeAlerts || 0,
      icon: Droplet,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      trend: "-2.1%",
      isPositive: true,
    },
    {
      title: t('aiInsights', 'Anomalies'),
      value: currentStats?.aiInsightsCount || 0,
      icon: TrendingUp,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
      trend: "+12%",
      isPositive: false,
    },
    {
      title: t('totalNodes', 'System Nodes'),
      value: currentStats?.totalNodes || 0,
      icon: AlertTriangle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      trend: "Stable",
      isPositive: true,
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
          className="group flex flex-col justify-between py-4 first:pt-0 last:pb-0 md:py-0 md:px-6 md:first:pl-0 md:last:pr-0"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </div>
              <div className="text-2xl font-black text-foreground tracking-tight flex items-center">
                {currentStats ? (
                  <NumberFlow 
                    value={Number(stat.value)} 
                    format={{ notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }} 
                  />
                ) : (
                  '...'
                )}
              </div>
            </div>
            
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl border ${stat.bg} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
          </div>

          {/* Dynamic Footer with trend */}
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
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
        </motion.div>
      ))}
    </>
  );
}
