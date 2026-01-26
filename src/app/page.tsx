"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Activity, Droplet, Bell, Shield, BarChart, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import AIChatbot from '@/components/AIChatbot';
import AISuggestions from '@/components/AISuggestions';

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
      title: 'Disease Monitoring',
      description: 'Real-time tracking of disease cases and outbreak predictions with advanced AI analytics.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Droplet,
      title: 'Water Quality',
      description: 'Monitor water quality parameters and receive instant contamination alerts.',
      color: 'from-cyan-500 to-teal-500'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Instant notifications for health threats and warnings delivered in real-time.',
      color: 'from-orange-500 to-pink-500'
    },
    {
      icon: BarChart,
      title: 'Data Analytics',
      description: 'Advanced visualization tools and comprehensive trend analysis.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access control for officials, workers, and community members.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Community Reporting',
      description: 'Empower communities to report health issues and contribute to public safety.',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 apple-glass border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Health Surveillance
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="ghost" className="text-sm font-medium">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="text-sm font-medium rounded-full">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 animate-fade-in-up">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-scale-in">
            <Activity className="w-4 h-4" />
            <span>Introducing Smart Health Surveillance</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.05]">
            Early Warning<br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              System for Health
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Empowering communities with real-time disease monitoring, water quality tracking, 
            and predictive analytics for better public health outcomes.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-20">
            <Button asChild size="lg" className="text-base px-8 rounded-full h-12 shadow-lg shadow-primary/20">
              <Link href="/register" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 rounded-full h-12">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Hero Image/Visual */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="aspect-video rounded-3xl apple-glass border border-border/40 overflow-hidden shadow-2xl">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Activity className="w-32 h-32 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to monitor, predict, and prevent health crises.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="apple-card p-8 group cursor-default"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="apple-card p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to Make<br />a Difference?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join health officials and community workers using our platform to prevent 
              disease outbreaks and improve public health.
            </p>
            <Button asChild size="lg" className="text-base px-10 rounded-full h-12 shadow-lg shadow-primary/20">
              <Link href="/register" className="flex items-center gap-2">
                Create Your Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Suggestions Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="apple-card p-8 md:p-12 mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                AI-Powered Health Suggestions
              </h2>
              <p className="text-muted-foreground mb-6">
                Personalized health recommendations and preventive care suggestions based on AI analysis.
              </p>
              <AISuggestions />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Health Surveillance System. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
              <Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link>
              <Link href="/education" className="hover:text-foreground transition-colors">Education</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for Chatbot */}
      <AIChatbot />
    </div>
  );
}