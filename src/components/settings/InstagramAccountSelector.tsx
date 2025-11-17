'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Instagram, CheckCircle2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InstagramAccount {
  id: string;
  username: string;
  name: string;
  profile_picture_url?: string;
  followers_count?: number;
  page_id: string;
  page_name: string;
  page_access_token: string;
}

interface InstagramAccountSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onAccountSelected?: () => void;
}

export function InstagramAccountSelector({ open, onOpenChange, userId, onAccountSelected }: InstagramAccountSelectorProps) {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instagram/accounts/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch Instagram accounts:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to fetch Instagram accounts');
      }
      
      const data = await response.json();
      setAccounts(data.accounts || []);
      
      if (data.message) {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error fetching Instagram accounts:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Instagram accounts. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (open) {
      fetchAccounts();
    }
  }, [open, fetchAccounts]);

  const handleSelectAccount = async (account: InstagramAccount) => {
    try {
      setSelecting(account.id);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instagram/accounts/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          instagramId: account.id,
          username: account.username,
          pageAccessToken: account.page_access_token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to select Instagram account');
      }

      toast({
        title: "Success",
        description: `@${account.username} has been connected successfully!`,
      });

      onOpenChange(false);
      if (onAccountSelected) {
        onAccountSelected();
      }
    } catch (error) {
      console.error('Error selecting Instagram account:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to select account. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSelecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-pink-600" />
            Select Instagram Business Account
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12">
              <Instagram className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No Instagram Business accounts found.</p>
              {message && (
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                  {message}
                </p>
              )}
              <div className="mt-6 text-left max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How to connect Instagram:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Create a Facebook Page (if you don&apos;t have one)</li>
                  <li>Convert your Instagram account to a Business account</li>
                  <li>Link your Instagram Business account to your Facebook Page</li>
                  <li>Come back here and reconnect Facebook</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Select an Instagram Business account to manage messages and engage with your audience.
              </p>
              
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="border rounded-lg p-4 hover:border-pink-500 cursor-pointer transition-all"
                  onClick={() => handleSelectAccount(account)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {account.profile_picture_url ? (
                        <img 
                          src={account.profile_picture_url} 
                          alt={account.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">@{account.username}</h3>
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </div>
                        
                        {account.name && (
                          <p className="text-sm text-gray-600">{account.name}</p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2">
                          {account.followers_count !== undefined && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3 h-3" />
                              <span>{account.followers_count.toLocaleString()} followers</span>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            via {account.page_name}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      disabled={selecting === account.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAccount(account);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {selecting === account.id ? 'Selecting...' : 'Select'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
