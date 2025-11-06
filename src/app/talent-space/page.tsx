
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CreatePost } from '@/components/talent-space/CreatePost';
import { JobListings } from '@/components/talent-space/JobListings';
import { SearchBar } from '@/components/talent-space/SearchBar';
import { PostFeed } from '@/components/talent-space/PostFeed';
import { jobs as mockJobs } from '@/data/talent-space';
import { useAuth } from '@/contexts/auth-provider';
import { Loader } from 'lucide-react';
import GuaranteedPostsService, { type GuaranteedPost } from '@/services/guaranteed-posts-service';
import ProfessionalGroupsList from '@/components/ProfessionalGroupsList';
import GroupChat from '@/components/GroupChat';
import { ProfessionalGroupsService, type ProfessionalGroup } from '@/services/professional-groups-service';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types/talent-space';

export default function TalentSpacePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<GuaranteedPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [groups, setGroups] = useState<ProfessionalGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const feedRef = useRef<HTMLDivElement>(null);


  const fetchAllData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setIsLoadingContent(true);
    }
    try {
      const [postsResult, groupsResult] = await Promise.all([
        GuaranteedPostsService.fetchPosts(isRefreshing),
        ProfessionalGroupsService.getAllGroups()
      ]);

      if (postsResult.success) {
        setPosts(postsResult.data);
      } else {
        toast({ title: "Error", description: postsResult.error || "Failed to load posts.", variant: "destructive" });
      }

      if (groupsResult.success) {
        setGroups(groupsResult.data);
      } else {
        toast({ title: "Error", description: groupsResult.error || "Failed to load groups.", variant: "destructive" });
      }

      // After content has loaded and state is updated, scroll to top
      if (feedRef.current) {
        feedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error) {
      console.error("Error fetching talent space data:", error);
      toast({ title: "Error", description: "Failed to load page content.", variant: "destructive" });
    } finally {
      setIsLoadingContent(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchAllData();
    }
  }, [user, authLoading, fetchAllData]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.content.toLowerCase().includes(query) ||
      post.author.name.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  const currentUser: User | null = user ? { id: user.uid, name: user.displayName || 'User', headline: '', avatarUrl: user.photoURL || '' } : null;
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  if (authLoading) {
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
        <div ref={feedRef} className="mb-6 scroll-mt-24">
          <SearchBar value={searchQuery} onSearch={setSearchQuery} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <ProfessionalGroupsList 
              groups={groups} 
              loading={isLoadingContent} 
              onGroupSelect={setSelectedGroupId}
              onRefresh={() => fetchAllData(true)}
            />
            <GroupChat 
              groupId={selectedGroupId} 
              groupName={selectedGroup?.name}
            />
          </aside>
          <div className="lg:col-span-2 space-y-6">
            {currentUser && <CreatePost user={currentUser} onPostCreated={() => fetchAllData(true)} />}
            {isLoadingContent ? (
              <div className="flex justify-center items-center h-64 bg-card rounded-lg">
                <Loader className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <PostFeed posts={filteredPosts} onPostUpdate={() => fetchAllData(true)} />
            )}
          </div>
          <aside className="hidden lg:block lg:col-span-1">
            <JobListings jobs={mockJobs} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
