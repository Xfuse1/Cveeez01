import type { User, Post, Group, Job, Message } from '@/types/talent-space';

export const users: User[] = [
  {
    id: 'u1',
    name: 'Ahmed Salah',
    headline: 'CEO & Founder @ CVEEEZ',
    avatarUrl: 'https://images.unsplash.com/photo-1589386417686-0d34b5903d23?w=100&h=100&fit=crop',
  },
  {
    id: 'u2',
    name: 'Fatima Al-Zahra',
    headline: 'Head of AI @ CVEEEZ',
    avatarUrl: 'https://images.unsplash.com/photo-1573496527892-904f897eb744?w=100&h=100&fit=crop',
  },
  {
    id: 'u3',
    name: 'Youssef Mohamed',
    headline: 'Lead Product Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  },
];

export const posts: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    content: `Excited to share that our team has just rolled out a new feature for the AI CV Builder! It now provides real-time suggestions to optimize your resume for ATS systems. #AI #CareerTech #CV`,
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800',
    likes: 125,
    comments: 23,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'p2',
    userId: 'u3',
    content: `Just published a new case study on designing for accessibility in professional networking platforms. It's crucial that our tools are inclusive for everyone. Would love to hear your thoughts!`,
    likes: 88,
    comments: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
    {
    id: 'p3',
    userId: 'u1',
    content: `We're hiring a Senior Frontend Developer to join our growing team at CVEEEZ! If you're passionate about building beautiful, scalable user interfaces with React and Next.js, check out the link in our jobs section. #Hiring #Frontend #ReactDev`,
    likes: 210,
    comments: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const groups: Group[] = [
    { id: 'g1', name: 'Web Developers', avatarUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=100&h=100&fit=crop', memberCount: 1250 },
    { id: 'g2', name: 'UI/UX Designers', avatarUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=100&h=100&fit=crop', memberCount: 890 },
    { id: 'g3', name: 'Digital Marketers', avatarUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=100&h=100&fit=crop', memberCount: 2300 },
];

export const jobs: Job[] = [
    { id: 'j1', title: 'Senior Frontend Developer', company: 'CVEEEZ', location: 'Cairo, Egypt' },
    { id: 'j2', title: 'Product Manager', company: 'Tech Innovators', location: 'Remote' },
    { id: 'j3', title: 'Data Scientist', company: 'Data Insights Co.', location: 'Alexandria, Egypt' },
    { id: 'j4', title: 'UX Researcher', company: 'UserFirst Studios', location: 'Remote' },
];

export const messages: Message[] = [];
