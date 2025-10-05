'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';

interface SettingsContentProps {
  userEmail: string;
  userId: string;
}

export function SettingsContent({ userEmail, userId }: SettingsContentProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  
  // Check for success/error messages from OAuth callback
  const connected = searchParams.get('connected');
  const error = searchParams.get('error');

  useEffect(() => {
    loadAccounts();
    
    // Show success message if account was just connected
    if (connected) {
      console.log(`Successfully connected ${connected} account`);
      // You could show a toast notification here
    }
    
    // Show error message if connection failed
    if (error) {
      console.error(`Failed to connect account: ${error}`);
      // You could show an error toast here
    }
  }, [connected, error]);

  async function loadAccounts() {
    setIsLoading(true);
    try {
      const fetchedAccounts = await fetchUserSocialAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Sidebar accounts={accounts} />
      
      <div className="ml-64">
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Settings
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0 space-y-8">
                {/* Connected Accounts Section */}
                <ConnectedAccountsSection 
                  accounts={accounts} 
                  userId={userId}
                  onAccountsChange={loadAccounts}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}