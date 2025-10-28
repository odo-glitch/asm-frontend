'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Linkedin, CheckCircle2, Building2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LinkedInOrganization {
  id: string;
  name: string;
  vanityName?: string;
  canPost: boolean;
}

interface LinkedInOrganizationSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSelected?: () => void;
}

export function LinkedInOrganizationSelector({ open, onOpenChange, userId, onSelected }: LinkedInOrganizationSelectorProps) {
  const [organizations, setOrganizations] = useState<LinkedInOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/linkedin/organizations/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch organizations:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to fetch organizations');
      }
      
      const data = await response.json();
      setOrganizations(data.organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch LinkedIn organizations. Please try again.";
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
      fetchOrganizations();
    }
  }, [open, fetchOrganizations]);

  const handleSelectPersonal = async () => {
    try {
      setSelecting('personal');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/linkedin/organizations/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isPersonal: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to select personal account');
      }

      toast({
        title: "Success",
        description: "Personal LinkedIn account selected for posting.",
      });

      onOpenChange(false);
      if (onSelected) {
        onSelected();
      }
    } catch (error) {
      console.error('Error selecting personal account:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to select personal account. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSelecting(null);
    }
  };

  const handleSelectOrganization = async (org: LinkedInOrganization) => {
    try {
      setSelecting(org.id);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/linkedin/organizations/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          organizationId: org.id,
          organizationName: org.name,
          isPersonal: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to select organization');
      }

      toast({
        title: "Success",
        description: `${org.name} has been selected for posting.`,
      });

      onOpenChange(false);
      if (onSelected) {
        onSelected();
      }
    } catch (error) {
      console.error('Error selecting organization:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to select organization. Please try again.";
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
            <Linkedin className="w-5 h-5 text-blue-700" />
            Select LinkedIn Account
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Choose where you want to post on LinkedIn - your personal profile or a company page you manage.
              </p>
              
              {/* Personal Account Option */}
              <div
                className="border rounded-lg p-4 hover:border-blue-700 cursor-pointer transition-all"
                onClick={handleSelectPersonal}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-700" />
                      <h3 className="font-semibold text-gray-900">Personal Profile</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Post to your personal LinkedIn timeline</p>
                    
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Available</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    disabled={selecting === 'personal'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPersonal();
                    }}
                  >
                    {selecting === 'personal' ? 'Selecting...' : 'Select'}
                  </Button>
                </div>
              </div>

              {/* Organization Pages */}
              {organizations.length > 0 && (
                <>
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Company Pages</h3>
                  </div>
                  
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className={`border rounded-lg p-4 transition-all ${
                        org.canPost 
                          ? 'hover:border-blue-700 cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => org.canPost && handleSelectOrganization(org)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-700" />
                            <h3 className="font-semibold text-gray-900">{org.name}</h3>
                          </div>
                          
                          {org.vanityName && (
                            <p className="text-sm text-gray-600 mt-1">linkedin.com/company/{org.vanityName}</p>
                          )}
                          
                          <div className="flex items-center gap-1 text-green-600 text-xs mt-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Can post</span>
                          </div>
                        </div>
                        
                        {org.canPost && (
                          <Button
                            size="sm"
                            disabled={selecting === org.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrganization(org);
                            }}
                          >
                            {selecting === org.id ? 'Selecting...' : 'Select'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {organizations.length === 0 && !loading && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p>No company pages found.</p>
                  <p className="mt-1">You can still post to your personal profile.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
