'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts';
import { useMobileMenu } from './AppLayout';
import { useState, useEffect } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const fetchedAccounts = await fetchUserSocialAccounts();
      setAccounts(fetchedAccounts || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setAccounts([]);
    }
  }

  return (
    <>
      <Sidebar
        accounts={accounts}
        onCreatePost={() => router.push('/create-post')}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="lg:ml-64 min-h-screen">
        {title && (
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
            </div>
          </header>
        )}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </>
  );
}
