'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, TrendingUp, Megaphone, Clock, CheckCircle2, Trash2, MessageSquarePlus } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/card';
import TextPressure from '@/components/TextPressure';
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts';
import { getUserProfile, getDisplayName, UserProfile } from '@/lib/profile';
import { ScheduledPost, fetchScheduledPosts } from '@/lib/scheduled-posts';
import { Announcement, fetchAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/announcements';
import { getSelectedOrganizationId } from '@/lib/organization-context';

interface DashboardContentProps {
  userEmail: string;
  userId: string;
}

export function DashboardContent({ userEmail, userId }: DashboardContentProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<ScheduledPost[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(() => 
    typeof window !== 'undefined' ? getSelectedOrganizationId() : null
  );
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  useEffect(() => {
    loadData();
    
    // Listen for organization changes
    const handleOrgChange = () => {
      console.log('Organization changed, reloading dashboard data...');
      const newOrgId = getSelectedOrganizationId();
      setSelectedOrgId(newOrgId);
      loadData();
    };
    
    window.addEventListener('organizationChanged', handleOrgChange);
    
    return () => {
      window.removeEventListener('organizationChanged', handleOrgChange);
    };
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [fetchedAccounts, userProfile, posts] = await Promise.all([
        fetchUserSocialAccounts(),
        getUserProfile(),
        fetchScheduledPosts().catch(() => [])
      ]);
      
      if (Array.isArray(fetchedAccounts)) {
        setAccounts(fetchedAccounts);
      } else {
        setAccounts([]);
      }
      
      setProfile(userProfile);
      
      // Split posts into scheduled and recent
      const now = new Date();
      const scheduled = posts.filter(p => p.status === 'scheduled' && new Date(p.scheduled_time) > now);
      const recent = posts.filter(p => p.status === 'published').slice(0, 5);
      
      setScheduledPosts(scheduled.slice(0, 5));
      setRecentPosts(recent);
      
      // Load announcements if organization selected
      if (selectedOrgId) {
        const orgAnnouncements = await fetchAnnouncements(selectedOrgId);
        setAnnouncements(orgAnnouncements);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateAnnouncement() {
    if (!announcementForm.title || !announcementForm.message) {
      alert('Please fill in all fields');
      return;
    }

    if (!selectedOrgId) {
      alert('No organization selected. Please select an organization from the sidebar.');
      return;
    }

    console.log('Attempting to create announcement with org ID:', selectedOrgId);
    const result = await createAnnouncement(selectedOrgId, announcementForm.title, announcementForm.message);
    
    if (result.success) {
      setAnnouncementForm({ title: '', message: '' });
      setShowAnnouncementForm(false);
      loadData();
    } else {
      alert('Failed to create announcement: ' + result.error);
      console.error('Full error details should be in console above');
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    const result = await deleteAnnouncement(id);
    if (result.success) {
      loadData();
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h`;
    return date.toLocaleDateString();
  }

  return (
    <>
      <Sidebar 
        accounts={accounts} 
        onCreatePost={() => router.push('/create-post')}
      />
      
      <div className="ml-64 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
        <div className="py-8">
          {/* Header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-48 w-full max-w-2xl mb-4">
                {profile && (
                  <TextPressure 
                    text={`Hi ${getDisplayName(profile)}!`}
                    textColor="#7f5ce7"
                    minFontSize={40}
                    width={true}
                    weight={true}
                    italic={false}
                    scale={false}
                  />
                )}
              </div>
              <p className="text-gray-700 text-lg font-medium">Here&apos;s what&apos;s happening with your social media</p>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-white rounded-lg">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Scheduled Posts</p>
                  <p className="text-4xl font-bold text-gray-800 mt-2">{scheduledPosts.length}</p>
                </div>

                <div className="p-6 bg-white rounded-lg">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Published Posts</p>
                  <p className="text-4xl font-bold text-gray-800 mt-2">{recentPosts.length}</p>
                </div>

                <div className="p-6 bg-white rounded-lg">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Connected Accounts</p>
                  <p className="text-4xl font-bold text-gray-800 mt-2">{accounts.length}</p>
                </div>
              </div>

              {/* Scheduled Posts */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Upcoming Posts
                </h2>
                
                <div className="space-y-3">
                  {scheduledPosts.length === 0 ? (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg flex gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop"
                          alt="Product launch"
                          className="w-24 h-24 rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                          onClick={() => setSelectedMedia({ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', type: 'image' })}
                        />
                        <div className="flex-1">
                          <p className="text-base text-gray-700 font-semibold">New product launch announcement 🚀</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <span>Instagram</span>
                            <span>•</span>
                            <span>Scheduled for tomorrow at 2:00 PM</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg flex gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop"
                          alt="Tips and tricks"
                          className="w-24 h-24 rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                          onClick={() => setSelectedMedia({ url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800', type: 'image' })}
                        />
                        <div className="flex-1">
                          <p className="text-base text-gray-700 font-semibold">Weekly tips and tricks for our community</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <span>Twitter</span>
                            <span>•</span>
                            <span>Scheduled for Oct 21 at 10:00 AM</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    scheduledPosts.map(post => (
                      <div key={post.id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-base text-gray-700 font-semibold line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <span>{post.platform}</span>
                          <span>•</span>
                          <span>{formatDate(post.scheduled_time)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Published Posts */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Recently Published
                </h2>
                
                <div className="space-y-3">
                  {recentPosts.length === 0 ? (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg flex gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop"
                          alt="Social media trends"
                          className="w-24 h-24 rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                          onClick={() => setSelectedMedia({ url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', type: 'image' })}
                        />
                        <div className="flex-1">
                          <p className="text-base text-gray-700 font-semibold">Check out our latest blog post on social media trends</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <span>LinkedIn</span>
                            <span>•</span>
                            <span>Published 2 hours ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg flex gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200&h=200&fit=crop"
                          alt="10K followers celebration"
                          className="w-24 h-24 rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                          onClick={() => setSelectedMedia({ url: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800', type: 'image' })}
                        />
                        <div className="flex-1">
                          <p className="text-base text-gray-700 font-semibold">Thank you for 10K followers! 🎉</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <span>Instagram</span>
                            <span>•</span>
                            <span>Published yesterday</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    recentPosts.map(post => (
                      <div key={post.id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-base text-gray-700 font-semibold line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <span>{post.platform}</span>
                          <span>•</span>
                          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Announcements Section */}
              {!selectedOrgId && (
                <div className="p-6 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Megaphone className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold text-base">No Organization Selected</h3>
                      <p className="text-sm text-gray-600">Select an organization from the sidebar to view and create announcements.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedOrgId && (
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      Organization Announcements
                    </h2>
                    <button
                      onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      New Announcement
                    </button>
                  </div>

                  {/* Announcement Form */}
                  {showAnnouncementForm && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        placeholder="Announcement Title"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      />
                      <textarea
                        placeholder="Write your announcement..."
                        value={announcementForm.message}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateAnnouncement}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Post Announcement
                        </button>
                        <button
                          onClick={() => {
                            setShowAnnouncementForm(false);
                            setAnnouncementForm({ title: '', message: '' });
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Announcements List */}
                  {announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-base">No announcements yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map(announcement => (
                        <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                              <p className="text-base text-gray-600 mt-1">{announcement.message}</p>
                              <p className="text-sm text-gray-500 mt-2">
                                {new Date(announcement.created_at).toLocaleDateString()} at {new Date(announcement.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-lg font-bold"
            >
              ✕ Close
            </button>
            {selectedMedia.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt="Media preview" 
                className="max-w-full max-h-[85vh] rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video 
                src={selectedMedia.url} 
                controls 
                className="max-w-full max-h-[85vh] rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}