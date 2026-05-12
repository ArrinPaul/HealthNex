"use client";

import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ReportForm from '@/components/community/ReportForm';
import ReportsList from '@/components/community/ReportsList';

export default function CommunityReportsPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('communityReports')}</h1>
          <p className="text-muted-foreground mt-2">
            Report health issues and unsafe water sources in your community
          </p>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submit">{t('reportIssue')}</TabsTrigger>
            <TabsTrigger value="reports">View Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <ReportForm />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsList />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
