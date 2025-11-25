'use client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CreatePost } from '@/components/talent-space/CreatePost';
import { PostFeed } from '@/components/talent-space/PostFeed';
import ProfessionalGroupsList from '@/components/ProfessionalGroupsList';
import GroupChat from '@/components/GroupChat';
import GroupMessages from '@/components/GroupMessages';
import RecommendedJobs from '@/components/RecommendedJobs';
import { ProfessionalGroupsService, type ProfessionalGroup } from '@/services/professional-groups-service';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-provider';
import { TalentSpaceService } from '@/services/talent-space';
import type { Post, User } from '@/types/talent-space';
import { mapAuthUserToTalentUser } from '@/lib/talent-space-utils';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function TalentSpacePage() {
  const [selectedGroup, setSelectedGroup] = useState<ProfessionalGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'group'>('public');
  const [activeFilter, setActiveFilter] = useState<'latest' | 'popular' | 'following'>('latest');
  const [posts, setPosts] = useState<Post[]>([]);
  const [limitCount, setLimitCount] = useState(20);
  const [groups, setGroups] = useState<ProfessionalGroup[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language].talentSpace;

  const currentUser = mapAuthUserToTalentUser(user);

  // Subscription for Real-time Posts
  useEffect(() => {
    setIsLoadingPosts(true);
    const unsubscribe = TalentSpaceService.subscribeToPosts((updatedPosts) => {
      setPosts(updatedPosts);
      setIsLoadingPosts(false);
    }, limitCount);

    return () => unsubscribe();
  }, [limitCount]);

  const handleLoadMore = () => {
    setLimitCount(prev => prev + 20);
  };

  const sortedPosts = useMemo(() => {
    if (activeFilter === 'latest') {
      return posts; // Already sorted by backend, but could ensure client-side sort if needed
    }
    if (activeFilter === 'popular') {
      return [...posts].sort((a, b) => {
        const scoreA = (a.likes?.length || 0) + (a.comments?.length || 0);
        const scoreB = (b.likes?.length || 0) + (b.comments?.length || 0);
        return scoreB - scoreA;
      });
    }
    if (activeFilter === 'following') {
      return []; // Not implemented yet
    }
    return posts;
  }, [posts, activeFilter]);
  
  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    const result = await ProfessionalGroupsService.getAllGroups();
    if (result.success) {
      setGroups(result.data);
    } else {
      toast({ title: "Error", description: "Failed to load groups", variant: "destructive" });
    }
    setIsLoadingGroups(false);
  }, [toast]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleSelectGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        setSelectedGroup(group);
        setActiveTab('group');
    }
  };

  const handleBackToPublic = () => {
    setSelectedGroup(null);
    setActiveTab('public');
  };

  const SidebarContentLeft = () => (
    <div className="space-y-6">
      {activeTab === 'public' ? (
        <GroupChat />
      ) : (
        selectedGroup && (
          <GroupMessages 
            group={selectedGroup}
            onBack={handleBackToPublic}
          />
        )
      )}
      
      <ProfessionalGroupsList 
        groups={groups}
        loading={isLoadingGroups}
        onGroupSelect={handleSelectGroup}
        onRefresh={loadGroups}
      />
    </div>
  );

  const SidebarContentRight = () => (
    <RecommendedJobs />
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                ت
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t.header.title}</h1>
                <p className="text-sm text-muted-foreground">{t.header.subtitle}</p>
              </div>
            </div>
            
            {selectedGroup && (
              <div className="flex items-center gap-2 bg-card rounded-lg p-1 w-full md:w-auto overflow-x-auto">
                <button
                  onClick={handleBackToPublic}
                  className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'public' 
                      ? 'bg-card text-primary shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  💬 {t.tabs.publicChat}
                </button>
                <button
                  className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'group' 
                      ? 'bg-card text-accent shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  👥 {selectedGroup.name}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile Action Buttons */}
        <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                        Groups & Chat
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto">
                    <div className="pt-6">
                        <SidebarContentLeft />
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                        Jobs
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto">
                    <div className="pt-6">
                        <SidebarContentRight />
                    </div>
                </SheetContent>
            </Sheet>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Chat and Groups (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="sticky top-24">
               <SidebarContentLeft />
            </div>
          </aside>

          {/* Main Content - Posts */}
          <div className="lg:col-span-2">
            {currentUser && (
              <div className="mb-6">
                <CreatePost user={currentUser} />
              </div>
            )}

            <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
              <div className="flex border-b border-border overflow-x-auto">
                <button 
                  onClick={() => setActiveFilter('latest')}
                  className={`flex-1 min-w-[100px] py-3 px-4 text-center font-medium transition-colors whitespace-nowrap ${
                    activeFilter === 'latest' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.feed.latest}
                </button>
                <button 
                  onClick={() => setActiveFilter('popular')}
                  className={`flex-1 min-w-[100px] py-3 px-4 text-center font-medium transition-colors whitespace-nowrap ${
                    activeFilter === 'popular' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.feed.popular}
                </button>
                <button 
                  onClick={() => setActiveFilter('following')}
                  className={`flex-1 min-w-[100px] py-3 px-4 text-center font-medium transition-colors whitespace-nowrap ${
                    activeFilter === 'following' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.feed.following}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <PostFeed 
                posts={sortedPosts} 
                currentUserId={currentUser?.id || ''} 
                onLoadMore={handleLoadMore}
                hasMore={activeFilter === 'latest' && posts.length >= limitCount}
                isLoading={isLoadingPosts}
              />
            </div>
          </div>

          {/* Right Sidebar - Recommended Jobs (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <SidebarContentRight />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
