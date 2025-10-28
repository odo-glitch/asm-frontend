'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { useMobileMenu } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIButton } from '@/components/ui/ai-button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  MessageSquare, 
  Sparkles, 
  Send,
  ThumbsUp,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  platform: 'google' | 'facebook' | 'yelp';
  author_name: string;
  author_image?: string;
  rating: number;
  text: string;
  created_at: string;
  replied: boolean;
  reply_text?: string;
  review_url?: string;
}

// Platform logo components
const PlatformLogo = ({ platform }: { platform: 'google' | 'facebook' | 'yelp' }) => {
  if (platform === 'google') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    );
  } else if (platform === 'facebook') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  } else {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF1A1A">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
    );
  }
};

const platformNames = {
  google: 'Google Business Profile (Odo Market)',
  facebook: 'Facebook Page (Odo Market)',
  yelp: 'Yelp Business (Odo Market)'
};

const platformColors = {
  google: 'bg-gray-50 text-gray-700 border-gray-200',
  facebook: 'bg-gray-50 text-gray-700 border-gray-200',
  yelp: 'bg-gray-50 text-gray-700 border-gray-200'
};

export default function ReviewsPage() {
  const router = useRouter()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu()
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIReply = async (review: Review) => {
    setIsGeneratingReply(true);
    try {
      const response = await fetch('/api/reviews/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: review.text,
          rating: review.rating,
          authorName: review.author_name,
          platform: review.platform
        }),
      });

      if (!response.ok) throw new Error('Failed to generate reply');
      
      const data = await response.json();
      setReplyText(data.reply);
      toast({
        title: 'AI Reply Generated',
        description: 'Review the suggested reply and edit if needed',
      });
    } catch (error) {
      console.error('Error generating reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI reply',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const sendReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    setIsSendingReply(true);
    try {
      const response = await fetch('/api/reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          replyText: replyText.trim(),
          platform: selectedReview.platform
        }),
      });

      if (!response.ok) throw new Error('Failed to send reply');

      // Update local state
      setReviews(reviews.map(r => 
        r.id === selectedReview.id 
          ? { ...r, replied: true, reply_text: replyText.trim() }
          : r
      ));

      toast({
        title: 'Reply Sent',
        description: 'Your reply has been posted successfully',
      });

      setSelectedReview(null);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterRating && review.rating !== filterRating) return false;
    if (filterPlatform && review.platform !== filterPlatform) return false;
    return true;
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const unrepliedCount = reviews.filter(r => !r.replied).length;

  return (
    <AppLayout>
      <Sidebar 
        onCreatePost={() => router.push('/create-post')}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 space-y-6">
          {/* Demo Notice Banner */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">Demo: Review Management with AI-Powered Replies</h3>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    This demonstration showcases our intelligent review management system. We integrate with <strong>Google Business Profile</strong> and <strong>Facebook Pages</strong> to centralize all your customer reviews in one place. Our AI-powered reply generation helps you respond quickly and professionally to every review, improving customer satisfaction and online reputation.
                  </p>
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    🔐 Below are sample reviews demonstrating the API integration capabilities we&apos;re requesting access for.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Reviews Management</h1>
              <p className="text-gray-600">Manage and respond to customer reviews with AI assistance</p>
            </div>
            <Button onClick={loadReviews} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold">{reviews.length}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      {averageRating}
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Needs Reply</p>
                    <p className="text-2xl font-bold">{unrepliedCount}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold">
                      {reviews.length > 0 
                        ? Math.round(((reviews.length - unrepliedCount) / reviews.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <ThumbsUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filterRating === null
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-blue-700 active:text-white'
                    }`}
                    onClick={() => setFilterRating(null)}
                  >
                    All Ratings
                  </button>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                        filterRating === rating
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 active:bg-blue-700 active:text-white'
                      }`}
                      onClick={() => setFilterRating(rating)}
                    >
                      {rating} <Star className="w-3 h-3" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 ml-auto">
                  <button
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filterPlatform === null
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-blue-700 active:text-white'
                    }`}
                    onClick={() => setFilterPlatform(null)}
                  >
                    All Platforms
                  </button>
                  {['google', 'facebook', 'yelp'].map(platform => (
                    <button
                      key={platform}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        filterPlatform === platform
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 active:bg-blue-700 active:text-white'
                      }`}
                      onClick={() => setFilterPlatform(platform)}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reviews Column */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No reviews found</p>
                  <p className="text-sm text-gray-400">Reviews will appear here once customers leave feedback</p>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <Card
                    key={review.id}
                    className={`cursor-pointer transition-all ${
                      selectedReview?.id === review.id
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedReview(review);
                      setReplyText(review.reply_text || '');
                    }}
                  >
                    <CardContent className="pt-6">
                      {/* Platform/Business Name Header */}
                      <div className="mb-3 pb-3  border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PlatformLogo platform={review.platform} />
                            <span className="font-semibold text-gray-700">{platformNames[review.platform]}</span>
                          </div>
                          <Badge className={platformColors[review.platform]}>
                            {review.platform.charAt(0).toUpperCase() + review.platform.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">
                            {review.author_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="mb-2">
                            <p className="font-semibold text-lg">{review.author_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-5 h-5 ${
                                      i < review.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 text-base mb-2 leading-relaxed">{review.text}</p>
                          
                          {review.replied && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-1">
                                <ThumbsUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">Replied</span>
                              </div>
                              <p className="text-sm text-gray-600">{review.reply_text}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Reply Panel */}
            <div className="lg:sticky lg:top-6 h-fit">
              {selectedReview ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Reply to Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Business Profile Name */}
                    <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <PlatformLogo platform={selectedReview.platform} />
                        <span className="font-semibold text-gray-700">{platformNames[selectedReview.platform]}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {selectedReview.author_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{selectedReview.author_name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < selectedReview.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedReview.text}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium">Your Reply</label>
                        <AIButton
                          size="md"
                          onClick={() => generateAIReply(selectedReview)}
                          isLoading={isGeneratingReply}
                        >
                          {isGeneratingReply ? 'Generating...' : 'Generate AI Reply'}
                        </AIButton>
                      </div>
                      <Textarea
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={6}
                        disabled={selectedReview.replied}
                      />
                    </div>

                    {!selectedReview.replied && (
                      <Button
                        onClick={sendReply}
                        disabled={!replyText.trim() || isSendingReply}
                        className="w-full"
                      >
                        {isSendingReply ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    )}

                    {selectedReview.replied && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-700">Already Replied</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a review to reply</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
