// Global type definitions to avoid using 'any'

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: unknown;
}

export interface AnalyticsMetric {
  name: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface BusinessMetric {
  totalViews: number;
  totalSearches: number;
  totalActions: number;
  websiteClicks: number;
  phoneCalls: number;
  directionsRequests: number;
  messagesSent: number;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  platform: string;
}

export interface ContentItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PrismToken {
  type: string;
  content: string;
  alias?: string;
  length?: number;
  greedy?: boolean;
  pattern?: RegExp | PrismToken;
}

export interface PrismGrammar {
  [key: string]: RegExp | PrismToken | Array<RegExp | PrismToken>;
}

export interface PrismLanguage {
  grammar: PrismGrammar;
  name: string;
}

// Social Media Platform Types
export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube';

export interface SocialAccount {
  id: string;
  userId: string;
  organizationId?: string;
  platform: SocialPlatform;
  accountName: string;
  accountId?: string;
  profileData?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}