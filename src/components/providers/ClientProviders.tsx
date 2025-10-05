'use client';

import { ToastProvider } from '@/hooks/use-toast';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}