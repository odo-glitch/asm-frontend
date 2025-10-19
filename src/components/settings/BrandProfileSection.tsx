'use client';

import { useState, useEffect } from 'react';
import { Building2, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getSelectedOrganizationId } from '@/lib/organization-context';
import { useToast } from '@/hooks/use-toast';

interface BrandProfileSectionProps {
  userId: string;
}

interface BrandProfile {
  brand_name?: string;
  industry?: string;
  tone_of_voice?: string;
  target_audience?: string;
  key_values?: string;
  unique_selling_points?: string;
  brand_personality?: string;
  content_guidelines?: string;
}

export function BrandProfileSection({ userId }: BrandProfileSectionProps) {
  const [profile, setProfile] = useState<BrandProfile>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBrandProfile();
    
    // Listen for organization changes
    const handleOrgChange = () => {
      loadBrandProfile();
    };
    
    window.addEventListener('organizationChanged', handleOrgChange);
    return () => window.removeEventListener('organizationChanged', handleOrgChange);
  }, [userId]);

  const loadBrandProfile = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const organizationId = getSelectedOrganizationId();
    
    try {
      let query = supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', userId);
      
      // Filter by organization
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      } else {
        query = query.is('organization_id', null);
      }
      
      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading brand profile:', error);
        // Clear profile on error
        setProfile({});
      } else if (data) {
        setProfile(data);
      } else {
        // No brand profile found for this organization - clear the form
        setProfile({});
      }
    } catch (error) {
      console.error('Error loading brand profile:', error);
      // Clear profile on error
      setProfile({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    const organizationId = getSelectedOrganizationId();
    
    try {
      const { data, error } = await supabase
        .from('brand_profiles')
        .upsert({
          user_id: userId,
          organization_id: organizationId,
          ...profile,
          updated_at: new Date().toISOString()
        }, {
          onConflict: organizationId ? 'user_id,organization_id' : 'user_id'
        })
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Brand profile saved:', data);
      toast({
        title: 'Success',
        description: 'Brand profile saved successfully',
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error saving brand profile:', error);
      const errorMessage = err?.message || 'Failed to save brand profile';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof BrandProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-medium text-gray-900">Brand Profile</h2>
            <p className="mt-1 text-sm text-gray-500">
              Define your brand identity to help AI generate content that matches your voice and style
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Name *
          </label>
          <input
            type="text"
            value={profile.brand_name || ''}
            onChange={(e) => handleChange('brand_name', e.target.value)}
            placeholder="e.g., Odo Market"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry/Niche *
          </label>
          <input
            type="text"
            value={profile.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
            placeholder="e.g., Social Media Management, E-commerce, Healthcare"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tone of Voice */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tone of Voice *
          </label>
          <input
            type="text"
            value={profile.tone_of_voice || ''}
            onChange={(e) => handleChange('tone_of_voice', e.target.value)}
            placeholder="e.g., Professional yet friendly, Casual and fun, Authoritative"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Describe how your brand communicates
          </p>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience *
          </label>
          <textarea
            value={profile.target_audience || ''}
            onChange={(e) => handleChange('target_audience', e.target.value)}
            placeholder="e.g., Small business owners aged 25-45 who want to grow their social media presence..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Key Values */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Core Values
          </label>
          <textarea
            value={profile.key_values || ''}
            onChange={(e) => handleChange('key_values', e.target.value)}
            placeholder="e.g., Innovation, Customer success, Transparency, Quality"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Unique Selling Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unique Selling Points (USPs)
          </label>
          <textarea
            value={profile.unique_selling_points || ''}
            onChange={(e) => handleChange('unique_selling_points', e.target.value)}
            placeholder="e.g., AI-powered scheduling, All-in-one platform, 24/7 support, Affordable pricing"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Brand Personality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Personality
          </label>
          <input
            type="text"
            value={profile.brand_personality || ''}
            onChange={(e) => handleChange('brand_personality', e.target.value)}
            placeholder="e.g., Innovative, Reliable, Approachable, Modern"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Content Guidelines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Guidelines & Preferences
          </label>
          <textarea
            value={profile.content_guidelines || ''}
            onChange={(e) => handleChange('content_guidelines', e.target.value)}
            placeholder="e.g., Always use emojis, Avoid jargon, Include call-to-actions, Focus on benefits..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Specific instructions for AI when generating content
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Brand Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
