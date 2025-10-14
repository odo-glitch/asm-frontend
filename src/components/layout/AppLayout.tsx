'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/auth/login');
        return;
      }
      
      setUserEmail(user.email || null);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Logo className="h-16 w-auto text-[#61497e]" />
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{userEmail}</span>
              <form onSubmit={handleSignOut}>
                <button
                  type="submit"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}
