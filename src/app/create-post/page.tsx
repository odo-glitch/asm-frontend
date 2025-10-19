'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Image as ImageIcon, Video, Calendar, Clock, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts';
import { ContentItem, fetchContentItems } from '@/lib/content-library';
import { createScheduledPost } from '@/lib/scheduled-posts';
import { Checkbox } from '@/components/ui/checkbox';
import { AIButton } from '@/components/ui/ai-button';

interface PlatformSelection {
  accountId: string;
  platform: string;
  accountName: string;
  selected: boolean;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [platformSelections, setPlatformSelections] = useState<PlatformSelection[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<ContentItem | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedAccounts, fetchedContent] = await Promise.all([
          fetchUserSocialAccounts(),
          fetchContentItems()
        ]);
        
        setAccounts(fetchedAccounts);
        setPlatformSelections(
          fetchedAccounts.map(account => ({
            accountId: account.id,
            platform: account.platform,
            accountName: account.account_name,
            selected: false
          }))
        );
        setContentItems(fetchedContent);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load accounts and content library');
      }
    }

    loadData();
  }, []);

  const togglePlatformSelection = (accountId: string) => {
    setPlatformSelections(prev =>
      prev.map(p =>
        p.accountId === accountId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const selectedPlatforms = platformSelections.filter(p => p.selected);
      const primaryPlatform = selectedPlatforms[0]?.platform || 'facebook';

      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: content || 'Create an engaging social media post',
          platform: primaryPlatform,
          tone: 'professional'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      console.error('Failed to generate content:', err);
      setError('Failed to generate content with AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedulePost = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const selectedAccounts = platformSelections.filter(p => p.selected);
      
      if (selectedAccounts.length === 0) {
        setError('Please select at least one platform');
        setIsSubmitting(false);
        return;
      }

      if (!content) {
        setError('Please enter post content');
        setIsSubmitting(false);
        return;
      }

      if (!scheduledDate || !scheduledTime) {
        setError('Please select date and time');
        setIsSubmitting(false);
        return;
      }

      const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;

      // Create a post for each selected platform
      await Promise.all(
        selectedAccounts.map(account =>
          createScheduledPost({
            social_account_id: account.accountId,
            content,
            scheduled_time: scheduledDateTime,
          })
        )
      );

      // Redirect back to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to schedule post:', err);
      setError('Failed to schedule post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectMedia = (item: ContentItem) => {
    setSelectedMedia(item);
    setShowMediaLibrary(false);
  };

  const selectedCount = platformSelections.filter(p => p.selected).length;

  return (
    <AppLayout>
      <Sidebar 
        accounts={accounts}
        onCreatePost={() => router.push('/create-post')}
      />
      
      <div className="ml-64">
        <div className="bg-white border-b sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedulePost}
                  disabled={isSubmitting || selectedCount === 0 || !content || !scheduledDate || !scheduledTime}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Post Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Post Content
                </label>
                <AIButton
                  onClick={handleGenerateWithAI}
                  isLoading={isGenerating}
                  size="sm"
                >
                  Generate with AI
                </AIButton>
              </div>
              <textarea
                rows={12}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-4 border"
                placeholder="What's on your mind? Or click 'Generate with AI' to create content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                {content.length} characters
              </p>
            </div>

            {/* Media Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Media</h3>
              
              {selectedMedia ? (
                <div className="relative">
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {selectedMedia.type === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : selectedMedia.type === 'video' ? (
                    <video
                      src={selectedMedia.url}
                      controls
                      className="w-full h-64 rounded-lg"
                    />
                  ) : null}
                  <p className="mt-2 text-sm text-gray-600">{selectedMedia.name}</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <Video className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Select from Content Library
                    </p>
                    <p className="text-xs text-gray-500">
                      Click to browse your media
                    </p>
                  </div>
                </button>
              )}

              {/* Media Library Grid */}
              {showMediaLibrary && (
                <div className="mt-4 grid grid-cols-3 gap-4 max-h-96 overflow-y-auto p-4 border rounded-lg">
                  {contentItems.length === 0 ? (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      No media in your library yet
                    </div>
                  ) : (
                    contentItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => selectMedia(item)}
                        className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.thumbnail_url || item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : item.type === 'video' ? (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Platform Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Select Platforms ({selectedCount} selected)
              </h3>
              
              {accounts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No connected accounts. Please connect your social media accounts first.
                </p>
              ) : (
                <div className="space-y-3">
                  {platformSelections.map((platform) => (
                    <label
                      key={platform.accountId}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={platform.selected}
                        onCheckedChange={() => togglePlatformSelection(platform.accountId)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {platform.accountName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {platform.platform}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Schedule
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
