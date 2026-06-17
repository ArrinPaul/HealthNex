"use client";

import { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Stethoscope, MapPin, CheckCircle2, Upload, FileText, Globe } from 'lucide-react';
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
      <div className="hidden md:flex flex-1 relative items-center justify-center p-16 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 space-y-10 max-w-lg">
           <Logo size="xl" className="dark:text-white" />
           <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Join the <br />
                <span className="text-primary">community.</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Help protect and inform your community through collaborative health monitoring.
              </p>
           </div>

           <div className="space-y-3">
              {['Encrypted data', 'Real-time sync', 'AI-powered insights'].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-white text-sm">
                   <CheckCircle2 className="w-4 h-4 text-primary" />
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
          className="w-full max-w-md space-y-8 py-12"
        >
          <div className="space-y-2">
             <div className="text-xs text-muted-foreground mb-2">
               Step {step} of {role === 'health-worker' ? 3 : 2}
             </div>
             <h1 className="text-3xl font-bold tracking-tight">
               {step === 1 ? 'Create Account' : step === 2 ? 'Set Up Profile' : 'Verify Identity'}
             </h1>
             <p className="text-muted-foreground text-sm">
               {step === 1 ? 'Enter your details to get started.' : step === 2 ? 'Choose your role and set a password.' : 'Upload your professional credentials.'}
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
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="text-right pt-2">
                     <Button type="button" onClick={handleNext} className="h-10 px-6 rounded-xl font-medium">
                        Continue
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                      <PasswordStrengthIndicator password={password} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm" className="text-sm font-medium">Confirm Password</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Role</Label>
                      <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-600 p-3 rounded-lg">
                        All accounts start with Public access. Your requested role will be reviewed by an admin.
                      </div>
                      <div className="grid gap-2">
                         {roles.map((r) => (
                           <button
                             key={r.value}
                             type="button"
                             onClick={() => setRole(r.value as UserRole)}
                             className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                               role === r.value 
                                 ? 'bg-primary/10 border-primary shadow-sm' 
                                 : 'bg-secondary border-border hover:border-primary/40'
                             }`}
                           >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${role === r.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                 <r.icon className="w-4 h-4" />
                              </div>
                              <div>
                                 <div className="font-medium text-sm">{r.label}</div>
                                 <p className="text-xs text-muted-foreground">{r.desc}</p>
                              </div>
                           </button>
                         ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          required
                          placeholder="City, State"
                          className="h-11 pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <button type="button" onClick={handleBack} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Back
                    </button>
                    {role === 'health-worker' ? (
                       <Button type="button" onClick={handleNext} className="h-10 px-6 rounded-xl font-medium">
                          Continue
                       </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        className="h-10 px-6 rounded-xl font-medium" 
                        disabled={loading}
                      >
                        {loading ? 'Creating account...' : 'Create Account'}
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
                  className="space-y-6"
                >
                   <div className="space-y-4">
                      <div className="p-8 rounded-xl border-2 border-dashed border-border bg-secondary text-center space-y-3 hover:border-primary transition-colors cursor-pointer relative group">
                         <input 
                           type="file" 
                           className="absolute inset-0 opacity-0 cursor-pointer" 
                           onChange={(e) => setVerificationFile(e.target.files?.[0]?.name || 'license.pdf')}
                         />
                         <Upload className="w-8 h-8 text-primary mx-auto" />
                         <div>
                            <h4 className="font-medium">Upload Credentials</h4>
                            <p className="text-xs text-muted-foreground">Medical License, Gov ID, or NGO Authorization (PDF/JPG)</p>
                         </div>
                         {verificationFile && (
                           <div className="flex items-center justify-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-xs">
                              <FileText className="w-4 h-4" />
                              <span className="truncate">{verificationFile}</span>
                           </div>
                         )}
                      </div>
                      
                      <div className="p-4 rounded-xl bg-secondary border border-border text-xs text-muted-foreground">
                         Your credentials will be reviewed within 12-24 hours.
                      </div>
                   </div>

                   <div className="flex items-center justify-between gap-4 pt-2">
                    <button type="button" onClick={handleBack} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Back
                    </button>
                    <Button 
                      type="submit" 
                      className="h-10 px-6 rounded-xl font-medium" 
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="pt-4 border-t border-border text-center">
             <p className="text-sm text-muted-foreground">
               Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
