"use client";

import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ReportForm from '@/components/community/ReportForm';
import ReportsList from '@/components/community/ReportsList';
import { useAuth } from '@/contexts/AuthContext';

export default function CommunityReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const canSubmit = user && user.role !== 'public';

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('communityReports')}</h1>
          <p className="text-muted-foreground mt-2">
            Report health issues and unsafe water sources in your community
          </p>
        </div>

        <Tabs defaultValue={canSubmit ? "submit" : "reports"} className="space-y-6">
          <TabsList>
            {canSubmit && <TabsTrigger value="submit">{t('reportIssue')}</TabsTrigger>}
            <TabsTrigger value="reports">View Reports</TabsTrigger>
          </TabsList>

          {canSubmit && (
            <TabsContent value="submit">
              <ReportForm />
            </TabsContent>
          )}

          <TabsContent value="reports">
            <ReportsList />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
