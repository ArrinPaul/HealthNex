"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import AppLayout from './AppLayout';

export default function ClientProviders({ children }: { children: any }) {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppLayout>
          {children}
        </AppLayout>
      </AuthProvider>
    </SettingsProvider>
  );
}