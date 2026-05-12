"use client";

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
// import { useTranslation } from 'react-i18next'; // Removed for SSR compatibility
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Shield, Stethoscope, Users, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { validatePassword } from '@/lib/passwordValidation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  // const { t } = useTranslation(); // Removed for SSR compatibility
  
  // Static translations for better SSR compatibility
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'signIn': 'Sign In',
      'email': 'Email',
      'password': 'Password',
      'signingIn': 'Signing In...',
      'signInButton': 'Sign In',
      'dontHaveAccount': "Don't have an account?",
      'signUp': 'Sign Up',
      'welcomeBack': 'Welcome Back',
      'signInToContinue': 'Sign in to continue to the health surveillance system',
      'adminAccess': 'Admin Access',
      'healthProfessional': 'Health Professional',
      'communityUser': 'Community User'
    };
    return translations[key] || key;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Basic validation for login
    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      // Login without specifying role - backend will determine user's role from signup data
      const userData = await login(email, password);
      
      // Role-based redirect based on user's stored role
      if (userData.role === 'admin' || userData.role === 'health-worker') {
        router.push('/dashboard');
      } else if (userData.role === 'community-user') {
        router.push('/education');
      }
    } catch (error) {
      console.error('Login failed:', error);
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
            Sign in to continue
          </p>
        </div>

        <div className="apple-card p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
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
                onChange={(e: any) => setPassword(e.target.value)}
                required
                className="mt-2 h-11 rounded-xl"
                placeholder="••••••••"
              />
            </div>



            <Button 
              type="submit" 
              className="w-full h-11 rounded-full text-base font-medium shadow-lg shadow-primary/20" 
              disabled={loading}
            >
              {loading ? t('loading') : (
                <span className="flex items-center gap-2">
                  {t('signIn')}
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
                New to Health Surveillance?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/register" 
              className="text-primary hover:text-primary/80 font-medium transition-colors text-sm"
            >
              Create an account
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