"use client";

import Navigation from './Navigation';
import { usePathname } from 'next/navigation';
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
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20">
      <div className="relative z-10 flex min-h-screen">
        <Navigation isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        
        <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-[60px]' : 'lg:ml-56'}`}>
          <div className="px-6 md:px-12 lg:px-16 py-8 max-w-8xl mx-auto pt-20 lg:pt-8">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-80px)]">
              <div className="flex-1 overflow-auto p-6 lg:p-8">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
