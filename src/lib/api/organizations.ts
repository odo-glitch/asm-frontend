import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  private supabase: any;

  constructor(supabaseClient: any) {
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
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/organizations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch organizations');
    }

    return response.json();
  }

  /**
   * Get details for a specific organization
   */
  async getOrganization(organizationId: string): Promise<{ organization: OrganizationDetails }> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/organizations/${organizationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch organization');
    }

    return response.json();
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
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/organizations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create organization');
    }

    return response.json();
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
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/organizations/${organizationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update organization');
    }

    return response.json();
  }

  /**
   * Delete an organization (owner only)
   */
  async deleteOrganization(organizationId: string): Promise<void> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/organizations/${organizationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete organization');
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