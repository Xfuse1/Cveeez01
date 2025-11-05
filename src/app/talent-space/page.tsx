'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GroupSidebar } from '@/components/talent-space/GroupSidebar';
import { ChatInterface } from '@/components/talent-space/ChatInterface';
import { CreatePost } from '@/components/talent-space/CreatePost';
import { JobListings } from '@/components/talent-space/JobListings';
import { SearchBar } from '@/components/talent-space/SearchBar';
import { users, jobs, groups } from '@/data/talent-space';
import { useAuth } from '@/contexts/auth-provider';
import { Loader } from 'lucide-react';
import GuaranteedPostsFeed from '@/components/GuaranteedPostsFeed';

export default function TalentSpacePage() {
  const { user, loading } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId === selectedGroupId ? undefined : groupId);
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const currentUser = user ? users.find(u => u.id === 'u1') : users[0]; // Mock user for now

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30 dark:bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <SearchBar value={searchQuery} onSearch={setSearchQuery} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <GroupSidebar groups={groups} onGroupSelect={handleGroupSelect} />
            <ChatInterface 
              groupId={selectedGroupId} 
              groupName={selectedGroup?.name}
              users={users}
            />
          </aside>
          
          <div className="lg:col-span-2 space-y-6">
            {user && <CreatePost user={currentUser!} onPostCreated={handlePostCreated} />}
            <GuaranteedPostsFeed key={refreshKey} />
          </div>

          <aside className="hidden lg:block lg:col-span-1">
            <JobListings jobs={jobs} />
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
