"use client";

import Link from 'next/link';
import Logo from './Logo';

export default function LandingFooter() {
  return (
    <footer className="py-32 border-t border-border bg-[var(--surface-2)]/70">
      <div className="container mx-auto px-6 grid md:grid-cols-4 gap-24">
        <div className="col-span-2 space-y-10">
          <Logo size="lg" />
          <p className="text-lg md:text-xl font-bold uppercase leading-relaxed tracking-tight text-foreground">Standardizing the world's health response through unified intelligence and distributed collaboration.</p>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-[0.3em] text-[10px] mb-12 text-primary">Intelligence</h4>
          <ul className="space-y-8 text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <li><Link href="/surveillance" className="hover:text-primary transition-all">Surveillance</Link></li>
            <li><Link href="/neural-engine" className="hover:text-primary transition-all">Neural Engine</Link></li>
            <li><Link href="/documentation" className="hover:text-primary transition-all">Documentation</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-[0.3em] text-[10px] mb-12 text-primary">Organization</h4>
          <ul className="space-y-8 text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <li><Link href="/privacy-code" className="hover:text-primary transition-all">Privacy Code</Link></li>
            <li><Link href="/mission-state" className="hover:text-primary transition-all">Mission State</Link></li>
            <li><Link href="/help" className="hover:text-primary transition-all">Help Center</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 pt-32 mt-32 border-t border-border flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
         <span>© 2026 HealthNex Intelligence Protocol. Built for Humanity.</span>
         <div className="flex gap-12 mt-12 md:mt-0">
           <Link href="#" className="hover:text-primary transition-all">Twitter</Link>
           <Link href="#" className="hover:text-primary transition-all">LinkedIn</Link>
           <Link href="#" className="hover:text-primary transition-all">GitHub</Link>
         </div>
      </div>
    </footer>
  );
}
