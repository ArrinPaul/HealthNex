"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplet, AlertCircle, ArrowLeft, MapPin, Calendar, Info, Image as ImageIcon, Download, Lock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function CommunityReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const report = useQuery(api.communityReports.getReportById, { reportId: params.id as any });

  const [attachmentBlobUrl, setAttachmentBlobUrl] = useState<string | null>(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (report?.hasAttachment && token) {
      setAttachmentLoading(true);
      setAttachmentError(null);

      fetch(`/api/community-reports/${params.id}/attachment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!active) return;
          if (res.status === 403) {
            setAttachmentError('Access restricted to report author and health authorities.');
            setAttachmentLoading(false);
            return;
          }
          if (res.status === 404) {
            setAttachmentError('Attachment is unavailable or has been removed.');
            setAttachmentLoading(false);
            return;
          }
          if (!res.ok) {
            setAttachmentError('Could not load attachment file.');
            setAttachmentLoading(false);
            return;
          }
          const blob = await res.blob();
          if (!active) return;
          createdUrl = URL.createObjectURL(blob);
          setAttachmentBlobUrl(createdUrl);
          setAttachmentLoading(false);
        })
        .catch((err) => {
          if (!active) return;
          console.warn('Failed to load attachment:', err);
          setAttachmentError('Failed to load attachment.');
          setAttachmentLoading(false);
        });
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [report?.hasAttachment, params.id, token]);

  if (report === undefined) {
    return <div className="p-12 text-center text-muted-foreground">Loading intelligence payload...</div>;
  }

  if (report === null) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-2xl font-bold">Report Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Button>

        <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-[var(--border-soft)] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div className={`p-5 rounded-2xl ${report.category === 'water' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {report.category === 'water' ? <Droplet className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                 </div>
                 <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{report.category === 'water' ? 'Unsafe Water Source' : 'Health Report'}</h1>
                    <p className="text-muted-foreground uppercase font-bold text-[10px] tracking-[0.3em] mt-2">Reference: {report._id.slice(-8).toUpperCase()}</p>
                 </div>
              </div>
              <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'} className="h-10 px-6 rounded-full text-sm font-bold uppercase tracking-widest">
                {report.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 md:p-12 space-y-12">
             <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-primary font-bold uppercase text-[10px] tracking-widest">
                         <Info className="w-4 h-4" /> Description
                      </div>
                      <p className="text-lg leading-relaxed">{report.description}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)]">
                         <div className="flex items-center gap-3 text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Location</span>
                         </div>
                         <p className="font-bold text-sm">{report.location.address}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)]">
                         <div className="flex items-center gap-3 text-muted-foreground mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Submitted</span>
                         </div>
                         <p className="font-bold text-sm">{format(report.createdAt, 'MMM d, p')}</p>
                      </div>
                   </div>

                   {/* Attached Evidence Section */}
                   {report.hasAttachment && (
                     <div className="space-y-3">
                       <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] tracking-widest">
                         <ImageIcon className="w-4 h-4" /> Photographic Evidence
                       </div>

                       {attachmentLoading && (
                         <div className="p-6 border rounded-2xl bg-surface-2/30 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                           <Loader2 className="w-4 h-4 animate-spin" /> Retrieving verified attachment...
                         </div>
                       )}

                       {attachmentError && (
                         <div className="p-4 border border-amber-500/30 rounded-2xl bg-amber-500/10 flex items-center gap-3 text-xs text-amber-600 dark:text-amber-400">
                           <Lock className="w-4 h-4 shrink-0" />
                           <span>{attachmentError}</span>
                         </div>
                       )}

                       {attachmentBlobUrl && (
                         <div className="border rounded-2xl overflow-hidden bg-card/40 space-y-3 p-3">
                           <img
                             src={attachmentBlobUrl}
                             alt="Report Evidence"
                             className="w-full max-h-80 object-cover rounded-xl"
                           />
                           <div className="flex items-center justify-between px-1">
                             <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                               {report.attachmentName || 'evidence.jpg'}
                             </span>
                             <a
                               href={attachmentBlobUrl}
                               download={report.attachmentName || 'evidence.jpg'}
                               className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                             >
                               <Download className="w-3.5 h-3.5" /> Download
                             </a>
                           </div>
                         </div>
                       )}
                     </div>
                   )}
                </div>

                <div className="space-y-8">
                   <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
                      <h4 className="font-bold tracking-tight text-lg mb-4">Report Details</h4>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-muted-foreground">Severity Level</span>
                            <Badge className="bg-primary/20 text-primary border-0">{report.severity} / 5</Badge>
                         </div>
                         <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-muted-foreground">Verification Support</span>
                            <span className="text-sm font-bold">{report.upvotes} Consensus</span>
                         </div>
                         <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-muted-foreground">Has Attachment</span>
                            <span className="text-xs font-bold uppercase">{report.hasAttachment ? 'Yes (Photo)' : 'None'}</span>
                         </div>
                         <div className="flex justify-between items-center py-3">
                            <span className="text-sm text-muted-foreground">Encryption Mode</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Active</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="pt-10 border-t border-[var(--border-soft)] text-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-[0.2em]">Verified Intelligence Payload - For Institutional Use Only</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
