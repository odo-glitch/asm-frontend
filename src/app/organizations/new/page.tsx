'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Building, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { OrganizationsAPI } from '@/lib/api/organizations';
import { setSelectedOrganizationId } from '@/lib/organization-context';
import { isAPIError } from '@/lib/api/errors';

export default function NewOrganizationPage() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const orgsAPI = new OrganizationsAPI(supabase);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
    setSlugError('');
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value;
    setFormData({ ...formData, slug });
    
    // Validate slug format
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
    } else {
      setSlugError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Error',
        description: 'Name and slug are required',
        variant: 'destructive',
      });
      return;
    }

    if (slugError) {
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { organization } = await orgsAPI.createOrganization({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        website: formData.website || undefined,
      });

      toast({
        title: 'Success',
        description: `Organization "${organization.name}" created successfully`,
      });

      // Store as selected org and trigger event
      setSelectedOrganizationId(organization.id);
      
      // Use replace instead of push to prevent back navigation
      router.replace('/dashboard');
    } catch (error: unknown) {
      const errorMessage = isAPIError(error) 
        ? error.error
        : error instanceof Error
          ? error.message
          : 'Failed to create organization';
          
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Create New Brand</CardTitle>
            <CardDescription>
              Set up a new brand organization to manage your social media presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  placeholder="My Awesome Brand"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                />
                <p className="text-sm text-gray-500">
                  This is how your brand will appear throughout the app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">app.com/</span>
                  <Input
                    id="slug"
                    placeholder="my-awesome-brand"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    className={slugError ? 'border-red-500' : ''}
                    required
                  />
                </div>
                {slugError && (
                  <p className="text-sm text-red-500">{slugError}</p>
                )}
                <p className="text-sm text-gray-500">
                  Used in URLs and must be unique
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your brand..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name || !formData.slug || !!slugError}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Brand'}
                </Button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You&apos;ll be the owner of this brand organization</li>
                <li>• You can invite team members to collaborate</li>
                <li>• Connect your social media accounts to this brand</li>
                <li>• Start creating and scheduling content</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}