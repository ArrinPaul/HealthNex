"use client";

import { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Lock, Mail, Users, Stethoscope, MapPin, CheckCircle2, Upload, FileText, Globe } from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';
import Logo from '@/components/layout/Logo';
import { PasswordInput } from '@/components/ui/PasswordInput';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { validatePassword } from '@/lib/passwordValidation';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('public');
  const [location, setLocation] = useState('');
  const [verificationFile, setVerificationFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleNext = () => {
    if (step === 2 && role === 'health-worker') {
      setStep(3);
    } else {
      setStep(step + 1);
    }
  };
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'health-worker' && !verificationFile) {
      alert('Verification credentials are required for Health Professionals.');
      return;
    }

    const { isValid } = validatePassword(password);
    if (!isValid) {
      alert('Security requirements not met. Please check your access key strength.');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Access keys do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role, location, verificationFile || undefined);
      router.push('/education');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'public', label: 'Public Visitor', icon: Globe, desc: 'View global trends & education' },
    { value: 'community-user', label: 'Community User', icon: Users, desc: 'Decentralized reporting & alerts' },
    { value: 'health-worker', label: 'Health Professional', icon: Stethoscope, desc: 'Medical verification & response' }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden relative">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 relative items-center justify-center p-20 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 space-y-12 max-w-lg">
           <Logo size="xl" className="dark:text-white" />
           <div className="space-y-6">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter text-white uppercase leading-none">
                Join the <br />
                <span className="text-primary">Network.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Become a part of the distributed intelligence protocol designed to protect and inform regional health ecosystems.
              </p>
           </div>

           <div className="space-y-6">
              {['End-to-End Encrypted', 'Real-time Synchronization', 'AI-Powered Insights'].map((text, i) => (
                <div key={i} className="flex items-center gap-4 text-white font-bold uppercase tracking-widest text-xs">
                   <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <CheckCircle2 className="w-4 h-4" />
                   </div>
                   {text}
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto">
        <div className="absolute top-8 right-8 flex items-center gap-6">
           <ThemeToggle />
           <Button asChild variant="ghost" className="text-[10px] font-bold uppercase tracking-widest">
             <Link href="/">Close</Link>
           </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-12 py-12"
        >
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                Step {step} of {role === 'health-worker' ? 3 : 2}
             </div>
             <h1 className="text-4xl font-bold tracking-tight uppercase leading-none">
               {step === 1 ? 'Personal' : step === 2 ? 'Protocol' : 'Verification'} <br />
               <span className="text-primary">{step === 1 ? 'Identity.' : step === 2 ? 'Selection.' : 'Credentials.'}</span>
             </h1>
             <p className="text-muted-foreground font-medium">
               {step === 1 ? 'Enter your professional details.' : step === 2 ? 'Choose your role within the network.' : 'Provide medical license or institutional ID.'}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest ml-4 text-muted-foreground">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="h-16 rounded-[1.5rem] bg-[var(--surface-2)] border-[var(--border-soft)] text-lg font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest ml-4 text-muted-foreground">Protocol ID (Email)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="id@healthnex.io"
                      className="h-16 rounded-[1.5rem] bg-[var(--surface-2)] border-[var(--border-soft)] text-lg font-medium"
                    />
                  </div>
                  <div className="space-y-3 text-right">
                     <Button type="button" onClick={handleNext} className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest">
                        Continue <ArrowRight className="ml-3 w-4 h-4" />
                     </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest ml-4 text-muted-foreground">Create Access Key</Label>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-16 rounded-[1.5rem] bg-[var(--surface-2)] border-[var(--border-soft)] text-lg font-medium"
                      />
                      <PasswordStrengthIndicator password={password} />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="confirm" className="text-[10px] font-bold uppercase tracking-widest ml-4 text-muted-foreground">Confirm Access Key</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="h-16 rounded-[1.5rem] bg-[var(--surface-2)] border-[var(--border-soft)] text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-4 text-muted-foreground">Network Role</Label>
                      <div className="grid gap-3">
                         <div className="p-4 mb-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold leading-relaxed">
                            Note: All new accounts are initialized with 'Public' access by default. Your requested role below will be reviewed and assigned by a network administrator.
                         </div>
                         {roles.map((r) => (
                           <button
                             key={r.value}
                             type="button"
                             onClick={() => setRole(r.value as UserRole)}
                             className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                               role === r.value 
                                 ? 'bg-primary/10 border-primary shadow-lg scale-[1.02]' 
                                 : 'bg-[var(--surface-2)] border-[var(--border-soft)] hover:border-primary/40'
                             }`}
                           >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${role === r.value ? 'bg-primary text-primary-foreground' : 'bg-[var(--surface-3)] text-muted-foreground'}`}>
                                 <r.icon className="w-5 h-5" />
                              </div>
                              <div>
                                 <div className="font-bold text-xs uppercase tracking-tight">{r.label}</div>
                                 <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{r.desc}</p>
                              </div>
                           </button>
                         ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-widest ml-4 text-muted-foreground">Deployment Zone (City, State)</Label>
                      <div className="relative group">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          required
                          placeholder="San Francisco, CA"
                          className="h-16 pl-14 rounded-[1.5rem] bg-[var(--surface-2)] border-[var(--border-soft)] text-lg font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 pt-4">
                    <button type="button" onClick={handleBack} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                      Back
                    </button>
                    {role === 'health-worker' ? (
                       <Button type="button" onClick={handleNext} className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary text-primary-foreground">
                          Verify Identity <ArrowRight className="ml-3 w-5 h-5" />
                       </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-all group" 
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : (
                          <span className="flex items-center gap-3">
                            Request Access <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && role === 'health-worker' && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                   <div className="space-y-6">
                      <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-[var(--border-soft)] bg-[var(--surface-2)] text-center space-y-4 hover:border-primary transition-colors cursor-pointer relative group">
                         <input 
                           type="file" 
                           className="absolute inset-0 opacity-0 cursor-pointer" 
                           onChange={(e) => setVerificationFile(e.target.files?.[0]?.name || 'license.pdf')}
                         />
                         <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                            <Upload className="w-10 h-10 text-primary" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="font-bold uppercase tracking-tight">Institutional Credentials</h4>
                            <p className="text-xs text-muted-foreground">Upload Medical License, Gov ID, or NGO Authorization (PDF/JPG)</p>
                         </div>
                         {verificationFile && (
                           <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
                              <FileText className="w-5 h-5" />
                              <span className="text-xs font-bold font-mono truncate">{verificationFile}</span>
                           </div>
                         )}
                      </div>
                      
                      <div className="p-6 rounded-2xl bg-[var(--surface-3)] border border-[var(--border-soft)] space-y-3">
                         <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Verification Policy</span>
                         </div>
                         <p className="text-[10px] text-muted-foreground leading-relaxed">Your credentials will be manually reviewed by a HealthNex Intelligence Lead. Verification typically completes within 12-24 hours.</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between gap-6 pt-4">
                    <button type="button" onClick={handleBack} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                      Back
                    </button>
                    <Button 
                      type="submit" 
                      className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-all group" 
                      disabled={loading}
                    >
                      {loading ? 'Transmitting...' : (
                        <span className="flex items-center gap-3">
                          Establish Connection <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="pt-8 border-t border-[var(--border-soft)] text-center">
             <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
               Already Verified? <Link href="/login" className="text-primary ml-2 hover:opacity-80">Initialize Session</Link>
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
