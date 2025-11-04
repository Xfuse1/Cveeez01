export interface User {
  id: string;
  name: string;
  headline: string;
  avatarUrl: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: number;
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
    content: string;
    createdAt: string;
}
