'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { OrganizationsAPI } from '@/lib/api/organizations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Crown, Shield, User, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  role: string;
}

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const orgsAPI = useMemo(() => new OrganizationsAPI(supabase), [supabase]);

  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserEmail(user.email || '');
    }
  }, [supabase]);

  const loadOrganizations = useCallback(async () => {
    try {
      const { organizations: orgs } = await orgsAPI.getUserOrganizations();
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrg) {
        setSelectedOrg(orgs[0].id);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [orgsAPI, selectedOrg, toast]);

  const loadTeamMembers = useCallback(async (orgId: string) => {
    try {
      const { organization } = await orgsAPI.getOrganization(orgId);
      if (organization.members) {
        setTeamMembers(organization.members.map((member: { role: string; email: string; user_id: string; joined_at: string }) => ({
          ...member,
          role: member.role as 'owner' | 'admin' | 'member' | 'viewer'
        })));
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    }
  }, [orgsAPI, toast]);

  useEffect(() => {
    loadOrganizations();
    getCurrentUser();
  }, [loadOrganizations, getCurrentUser]);

  useEffect(() => {
    if (selectedOrg) {
      loadTeamMembers(selectedOrg);
    }
  }, [selectedOrg, loadTeamMembers]);

  const removeMember = async (userId: string) => {
    if (!selectedOrg) return;
    
    // Don't allow removing yourself
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id === userId) {
      toast({
        title: 'Error',
        description: "You cannot remove yourself from the organization",
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', selectedOrg);

      if (error) throw error;

      // Refresh team members
      loadTeamMembers(selectedOrg);
      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'member':
        return <User className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'member':
        return 'outline';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const canRemoveMember = (memberRole: string, currentUserRole: string) => {
    // Only owners can remove other owners
    if (memberRole === 'owner') return currentUserRole === 'owner';
    // Owners and admins can remove other members
    return ['owner', 'admin'].includes(currentUserRole);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading accounts...</p>
        </div>
      </div>
    );
  }

  const currentOrg = organizations.find(org => org.id === selectedOrg);
  const currentUserRole = currentOrg?.role || 'member';
  const teamLimit = 5; // You can make this dynamic based on plan

  return (
    <AppLayout>
      <Sidebar />
      
      <div className="ml-64">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Management</h1>
            <p className="text-gray-600">Manage your organizations and team members</p>
          </div>

      {/* Organization Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Organization</CardTitle>
          <CardDescription>Choose which organization to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrg(org.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedOrg === org.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold">{org.name}</h3>
                <p className="text-sm text-gray-500">{org.slug}</p>
                <Badge className="mt-2" variant={getRoleBadgeVariant(org.role)}>
                  <span className="flex items-center gap-1">
                    {getRoleIcon(org.role)}
                    {org.role}
                  </span>
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members Section */}
      {selectedOrg && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Current Team Members</CardTitle>
                <CardDescription>
                  Team Members ({teamMembers.length} of {teamLimit})
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push('/accounts/invite')}
                disabled={teamMembers.length >= teamLimit}
              >
                Invite Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://avatar.vercel.sh/${member.email}`} />
                      <AvatarFallback>
                        {member.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.email}
                        {member.email === currentUserEmail && (
                          <span className="text-sm text-gray-500 ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </Badge>
                    {canRemoveMember(member.role, currentUserRole) && 
                     member.email !== currentUserEmail && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.user_id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {teamMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No team members yet</p>
                  <p className="text-sm mt-1">Invite members to collaborate</p>
                </div>
              )}
            </div>

            {/* Team Limit Warning */}
            {teamMembers.length >= teamLimit && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You&apos;ve reached the team member limit for your current plan.
                  <a href="/pricing" className="ml-1 underline font-medium">
                    Upgrade to add more members
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </AppLayout>
  );
}
