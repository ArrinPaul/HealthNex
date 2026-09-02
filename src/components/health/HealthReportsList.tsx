"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/services/healthDataService';

import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';

export default function HealthReportsList() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const reports = useHealthData(token);

  return (
    <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-xl overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      <CardHeader className="border-b border-border/40 bg-muted/20 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
             <CardTitle className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
               <FileText className="w-5 h-5 text-primary" />
               {t('healthReports', 'Intelligence Payload')}
             </CardTitle>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Verified Clinical Records</p>
          </div>
          <div className="flex gap-2 relative z-10">
            <Button variant="outline" size="sm" className="rounded-xl border-border/40 bg-background/50 hover:bg-background">
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              {t('search')}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-border/40 bg-background/50 hover:bg-background">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              {t('filter')}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="uppercase text-[10px] font-bold tracking-widest pl-6 h-12">{t('patient', 'Patient')}</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest h-12">{t('symptoms')}</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest h-12">{t('location')}</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest h-12">{t('date')}</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest h-12">{t('severity', 'Severity')}</TableHead>
                <TableHead className="w-16 h-12 pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report: any) => (
                <TableRow key={report._id} className="border-border/40 hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-bold pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {(report.data?.patientName || 'A').charAt(0)}
                      </div>
                      {report.data?.patientName || 'Anonymous'}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground font-medium">{report.notes || 'No symptoms reported'}</TableCell>
                  <TableCell className="text-sm font-medium">{report.location?.address || 'Unknown Location'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(report.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                  <TableCell>
                    <Badge
                      className="rounded-full px-3 font-semibold shadow-sm"
                      variant={
                        report.severity > 7 ? 'destructive' :
                        report.severity > 4 ? 'default' :
                        'secondary'
                      }
                    >
                      Level {report.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6">
                    <Link href={`/health-data/${report._id}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md transition-all ml-auto">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {reports?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24 text-muted-foreground italic font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText className="w-12 h-12 text-muted-foreground/30" />
                      <p>No intelligence payloads found in this region.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
