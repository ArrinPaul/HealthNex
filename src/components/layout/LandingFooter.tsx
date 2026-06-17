"use client";

import Link from 'next/link';
import Logo from './Logo';

export default function LandingFooter() {
  return (
    <footer className="py-20 border-t border-border bg-secondary/50">
      <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
        <div className="col-span-2 space-y-6">
          <Logo size="lg" />
          <p className="text-base leading-relaxed text-muted-foreground">Helping communities and health organizations work together to monitor and respond to health issues.</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-6 text-primary">Platform</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><Link href="/surveillance" className="hover:text-primary transition-all">Surveillance</Link></li>
            <li><Link href="/neural-engine" className="hover:text-primary transition-all">AI Insights</Link></li>
            <li><Link href="/documentation" className="hover:text-primary transition-all">Documentation</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-6 text-primary">
            <Link href="/organization" className="hover:opacity-80 transition-all">Organization</Link>
          </h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><Link href="/privacy-code" className="hover:text-primary transition-all">Privacy</Link></li>
            <li><Link href="/mission-state" className="hover:text-primary transition-all">Mission</Link></li>
            <li><Link href="/help" className="hover:text-primary transition-all">Help Center</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 pt-12 mt-12 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
         <span>&copy; 2026 HealthNex. Open-source health monitoring.</span>
         <div className="flex gap-6 mt-4 md:mt-0">
           <Link href="#" className="hover:text-primary transition-all">Twitter</Link>
           <Link href="#" className="hover:text-primary transition-all">GitHub</Link>
         </div>
      </div>
    </footer>
  );
}
