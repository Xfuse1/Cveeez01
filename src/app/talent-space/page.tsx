'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GroupSidebar } from '@/components/talent-space/GroupSidebar';
import { ChatInterface } from '@/components/talent-space/ChatInterface';
import { CreatePost } from '@/components/talent-space/CreatePost';
import { PostFeed } from '@/components/talent-space/PostFeed';
import { JobListings } from '@/components/talent-space/JobListings';
import { posts, users, jobs, groups } from '@/data/talent-space';


export default function TalentSpacePage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/30 dark:bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <GroupSidebar groups={groups} />
            <ChatInterface />
          </aside>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost user={users[0]} />
            <PostFeed posts={posts} users={users} />
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
