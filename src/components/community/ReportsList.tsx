"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplet, AlertCircle } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ReportsList() {
  const { t } = useTranslation();
  const reports = useQuery(api.communityReports.getReports, {});

  return (
    <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle>Community Reports</CardTitle>
        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 text-primary font-mono text-sm">
          {reports?.length ?? 0} Reports Found
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports?.map((report: any) => (
            <Card key={report._id} className="backdrop-blur-xl bg-[var(--surface-1)]/70 border border-[var(--border-soft)]">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    report.category === 'water' ? 'bg-sky-500/15' : 'bg-amber-500/15'
                  }`}>
                    {report.category === 'water' ? (
                      <Droplet className="w-6 h-6 text-sky-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold">
                          {report.category === 'water' ? t('unsafeWaterSource') : t('healthIssue')}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reported • {report.location?.address}
                        </p>
                      </div>
                      <Badge
                        variant={
                          report.status === 'Confirmed' ? 'destructive' :
                          report.status === 'resolved' ? 'default' :
                          'secondary'
                        }
                      >
                        {report.status}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-3">{report.description}</p>

                    <div className="text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {reports?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No reports found in your community.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
