"use client";

import Navigation from './Navigation';
// import AIChatbot from './AIChatbot';
// import VoiceEnabledChatbot from './VoiceEnabledChatbot';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <VisualEditsMessenger />
      <Navigation />
      <main className="lg:ml-72 pt-20 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
      {/* <VoiceEnabledChatbot /> */}
    </div>
  );
}