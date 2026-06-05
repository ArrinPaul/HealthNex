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
      {/* Atmospheric background layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(0,217,255,0.2)_0%,transparent_65%)] blur-2xl" />
        <div className="absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.18)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.02)_0%,transparent_45%,rgba(0,217,255,0.03)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Navigation isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        
        <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
          <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto pt-24 lg:pt-12">
            {/* Glassy control surface container */}
            <div className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-[2rem] shadow-[0_40px_90px_-50px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col min-h-[calc(100vh-100px)] theme-transition">
              
              {/* Window Header */}
              <div className="h-14 border-b border-[var(--border-soft)] bg-[var(--surface-2)]/80 backdrop-blur flex items-center px-8 justify-between shrink-0 theme-transition">
                <div className="flex gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] shadow-sm hover:opacity-80 cursor-pointer transition-opacity" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] shadow-sm hover:opacity-80 cursor-pointer transition-opacity" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] shadow-sm hover:opacity-80 cursor-pointer transition-opacity" />
                </div>
                
                <div className="flex items-center gap-3 bg-[var(--surface-1)] px-6 py-1.5 rounded-xl border border-[var(--border-soft)] shadow-sm theme-transition">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] min-w-[180px] text-center">
                    portal.healthnex.io
                  </div>
                </div>

                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] hidden md:block">
                  HealthNex Intelligence Session
                </div>
                <div className="w-16 md:hidden" />
              </div>

              {/* Window Content */}
              <div className="flex-1 overflow-auto p-10 lg:p-12 custom-scrollbar">
                {children}
              </div>
            </div>

            <GlobalHUDAlert />
          </div>
        </main>
      </div>
    </div>
  );
}
