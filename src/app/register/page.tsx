"use client";

import { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
// import { useTranslation } from 'react-i18next'; // Removed for SSR compatibility
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Shield, Stethoscope, Users, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { validatePassword } from '@/lib/passwordValidation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('community-user');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  // const { t } = useTranslation(); // Removed for SSR compatibility
  
  // Static translations for better SSR compatibility
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'createAccount': 'Create Account',
      'fullName': 'Full Name',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'selectRole': 'Select Role',
      'location': 'Location',
      'creating': 'Creating...',
      'signUp': 'Sign Up',
      'alreadyHaveAccount': 'Already have an account?',
      'signIn': 'Sign In',
      'joinHealthSystem': 'Join the Health Surveillance System',
      'roleDescriptions': 'Choose your role to get started',
      'adminAccess': 'Admin Access',
      'healthProfessional': 'Health Professional',
      'communityUser': 'Community User'
    };
    return translations[key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password strength
    const { isValid } = validatePassword(password);
    if (!isValid) {
      alert('Password does not meet the required criteria. Please check the requirements below.');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role, location);
      
      // Role-based redirect
      if (role === 'admin' || role === 'health-worker') {
        router.push('/dashboard');
      } else if (role === 'community-user') {
        router.push('/education');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Health Surveillance
            </h1>
          </Link>
          <p className="text-xl text-muted-foreground">
            Create your account
          </p>
        </div>

        <div className="apple-card p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                {t('name')}
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 h-11 rounded-xl"
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 h-11 rounded-xl"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                {t('password')}
              </Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 h-11 rounded-xl"
                placeholder="••••••••"
              />
              <PasswordStrengthIndicator password={password} />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                {t('confirmPassword')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-2 h-11 rounded-xl"
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-sm font-medium">
                {t('role')}
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="mt-2 h-11 rounded-xl">
                  <SelectValue placeholder={t('selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {t('admin')}
                    </div>
                  </SelectItem>
                  <SelectItem value="health-worker">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      {t('healthWorker')}
                    </div>
                  </SelectItem>
                  <SelectItem value="community-user">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('communityUser')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium">
                {t('location')}
              </Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="mt-2 h-11 rounded-xl"
                placeholder="City, State"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 rounded-full text-base font-medium shadow-lg shadow-primary/20" 
              disabled={loading}
            >
              {loading ? t('loading') : (
                <span className="flex items-center gap-2">
                  {t('signUp')}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-4 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/login" 
              className="text-primary hover:text-primary/80 font-medium transition-colors text-sm"
            >
              Sign in instead
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}