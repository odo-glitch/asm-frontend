'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SocialAccount } from '@/lib/social-accounts';
import { createScheduledPost } from '@/lib/scheduled-posts';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialAccount[];
  defaultDate?: Date;
  onPostScheduled?: () => void | Promise<void>;
}

export function CreatePostModal({ isOpen, onClose, accounts, defaultDate, onPostScheduled }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [scheduledDate, setScheduledDate] = useState(defaultDate ? defaultDate.toISOString().split('T')[0] : '');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update scheduledDate when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      setScheduledDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [defaultDate]);

  const handleSchedulePost = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Create the scheduled post in the database
      const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;
      await createScheduledPost({
        social_account_id: selectedAccount,
        content,
        scheduled_time: scheduledDateTime,
      });

      // Call the onPostScheduled callback if provided
      if (onPostScheduled) {
        await onPostScheduled();
      }

      // Log success for debugging
      console.log('Post successfully scheduled!');

      // Reset form and close modal
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Post Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
            </label>
            <textarea
              id="content"
              rows={6}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 border"
              placeholder="What's on your mind?"
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
              Select Social Account
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
                Date
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
                Time
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
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedulePost}
            disabled={!content || !selectedAccount || !scheduledDate || !scheduledTime || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
          </button>
        </div>
      </div>
    </div>
  );
}