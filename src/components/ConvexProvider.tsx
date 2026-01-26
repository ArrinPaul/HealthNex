'use client';

import { ReactNode } from 'react';
import { ConvexProvider, ConvexHttpClient } from "convex/react";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ConvexClientProviderProps {
  children: ReactNode;
}

/**
 * Basic Convex provider for server-side or simple client-side usage.
 * For full real-time capabilities with Auth, consider using ConvexProviderWithAuth
 */
export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexProvider client={convex as any}>
      {children}
    </ConvexProvider>
  );
}
