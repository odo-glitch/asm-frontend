'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { InvitationsAPI } from '@/lib/api/invitations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function InvitePageContent() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const invitationsAPI = useMemo(() => new InvitationsAPI(supabase), [supabase]);

  const organizationId = searchParams.get('orgId');

  useEffect(() => {
    if (!organizationId) {
      toast({
        title: 'Error',
        description: 'No organization selected',
        variant: 'destructive',
      });
      router.push('/accounts');
    }
  }, [organizationId, router, toast]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationId) {
      toast({
        title: 'Error',
        description: 'No organization selected',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await invitationsAPI.createInvitation({
        email,
        role,
        organizationId
      });

      toast({
        title: 'Success',
        description: response.warning || `Invitation sent to ${email}`,
        variant: response.warning ? 'default' : 'default',
      });
      
      // Redirect back to accounts page
      setTimeout(() => router.push('/accounts'), 1500);
    } catch (error) {
      console.error('Invitation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/accounts')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Accounts
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
          <CardDescription>
            Send an invitation to a new team member to join your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as 'admin' | 'member' | 'viewer')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Can manage team and settings</SelectItem>
                  <SelectItem value="member">Member - Can create and manage content</SelectItem>
                  <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Choose the level of access for this team member
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>Sending Invitation...</>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The invited member will receive an email with instructions 
              to join your organization. They must create an account or sign in to accept the invitation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 max-w-xl">
        <Card>
          <CardContent className="pt-12 pb-12 flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}