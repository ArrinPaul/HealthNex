"use client";

import Navigation from './Navigation';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const VisualEditsMessenger = dynamic(() => import('@/visual-edits/VisualEditsMessenger'), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <VisualEditsMessenger />
      
      <div className="relative z-10 flex min-h-screen">
        <Navigation />
        <main className="flex-1 lg:ml-80 transition-all duration-300">
          <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-24 lg:pt-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}