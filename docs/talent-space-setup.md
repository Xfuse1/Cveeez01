# Talent Space - Setup & Usage Guide

## Overview

Talent Space is a professional networking feature that allows users to:
- Create and share posts with text, images, videos, and links
- Like and comment on posts
- Join groups and participate in discussions
- Send messages in global and group chats
- View recommended jobs

## Architecture

The system uses a **fallback mechanism** to ensure content is always available:

1. **Primary Data Source**: Firebase Firestore
2. **Fallback Data Source**: Mock data from `src/data/talent-space.ts`

### How Fallback Works

When the application tries to fetch data from Firestore:
- If Firestore returns data → Use Firestore data
- If Firestore is empty → Use mock data
- If Firestore connection fails → Use mock data

This ensures users always see content, even if:
- Firebase is not configured
- There's no internet connection
- The database is empty (first time setup)

## Firebase Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firestore Collections Structure

The application uses the following Firestore collections:

#### 1. `posts` Collection
```typescript
{
  id: string (auto-generated)
  userId: string
  content: string
  imageUrl?: string
  videoUrl?: string
  linkUrl?: string
  likes: number
  likedBy: string[] // Array of user IDs
  comments: number
  createdAt: string (ISO format)
}
```

#### 2. `comments` Collection
```typescript
{
  id: string (auto-generated)
  postId: string
  userId: string
  content: string
  createdAt: string (ISO format)
}
```

#### 3. `messages` Collection
```typescript
{
  id: string (auto-generated)
  userId: string
  groupId?: string // Optional, for group chats
  content: string
  createdAt: string (ISO format)
}
```

#### 4. `users` Collection (Optional)
```typescript
{
  id: string (matches Auth UID)
  name: string
  headline: string
  avatarUrl: string
}
```

### Firestore Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Posts
    match /posts/{postId} {
      allow read: if true; // Anyone can read posts
      allow create: if request.auth != null; // Only authenticated users can create
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Comments
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Users
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firebase Storage Rules

For uploading images and videos:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Features

### 1. Create Posts

Users can create posts with:
- Text content
- Images (uploaded to Firebase Storage)
- Videos (uploaded to Firebase Storage)
- Links (with preview)

**Implementation**: `src/components/talent-space/CreatePost.tsx`

### 2. Like Posts

Users can like/unlike posts. The system uses optimistic updates for better UX:
- UI updates immediately
- If the operation fails, the UI reverts
- Like count is stored in Firestore

**Implementation**: `src/components/talent-space/PostCard.tsx`

### 3. Comment on Posts

Users can add comments to posts. Comments are:
- Stored in a separate `comments` collection
- Linked to posts via `postId`
- Displayed in chronological order

**Implementation**: `src/components/talent-space/PostCard.tsx`

### 4. Chat System

Two types of chat:
- **Global Chat**: Available to all users
- **Group Chat**: Specific to each group

**Implementation**: `src/components/talent-space/ChatInterface.tsx`

### 5. Search

Users can search for:
- Post content
- Author names
- Author headlines

**Implementation**: `src/components/talent-space/SearchBar.tsx`

## Mock Data

Mock data is located in `src/data/talent-space.ts` and includes:

- **3 Users**: Sample profiles with avatars
- **3 Posts**: Example posts with likes and comments
- **3 Groups**: Professional groups
- **4 Jobs**: Job listings
- **5 Messages**: Sample chat messages (global and group)

This data is automatically used when Firestore is empty or unavailable.

## Troubleshooting

### Posts Not Showing

**Symptom**: No posts appear on the page

**Solutions**:
1. Check browser console for errors
2. Verify Firebase configuration in `.env.local`
3. Check Firestore security rules
4. Ensure mock data is being used (check console logs)

### Cannot Create Posts

**Symptom**: Posts fail to create with error message

**Solutions**:
1. Verify user is authenticated
2. Check Firestore security rules allow creation
3. Check Firebase Storage rules for media uploads
4. Verify internet connection

### Images Not Uploading

**Symptom**: Image upload fails

**Solutions**:
1. Check Firebase Storage configuration
2. Verify storage rules allow uploads
3. Check file size (Firebase has limits)
4. Ensure `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is set correctly

### Chat Messages Not Sending

**Symptom**: Messages don't appear after sending

**Solutions**:
1. Check Firestore rules for messages collection
2. Verify user authentication
3. Check console for error messages

## Development Tips

### Testing with Mock Data

To test the fallback system:
1. Disable internet connection
2. Clear Firestore collections
3. The app should automatically use mock data

### Adding New Mock Data

Edit `src/data/talent-space.ts`:

```typescript
export const posts: Post[] = [
  // Add your mock posts here
  {
    id: 'p4',
    userId: 'u1',
    content: 'New test post',
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
  }
];
```

### Console Logging

The application logs important events:
- `Fetched X posts from Firestore` - Successful fetch
- `No posts in Firestore, using mock data` - Fallback activated
- `Error fetching posts, using mock data:` - Error occurred
- `Creating post with user:` - Post creation started
- `Post created successfully with ID:` - Post created

## Performance Considerations

1. **Optimistic Updates**: Likes update UI immediately for better UX
2. **Lazy Loading**: Components only fetch data when needed
3. **Caching**: Posts are cached in state until refresh
4. **Mock Data**: Instant loading when Firestore is unavailable

## Security Notes

1. **Authentication Required**: Users must be logged in to:
   - Create posts
   - Like posts
   - Comment on posts
   - Send messages

2. **Authorization**: Users can only:
   - Edit/delete their own posts
   - Edit/delete their own comments
   - Edit/delete their own messages

3. **File Uploads**: 
   - Only authenticated users can upload
   - Files are stored under user-specific paths
   - Consider adding file size and type validation

## Future Enhancements

Potential improvements:
1. Real-time updates using Firestore listeners
2. Pagination for posts and comments
3. User profiles and follow system
4. Notifications for likes and comments
5. Advanced search with filters
6. Post editing and deletion
7. Rich text editor for posts
8. Image compression before upload
9. Video thumbnails
10. Direct messaging between users

## Support

For issues or questions:
1. Check console logs for error messages
2. Review Firestore security rules
3. Verify Firebase configuration
4. Check this documentation

---

Last Updated: 2024
