"use client";

import { AuthProvider } from '@/contexts/AuthContext';

import { SettingsProvider } from '@/contexts/SettingsContext';

import { ConvexClientProvider } from './ConvexProvider';

import AppLayout from '../layout/AppLayout';



export default function ClientProviders({ children }: { children: any }) {

  return (

    <ConvexClientProvider>

      <SettingsProvider>

        <AuthProvider>

          <AppLayout>

            {children}

          </AppLayout>

        </AuthProvider>

      </SettingsProvider>

    </ConvexClientProvider>

  );

}
