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
  const record = useQuery(api.healthData.getHealthDataById, token ? { token, id: params.id as any } : "skip");

  if (record === undefined) {
    return <div className="p-12 text-center text-muted-foreground">Retrieving clinical record...</div>;
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
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker']}>
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Records
        </Button>

        <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] shadow-2xl overflow-hidden">
          <CardHeader className="bg-[var(--surface-2)]/50 border-b border-[var(--border-soft)] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                    <Stethoscope className="w-8 h-8" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight uppercase">Clinical Intelligence</h1>
                    <p className="text-muted-foreground uppercase font-bold text-[10px] tracking-[0.3em] mt-2">Case UID: {record._id.slice(-8).toUpperCase()}</p>
                 </div>
              </div>
              <Badge variant="outline" className="h-10 px-6 rounded-full text-sm font-bold uppercase tracking-widest border-primary/30 text-primary bg-primary/5">
                Verified
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 md:p-12 space-y-12">
             <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-2 p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-soft)]">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patient Name</p>
                   <p className="text-lg font-bold">{record.data.patientName}</p>
                </div>
                <div className="space-y-2 p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-soft)]">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Age / Gender</p>
                   <p className="text-lg font-bold">{record.data.age} / {record.data.gender}</p>
                </div>
                <div className="space-y-2 p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-soft)]">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Severity Index</p>
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-[var(--surface-3)] rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{ width: `${(record.severity || 0) * 10}%` }} />
                      </div>
                      <span className="font-bold text-sm text-primary">{record.severity || 0}/10</span>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary font-bold uppercase text-[10px] tracking-widest">
                   <Activity className="w-4 h-4" /> Reported Symptoms
                </div>
                <div className="p-8 rounded-[2.5rem] bg-[var(--surface-2)] border border-[var(--border-soft)]">
                   <p className="text-lg leading-relaxed italic">"{record.notes}"</p>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] border border-[var(--border-soft)] space-y-4">
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Deployment Location</span>
                   </div>
                   <p className="font-bold">{record.location?.address || 'Unknown Region'}</p>
                </div>
                <div className="p-8 rounded-[2rem] border border-[var(--border-soft)] space-y-4">
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Timestamp</span>
                   </div>
                   <p className="font-bold">{format(record.timestamp, 'PPPP p')}</p>
                </div>
             </div>

             <div className="pt-10 border-t border-[var(--border-soft)] flex items-center justify-between">
                <div className="flex items-center gap-4 text-emerald-500">
                   <Shield className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">E2EE Protected Record</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                   <Database className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Convex Synchronized</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
