"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';
import Logo from '@/components/layout/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'public') {
        router.push('/education');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden relative">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 relative items-center justify-center p-16 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 space-y-10 max-w-md">
           <Logo size="xl" className="text-white" />

           <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Better health data,<br />
                <span className="text-primary">better outcomes.</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Track, report, and respond to health issues in your community.
              </p>
           </div>
           
           <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
              {[
                { label: 'Response Time', value: '< 1s' },
                { label: 'Uptime', value: '99.9%' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                   <span className="text-xs text-white/40">{item.label}</span>
                   <div className="text-2xl font-bold text-white font-mono">{item.value}</div>
                </div>
              ))}
           </div>
        </div>

        <div className="absolute bottom-8 left-8 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-xs font-medium text-emerald-400">System Online</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative">
        <div className="absolute top-8 right-8 flex items-center gap-6">
           <ThemeToggle />
           <Button asChild variant="ghost" className="text-[10px] font-bold uppercase tracking-widest hidden sm:flex">
             <Link href="/">Close</Link>
           </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
             <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
             <p className="text-muted-foreground">Access your health monitoring dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="h-11 pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                   <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 pl-10 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl font-medium" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-4 border-t border-border text-center">
             <p className="text-sm text-muted-foreground">
               Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Sign up</Link>
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
