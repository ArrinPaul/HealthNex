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
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Logo size="md" />

        <nav className="hidden lg:flex items-center gap-12 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
          <Link href="/#how-it-works" className="hover:text-primary transition-colors">Protocol</Link>
          <Link href="/#modules" className="hover:text-primary transition-colors">Showcase</Link>
          <Link href="/#performance" className="hover:text-primary transition-colors">Performance</Link>
          <Link href="/#faq" className="hover:text-primary transition-colors">Support</Link>
        </nav>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => router.push('/dashboard')} className="h-11 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/20 transition-all">
                Dashboard
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-[10px] font-bold uppercase tracking-widest">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button onClick={() => router.push('/register')} className="h-11 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/20 transition-all">
                  Initialize
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
          <nav className="flex flex-col gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
            <Link href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Protocol</Link>
            <Link href="/#modules" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Showcase</Link>
            <Link href="/#performance" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Performance</Link>
            <Link href="/#faq" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Support</Link>
          </nav>
          <div className="flex flex-col gap-4">
            {isAuthenticated ? (
              <Button onClick={() => { router.push('/dashboard'); setIsMenuOpen(false); }} className="w-full h-11 rounded-xl font-bold bg-primary text-primary-foreground">
                Dashboard
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button onClick={() => { router.push('/register'); setIsMenuOpen(false); }} className="w-full h-11 rounded-xl font-bold bg-primary text-primary-foreground">
                  Initialize
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

