'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts';
import { getSelectedOrganizationId } from '@/lib/organization-context';
import { PersonalProfileSection } from './PersonalProfileSection';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { BrandProfileSection } from './BrandProfileSection';
import { FacebookPageSelector } from './FacebookPageSelector';

interface SettingsContentProps {
  userEmail: string;
  userId: string;
}

export function SettingsContent({ userEmail, userId }: SettingsContentProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFacebookPageSelector, setShowFacebookPageSelector] = useState(false);
  const searchParams = useSearchParams();
  
  // Check for success/error messages from OAuth callback
  const success = searchParams.get('success');
  const platform = searchParams.get('platform');
  const error = searchParams.get('error');

  useEffect(() => {
    loadAccounts();
    
    // Show success message if account was just connected
    if (success && platform) {
      console.log(`Successfully connected ${platform} account`);
      
      // Show Facebook page selector if Facebook was just connected
      if (platform === 'facebook') {
        setTimeout(() => {
          setShowFacebookPageSelector(true);
        }, 500);
      }
      
      // Reload accounts after successful connection
      setTimeout(() => loadAccounts(), 1000);
    }
    
    // Show error message if connection failed
    if (error) {
      console.error(`Failed to connect account: ${error}`);
      // You could show an error toast here
    }
    
    // Listen for organization changes and reload accounts
    const handleOrgChange = () => {
      console.log('Organization changed, reloading accounts...');
      loadAccounts();
    };
    
    window.addEventListener('organizationChanged', handleOrgChange);
    return () => window.removeEventListener('organizationChanged', handleOrgChange);
  }, [success, platform, error]);

  async function loadAccounts() {
    setIsLoading(true);
    try {
      // Get current organization and fetch accounts for it
      const organizationId = getSelectedOrganizationId();
      console.log('Loading accounts for organization:', organizationId || 'personal');
      const fetchedAccounts = await fetchUserSocialAccounts(organizationId);
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
                {/* Personal Profile Section */}
                <PersonalProfileSection />

                {/* Connected Accounts Section */}
                <ConnectedAccountsSection 
                  accounts={accounts} 
                  userId={userId}
                  onAccountsChange={loadAccounts}
                />

                {/* Brand Profile Section */}
                <BrandProfileSection userId={userId} />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Facebook Page Selector Modal */}
      <FacebookPageSelector
        open={showFacebookPageSelector}
        onOpenChange={setShowFacebookPageSelector}
        userId={userId}
        onPageSelected={loadAccounts}
      />
    </>
  );
}