'use client';

import { ReactNode } from 'react';

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return <>{children}</>;
}