"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import WaterSearch from '@/components/water/WaterSearch';
import WaterResults from '@/components/water/WaterResults';
import HistoricalTrends from '@/components/water/HistoricalTrends';
import { motion } from 'framer-motion';
import { Droplet, Activity } from 'lucide-react';

export default function WaterQualityPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const trackUsage = useMutation(api.usage.trackUsage as any);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleResults = (data: any) => {
    setResults(data);
    if (data && token) {
      trackUsage({ token, feature: 'water_quality', status: 'success' }).catch(() => {});
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker']}>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative">
        {/* Ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Environmental Monitoring</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Water Quality</h1>
            <p className="text-xs text-muted-foreground mt-1">Monitor water quality parameters using environmental data</p>
          </div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WaterSearch
            onResults={handleResults}
            loading={loading}
            setLoading={setLoading}
          />
        </motion.div>

        {/* Dynamic Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <WaterResults results={results} />
          </motion.div>
        )}

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <HistoricalTrends />
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
