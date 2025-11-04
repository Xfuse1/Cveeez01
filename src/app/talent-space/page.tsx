'use client';

import { CreatePost } from '@/components/talent-space/CreatePost';
import { PostCard } from '@/components/talent-space/PostCard';
import { GroupSidebar } from '@/components/talent-space/GroupSidebar';
import { JobsSidebar } from '@/components/talent-space/JobsSidebar';
import { posts, users, jobs, groups } from '@/data/talent-space';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function TalentSpacePage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <GroupSidebar groups={groups} />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost user={users[0]} />
            {posts.map((post) => {
              const author = users.find((user) => user.id === post.userId);
              return author ? <PostCard key={post.id} post={post} author={author} /> : null;
            })}
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <JobsSidebar jobs={jobs} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
