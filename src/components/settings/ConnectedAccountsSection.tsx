'use client';

import { useState } from 'react';
import { Twitter, Facebook, Linkedin, Instagram, Plus, Trash2, RefreshCw } from 'lucide-react';
import { SocialAccount } from '@/lib/social-accounts';
import { createClient } from '@/lib/supabase/client';
import { ConnectAccountModal } from './ConnectAccountModal';

interface ConnectedAccountsSectionProps {
  accounts: SocialAccount[];
  userId: string;
  onAccountsChange: () => void;
}

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
} as const;

const platformColors = {
  twitter: 'text-blue-400',
  facebook: 'text-blue-600',
  linkedin: 'text-blue-700',
  instagram: 'text-purple-600',
} as const;

export function ConnectedAccountsSection({ accounts, userId, onAccountsChange }: ConnectedAccountsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const getPlatformIcon = (platform: string) => {
    const Icon = platformIcons[platform as keyof typeof platformIcons] || Twitter;
    const color = platformColors[platform as keyof typeof platformColors] || 'text-gray-500';
    return <Icon className={`h-5 w-5 ${color}`} />;
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;
    
    setDeletingId(accountId);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      
      onAccountsChange();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert('Failed to disconnect account');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefreshToken = async (account: SocialAccount) => {
    // This would trigger OAuth re-authentication
    alert(`Token refresh for ${account.platform} will be implemented with OAuth flow`);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Connected Accounts</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Account
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Manage your connected social media accounts
          </p>
        </div>
        
        <div className="p-6">
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No accounts connected yet</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Connect your first account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <p className="font-medium text-gray-900">{account.account_name}</p>
                      <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRefreshToken(account)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Refresh token"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDisconnect(account.id)}
                      disabled={deletingId === account.id}
                      className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50"
                      title="Disconnect account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConnectAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingAccounts={accounts}
        userId={userId}
        onSuccess={onAccountsChange}
      />
    </>
  );
}