"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Activity, Droplet, Bell, Shield, BarChart, Users, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    try {
      if (isAuthenticated) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: Activity,
      title: 'Real-time Surveillance',
      description: 'Advanced AI monitoring of disease outbreaks with predictive analytics.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Droplet,
      title: 'Water Intelligence',
      description: 'Smart sensors for immediate water quality detection and contamination alerts.',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    },
    {
      icon: Bell,
      title: 'Rapid Response',
      description: 'Instant warning dissemination system for health officials and communities.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    {
      icon: BarChart,
      title: 'Data Visualization',
      description: 'Comprehensive dashboards turning complex data into actionable insights.',
      color: 'text-violet-500',
      bg: 'bg-violet-500/10'
    },
    {
      icon: Shield,
      title: 'Secure Access',
      description: 'Role-based encryption ensuring data privacy for all stakeholders.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: Users,
      title: 'Community Power',
      description: 'Crowdsourced reporting empowering citizens to be part of the solution.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-primary/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-400/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">HealthNex</span>
          </div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-4">
              <Button asChild variant="ghost" className="text-base font-medium hover:bg-white/10">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen Health Surveillance</span>
              </div>
              
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.05]">
                Monitor. <br />
                Predict. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                  Protect.
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-12 max-w-xl leading-relaxed">
                Empowering communities with AI-driven disease monitoring and water quality tracking. 
                Early warning systems reimagined for the modern world.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                  <Link href="/register">
                    Start Monitoring
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-sm">
                  <Link href="/login">Live Demo</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden glass border border-white/20 shadow-2xl shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-cyan-400/5" />
                
                {/* Abstract Data Visualization Decoration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-4 border-2 border-cyan-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="w-24 h-24 text-primary opacity-50" />
                    </div>
                    {/* Floating Cards */}
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-12 -right-12 p-4 rounded-2xl glass border border-white/40 shadow-xl"
                    >
                      <Droplet className="w-8 h-8 text-cyan-500 mb-2" />
                      <div className="h-2 w-16 bg-muted rounded-full mb-1" />
                      <div className="h-2 w-10 bg-muted rounded-full" />
                    </motion.div>
                    
                    <motion.div 
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute -bottom-8 -left-8 p-4 rounded-2xl glass border border-white/40 shadow-xl"
                    >
                      <Bell className="w-8 h-8 text-rose-500 mb-2" />
                      <div className="h-2 w-20 bg-muted rounded-full mb-1" />
                      <div className="h-2 w-12 bg-muted rounded-full" />
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Mesh Behind */}
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary/30 to-purple-500/30 blur-[60px] rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Intelligent Surveillance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive suite of tools designed for the future of public health monitoring.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-[2rem] bg-background border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-display font-bold tracking-tight">HealthNex</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 HealthNex Surveillance. Built for humanity.
          </p>
        </div>
      </footer>
    </div>
  );
}
