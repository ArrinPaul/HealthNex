"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import UsageStats from '@/components/admin/UsageStats';
import SupportTicketsList from '@/components/admin/SupportTicketsList';
import VerificationQueue from '@/components/admin/VerificationQueue';
import UserManagement from '@/components/admin/UserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, ShieldCheck, MessageSquare } from 'lucide-react';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage users, verification requests, and system activity.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="verification" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <UsageStats />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="verification">
            <VerificationQueue />
          </TabsContent>

          <TabsContent value="tickets">
            <SupportTicketsList />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
