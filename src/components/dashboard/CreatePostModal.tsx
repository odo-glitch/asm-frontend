'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { SocialAccount } from '@/lib/social-accounts';
import { createScheduledPost } from '@/lib/scheduled-posts';
import { createClient } from '@/lib/supabase/client';
import { getSelectedOrganizationId } from '@/lib/organization-context';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialAccount[];
  defaultDate?: Date;
  onPostScheduled?: () => void | Promise<void>;
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

export function CreatePostModal({ isOpen, onClose, accounts, defaultDate, onPostScheduled, userId }: CreatePostModalProps) {
  // Form fields
  const [postTitle, setPostTitle] = useState('');
  const [primaryMessage, setPrimaryMessage] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [offerDetails, setOfferDetails] = useState('');
  const [goalObjective, setGoalObjective] = useState('');
  const [lengthPreference, setLengthPreference] = useState<'short' | 'medium' | 'long'>('medium');
  
  const [content, setContent] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [scheduledDate, setScheduledDate] = useState(defaultDate ? defaultDate.toISOString().split('T')[0] : '');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);

  // Load brand profile when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadBrandProfile();
    }
  }, [isOpen, userId]);

  // Update scheduledDate when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      setScheduledDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [defaultDate]);

  const loadBrandProfile = async () => {
    const supabase = createClient();
    const organizationId = getSelectedOrganizationId();
    
    try {
      let query = supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', userId);
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      } else {
        query = query.is('organization_id', null);
      }
      
      const { data, error } = await query.single();

      if (!error && data) {
        setBrandProfile(data);
        console.log('Brand profile loaded:', data);
      }
    } catch (error) {
      console.error('Error loading brand profile:', error);
    }
  };

  const handleGenerateContent = async () => {
    if (!primaryMessage.trim()) {
      setError('Please enter a primary message or prompt first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Get selected account platform
      const selectedAcct = accounts.find(a => a.id === selectedAccount);
      const platform = selectedAcct?.platform || 'social media';

      // Build the prompt
      const lengthGuide = {
        short: '1-2 sentences',
        medium: '3-4 sentences',
        long: '5-6 sentences or more'
      }[lengthPreference];

      const prompt = `Generate a social media caption for ${platform} promoting "${primaryMessage}" for ${brandProfile?.brand_name || 'our brand'}.
${brandProfile?.tone_of_voice ? `Tone: ${brandProfile.tone_of_voice}.` : ''}
${brandProfile?.target_audience ? `Target audience: ${brandProfile.target_audience}.` : ''}
${callToAction ? `Include CTA: "${callToAction}".` : ''}
${hashtags ? `Hashtags: ${hashtags}.` : ''}
${offerDetails ? `Offer: ${offerDetails}.` : ''}
${goalObjective ? `Goal: ${goalObjective}.` : ''}
Length: ${lengthGuide}.
${brandProfile?.brand_personality ? `Brand personality: ${brandProfile.brand_personality}.` : ''}
${brandProfile?.content_guidelines ? `Guidelines: ${brandProfile.content_guidelines}.` : ''}

Generate engaging, ${lengthPreference} length social media content that captures attention and drives engagement.`;

      console.log('Generating content with prompt:', prompt);

      // Call OpenAI API
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      console.error('Failed to generate content:', err);
      setError('Failed to generate content. Please try again or write manually.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedulePost = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;
      await createScheduledPost({
        social_account_id: selectedAccount,
        content,
        scheduled_time: scheduledDateTime,
      });

      if (onPostScheduled) {
        await onPostScheduled();
      }

      // Reset form
      setPostTitle('');
      setPrimaryMessage('');
      setCallToAction('');
      setHashtags('');
      setOfferDetails('');
      setGoalObjective('');
      setLengthPreference('medium');
      setContent('');
      setSelectedAccount('');
      setScheduledDate('');
      setScheduledTime('');
      onClose();
    } catch (err) {
      console.error('Failed to schedule post:', err);
      setError('Failed to schedule post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b z-10">
          <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Post Details</h3>
              
              {/* Post Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., Summer Sale Announcement"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
              </div>

              {/* Primary Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Message or Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 border"
                  placeholder="What do you want to promote or talk about?"
                  value={primaryMessage}
                  onChange={(e) => setPrimaryMessage(e.target.value)}
                />
              </div>

              {/* Call to Action */}
              <div>
                <label htmlFor="cta" className="block text-sm font-medium text-gray-700 mb-2">
                  Call to Action
                </label>
                <input
                  type="text"
                  id="cta"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., Shop Now, Learn More, Sign Up"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                />
              </div>

              {/* Hashtags */}
              <div>
                <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags
                </label>
                <input
                  type="text"
                  id="hashtags"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., #Summer #Sale #Fashion"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
              </div>

              {/* Offer Details */}
              <div>
                <label htmlFor="offer" className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Details
                </label>
                <input
                  type="text"
                  id="offer"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., 20% off all items"
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                />
              </div>

              {/* Goal/Objective */}
              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                  Goal / Objective
                </label>
                <input
                  type="text"
                  id="goal"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  placeholder="e.g., Drive traffic, Increase engagement"
                  value={goalObjective}
                  onChange={(e) => setGoalObjective(e.target.value)}
                />
              </div>

              {/* Length Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length Preference
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
              <button
                onClick={handleGenerateContent}
                disabled={isGenerating || !primaryMessage.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>

            {/* Right Column - Generated Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Generated Content</h3>
              
              {/* Post Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  rows={10}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 border"
                  placeholder="Generated content will appear here, or write your own..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="mt-2 text-sm text-gray-500">
                  {content.length} characters
                </p>
              </div>

              {/* Account Selection */}
              <div>
                <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Social Account <span className="text-red-500">*</span>
                </label>
                <select
                  id="account"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  <option value="">Choose an account...</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_name} - {account.platform}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="time"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Brand Profile Info */}
              {brandProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-xs font-medium text-blue-900 mb-2">Using Brand Profile:</p>
                  <p className="text-sm text-blue-800">
                    <strong>{brandProfile.brand_name}</strong>
                    {brandProfile.tone_of_voice && ` • ${brandProfile.tone_of_voice}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedulePost}
            disabled={!content || !selectedAccount || !scheduledDate || !scheduledTime || isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
