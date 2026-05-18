"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import UserManagement from '@/components/admin/UserManagement';

export default function UserManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker']}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Access Management</h1>
          <p className="text-muted-foreground">
            Monitor and assign roles across the HealthNex network.
          </p>
        </div>

        <UserManagement />
      </div>
    </ProtectedRoute>
  );
}
