
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CreatePost } from '@/components/talent-space/CreatePost';
import { JobListings } from '@/components/talent-space/JobListings';
import { SearchBar } from '@/components/talent-space/SearchBar';
import { PostFeed } from '@/components/talent-space/PostFeed';
import { jobs, users as mockUsers } from '@/data/talent-space';
import { useAuth } from '@/contexts/auth-provider';
import { Loader } from 'lucide-react';
import { getPosts, getUserById } from '@/services/talent-space';
import type { Post, User } from '@/types/talent-space';

import ProfessionalGroupsList from '@/components/ProfessionalGroupsList';
import GroupChat from '@/components/GroupChat';


export default function TalentSpacePage() {
  const { user, loading } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [postAuthors, setPostAuthors] = useState<Record<string, User>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const fetchPostsAndAuthors = useCallback(async () => {
    setIsLoadingPosts(true);
    const fetchedPosts = await getPosts();
    
    // Fetch unique authors
    const authorIds = [...new Set(fetchedPosts.map(p => p.userId))];
    const authorPromises = authorIds.map(id => getUserById(id));
    const authors = await Promise.all(authorPromises);

    const authorsMap: Record<string, User> = {};
    authors.forEach(author => {
      if (author) {
        authorsMap[author.id] = author;
      }
    });

    setPosts(fetchedPosts);
    setPostAuthors(authorsMap);
    setIsLoadingPosts(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchPostsAndAuthors();
    } else if (!loading) {
        setIsLoadingPosts(false);
    }
  }, [user, loading, fetchPostsAndAuthors]);


  const handlePostCreated = () => {
    fetchPostsAndAuthors();
  };

  const currentUser = user ? { id: user.uid, name: user.displayName || 'User', headline: '', avatarUrl: user.photoURL || '' } : null;

  const filteredPosts = posts.filter(post => {
    const author = postAuthors[post.userId];
    const query = searchQuery.toLowerCase();
    
    if (!author) return false;

    return (
      post.content.toLowerCase().includes(query) ||
      author.name.toLowerCase().includes(query) ||
      (author.headline && author.headline.toLowerCase().includes(query))
    );
  });
  
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
            <ProfessionalGroupsList />
            <GroupChat />
          </aside>
          
          <div className="lg:col-span-2 space-y-6">
            {user && currentUser && <CreatePost user={currentUser} onPostCreated={handlePostCreated} />}
            {isLoadingPosts ? (
              <div className="flex justify-center items-center h-64 bg-card rounded-lg">
                <Loader className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <PostFeed posts={filteredPosts} users={postAuthors} onPostUpdate={fetchPostsAndAuthors} />
            )}
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
