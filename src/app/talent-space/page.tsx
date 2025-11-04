'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GroupSidebar } from '@/components/talent-space/GroupSidebar';
import { ChatInterface } from '@/components/talent-space/ChatInterface';
import { CreatePost } from '@/components/talent-space/CreatePost';
import { PostFeed } from '@/components/talent-space/PostFeed';
import { JobListings } from '@/components/talent-space/JobListings';
import { SearchBar } from '@/components/talent-space/SearchBar';
import { posts as mockPosts, users, jobs, groups } from '@/data/talent-space';
import { useAuth } from '@/contexts/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import type { Post } from '@/types/talent-space';

export default function TalentSpacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    const author = users.find((u) => u.id === post.userId);
    const searchLower = searchQuery.toLowerCase();
    
    return (
      post.content.toLowerCase().includes(searchLower) ||
      author?.name.toLowerCase().includes(searchLower) ||
      author?.headline.toLowerCase().includes(searchLower)
    );
  });

  const handlePostCreated = () => {
    // Refresh posts - in a real app, this would fetch from Firestore
    // For now, we trigger a re-render
    setRefreshKey(prev => prev + 1);
    
    // Optionally, fetch fresh posts from Firestore:
    // const freshPosts = await getPosts();
    // setPosts(freshPosts);
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

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
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onSearch={setSearchQuery} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <GroupSidebar groups={groups} onGroupSelect={handleGroupSelect} />
            <ChatInterface 
              groupId={selectedGroupId} 
              groupName={selectedGroup?.name}
              users={users}
            />
          </aside>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost user={users[0]} onPostCreated={handlePostCreated} />
            <PostFeed posts={filteredPosts} users={users} key={refreshKey} />
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <JobListings jobs={jobs} />
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
