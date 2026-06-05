"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import UsageStats from '@/components/admin/UsageStats';
import SupportTicketsList from '@/components/admin/SupportTicketsList';
import VerificationQueue from '@/components/admin/VerificationQueue';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Shield, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">Intelligence Command Center</h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">
              System-wide protocol synchronization and high-priority ticket management.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-[var(--border-soft)] h-12 gap-3 px-6 hover:bg-primary/5 hover:text-primary transition-all">
             <Link href="/admin/audit-logs">
                <Shield className="w-4 h-4" />
                <span className="uppercase text-[10px] font-bold tracking-widest">Protocol Audit Logs</span>
                <ArrowRight className="w-3 h-3 ml-2" />
             </Link>
          </Button>
        </div>

        <UsageStats />
        
        <VerificationQueue />
        
        <SupportTicketsList />
      </div>
    </ProtectedRoute>
  );
}
