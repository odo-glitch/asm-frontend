'use client';

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppLayout, useMobileMenu } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts';
import { ContentItem, fetchContentItems } from '@/lib/content-library';
import { createScheduledPost } from '@/lib/scheduled-posts';
import { Checkbox } from '@/components/ui/checkbox';
import { AIButton } from '@/components/ui/ai-button';
import { X, ImageIcon, Video, RefreshCw, ChevronUp, ChevronDown, Calendar, Clock } from 'lucide-react';

interface PlatformSelection {
  accountId: string;
  platform: string;
  accountName: string;
  selected: boolean;
}

function CreatePostContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu()
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isScheduled, setIsScheduled] = useState(true);
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const [generatedContent, setGeneratedContent] = useState('');
  
  // Get selected organization ID from localStorage (same as library page)
  const [selectedOrgId] = useState<string | null>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('selectedOrgId') : null
  );
  
  // AI mode fields
  const [postTitle, setPostTitle] = useState('');
  const [primaryMessage, setPrimaryMessage] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [offerDetails, setOfferDetails] = useState('');
  const [goalObjective, setGoalObjective] = useState('');
  const [lengthPreference, setLengthPreference] = useState<'short' | 'medium' | 'long'>('medium');
  
  const [content, setContent] = useState('');
  const [platformSelections, setPlatformSelections] = useState<PlatformSelection[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<ContentItem | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [isRefreshingContent, setIsRefreshingContent] = useState(false);

  // Function to refresh content items
  const refreshContentItems = async () => {
    setIsRefreshingContent(true);
    try {
      const fetchedContent = await fetchContentItems(selectedOrgId);
      setContentItems(fetchedContent);
    } catch (error) {
      console.error('Failed to refresh content library:', error);
    } finally {
      setIsRefreshingContent(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedAccounts, fetchedContent] = await Promise.all([
          fetchUserSocialAccounts(),
          fetchContentItems(selectedOrgId)
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
        
        // Pre-select date from URL if provided
        const dateParam = searchParams.get('date');
        if (dateParam) {
          setScheduledDate(dateParam);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load accounts and content library');
      }
    }

    loadData();
  }, [searchParams, selectedOrgId]);

  // Auto-refresh content when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      refreshContentItems();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlatformSelection = (accountId: string) => {
    setPlatformSelections(prev =>
      prev.map(p =>
        p.accountId === accountId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const handleGenerateWithAI = async () => {
    if (!primaryMessage.trim()) {
      setError('Please enter some content to enhance with AI');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const selectedPlatforms = platformSelections.filter(p => p.selected);
      const platform = selectedPlatforms[0]?.platform || 'social media';

      const lengthGuide = {
        short: '1-2 sentences',
        medium: '3-4 sentences',
        long: '5-6 sentences or more'
      }[lengthPreference];

      const prompt = `Enhance this social media post for ${platform}: "${primaryMessage}"
${callToAction ? `Include this CTA: "${callToAction}".` : ''}
${hashtags ? `Use these hashtags: ${hashtags}.` : ''}
${offerDetails ? `Highlight this offer: ${offerDetails}.` : ''}
${goalObjective ? `Goal: ${goalObjective}.` : ''}
Length: ${lengthGuide}.

Make it engaging, professional, and optimized for ${platform}. Keep the core message but enhance it.`;

      console.log('Sending prompt to API:', prompt);
      
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      console.log('Generated content:', data.content);
      setGeneratedContent(data.content);
      
      // Show success message
      setError(null);
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

      // Use generatedContent if available, otherwise primaryMessage for AI mode, content for manual mode
      const postContent = isAIMode ? (generatedContent || primaryMessage) : content;

      if (!postContent.trim()) {
        setError(isAIMode ? 'Please enter a primary message' : 'Please enter post content');
        setIsSubmitting(false);
        return;
      }

      if (isScheduled && (!scheduledDate || !scheduledTime)) {
        setError('Please select date and time');
        setIsSubmitting(false);
        return;
      }

      const scheduledDateTime = isScheduled ? `${scheduledDate}T${scheduledTime}` : new Date().toISOString();

      // Create a post for each selected platform
      await Promise.all(
        selectedAccounts.map(account =>
          createScheduledPost({
            social_account_id: account.accountId,
            content: postContent,
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
    <>
      <Sidebar 
        accounts={accounts} 
        onCreatePost={() => {}}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="lg:ml-64 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 min-h-screen">
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
            {/* Mode Toggle */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsAIMode(false)}
                  className={`flex-1 px-6 py-3 text-base font-medium rounded-md transition-colors ${
                    !isAIMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Manual Post
                </button>
                <button
                  onClick={() => setIsAIMode(true)}
                  className={`flex-1 px-6 py-3 text-base font-medium rounded-md transition-colors ${
                    isAIMode
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Generate with AI
                </button>
              </div>
            </div>

            {/* Media Selection - At Top */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Media</h3>
              
              {selectedMedia ? (
                <div className="relative">
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
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
                    <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                      <video
                        src={selectedMedia.url}
                        controls
                        className="w-full h-full"
                      />
                    </div>
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
                <div className="mt-4 border rounded-lg">
                  <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">Content Library</span>
                    <button
                      onClick={refreshContentItems}
                      disabled={isRefreshingContent}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Refresh content library"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshingContent ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto p-4">
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
                          <div className="relative w-full h-full bg-gray-900">
                            {item.thumbnail_url ? (
                              <img
                                src={item.thumbnail_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <Video className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        ) : null}
                      </button>
                    ))
                  )}
                  </div>
                </div>
              )}
            </div>

            {/* AI Mode - Combined Card */}
            {isAIMode ? (
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsPromptExpanded(!isPromptExpanded)}>
                <h3 className="text-lg font-medium text-gray-900">Create Your Post</h3>
                <button className="text-gray-500 hover:text-gray-700">
                  {isPromptExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {isPromptExpanded && (
              <div>
              {/* Post Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., Summer Sale Announcement"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
              </div>

              {/* Primary Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 border"
                  placeholder="What do you want to post? This will be your social media content."
                  value={primaryMessage}
                  onChange={(e) => setPrimaryMessage(e.target.value)}
                />
                <p className="mt-2 text-sm text-gray-500">
                  {primaryMessage.length} characters
                </p>
              </div>

              {/* AI Enhancement Section */}
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 rounded-lg border border-purple-100">
                <p className="text-sm text-gray-700 mb-3">
                  Fill in the optional fields below to help AI enhance your content
                </p>
              </div>

              {/* Call to Action */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call to Action <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., Shop Now, Learn More, Sign Up"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                />
              </div>

              {/* Hashtags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., #Summer #Sale #Fashion"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
              </div>

              {/* Offer Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Details <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., 20% off all items"
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                />
              </div>

              {/* Goal/Objective */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal / Objective <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., Drive traffic, Increase engagement"
                  value={goalObjective}
                  onChange={(e) => setGoalObjective(e.target.value)}
                />
              </div>

              {/* Length Preference */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length Preference <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['short', 'medium', 'long'] as const).map((length) => (
                    <button
                      key={length}
                      type="button"
                      onClick={() => setLengthPreference(length)}
                      className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                        lengthPreference === length
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {length.charAt(0).toUpperCase() + length.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-6">
                <AIButton
                  onClick={handleGenerateWithAI}
                  isLoading={isGenerating}
                  disabled={!primaryMessage.trim()}
                  className="w-full"
                  size="lg"
                >
                  Enhance with AI
                </AIButton>
              </div>
              </div>
              )}
            </div>
            ) : null}

            {/* AI Generated Content Card */}
            {isAIMode && generatedContent && (
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Generated Content</h3>
              
              <div className="mb-4">
                <textarea
                  rows={8}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 border"
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                />
                <p className="mt-2 text-sm text-gray-500">
                  {generatedContent.length} characters
                </p>
              </div>

              <button
                onClick={() => {
                  setPrimaryMessage(generatedContent);
                  setGeneratedContent('');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Use This Content
              </button>
            </div>
            )}

            {/* Manual Mode Content Card */}
            {!isAIMode && (
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Content <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={12}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-4 border"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                {content.length} characters
              </p>
            </div>
            )}

          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Platform Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
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

            {/* Post Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Post Preview</h3>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                {/* Preview Image/Video */}
                {selectedMedia && (
                  <div className="mb-3">
                    {selectedMedia.type === 'image' ? (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.name}
                        className="w-full rounded-lg object-cover max-h-64"
                      />
                    ) : selectedMedia.type === 'video' ? (
                      <div className="relative w-full bg-black rounded-lg overflow-hidden">
                        <video
                          src={selectedMedia.url}
                          className="w-full max-h-64"
                          controls={false}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <Video className="h-12 w-12 text-white" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Preview Text */}
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {(isAIMode ? (generatedContent || primaryMessage) : content) || (
                    <span className="text-gray-400 italic">
                      Your post content will appear here...
                    </span>
                  )}
                </div>

                {/* Platform badges */}
                {selectedCount > 0 && (
                  <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                    {platformSelections
                      .filter(p => p.selected)
                      .map(p => (
                        <span
                          key={p.accountId}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                        >
                          {p.platform}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  When to Post
                </h3>
              </div>
              
              {/* Post Now / Schedule Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsScheduled(false)}
                  className={`flex-1 px-4 py-3 text-base font-medium rounded-md transition-colors ${
                    !isScheduled
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Schedule Now
                </button>
                <button
                  onClick={() => setIsScheduled(true)}
                  className={`flex-1 px-4 py-3 text-base font-medium rounded-md transition-colors ${
                    isScheduled
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Schedule Later
                </button>
              </div>
              
              {isScheduled && (
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
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSchedulePost}
              disabled={isSubmitting || selectedCount === 0 || (!content && !generatedContent && !primaryMessage) || (isScheduled && (!scheduledDate || !scheduledTime))}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  {isScheduled ? 'Schedule Post' : 'Post Now'}
                </>
              )}
            </button>

          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default function CreatePostPage() {
  return (
    <AppLayout>
      <CreatePostContent />
    </AppLayout>
  );
}
