'use client';

import { useState } from 'react';
import { X, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';
import { SocialAccount } from '@/lib/social-accounts';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts: SocialAccount[];
  userId: string;
  onSuccess?: () => void;
}

interface PlatformConfig {
  name: string;
  icon: React.ElementType;
  bgColor: string;
  hoverColor: string;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    bgColor: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800'
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    bgColor: 'bg-sky-500',
    hoverColor: 'hover:bg-sky-600'
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    bgColor: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700'
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    hoverColor: 'hover:from-purple-600 hover:to-pink-600'
  },
  'demo-facebook-1': {
    name: 'Demo Facebook Page 1',
    icon: Facebook,
    bgColor: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700'
  },
  'demo-facebook-2': {
    name: 'Demo Facebook Page 2',
    icon: Facebook,
    bgColor: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700'
  }
};

export function ConnectAccountModal({ isOpen, onClose, existingAccounts, userId, onSuccess }: ConnectAccountModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const connectedPlatforms = existingAccounts.map(acc => acc.platform);

  const handleConnect = async (platformKey: string) => {
    setLoading(platformKey);
    setError(null);
    
    try {
      // Handle demo accounts
      if (platformKey.startsWith('demo-')) {
        await handleDemoAccount(platformKey);
        return;
      }
      
      // Redirect to backend OAuth endpoint for real accounts
      const params = new URLSearchParams({
        userId,
        redirect: `${window.location.origin}/settings`
      });
      
      // Use backend OAuth flow for social media posting
      window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/auth/${platformKey}?${params}`;
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      setError('An unexpected error occurred');
      setLoading(null);
    }
  };

  const handleDemoAccount = async (demoKey: string) => {
    const { createClient } = await import('@/lib/supabase/client');
    const { getSelectedOrganizationId } = await import('@/lib/organization-context');
    const supabase = createClient();
    
    try {
      const organizationId = getSelectedOrganizationId();
      
      console.log('Creating demo account with organization:', organizationId);
      
      // Create demo account name based on key
      const accountName = demoKey === 'demo-facebook-1' 
        ? 'Demo Page 1 (Testing)' 
        : 'Demo Page 2 (Testing)';
      
      // Insert demo account
      const { data, error } = await supabase
        .from('social_accounts')
        .insert({
          user_id: userId,
          organization_id: organizationId,
          platform: 'facebook',
          account_name: accountName,
          account_id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          access_token: 'demo-token-' + Math.random().toString(36).substr(2, 20),
          refresh_token: null
        })
        .select();

      if (error) {
        console.error('Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || 'Failed to insert demo account');
      }

      console.log('Demo account created successfully:', data);

      // Close modal and refresh
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to create demo account:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create demo account. Please check console for details.';
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Connect Social Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-6">
            Choose a social media platform to connect. You&apos;ll be redirected to authenticate with the platform.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Real Platforms */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Real Accounts</h3>
            {(Object.entries(PLATFORMS) as [string, PlatformConfig][])
              .filter(([key]) => !key.startsWith('demo-'))
              .map(([key, platform]) => {
                const Icon = platform.icon;
                const isConnected = connectedPlatforms.includes(key);
                const isLoading = loading === key;
                const canReconnect = key === 'facebook';
                const isDisabled = (isConnected && !canReconnect) || isLoading;

                return (
                  <button
                    key={key}
                    onClick={() => handleConnect(key)}
                    disabled={isDisabled}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 
                      text-white font-medium rounded-lg
                      ${platform.bgColor} ${platform.hoverColor}
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left">
                      {isLoading ? (
                        'Connecting...'
                      ) : isConnected ? (
                        canReconnect ? `Reconnect ${platform.name}` : `${platform.name} Already Connected`
                      ) : (
                        `Connect ${platform.name}`
                      )}
                    </span>
                    {isConnected && !canReconnect && <span className="text-lg">✓</span>}
                  </button>
                );
              })}
          </div>

          {/* Demo Accounts */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Demo/Testing Accounts</h3>
            <p className="text-xs text-gray-500">
              Create fake accounts to test features without connecting real social media pages
            </p>
            {(Object.entries(PLATFORMS) as [string, PlatformConfig][])
              .filter(([key]) => key.startsWith('demo-'))
              .map(([key, platform]) => {
                const Icon = platform.icon;
                const isLoading = loading === key;

                return (
                  <button
                    key={key}
                    onClick={() => handleConnect(key)}
                    disabled={isLoading}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 
                      text-white font-medium rounded-lg
                      ${platform.bgColor} ${platform.hoverColor}
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left">
                      {isLoading ? 'Creating...' : `Add ${platform.name}`}
                    </span>
                  </button>
                );
              })}
          </div>


        </div>
      </div>
    </div>
  );
}