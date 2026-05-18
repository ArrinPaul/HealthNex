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
import { ChevronRight } from 'lucide-react';

export default function HealthReportsList() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const reports = useHealthData(token);

  return (
    <Card className="backdrop-blur-xl bg-card/50 border border-[var(--border-soft)] shadow-xl">
      <CardHeader className="border-b border-[var(--border-soft)] pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
             <CardTitle className="text-xl font-bold uppercase tracking-tight">{t('healthReports', 'Intelligence Payload')}</CardTitle>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Verified Clinical Records</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-[var(--border-soft)]">
              <Search className="w-4 h-4 mr-2" />
              {t('search')}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-[var(--border-soft)]">
              <Filter className="w-4 h-4 mr-2" />
              {t('filter')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--border-soft)] hover:bg-transparent">
                <TableHead className="uppercase text-[10px] font-bold tracking-widest">{t('patient', 'Patient')}</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest">{t('symptoms')}</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest">{t('location')}</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest">{t('date')}</TableHead>
                <TableHead className="uppercase text-[10px] font-bold tracking-widest">{t('severity', 'Severity')}</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report: any) => (
                <TableRow key={report._id} className="border-[var(--border-soft)] hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-bold">{report.data?.patientName || 'Anonymous'}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{report.notes}</TableCell>
                  <TableCell className="text-sm font-medium">{report.location?.address}</TableCell>
                  <TableCell className="text-sm">{new Date(report.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      className="rounded-full px-3"
                      variant={
                        report.severity > 7 ? 'destructive' :
                        report.severity > 4 ? 'default' :
                        'secondary'
                      }
                    >
                      {report.severity}/10
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/health-data/${report._id}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {reports?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic font-medium">
                    No intelligence payloads found in this region.
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
