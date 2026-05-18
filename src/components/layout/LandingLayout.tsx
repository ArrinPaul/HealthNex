"use client";

import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="relative min-h-screen bg-background font-sans selection:bg-primary/10 overflow-x-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-[100] origin-left shadow-[0_0_10px_var(--primary)]" style={{ scaleX }} />
      
      <LandingHeader />
      
      <main className="pt-20">
        {children}
      </main>
      
      <LandingFooter />
    </div>
  );
}
