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
  Building
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SocialAccount } from '@/lib/social-accounts';
import { BrandSwitcher } from './BrandSwitcher';

interface SidebarProps {
  onCreatePost?: () => void;
}

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
} as const;

const platformColors = {
  twitter: 'text-blue-400',
  facebook: 'text-blue-600',
  linkedin: 'text-blue-700',
} as const;

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
  
  const getPlatformIcon = (platform: string) => {
    const Icon = platformIcons[platform as keyof typeof platformIcons] || Twitter;
    const color = platformColors[platform as keyof typeof platformColors] || 'text-gray-500';
    return <Icon className={`h-5 w-5 ${color}`} />;
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
            Messages
          </h3>
          <div className="space-y-1">
            <Link href="/inbox" className={navLinkClasses('/inbox')}>
              <MessageSquare className="h-5 w-5" />
              Inbox
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