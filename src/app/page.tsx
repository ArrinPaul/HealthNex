"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Activity, Users, ArrowRight, CheckCircle2, 
  Brain, Zap, ChevronDown, ChevronRight, ShieldCheck, 
  Waves, BarChart3, Globe2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Logo from '@/components/layout/Logo';
import LandingLayout from '@/components/layout/LandingLayout';

// --- Sub-components ---

const FeatureCard = ({ title, desc, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="group relative p-8 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col text-left h-full"
  >
    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center mb-6 bg-secondary ${color} group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300`}>
      <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
    </div>

    <div className="space-y-3 mb-6 flex-1">
      <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed text-sm">
        {desc}
      </p>
    </div>
    
    <div className="pt-4 border-t border-border w-full flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
       <span className="text-xs font-semibold text-primary">Learn more</span>
       <ArrowRight className="w-4 h-4 text-primary" />
    </div>
  </motion.div>
);

const InteractiveDashboardMockup = ({ stats }: { stats?: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="mt-16 md:mt-24 max-w-5xl mx-auto bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
  >
    <div className="bg-secondary/80 h-12 border-b border-border flex items-center px-6 justify-between shrink-0">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
      </div>
      <div className="text-xs font-mono text-muted-foreground">healthnex.io/dashboard</div>
      <div className="w-10" />
    </div>

    <div className="p-8 lg:p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-xl font-bold tracking-tight">Dashboard</h4>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-secondary border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{stats?.activeUsers?.toLocaleString() ?? '1,247'}</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
          </div>
          <div className="h-12 flex items-end gap-1">
            {[40, 60, 45, 80, 50, 95, 70, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium opacity-80">Verified</span>
          </div>
          <h5 className="text-xl font-bold">Secure & Private</h5>
          <p className="text-xs opacity-80 mt-1">End-to-end encryption</p>
        </div>

        <div className="p-6 rounded-2xl bg-secondary border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold">{stats?.dataNodes?.toLocaleString() ?? '312'}</div>
              <div className="text-xs text-muted-foreground">Data Nodes</div>
            </div>
          </div>
          <div className="space-y-3">
            {[0.7, 0.4].map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500/60 rounded-full" style={{ width: `${p * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const ModuleShowcase = () => {
  const [active, setActive] = useState(0);
  
  const modules = [
    { 
      id: 0, 
      title: 'Health Surveillance', 
      icon: Activity, 
      color: 'text-sky-400', 
      href: '/surveillance',
      desc: 'Real-time regional health tracking and community report monitoring.',
      features: ['Automated Anomaly Detection', 'Geospatial Heatmaps', 'Health Worker Dashboards']
    },
    { 
      id: 1, 
      title: 'AI-Powered Insights', 
      icon: Brain, 
      color: 'text-violet-400', 
      href: '/neural-engine',
      desc: 'Analyze symptom reports and identify emerging health trends with AI.',
      features: ['Symptom Analysis', 'Risk Factor Correlation', 'Trend Predictions']
    },
    { 
      id: 2, 
      title: 'Community Response', 
      icon: Users, 
      color: 'text-emerald-400', 
      href: '/organization',
      desc: 'Connect community reporting with professional health organization response.',
      features: ['Verified Field Reports', 'Regional Alert System', 'Water Quality Tracking']
    }
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-12 py-16 items-center">
      <div className="lg:col-span-5 space-y-4">
        {modules.map((m, i) => (
          <Link key={m.id} href={m.href}>
            <motion.div 
              onMouseEnter={() => setActive(i)}
              whileHover={{ x: 8 }}
              className={`cursor-pointer p-8 rounded-3xl border transition-all duration-300 mb-4 ${
                active === i 
                  ? 'bg-card border-primary shadow-lg shadow-primary/5 scale-[1.02]' 
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 shrink-0 rounded-2xl bg-secondary flex items-center justify-center ${active === i ? m.color : 'text-muted-foreground'}`}>
                  <m.icon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg tracking-tight">{m.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="lg:col-span-7 relative bg-card border border-border rounded-3xl overflow-hidden shadow-xl flex flex-col min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 p-10 lg:p-14 flex flex-col justify-start"
          >
             <div className="mb-10">
                <h4 className="text-2xl font-bold tracking-tight mb-3">{modules[active].title}</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">{modules[active].desc}</p>
             </div>
             
             <div className="grid gap-4">
               {modules[active].features.map((f, i) => (
                 <motion.div 
                   key={f}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 + i * 0.08 }}
                   className="flex items-center gap-4 p-5 rounded-2xl bg-secondary/60 border border-border"
                 >
                   <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                   <span className="font-medium">{f}</span>
                 </motion.div>
               ))}
             </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const ComparisonSection = () => (
  <section className="py-20">
    <div className="max-w-4xl mx-auto bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-secondary/70 border-b border-border text-xs font-semibold text-muted-foreground">
            <th className="p-6 w-1/3">Feature</th>
            <th className="p-6 w-1/3">Traditional</th>
            <th className="p-6 w-1/3 text-right text-primary">HealthNex</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[
            { label: 'Alert Speed', legacy: 'Hours/Days', next: 'Real-time' },
            { label: 'Data Sync', legacy: 'Manual', next: 'Automatic' },
            { label: 'Community Input', legacy: 'None', next: 'Built-in' },
            { label: 'Uptime', legacy: 'Variable', next: '99.9%' },
            { label: 'Reporting', legacy: 'After the fact', next: 'Proactive' },
          ].map((row, i) => (
            <motion.tr 
              key={row.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="hover:bg-secondary/40 transition-colors"
            >
              <td className="p-6">
                <span className="text-sm font-medium text-muted-foreground">{row.label}</span>
              </td>
              <td className="p-6">
                <span className="text-sm opacity-40 line-through">{row.legacy}</span>
              </td>
              <td className="p-6 text-right">
                <span className="text-sm font-bold text-primary">{row.next}</span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border py-6 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left group">
        <span className="text-base font-semibold pr-4 group-hover:text-primary transition-colors">{question}</span>
        <div className={`w-8 h-8 rounded-full border border-border flex items-center justify-center shrink-0 transition-all ${isOpen ? 'bg-primary border-primary text-white rotate-180' : 'group-hover:border-primary group-hover:text-primary'}`}>
           <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pt-4 text-sm text-muted-foreground leading-relaxed max-w-4xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page ---

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const statsData = useQuery(api.stats.getLandingPageStats);
  
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      if (user?.role === 'public') {
        router.push('/education');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  if (!mounted) return <div className="min-h-screen bg-background" />;

  const features = [
    { title: "Real-time Monitoring", desc: "Track regional health data instantly with low-latency synchronization.", icon: Activity, color: "text-sky-400" },
    { title: "AI-Powered Insights", desc: "Analyze symptom reports and identify health trends using advanced AI.", icon: Brain, color: "text-violet-400" },
    { title: "Community Reports", desc: "Enable local communities to report and track health issues together.", icon: Users, color: "text-emerald-400" },
    { title: "Water Quality Tracking", desc: "Monitor water source quality to help prevent waterborne diseases.", icon: Waves, color: "text-cyan-400" },
    { title: "Secure & Private", desc: "Role-based access control with encrypted data synchronization.", icon: ShieldCheck, color: "text-muted-foreground" },
    { title: "Rich Analytics", desc: "Visualize complex data with interactive charts and reports.", icon: BarChart3, color: "text-amber-400" }
  ];

  return (
    <LandingLayout>
      <section className="pt-24 pb-20 md:pb-32 bg-secondary/50 border-b border-border relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-12">
               <Zap className="w-3.5 h-3.5" />
               <span>Open-Source Health Monitoring</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-foreground leading-tight">
               Better health data,<br />
               <span className="text-primary">better outcomes.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              A collaborative platform for communities and health organizations to track, report, and respond to health issues in real time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => router.push('/register')} className="h-12 px-10 text-base font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Get Started
              </Button>
              <Button asChild variant="ghost" className="h-12 px-8 text-base font-medium group">
                <Link href="/documentation" className="flex items-center gap-2">
                  Learn More <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>
          <InteractiveDashboardMockup stats={statsData} />
        </div>
      </section>

      <section id="how-it-works" className="py-24 md:py-32 bg-background border-b border-border relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-20 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A simple pipeline from community reporting to actionable insights.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 relative">
            {[
              { icon: Globe2, title: "Collect", desc: "Community members and health workers submit reports from the field." },
              { icon: Brain, title: "Analyze", desc: "AI identifies patterns, clusters, and potential health risks automatically." },
              { icon: ShieldCheck, title: "Respond", desc: "Verified alerts are sent to the right people for timely action." }
            ].map((step, i) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col p-8 bg-card border border-border rounded-3xl hover:border-primary/40 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="py-24 border-t border-border bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 leading-tight">Built for <br /><span className="text-muted-foreground">real-world use.</span></h2>
          <ModuleShowcase />
        </div>
      </section>

      <section id="features" className="py-24 bg-background border-b border-border overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Features</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need for effective health monitoring.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => <FeatureCard key={i} {...feature} delay={i * 0.1} />)}
          </div>
        </div>
      </section>

      <section id="performance" className="py-24 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Why HealthNex?</h2>
          </div>
          <ComparisonSection />
        </div>
      </section>

      <section id="faq" className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
            <FAQItem question="How does HealthNex identify health issues?" answer="Our platform uses AI to analyze community symptom reports and correlate them with regional data, helping identify potential health concerns in real-time." />
            <FAQItem question="Is my data secure?" answer="Yes. All reports are transmitted through encrypted channels. We implement role-based access controls so only authorized personnel can view sensitive data." />
            <FAQItem question="Can health workers use this offline?" answer="Yes. HealthNex is built as a PWA with intelligent caching. It maintains a local data cache and syncs when a connection is available." />
            <FAQItem question="How do I report a health issue?" answer="Registered users and community members can submit reports through the Community Reporting interface, providing ground-level data to the network." />
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
