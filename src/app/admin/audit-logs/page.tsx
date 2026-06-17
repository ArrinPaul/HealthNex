"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function AuditLogPage() {
  const { token } = useAuth();
  const logs = useQuery(api.users.getAuditLogs, token ? { token } : "skip");

  if (!logs) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getActionColor = (action: string) => {
    switch(action) {
      case 'ROLE_CHANGE': return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
      case 'ALERT_BROADCAST': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View system activity and administrative actions.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                   <TableHead className="py-3">Timestamp</TableHead>
                   <TableHead className="py-3">Admin</TableHead>
                   <TableHead className="py-3">Action</TableHead>
                   <TableHead className="py-3">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id} className="border-border hover:bg-secondary/50 transition-colors">
                    <TableCell className="py-3">
                       <span className="text-sm">{format(log.timestamp, 'MMM d, HH:mm:ss')}</span>
                    </TableCell>
                    <TableCell className="py-3">
                       <span className="text-sm font-medium">ID: {log.userId.slice(-6).toUpperCase()}</span>
                    </TableCell>
                    <TableCell className="py-3">
                       <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getActionColor(log.action)}`}>
                         {log.action.replace('_', ' ')}
                       </span>
                    </TableCell>
                    <TableCell className="py-3">
                       <p className="text-sm text-muted-foreground">{log.details}</p>
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-sm">
                       No audit logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
