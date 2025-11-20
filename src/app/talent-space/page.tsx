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
import { Loader } from 'lucide-react';


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
    window.scrollTo(0, 0);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                ت
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.header.title}</h1>
                <p className="text-sm text-gray-500">{t.header.subtitle}</p>
              </div>
            </div>
            
            {selectedGroup && (
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handleBackToPublic}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'public' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  💬 {t.tabs.publicChat}
                </button>
                <button
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'group' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Chat and Groups */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
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
          </aside>

          {/* Main Content - Posts */}
          <div className="lg:col-span-2">
            {currentUser && (
              <div className="mb-6">
                <CreatePost user={currentUser} onPostCreated={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button 
                  onClick={() => setActiveFilter('latest')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeFilter === 'latest' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.feed.latest}
                </button>
                <button 
                  onClick={() => setActiveFilter('popular')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeFilter === 'popular' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.feed.popular}
                </button>
                <button 
                  onClick={() => setActiveFilter('following')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeFilter === 'following' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
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

          {/* Right Sidebar - Recommended Jobs */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <RecommendedJobs />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
