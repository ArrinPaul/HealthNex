"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import UsageStats from '@/components/admin/UsageStats';
import SupportTicketsList from '@/components/admin/SupportTicketsList';
import { useTranslation } from 'react-i18next';

export default function AdminPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute allowedRoles={['super-admin']}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Intelligence Command Center</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
            System-wide protocol synchronization and high-priority ticket management.
          </p>
        </div>

        <UsageStats />
        
        <SupportTicketsList />
      </div>
    </ProtectedRoute>
  );
}
