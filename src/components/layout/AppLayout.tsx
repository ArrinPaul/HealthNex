"use client";

import Navigation from './Navigation';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

import GlobalHUDAlert from './GlobalHUDAlert';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/surveillance',
    '/neural-engine',
    '/privacy-code',
    '/mission-state',
    '/help',
    '/documentation',
    '/organization'
  ];
  
  const isPublicPage = publicRoutes.includes(pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20 theme-transition">
      {/* Atmospheric Technical Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#020202]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(var(--primary-rgb),0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Navigation isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        
        <main className={`flex-1 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
          <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto pt-20 lg:pt-10">
            {/* High-Fidelity Intelligence Surface */}
            <div className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-[2.5rem] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col min-h-[calc(100vh-80px)] relative group/window">
              
              {/* Window Header: Technical Protocol Bar */}
              <div className="h-12 border-b border-[var(--border-soft)] bg-[var(--surface-2)]/90 backdrop-blur-md flex items-center px-8 justify-between shrink-0 transition-colors group-hover/window:border-primary/20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]/20 border border-[#FF5F56]/40 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/20 border border-[#FFBD2E]/40 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]/20 border border-[#27C93F]/40 shadow-sm" />
                </div>
                
                <div className="flex items-center gap-4 bg-[var(--surface-1)] px-5 py-1 rounded-full border border-[var(--border-soft)] shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
                  <div className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-[0.3em]">
                    protocol://portal.healthnex.io
                  </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="hidden md:flex items-center gap-2 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                     <span className="text-primary/60">UPLINK:</span> SECURE
                   </div>
                   <div className="h-4 w-px bg-[var(--border-soft)] hidden md:block" />
                   <div className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.3em]">
                     SESSION_ALPHA_v1.0
                   </div>
                </div>
              </div>

              {/* Window Content Container */}
              <div className="flex-1 overflow-auto p-8 lg:p-12 custom-scrollbar relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_100%)] opacity-[0.02] pointer-events-none" />
                <div className="relative z-10 h-full">
                   {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
