export interface User {
  id: string;
  name: string;
  headline: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  likes: number;
  likedBy?: string[]; // Array of user IDs who liked the post
  comments: number;
  createdAt: string;
}

export interface Group {
    id: string;
    name: string;
    avatarUrl: string;
    memberCount: number;
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
}

export interface Message {
    id: string;
    userId: string;
    groupId?: string; // Optional: for group-specific messages
    content: string;
    createdAt: string;
}
