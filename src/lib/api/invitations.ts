import type { SupabaseClient } from '@supabase/supabase-js';

export interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  expires_at: string;
  accepted_at?: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  };
}

export interface CreateInvitationRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  organizationId: string;
}

export interface InvitationResponse {
  invitation: Invitation;
  message?: string;
  warning?: string;
}

export class InvitationsAPI {
  private supabase: SupabaseClient;
  private backendUrl: string;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  }

  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    return session.access_token;
  }

  /**
   * Create and send an invitation
   */
  async createInvitation(request: CreateInvitationRequest): Promise<InvitationResponse> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.backendUrl}/api/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create invitation error:', error);
      throw error instanceof Error ? error : new Error('Failed to create invitation');
    }
  }

  /**
   * Get invitation details by token
   */
  async getInvitation(token: string): Promise<Invitation> {
    try {
      const response = await fetch(`${this.backendUrl}/api/invitations/${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invitation');
      }

      const data = await response.json();
      return data.invitation;
    } catch (error) {
      console.error('Get invitation error:', error);
      throw error instanceof Error ? error : new Error('Failed to get invitation');
    }
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string): Promise<{ message: string; organization_id: string }> {
    try {
      const authToken = await this.getAuthToken();

      const response = await fetch(`${this.backendUrl}/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept invitation');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Accept invitation error:', error);
      throw error instanceof Error ? error : new Error('Failed to accept invitation');
    }
  }
}
