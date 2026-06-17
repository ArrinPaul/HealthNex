"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

import { useAuth } from '@/contexts/AuthContext';

export default function LandingHeader() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Logo size="md" />

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
          <Link href="/#modules" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/#performance" className="hover:text-primary transition-colors">Why HealthNex</Link>
          <Link href="/#faq" className="hover:text-primary transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Button 
                onClick={() => {
                  if (user?.role === 'public') {
                    router.push('/education');
                  } else {
                    router.push('/dashboard');
                  }
                }} 
                className="h-11 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/20 transition-all"
              >
                {user?.role === 'public' ? 'Education' : 'Dashboard'}
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-sm font-medium">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button onClick={() => router.push('/register')} className="h-10 px-6 rounded-xl font-medium bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all">
                  Get Started
                </Button>
              </>
            )}
          </div>
          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">How It Works</Link>
            <Link href="/#modules" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Features</Link>
            <Link href="/#performance" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Why HealthNex</Link>
            <Link href="/#faq" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">FAQ</Link>
          </nav>
          <div className="flex flex-col gap-4">
            {isAuthenticated ? (
              <Button 
                onClick={() => { 
                  if (user?.role === 'public') {
                    router.push('/education');
                  } else {
                    router.push('/dashboard');
                  }
                  setIsMenuOpen(false); 
                }} 
                className="w-full h-11 rounded-xl font-bold bg-primary text-primary-foreground"
              >
                {user?.role === 'public' ? 'Education' : 'Dashboard'}
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="w-full text-sm font-medium">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button onClick={() => { router.push('/register'); setIsMenuOpen(false); }} className="w-full h-10 rounded-xl font-medium bg-primary text-primary-foreground">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

