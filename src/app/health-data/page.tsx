"use client";

import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/ProtectedRoute';
import HealthReportForm from '@/components/health/HealthReportForm';
import HealthReportsList from '@/components/health/HealthReportsList';

export default function HealthDataPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute allowedRoles={['admin', 'health-worker']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('healthData')}</h1>
          <p className="text-muted-foreground mt-2">
            Collect and manage health data reports
          </p>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submit">{t('submitReport')}</TabsTrigger>
            <TabsTrigger value="reports">{t('viewReports')}</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <HealthReportForm />
          </TabsContent>

          <TabsContent value="reports">
            <HealthReportsList />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
