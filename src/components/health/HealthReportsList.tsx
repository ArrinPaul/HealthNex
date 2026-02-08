"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/services/healthDataService';

export default function HealthReportsList() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const reports = useHealthData(token);

  return (
    <Card className="backdrop-blur-xl bg-card/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>{t('healthReports', 'Health Reports')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              {t('search')}
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              {t('filter')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('patient', 'Patient')}</TableHead>
                <TableHead>{t('symptoms')}</TableHead>
                <TableHead>{t('location')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('severity', 'Severity')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report: any) => (
                <TableRow key={report._id}>
                  <TableCell className="font-medium">{report.data?.patientName || 'Anonymous'}</TableCell>
                  <TableCell className="max-w-xs truncate">{report.notes}</TableCell>
                  <TableCell>{report.location?.address}</TableCell>
                  <TableCell>{new Date(report.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.severity > 7 ? 'destructive' :
                        report.severity > 4 ? 'default' :
                        'secondary'
                      }
                    >
                      {report.severity}/10
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {reports?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No health reports found.
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
