"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/ProtectedRoute';
import WaterSearch from '@/components/water/WaterSearch';
import WaterResults from '@/components/water/WaterResults';
import HistoricalTrends from '@/components/water/HistoricalTrends';

export default function WaterQualityPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  return (
    <ProtectedRoute allowedRoles={['admin', 'health-worker']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('waterQuality')}</h1>
          <p className="text-muted-foreground mt-2">
            Monitor water quality parameters using environmental data
          </p>
        </div>

        {/* Search Logic */}
        <WaterSearch 
          onResults={setResults} 
          loading={loading} 
          setLoading={setLoading} 
        />

        {/* Dynamic Results */}
        {results && <WaterResults results={results} />}

        {/* Charts */}
        <HistoricalTrends />
      </div>
    </ProtectedRoute>
  );
}
