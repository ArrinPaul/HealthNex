"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Lock, Mail, Zap, Activity, Globe } from 'lucide-react';
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
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden relative">
      {/* Immersive Background Side (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 relative items-center justify-center p-20 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Decorative elements */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] border border-primary/20 rounded-full flex items-center justify-center"
        >
          <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent absolute" />
          <div className="w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent absolute" />
        </motion.div>

        <div className="relative z-10 space-y-12 max-w-lg">
           <Logo size="xl" className="dark:text-white" />
           <div className="space-y-6">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter text-white uppercase leading-none">
                Unified <br />
                <span className="text-primary">Intelligence</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Establishing the global standard for regional health visibility and proactive response coordination.
              </p>
           </div>
           
           <div className="grid grid-cols-2 gap-8">
              {[
                { label: 'Latency', value: '<1s', icon: Activity },
                { label: 'Availability', value: '99.9%', icon: Globe }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex items-center gap-3 text-primary">
                      <item.icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{item.label}</span>
                   </div>
                   <div className="text-3xl font-bold text-white font-mono">{item.value}</div>
                </div>
              ))}
           </div>
        </div>

        {/* Floating status blip */}
        <div className="absolute bottom-12 left-12 flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_var(--emerald-500)]" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Protocol Status: Optimal</span>
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
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                <Shield className="w-3 h-3" />
                Identity Verification
             </div>
             <h1 className="text-4xl font-bold tracking-tight uppercase leading-none">Initialize <br /><span className="text-primary">Session.</span></h1>
             <p className="text-muted-foreground font-medium">Access your regional intelligence dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest ml-4 text-muted-foreground">Protocol ID (Email)</Label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="id@healthnex.io"
                    className="h-16 pl-14 pr-8 rounded-[1.5rem] bg-[var(--surface-2)] border-[var(--border-soft)] focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-4">
                   <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access Key</Label>
                   <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-80">Recover</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-16 pl-14 pr-8 rounded-[1.5rem] bg-[var(--surface-2)] border-[var(--border-soft)] focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-20 rounded-[1.5rem] text-xl font-bold bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-3">Authenticating...</span>
              ) : (
                <span className="flex items-center gap-3">
                  Establish Connection <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-8 border-t border-[var(--border-soft)] flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">New to Protocol?</div>
             <Button asChild variant="outline" className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all">
                <Link href="/register">Request Access</Link>
             </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
