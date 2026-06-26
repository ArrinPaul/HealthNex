"use client";

import { AuthProvider } from '@/contexts/AuthContext';

import { SettingsProvider } from '@/contexts/SettingsContext';

import { ConvexClientProvider } from './ConvexProvider';
import AppLayout from '../layout/AppLayout';
import { Toaster } from "@/components/ui/sonner";
import '@/lib/i18n';

export default function ClientProviders({ children }: { children: any }) {
  return (
    <ConvexClientProvider>
      <SettingsProvider>
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </SettingsProvider>
    </ConvexClientProvider>
  );
}
