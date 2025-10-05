'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { CreatePostModal } from '@/components/dashboard/CreatePostModal';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts';
import TextPressure from '@/components/TextPressure';

interface DashboardContentProps {
  userEmail: string;
}

export function DashboardContent({ userEmail }: DashboardContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      setIsLoading(true);
      try {
        const fetchedAccounts = await fetchUserSocialAccounts();
        setAccounts(fetchedAccounts);
      } catch (error) {
        console.error('Failed to load accounts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAccounts();
  }, []);

  return (
    <>
      <Sidebar 
        accounts={accounts} 
        onCreatePost={() => setIsModalOpen(true)}
      />
      
      <div className="ml-64">
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold leading-tight text-gray-900">
                  Dashboard
                </h1>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-5 w-5" />
                  Create Post
                </button>
              </div>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className=" border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-medium text-gray-900">
                      Welcome, {userEmail}!
                    </h2>
                    <div style={{position: 'relative', height: '300px'}}>
                     
  <TextPressure
    text={`Hi ${userEmail.split('@')[0]}!`}
    flex={true}
    alpha={false}
    stroke={false}
    width={true}
    weight={true}
    italic={true}
    textColor="#000000ff"
    strokeColor="#ff0000"
    minFontSize={36}
  />
</div>
                    <p className="mt-2 text-gray-600">
                      {accounts.length === 0 
                        ? "Connect your social media accounts to get started."
                        : "Click 'Create Post' to schedule your first social media post."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accounts={accounts}
      />
    </>
  );
}