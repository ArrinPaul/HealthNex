"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import UsageStats from '@/components/admin/UsageStats';
import { useTranslation } from 'react-i18next';

export default function AdminPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">
            Monitor system usage and API performance.
          </p>
        </div>

        <UsageStats />
      </div>
    </ProtectedRoute>
  );
}
