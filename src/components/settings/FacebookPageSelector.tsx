'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Facebook, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FacebookPage {
  id: string;
  name: string;
  category?: string;
  hasManagePermission: boolean;
  hasAccessToken: boolean;
}

interface FacebookPageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onPageSelected?: () => void;
}

export function FacebookPageSelector({ open, onOpenChange, userId, onPageSelected }: FacebookPageSelectorProps) {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/facebook/pages/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch pages:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to fetch pages');
      }
      
      const data = await response.json();
      setPages(data.pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Facebook pages. Please try again.";
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
      fetchPages();
    }
  }, [open, fetchPages]);

  const handleSelectPage = async (page: FacebookPage) => {
    try {
      setSelecting(page.id);
      
      // Step 1: Call backend to select the page (this gets the access token)
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/facebook/pages/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          pageId: page.id,
          pageName: page.name,
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.details || errorData.error || 'Failed to select page from backend');
      }

      const backendData = await backendResponse.json();
      
      // Step 2: Save to frontend Supabase database
      const saveResponse = await fetch('/api/facebook/save-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: page.id,
          pageName: page.name,
          accessToken: backendData.accessToken || 'temp_token', // Use token from backend
          organizationId: null, // or get from context if needed
        }),
      });

      if (!saveResponse.ok) {
        const saveError = await saveResponse.json();
        console.error('Failed to save to database:', saveError);
        // Don't throw - backend succeeded, just log the error
      }

      toast({
        title: "Success",
        description: `${page.name} has been connected successfully!`,
      });

      onOpenChange(false);
      if (onPageSelected) {
        onPageSelected();
      }
    } catch (error) {
      console.error('Error selecting page:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to select page. Please try again.";
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
            <Facebook className="w-5 h-5 text-blue-600" />
            Select Facebook Page
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12">
              <Facebook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No Facebook pages found.</p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure your Facebook account has admin access to at least one page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Select a Facebook page to use for posting. You need MANAGE or CREATE_CONTENT permissions.
              </p>
              
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`border rounded-lg p-4 transition-all ${
                    page.hasManagePermission 
                      ? 'hover:border-blue-500 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => page.hasManagePermission && handleSelectPage(page)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{page.name}</h3>
                      </div>
                      
                      {page.category && (
                        <p className="text-sm text-gray-600 mt-1">{page.category}</p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-2">
                        {page.hasManagePermission ? (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Can manage</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600 text-xs">
                            <AlertCircle className="w-4 h-4" />
                            <span>Insufficient permissions</span>
                          </div>
                        )}
                        
                        {page.hasAccessToken && (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Access token available</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {page.hasManagePermission && (
                      <Button
                        size="sm"
                        disabled={selecting === page.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPage(page);
                        }}
                      >
                        {selecting === page.id ? 'Selecting...' : 'Select'}
                      </Button>
                    )}
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
