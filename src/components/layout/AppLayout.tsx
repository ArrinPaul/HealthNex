"use client";

import Navigation from './Navigation';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import GlobalHUDAlert from './GlobalHUDAlert';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import SymptomCheckerModal from '../SymptomCheckerModal';

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

  const { user, token } = useAuth();
  const statusQuery = useQuery(api.healthAssessments.getAssessmentStatus as any, { token: token || "" });
  const needsOnboarding = statusQuery?.needsOnboarding === true;
  const [showModal, setShowModal] = useState(false);

  // When status loads and they need onboarding, show it
  // But only if we're not on a public page to avoid annoying popups on public pages
  if (!isPublicPage && needsOnboarding && !showModal) {
    setShowModal(true);
  }

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

      <SymptomCheckerModal 
        isOpen={showModal} 
        onClose={() => {}} 
        onComplete={() => setShowModal(false)}
        forceOnboarding={true}
      />
    </div>
  );
}
