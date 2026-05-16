"use client";

import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, FileCheck } from 'lucide-react';

export default function PrivacyCodePage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
              Zero-Trust Architecture
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase">Privacy Code Protocol</h1>
            <p className="text-muted-foreground text-xl max-w-3xl leading-relaxed">
              Medical-grade security and uncompromising data sovereignty. At HealthNex, your regional health data is end-to-end encrypted at the edge, ensuring total privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-[2.5rem] bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-xl space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">E2EE Synchronization</h3>
              <p className="text-muted-foreground leading-relaxed">
                All community reports and medical telemetry are encrypted on the reporting device before being synchronized with our distributed backend. Only verified health leads hold the keys.
              </p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-xl space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <EyeOff className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">Anonymization Layer</h3>
              <p className="text-muted-foreground leading-relaxed">
                Personal identifiers are automatically stripped from surveillance data. We monitor health trends, not individuals, maintaining 100% HIPAA and GDPR compliance protocols.
              </p>
            </div>
          </div>

          <div className="p-12 rounded-[3rem] bg-[var(--surface-1)] border border-[var(--border-soft)]">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">Security Compliance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {['HIPAA', 'GDPR', 'ISO 27001', 'SOC 2 Type II'].map(cert => (
                 <div key={cert} className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-soft)]">
                    <FileCheck className="w-6 h-6 text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{cert}</span>
                 </div>
               ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
