'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts';
import { getSelectedOrganizationId } from '@/lib/organization-context';
import { PersonalProfileSection } from './PersonalProfileSection';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { BrandProfileSection } from './BrandProfileSection';
import { FacebookPageSelector } from './FacebookPageSelector';
import { Trash2 } from 'lucide-react';

interface SettingsContentProps {
  userEmail: string;
  userId: string;
}

export function SettingsContent({ userEmail, userId }: SettingsContentProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFacebookPageSelector, setShowFacebookPageSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
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

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Redirect to home page after successful deletion
      router.push('/?deleted=true');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Sidebar accounts={accounts} onCreatePost={() => router.push('/create-post')} />
      
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

                {/* Delete Account Section */}
                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-500">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Danger Zone</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-red-600 mb-2">Delete Account Permanently</h3>
                      <p className="text-gray-600 mb-4">
                        Once you delete your account, there is no going back. Please be certain. All your data including posts, analytics, and connected accounts will be permanently deleted.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account Permanently
                        </button>
                        <a
                          href="/data-deletion"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          View Deletion Instructions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Account Permanently?</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                This action <strong>cannot be undone</strong>. This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                <li>Your account and profile</li>
                <li>All connected social media accounts</li>
                <li>All scheduled posts</li>
                <li>Content library and uploaded media</li>
                <li>Analytics data and insights</li>
                <li>Message history and conversations</li>
                <li>All settings and preferences</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Your data will be permanently deleted and cannot be recovered.
                </p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <strong className="text-red-600">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type DELETE"
                  disabled={isDeleting}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}