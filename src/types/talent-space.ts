import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  headline: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  likes: string[];
}

export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  media: string[];
  tags: string[];
  likes: string[];
  comments: Comment[];
  shares: number;
  createdAt: Date;
  updatedAt: Date;
  isEdited?: boolean;
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
  type: string;
  category: string;
  description: string;
  requirements: string[];
  salary: string;
  tags: string[];
  applications: number;
  createdAt: Date;
  isActive: boolean;
}

export interface Message {
  id: string;
  userId: string;
  groupId?: string; // Optional: for group-specific messages
  content: string;
  createdAt: string;
}
