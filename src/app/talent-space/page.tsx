'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Loader } from 'lucide-react';


export default function TalentSpacePage() {
  const [selectedGroup, setSelectedGroup] = useState<ProfessionalGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'group'>('public');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const currentUser: User | null = user ? { id: user.uid, name: user.displayName || 'User', headline: '', avatarUrl: user.photoURL || '' } : null;

  const loadPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    const result = await TalentSpaceService.getAllPosts(50);
    if (result.success) {
      setPosts(result.data);
    } else {
      toast({ title: "Error", description: "Failed to load posts", variant: "destructive" });
    }
    setIsLoadingPosts(false);
  }, [toast]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPosts();
  }, [loadPosts]);

  const handleSelectGroup = (group: ProfessionalGroup) => {
    setSelectedGroup(group);
    setActiveTab('group');
  };

  const handleBackToPublic = () => {
    setSelectedGroup(null);
    setActiveTab('public');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
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
                onSelectGroup={handleSelectGroup}
              />
            </div>
          </aside>

          <div className="lg:col-span-2">
            {currentUser && <CreatePost user={currentUser} onPostCreated={loadPosts} />}
            <div className="mt-6">
              {isLoadingPosts ? (
                <div className="flex justify-center items-center h-64 bg-card rounded-lg">
                    <Loader className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <PostFeed posts={posts} onUpdate={loadPosts} currentUserId={currentUser?.id || ''} />
              )}
            </div>
          </div>

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
