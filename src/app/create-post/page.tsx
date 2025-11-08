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
  
  // AI mode fields - Enhanced
  const [postTitle, setPostTitle] = useState('');
  const [primaryMessage, setPrimaryMessage] = useState('');
  const [postType, setPostType] = useState<'general' | 'question' | 'tip' | 'announcement' | 'story' | 'promotional' | 'educational'>('general');
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'informative' | 'inspirational'>('professional');
  const [targetAudience, setTargetAudience] = useState('');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [hashtagCount, setHashtagCount] = useState(3);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [postGoal, setPostGoal] = useState<'engagement' | 'awareness' | 'conversion' | 'education'>('engagement');
  const [brandVoice, setBrandVoice] = useState('');
  
  // Per-platform customization
  const [customizePerPlatform, setCustomizePerPlatform] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<Record<string, any>>({});
  const [platformGeneratedContent, setPlatformGeneratedContent] = useState<Record<string, string>>({});
  
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
      setError('Please enter some content to generate');
      return;
    }

    const selectedAccounts = platformSelections.filter(p => p.selected);
    if (selectedAccounts.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      if (customizePerPlatform) {
        // Generate separately for each platform
        const platformContents: Record<string, string> = {};
        
        for (const account of selectedAccounts) {
          const settings = platformSettings[account.accountId] || {};
          
          const response = await fetch('/api/generate-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: settings.customMessage || primaryMessage,
              platform: account.platform,
              tone: settings.tone || tone,
              postType: settings.postType || postType,
              targetAudience: settings.targetAudience || targetAudience || 'general audience',
              includeEmojis: settings.includeEmojis ?? includeEmojis,
              includeHashtags: settings.includeHashtags ?? includeHashtags,
              hashtagCount: settings.hashtagCount || hashtagCount,
              callToAction: settings.includeCTA ?? includeCTA,
              postGoal: settings.postGoal || postGoal,
              brandVoice: settings.brandVoice || brandVoice || null
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate content for ${account.accountName}`);
          }

          const data = await response.json();
          platformContents[account.accountId] = data.content;
        }
        
        setPlatformGeneratedContent(platformContents);
      } else {
        // Generate once for all platforms
        const platform = selectedAccounts[0]?.platform || 'twitter';
        
        const response = await fetch('/api/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: primaryMessage,
            platform: platform,
            tone: tone,
            postType: postType,
            targetAudience: targetAudience || 'general audience',
            includeEmojis: includeEmojis,
            includeHashtags: includeHashtags,
            hashtagCount: hashtagCount,
            callToAction: includeCTA,
            postGoal: postGoal,
            brandVoice: brandVoice || null
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate content');
        }

        const data = await response.json();
        setGeneratedContent(data.content);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to generate content:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content with AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePlatformSetting = (accountId: string, key: string, value: any) => {
    setPlatformSettings(prev => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        [key]: value
      }
    }));
  };

  const getPlatformSetting = (accountId: string, key: string, defaultValue: any) => {
    return platformSettings[accountId]?.[key] ?? defaultValue;
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

      if (isScheduled && (!scheduledDate || !scheduledTime)) {
        setError('Please select date and time');
        setIsSubmitting(false);
        return;
      }

      const scheduledDateTime = isScheduled ? `${scheduledDate}T${scheduledTime}` : new Date().toISOString();

      // Create a post for each selected platform with appropriate content
      if (isAIMode && customizePerPlatform) {
        // Per-platform: Use platform-specific generated content
        const hasContent = selectedAccounts.every(account => 
          platformGeneratedContent[account.accountId]?.trim()
        );
        
        if (!hasContent) {
          setError('Please generate content for all selected platforms');
          setIsSubmitting(false);
          return;
        }

        await Promise.all(
          selectedAccounts.map(account =>
            createScheduledPost({
              social_account_id: account.accountId,
              content: platformGeneratedContent[account.accountId],
              scheduled_time: scheduledDateTime,
            })
          )
        );
      } else {
        // Single content for all platforms
        const postContent = isAIMode ? (generatedContent || primaryMessage) : content;

        if (!postContent.trim()) {
          setError(isAIMode ? 'Please enter a primary message' : 'Please enter post content');
          setIsSubmitting(false);
          return;
        }

        await Promise.all(
          selectedAccounts.map(account =>
            createScheduledPost({
              social_account_id: account.accountId,
              content: postContent,
              scheduled_time: scheduledDateTime,
            })
          )
        );
      }

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

            {/* AI Mode - Enhanced Controls */}
            {isAIMode ? (
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsPromptExpanded(!isPromptExpanded)}>
                <h3 className="text-lg font-medium text-gray-900">✨ AI Post Generator</h3>
                <button className="text-gray-500 hover:text-gray-700">
                  {isPromptExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {isPromptExpanded && (
              <div className="space-y-6">
              {/* Customize Per Platform Toggle */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-gray-800">Customize Each Platform Separately</label>
                    <p className="text-xs text-gray-600 mt-1">Create tailored content for each selected account</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomizePerPlatform(!customizePerPlatform);
                      if (!customizePerPlatform) {
                        setGeneratedContent('');
                        setPlatformGeneratedContent({});
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      customizePerPlatform ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        customizePerPlatform ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Primary Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {customizePerPlatform ? 'Base Message (Optional)' : 'What do you want to post about?'} {!customizePerPlatform && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 border"
                  placeholder="e.g., We're launching a new product that helps small businesses automate their social media..."
                  value={primaryMessage}
                  onChange={(e) => setPrimaryMessage(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {primaryMessage.length} characters
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-4">🎨 {customizePerPlatform ? 'Default Settings (can be overridden per platform)' : 'Customize Your Post'}</p>
                
                {/* Row 1: Post Type & Tone */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Post Type
                    </label>
                    <select
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as any)}
                    >
                      <option value="general">General</option>
                      <option value="question">❓ Question</option>
                      <option value="tip">💡 Tip/Advice</option>
                      <option value="announcement">📢 Announcement</option>
                      <option value="story">📖 Story</option>
                      <option value="promotional">🎯 Promotional</option>
                      <option value="educational">📚 Educational</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Tone
                    </label>
                    <select
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                      value={tone}
                      onChange={(e) => setTone(e.target.value as any)}
                    >
                      <option value="professional">👔 Professional</option>
                      <option value="casual">😊 Casual</option>
                      <option value="friendly">🤝 Friendly</option>
                      <option value="informative">📊 Informative</option>
                      <option value="inspirational">✨ Inspirational</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Goal & Target Audience */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Post Goal
                    </label>
                    <select
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                      value={postGoal}
                      onChange={(e) => setPostGoal(e.target.value as any)}
                    >
                      <option value="engagement">💬 Engagement</option>
                      <option value="awareness">📣 Awareness</option>
                      <option value="conversion">🎯 Conversion</option>
                      <option value="education">🎓 Education</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                      placeholder="e.g., small business owners"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>
                </div>

                {/* Toggle Controls */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Include Emojis</label>
                      <p className="text-xs text-gray-500">Add relevant emojis to make it engaging</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludeEmojis(!includeEmojis)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        includeEmojis ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          includeEmojis ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Include Hashtags</label>
                      <p className="text-xs text-gray-500">Add relevant hashtags for reach</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludeHashtags(!includeHashtags)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        includeHashtags ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          includeHashtags ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Hashtag Count Slider */}
                  {includeHashtags && (
                    <div className="pt-2 border-t">
                      <label className="text-xs font-medium text-gray-700 mb-2 block">
                        Number of Hashtags: <span className="text-blue-600">{hashtagCount}</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={hashtagCount}
                        onChange={(e) => setHashtagCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Include Call-to-Action</label>
                      <p className="text-xs text-gray-500">End with a clear CTA</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludeCTA(!includeCTA)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        includeCTA ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          includeCTA ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Brand Voice (Optional) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Brand Voice <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                    placeholder="e.g., playful and witty, data-driven expert"
                    value={brandVoice}
                    onChange={(e) => setBrandVoice(e.target.value)}
                  />
                </div>
              </div>

              {/* Per-Platform Customization Sections */}
              {customizePerPlatform && platformSelections.filter(p => p.selected).length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">📝 Customize Per Platform</p>
                  <p className="text-xs text-gray-500 mb-4">Override settings for specific accounts. Leave blank to use defaults.</p>
                  
                  <div className="space-y-3">
                    {platformSelections.filter(p => p.selected).map((account) => (
                      <details key={account.accountId} className="bg-gray-50 rounded-lg border border-gray-200">
                        <summary className="cursor-pointer px-4 py-3 font-medium text-sm text-gray-800 hover:bg-gray-100 rounded-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="capitalize">{account.platform}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600 font-normal">{account.accountName}</span>
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </summary>
                        
                        <div className="px-4 pb-4 pt-2 space-y-3">
                          {/* Custom Message for this platform */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Custom Message <span className="text-gray-400">(optional)</span>
                            </label>
                            <textarea
                              rows={3}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none text-sm p-2 border"
                              placeholder="Custom content for this platform..."
                              value={getPlatformSetting(account.accountId, 'customMessage', '')}
                              onChange={(e) => updatePlatformSetting(account.accountId, 'customMessage', e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Post Type */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Post Type</label>
                              <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-1.5 border"
                                value={getPlatformSetting(account.accountId, 'postType', '')}
                                onChange={(e) => updatePlatformSetting(account.accountId, 'postType', e.target.value)}
                              >
                                <option value="">Use default</option>
                                <option value="general">General</option>
                                <option value="question">Question</option>
                                <option value="tip">Tip/Advice</option>
                                <option value="announcement">Announcement</option>
                                <option value="story">Story</option>
                                <option value="promotional">Promotional</option>
                                <option value="educational">Educational</option>
                              </select>
                            </div>

                            {/* Tone */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Tone</label>
                              <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-1.5 border"
                                value={getPlatformSetting(account.accountId, 'tone', '')}
                                onChange={(e) => updatePlatformSetting(account.accountId, 'tone', e.target.value)}
                              >
                                <option value="">Use default</option>
                                <option value="professional">Professional</option>
                                <option value="casual">Casual</option>
                                <option value="friendly">Friendly</option>
                                <option value="informative">Informative</option>
                                <option value="inspirational">Inspirational</option>
                              </select>
                            </div>

                            {/* Post Goal */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Goal</label>
                              <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs p-1.5 border"
                                value={getPlatformSetting(account.accountId, 'postGoal', '')}
                                onChange={(e) => updatePlatformSetting(account.accountId, 'postGoal', e.target.value)}
                              >
                                <option value="">Use default</option>
                                <option value="engagement">Engagement</option>
                                <option value="awareness">Awareness</option>
                                <option value="conversion">Conversion</option>
                                <option value="education">Education</option>
                              </select>
                            </div>

                            {/* Hashtag Count */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Hashtags: {getPlatformSetting(account.accountId, 'hashtagCount', hashtagCount)}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="5"
                                value={getPlatformSetting(account.accountId, 'hashtagCount', hashtagCount)}
                                onChange={(e) => updatePlatformSetting(account.accountId, 'hashtagCount', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                            </div>
                          </div>

                          {/* Mini toggles */}
                          <div className="flex gap-4 text-xs">
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={getPlatformSetting(account.accountId, 'includeEmojis', includeEmojis)}
                                onChange={(e) => updatePlatformSetting(account.accountId, 'includeEmojis', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>Emojis</span>
                            </label>
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={getPlatformSetting(account.accountId, 'includeHashtags', includeHashtags)}
                                onChange={(e) => updatePlatformSetting(account.accountId, 'includeHashtags', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>Hashtags</span>
                            </label>
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={getPlatformSetting(account.accountId, 'includeCTA', includeCTA)}
                                onChange={(e) => updatePlatformSetting(account.accountId, 'includeCTA', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>CTA</span>
                            </label>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="mt-6">
                <AIButton
                  onClick={handleGenerateWithAI}
                  isLoading={isGenerating}
                  disabled={!customizePerPlatform && !primaryMessage.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? 'Generating...' : '✨ Generate Post with AI'}
                </AIButton>
              </div>
              </div>
              )}
            </div>
            ) : null}

            {/* AI Generated Content - Single for All Platforms */}
            {isAIMode && !customizePerPlatform && generatedContent && (
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">✨ AI Generated Content</h3>
              
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

            {/* AI Generated Content - Per Platform */}
            {isAIMode && customizePerPlatform && Object.keys(platformGeneratedContent).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-blue-50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">✨ Generated Content Per Platform</h3>
              
              <div className="space-y-4">
                {platformSelections.filter(p => p.selected && platformGeneratedContent[p.accountId]).map((account) => (
                  <div key={account.accountId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 capitalize">{account.platform}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{account.accountName}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {platformGeneratedContent[account.accountId]?.length || 0} chars
                      </span>
                    </div>
                    
                    <textarea
                      rows={6}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 border bg-white text-sm"
                      value={platformGeneratedContent[account.accountId] || ''}
                      onChange={(e) => setPlatformGeneratedContent(prev => ({
                        ...prev,
                        [account.accountId]: e.target.value
                      }))}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  // Clear per-platform generated content after using
                  setPlatformGeneratedContent({});
                }}
                className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Clear All Generated Content
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
              disabled={
                isSubmitting || 
                selectedCount === 0 || 
                (isScheduled && (!scheduledDate || !scheduledTime)) ||
                (isAIMode && customizePerPlatform && Object.keys(platformGeneratedContent).length === 0) ||
                (isAIMode && !customizePerPlatform && !generatedContent && !primaryMessage) ||
                (!isAIMode && !content)
              }
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
