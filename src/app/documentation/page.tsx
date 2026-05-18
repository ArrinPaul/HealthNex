"use client";

import LandingLayout from '@/components/layout/LandingLayout';
import { motion } from 'framer-motion';
import { 
  Book, Code, Terminal, Server, Network, 
  Shield, Zap, Cpu, Database, ChevronRight,
  FileCode, Layers, Radio, Globe
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const DocSection = ({ title, desc, icon: Icon, children }: any) => (
  <div className="space-y-10 py-16 border-b border-[var(--border-soft)] last:border-0">
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-3xl font-bold uppercase tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-lg">{desc}</p>
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-8">
      {children}
    </div>
  </div>
);

const DocCard = ({ title, desc, code }: any) => (
  <div className="p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-sm hover:border-primary/40 transition-colors group">
    <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{desc}</p>
    {code && (
      <div className="bg-black/40 rounded-xl p-6 font-mono text-[11px] text-sky-300 border border-white/5 overflow-x-auto">
        <pre><code>{code}</code></pre>
      </div>
    )}
  </div>
);

export default function DocumentationPage() {
  return (
    <LandingLayout>
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.03] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-8 mb-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Terminal className="w-3.5 h-3.5" />
              Technical Protocol
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              Documentation <br />
              <span className="text-primary">& Standards</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl mx-auto">
              Deep dive into the HealthNex Intelligence Protocol. Learn how our distributed surveillance, neural forecasting, and zero-trust synchronization layers operate.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <DocSection 
              title="Intelligence Layer" 
              desc="Understanding the core neural processing and data ingestion pipelines."
              icon={Cpu}
            >
              <DocCard 
                title="Neural Sync Protocol" 
                desc="HealthNex uses a proprietary synchronization protocol built on Convex to ensure sub-second latency across global nodes."
                code="protocol.sync({\n  nodeId: 'HN-ZONE-04',\n  telemetry: dataStream,\n  encryption: 'AES-256-GCM'\n});"
              />
              <DocCard 
                title="Predictive Models" 
                desc="Our models utilize multi-modal data including environmental factors, historical trends, and real-time reports."
                code="model.forecast({\n  vector: 'outbreak_beta',\n  lookahead: '14d',\n  confidence: true\n});"
              />
            </DocSection>

            <DocSection 
              title="Distributed Nodes" 
              desc="How to setup and manage regional surveillance nodes."
              icon={Network}
            >
              <DocCard 
                title="Node Initialization" 
                desc="Setting up a new regional node requires a verified health organization signature and secure hardware enclave."
                code="healthnex init-node --region=SA-BN-01"
              />
              <DocCard 
                title="Offline Synchronization" 
                desc="Nodes are designed to operate in low-connectivity environments, maintaining a local SQLite cache for all reports."
                code="// Automatic sync when online\nsync.autoReconnect(true);"
              />
            </DocSection>

            <DocSection 
              title="Security & Privacy" 
              desc="The zero-trust architecture protecting every byte of health data."
              icon={Shield}
            >
              <DocCard 
                title="End-to-End Encryption" 
                desc="Data is encrypted at the reporting device. HealthNex servers never see the raw patient identification data."
                code="report.encrypt(patientPubKey);"
              />
              <DocCard 
                title="Anonymization Engine" 
                desc="Surveillance telemetry is stripped of PII (Personally Identifiable Information) before being broadcasted to the global layer."
                code="telemetry.stripPII();"
              />
            </DocSection>

            <DocSection 
              title="API Reference" 
              desc="Integrating 3rd party health systems with HealthNex."
              icon={Code}
            >
              <DocCard 
                title="REST API" 
                desc="Standardized endpoints for ingesting verified medical records and environment data."
                code="POST /api/v1/telemetry\n{\n  'value': 98.6,\n  'unit': 'fahrenheit'\n}"
              />
              <DocCard 
                title="Webhooks" 
                desc="Subscribe to real-time regional alerts and anomaly detection events."
                code="webhooks.subscribe('REGION_SPIKE');"
              />
            </DocSection>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mt-32 p-12 md:p-20 rounded-[4rem] bg-[var(--surface-2)] border border-[var(--border-soft)] relative overflow-hidden text-center"
          >
             <div className="relative z-10 space-y-12">
                <div className="space-y-4">
                   <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">Need Support?</h2>
                   <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.4em]">Our technical team is ready to assist</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                   <Button asChild className="h-16 px-10 rounded-2xl font-bold bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                      <Link href="/help">Contact Support</Link>
                   </Button>
                   <Button asChild variant="ghost" className="h-16 px-10 rounded-2xl font-bold">
                      <Link href="https://github.com/healthnex" className="flex items-center gap-3">
                        <Globe className="w-5 h-5" /> GitHub Repository
                      </Link>
                   </Button>
                </div>
             </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
