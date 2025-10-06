'use client';

import { useState } from 'react';
import { X, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';
import { SocialAccount } from '@/lib/social-accounts';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts: SocialAccount[];
  userId: string;
  onSuccess: () => void;
}

interface PlatformConfig {
  name: string;
  icon: any;
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
      // Redirect to backend OAuth endpoint
      const params = new URLSearchParams({
        platform: platformKey,
        userId,
        redirect: `${window.location.origin}/api/auth/callback`
      });
      
      // Use backend OAuth flow for social media posting
      window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/auth/${platformKey}?${params}`;
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      setError('An unexpected error occurred');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

          {(Object.entries(PLATFORMS) as [string, PlatformConfig][]).map(([key, platform]) => {
            const Icon = platform.icon;
            const isConnected = connectedPlatforms.includes(key);
            const isLoading = loading === key;

            return (
              <button
                key={key}
                onClick={() => handleConnect(key)}
                disabled={isConnected || isLoading}
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
                    `${platform.name} Already Connected`
                  ) : (
                    `Connect ${platform.name}`
                  )}
                </span>
                {isConnected && <span className="text-lg">✓</span>}
              </button>
            );
          })}


        </div>
      </div>
    </div>
  );
}