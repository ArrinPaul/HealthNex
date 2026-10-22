"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Stethoscope, User, MapPin, Calendar, Activity, Database, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function HealthDataDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const record = useQuery(api.healthData.getHealthDataById as any, token ? { token, id: params.id } : "skip");

  if (record === undefined) {
    return <div className="p-12 text-center text-muted-foreground">Loading health record...</div>;
  }

  if (record === null) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-2xl font-bold">Record Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'health-worker', 'public-user']}>
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Records
        </Button>

        <Card className="bg-card border border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/30 border-b border-border p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                    <Stethoscope className="w-7 h-7" />
                 </div>
                 <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Health Record</h1>
                    <p className="text-muted-foreground font-mono text-xs mt-1">Record ID: {record._id.slice(-8).toUpperCase()}</p>
                 </div>
              </div>
              <Badge variant="outline" className="h-9 px-4 rounded-full text-xs font-semibold border-primary/30 text-primary bg-primary/5">
                Verified
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-10">
             <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-1.5 p-5 rounded-xl bg-secondary/30 border border-border">
                   <p className="text-xs font-medium text-muted-foreground">Patient Name</p>
                   <p className="text-lg font-semibold text-foreground">{record.data.patientName}</p>
                </div>
                <div className="space-y-1.5 p-5 rounded-xl bg-secondary/30 border border-border">
                   <p className="text-xs font-medium text-muted-foreground">Age / Gender</p>
                   <p className="text-lg font-semibold text-foreground">{record.data.age} / {record.data.gender}</p>
                </div>
                <div className="space-y-1.5 p-5 rounded-xl bg-secondary/30 border border-border">
                   <p className="text-xs font-medium text-muted-foreground">Severity</p>
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{ width: `${(record.severity || 0) * 10}%` }} />
                      </div>
                      <span className="font-semibold text-sm text-primary">{record.severity || 0}/10</span>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wide">
                   <Activity className="w-4 h-4" /> Reported Symptoms
                </div>
                <div className="p-6 rounded-xl bg-secondary/30 border border-border">
                   <p className="text-base leading-relaxed text-foreground italic">"{record.notes}"</p>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-border space-y-3">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-medium">Location</span>
                   </div>
                   <p className="font-semibold text-foreground">{record.location?.address || 'Unknown Region'}</p>
                </div>
                <div className="p-6 rounded-xl border border-border space-y-3">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">Reported On</span>
                   </div>
                   <p className="font-semibold text-foreground">{format(record.timestamp, 'PPPP p')}</p>
                </div>
             </div>

             <div className="pt-8 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                   <Shield className="w-4 h-4" />
                   <span className="text-xs font-medium">Encrypted in Transit (TLS)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Database className="w-4 h-4" />
                   <span className="text-xs font-medium">Synced with Convex</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
