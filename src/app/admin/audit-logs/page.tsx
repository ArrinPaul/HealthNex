"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Shield, Clock, Info, User, Activity, Globe, Loader2 } from 'lucide-react';

export default function AuditLogPage() {
  const logs = useQuery(api.users.getAuditLogs);

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
    <ProtectedRoute allowedRoles={['super-admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">System Audit Log</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-2">
            Immutable protocol records and administrative transparency
          </p>
        </div>

        <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-[var(--border-soft)] bg-[var(--surface-2)]/50">
             <CardTitle className="flex items-center gap-3 text-lg font-bold uppercase tracking-tight">
                <Shield className="w-5 h-5 text-primary" />
                Administrative Records
             </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[var(--border-soft)] hover:bg-transparent">
                       <TableHead className="uppercase text-[10px] font-bold tracking-widest pl-8 py-6">Timestamp</TableHead>
                       <TableHead className="uppercase text-[10px] font-bold tracking-widest">Protocol Lead</TableHead>
                       <TableHead className="uppercase text-[10px] font-bold tracking-widest">Action Event</TableHead>
                       <TableHead className="uppercase text-[10px] font-bold tracking-widest pr-8">Event Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id} className="border-[var(--border-soft)] hover:bg-white/5 transition-colors">
                        <TableCell className="pl-8 py-5">
                           <div className="flex items-center gap-3">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{format(log.timestamp, 'MMM d, HH:mm:ss')}</span>
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                 <User className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-bold uppercase tracking-tight">Lead ID: {log.userId.slice(-6).toUpperCase()}</span>
                           </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className={`rounded-lg uppercase text-[9px] font-bold border ${getActionColor(log.action)}`}>
                              {log.action.replace('_', ' ')}
                           </Badge>
                        </TableCell>
                        <TableCell className="pr-8">
                           <p className="text-sm text-muted-foreground leading-relaxed">{log.details}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                    {logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-24 text-muted-foreground italic font-medium">
                           No administrative events recorded in the protocol cache.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
             </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
