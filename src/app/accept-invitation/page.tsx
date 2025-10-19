'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { InvitationsAPI } from '@/lib/api/invitations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Invitation } from '@/lib/api/invitations';

function AcceptInvitationContent() {
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const invitationsAPI = useMemo(() => new InvitationsAPI(supabase), [supabase]);

  const token = searchParams.get('token');

  useEffect(() => {
    const checkAuthAndLoadInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);

        // Load invitation details
        const invitationData = await invitationsAPI.getInvitation(token);
        setInvitation(invitationData);

        // Check if user email matches invitation email
        if (user && user.email?.toLowerCase() !== invitationData.email.toLowerCase()) {
          setError(`This invitation is for ${invitationData.email}. Please sign out and sign in with the correct email.`);
        }
      } catch (err) {
        console.error('Error loading invitation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadInvitation();
  }, [token, supabase, invitationsAPI]);

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    try {
      await invitationsAPI.acceptInvitation(token);
      
      toast({
        title: 'Success!',
        description: 'You have successfully joined the organization',
      });

      // Redirect to the organization dashboard or accounts page
      setTimeout(() => router.push('/accounts'), 1500);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to accept invitation',
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleSignIn = () => {
    // Redirect to sign in and come back after
    router.push(`/auth/login?redirect=/accept-invitation?token=${token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
            <CardDescription className="text-base mt-2">
              {error || 'This invitation link is not valid'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button 
              onClick={() => router.push('/accounts')} 
              className="w-full"
              variant="outline"
            >
              Go to Accounts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
          <CardDescription className="text-base mt-2">
            Join {invitation.organization?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Organization:</span>
              <span className="text-sm font-semibold">{invitation.organization?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Email:</span>
              <span className="text-sm">{invitation.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Role:</span>
              <span className="text-sm capitalize font-medium text-blue-600">{invitation.role}</span>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You need to sign in with <strong>{invitation.email}</strong> to accept this invitation.
                </p>
              </div>
              <Button onClick={handleSignIn} className="w-full" size="lg">
                Sign In to Accept
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                onClick={handleAccept} 
                disabled={accepting || !!error}
                className="w-full" 
                size="lg"
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                By accepting, you&apos;ll be added to {invitation.organization?.name} as a {invitation.role}
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button 
              onClick={() => router.push('/')} 
              variant="ghost" 
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
