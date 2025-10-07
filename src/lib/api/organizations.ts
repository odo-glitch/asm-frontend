import type { SupabaseClient } from '@supabase/supabase-js';

interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  created_at: string;
}

interface OrganizationMemberRecord {
  organization: OrganizationRecord;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  created_at: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
}

export interface OrganizationDetails extends Organization {
  member_count: number;
  social_account_count: number;
  current_user_role: string;
  members?: Array<{
    user_id: string;
    email: string;
    role: string;
    joined_at: string;
  }>;
}

export interface OrganizationsResponse {
  organizations: Organization[];
  is_super_admin: boolean;
  total_count: number;
}

export class OrganizationsAPI {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    return session.access_token;
  }

  /**
   * Get all organizations the current user is a member of
   */
  async getUserOrganizations(): Promise<OrganizationsResponse> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', {
          message: authError.message,
          status: authError.status,
          name: authError.name,
          stack: authError.stack
        });
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Log user info for debugging
      console.log('Authenticated user:', { 
        id: user.id, 
        email: user.email,
        role: user.role 
      });

      // First check if user is super admin
      const { data: adminData, error: adminError } = await this.supabase
        .from('super_admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (adminError) {
        console.error('Super admin check error:', {
          message: adminError.message,
          code: adminError.code,
          details: adminError.details,
          hint: adminError.hint
        });
      }

      const isSuperAdmin = !adminError && adminData;

      // Get organizations user is a member of
      const { data: orgs, error: orgsError, count } = await this.supabase
        .from('organization_members')
        .select(`
          organization:organizations (
            id,
            name,
            slug,
            description,
            logo_url,
            website,
            created_at
          ),
          role,
          joined_at
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .returns<OrganizationMemberRecord[]>();

      if (orgsError) {
        console.error('Organization fetch error:', {
          message: orgsError.message,
          code: orgsError.code,
          details: orgsError.details,
          hint: orgsError.hint
        });
        throw new Error(`Failed to fetch organizations: ${orgsError.message}`);
      }

      // Log successful fetch
      console.log('Organizations fetched:', {
        count: orgs?.length || 0,
        isSuperAdmin
      });

      // Transform the data to match the expected format
      const organizations: Organization[] = (orgs || []).map(org => ({
        id: org.organization.id,
        name: org.organization.name,
        slug: org.organization.slug,
        description: org.organization.description,
        logo_url: org.organization.logo_url,
        website: org.organization.website,
        created_at: org.organization.created_at,
        role: org.role,
        joined_at: org.joined_at
      }));

      return {
        organizations,
        is_super_admin: !!isSuperAdmin,
        total_count: count || 0
      };
    } catch (error) {
      console.error('Error in getUserOrganizations:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Get details for a specific organization
   */
  async getOrganization(organizationId: string): Promise<{ organization: OrganizationDetails }> {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select(`
          id,
          name,
          slug,
          description,
          logo_url,
          website,
          created_at,
          member_count:organization_members(count),
          social_account_count:social_accounts(count)
        `)
        .eq('id', organizationId)
        .single();

      if (error) {
        console.error('Organization fetch error:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw new Error(`Failed to fetch organization: ${error.message}`);
      }

      if (!data) {
        throw new Error('Organization not found');
      }

      // Get current user's role
      const { data: memberData, error: memberError } = await this.supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .single();

      if (memberError) {
        console.error('Member role fetch error:', {
          code: memberError.code,
          message: memberError.message
        });
      }

      const organizationDetails: OrganizationDetails = {
        ...data,
        current_user_role: memberData?.role || 'viewer',
        member_count: (data.member_count as any)?.[0]?.count || 0,
        social_account_count: (data.social_account_count as any)?.[0]?.count || 0,
        role: memberData?.role || 'viewer',
        joined_at: new Date().toISOString() // Add missing joined_at field
      };

      return { organization: organizationDetails };
    } catch (error) {
      console.error('Error in getOrganization:', {
        error,
        organizationId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Create a new organization
   */
  async createOrganization(data: {
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    website?: string;
  }): Promise<{ organization: Organization }> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError) throw new Error(`Authentication failed: ${authError.message}`);
      if (!user) throw new Error('No authenticated user found');

      // Insert organization
      const { data: org, error: orgError } = await this.supabase
        .from('organizations')
        .insert([data])
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', {
          code: orgError.code,
          message: orgError.message,
          details: orgError.details
        });
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      // Add creator as owner
      const { error: memberError } = await this.supabase
        .from('organization_members')
        .insert([{
          organization_id: org.id,
          user_id: user.id,
          role: 'owner'
        }]);

      if (memberError) {
        console.error('Member creation error:', {
          code: memberError.code,
          message: memberError.message
        });
        // Clean up organization if member creation fails
        await this.supabase
          .from('organizations')
          .delete()
          .eq('id', org.id);
        throw new Error(`Failed to set organization owner: ${memberError.message}`);
      }

      return {
        organization: {
          ...org,
          role: 'owner',
          joined_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error in createOrganization:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update an organization
   */
  async updateOrganization(organizationId: string, updates: Partial<{
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    website: string;
  }>): Promise<{ organization: Organization }> {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .update(updates)
        .eq('id', organizationId)
        .select(`
          *,
          organization_members!inner (
            role,
            joined_at
          )
        `)
        .single();

      if (error) {
        console.error('Organization update error:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw new Error(`Failed to update organization: ${error.message}`);
      }

      return {
        organization: {
          ...data,
          role: data.organization_members[0].role,
          joined_at: data.organization_members[0].joined_at
        }
      };
    } catch (error) {
      console.error('Error in updateOrganization:', {
        error,
        organizationId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete an organization (owner only)
   */
  async deleteOrganization(organizationId: string): Promise<void> {
    try {
      // Check if user is owner
      const { data: memberData, error: memberError } = await this.supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .single();

      if (memberError) {
        throw new Error('Failed to verify organization ownership');
      }

      if (memberData.role !== 'owner') {
        throw new Error('Only organization owners can delete organizations');
      }

      // Delete organization (cascade will handle members)
      const { error } = await this.supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId);

      if (error) {
        console.error('Organization deletion error:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw new Error(`Failed to delete organization: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteOrganization:', {
        error,
        organizationId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

// Example usage:
/*
import { createClient } from '@/lib/supabase/client';
import { OrganizationsAPI } from '@/lib/api/organizations';

const supabase = createClient();
const orgsAPI = new OrganizationsAPI(supabase);

// Get user's organizations
const { organizations, is_super_admin } = await orgsAPI.getUserOrganizations();

// Get specific organization details
const { organization } = await orgsAPI.getOrganization('org-id-here');

// Create new organization
const { organization: newOrg } = await orgsAPI.createOrganization({
  name: 'My Brand',
  slug: 'my-brand',
  description: 'My awesome brand'
});
*/