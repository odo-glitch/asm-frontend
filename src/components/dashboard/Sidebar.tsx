'use client';

import { 
  Plus, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Home,
  Calendar,
  BarChart3,
  Image,
  Users,
  Settings,
  MessageSquare,
  Building,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SocialAccount } from '@/lib/social-accounts';
import { BrandSwitcher } from './BrandSwitcher';

interface SidebarProps {
  onCreatePost?: () => void;
  accounts?: SocialAccount[];
}

// Real platform logo SVG components
const getPlatformIcon = (platform: string) => {
  if (platform === 'twitter' || platform === 'x') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000000"/>
      </svg>
    );
  } else if (platform === 'facebook') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  } else if (platform === 'linkedin') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }
  // Fallback
  return <Twitter className="h-5 w-5 text-gray-500" />;
};

export function Sidebar({ onCreatePost }: SidebarProps) {
  const pathname = usePathname();
  const [selectedOrgId, setSelectedOrgId] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('selectedOrgId') || '' : ''
  );
  
  const handleOrgChange = (orgId: string) => {
    if (orgId !== selectedOrgId) {
      setSelectedOrgId(orgId);
      localStorage.setItem('selectedOrgId', orgId);
    }
  };

  const isActive = (path: string) => pathname === path;

  const navLinkClasses = (path: string) => `
    flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
    ${isActive(path) 
      ? 'bg-blue-50 text-blue-700' 
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    }
  `;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Brand Switcher at the top */}
      <BrandSwitcher 
        currentOrgId={selectedOrgId}
        onOrgChange={handleOrgChange}
      />
      
      <nav className="p-4 space-y-8 flex-1">
        {/* Main Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main
          </h3>
          <div className="space-y-1">
            <Link href="/dashboard" className={navLinkClasses('/dashboard')}>
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link href="/calendar" className={navLinkClasses('/calendar')}>
              <Calendar className="h-5 w-5" />
              Calendar
            </Link>
            <Link href="/analytics" className={navLinkClasses('/analytics')}>
              <BarChart3 className="h-5 w-5" />
              Analytics
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Content
          </h3>
          <div className="space-y-1">
            <button
              onClick={onCreatePost}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Post
            </button>
            <Link href="/library" className={navLinkClasses('/library')}>
              <Image className="h-5 w-5" />
              Content Library
            </Link>
          </div>
        </div>

        {/* Messages Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Engagement
          </h3>
          <div className="space-y-1">
            <Link href="/inbox" className={navLinkClasses('/inbox')}>
              <MessageSquare className="h-5 w-5" />
              Inbox
            </Link>
            <Link href="/reviews" className={navLinkClasses('/reviews')}>
              <Star className="h-5 w-5" />
              Reviews
            </Link>
          </div>
        </div>

        {/* Management Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Management
          </h3>
          <div className="space-y-1">
            <Link href="/business-profile" className={navLinkClasses('/business-profile')}>
              <Building className="h-5 w-5" />
              Business Profile
            </Link>
            <Link href="/accounts" className={navLinkClasses('/accounts')}>
              <Users className="h-5 w-5" />
              Manage Accounts
            </Link>
            <Link href="/settings" className={navLinkClasses('/settings')}>
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}