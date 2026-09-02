"use client";

import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import HealthReportForm from '@/components/health/HealthReportForm';
import HealthReportsList from '@/components/health/HealthReportsList';

import { motion } from 'framer-motion';
import { ActivitySquare, FileText, PlusCircle } from 'lucide-react';

export default function HealthDataPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker']}>
      <div className="space-y-8 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-8 shadow-sm"
        >
          <div className="absolute top-0 right-0 -mt-16 -mr-16 text-primary/5">
            <ActivitySquare className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {t('healthData')}
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                Secure
              </span>
            </h1>
            <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
              Collect, digitize, and manage unstructured health reports. Our Neural Engine will automatically extract parameters.
            </p>
          </div>
        </motion.div>

        <Tabs defaultValue="submit" className="space-y-8">
          <TabsList className="bg-card/50 border border-border/40 p-1 rounded-xl h-12 w-full justify-start overflow-x-auto shadow-sm">
            <TabsTrigger 
              value="submit"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-6 h-9 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {t('submitReport')}
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-6 h-9 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {t('viewReports')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="focus-visible:outline-none focus-visible:ring-0">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <HealthReportForm />
            </motion.div>
          </TabsContent>

          <TabsContent value="reports" className="focus-visible:outline-none focus-visible:ring-0">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <HealthReportsList />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
