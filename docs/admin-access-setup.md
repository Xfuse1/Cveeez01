# Admin Access Setup Guide

This guide explains how to set up and manage admin access to the admin dashboard (`/admin` route).

## How Admin Access Control Works

The admin dashboard at `/admin` is protected by multiple layers of security:

1. **Authentication Check**: User must be logged in
2. **Authorization Check**: User must have admin privileges
3. **Layout Protection**: The `layout.tsx` verifies access before rendering any admin pages

## Methods to Grant Admin Access

There are **two methods** to grant admin access to a user:

### Method 1: Hardcoded Admin Lists (Recommended for initial setup)

Edit `src/services/admin.ts` and add the user's credentials:

```typescript
const ADMIN_UIDS: string[] = [
  'your-user-firebase-uid-here',
  'another-admin-uid',
];

const ADMIN_EMAILS: string[] = [
  'admin@cveeez.com',
  'owner@cveeez.com',
];
```

**How to find your Firebase UID:**
1. Sign in to your app
2. Open browser console (F12)
3. Type: `localStorage` and look for Firebase auth data
4. Or check Firebase Console → Authentication → Users

**Pros:**
- Fast and simple
- No database changes needed
- Works immediately after deployment

**Cons:**
- Requires code changes and redeployment
- Not suitable for frequently changing admin list

### Method 2: Firestore Database (Recommended for production)

Add admin users to the `admins` collection in Firestore:

**Using Firebase Console:**
1. Go to Firebase Console → Firestore Database
2. Create/navigate to `admins` collection
3. Add a document with the user's UID as the document ID
4. Set these fields:
   ```
   uid: "user-firebase-uid"
   email: "user@example.com"
   isAdmin: true
   role: "admin" (or "super_admin" or "moderator")
   permissions: [] (array of permission strings)
   createdAt: (Timestamp) now
   ```

**Using the provided helper function:**

You can create a temporary admin setup route or run this in your dev environment:

```typescript
import { setAdminUser } from '@/services/admin';

// Example: Grant admin access
await setAdminUser(
  'user-firebase-uid',
  'admin@cveeez.com',
  'super_admin',
  ['manage_users', 'manage_jobs', 'manage_payments']
);
```

**Pros:**
- Dynamic - no code changes needed
- Can be managed through admin UI
- Different permission levels (super_admin, admin, moderator)

**Cons:**
- Requires Firestore setup
- Slightly slower (database query)

## Admin Roles

The system supports three admin roles:

1. **super_admin**: Full access to everything
2. **admin**: Standard admin access
3. **moderator**: Limited admin access (can be customized)

## Access Control Flow

When a user tries to access `/admin`:

1. ✅ Check if user is authenticated (logged in)
2. ✅ Check hardcoded ADMIN_UIDS and ADMIN_EMAILS
3. ✅ If not found, check Firestore `admins` collection
4. ✅ If admin access confirmed, render admin dashboard
5. ❌ If not admin, redirect to home with error message

## Testing Admin Access

### Test as Admin:
1. Add your UID or email to the admin lists
2. Sign in to the app
3. Navigate to `/admin`
4. You should see the admin dashboard

### Test as Non-Admin:
1. Sign in with a non-admin account
2. Try to access `/admin` directly
3. You should be redirected to home page

## Security Best Practices

1. **Never expose admin credentials in client code**
2. **Use environment variables for sensitive data** (if needed)
3. **Regularly audit admin access list**
4. **Use role-based permissions for granular control**
5. **Log all admin actions** (implement audit logging)

## Troubleshooting

### "Access Denied" even though I'm an admin
- Verify your UID/email is correctly added
- Check browser console for errors
- Ensure Firestore rules allow reading `admins` collection
- Clear browser cache and try again

### Admin page loads but no data
- Check Firebase Firestore rules
- Verify user has proper permissions
- Check browser console for API errors

### Redirect loop
- Check that auth provider is properly initialized
- Verify no conflicting redirects in middleware
- Clear browser cookies/localStorage

## Firestore Security Rules

Add these rules to allow admins to read their admin status:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read their own admin status
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only allow writes through admin panel or Cloud Functions
    }
  }
}
```

## Next Steps

1. Add yourself as the first admin using Method 1
2. Build an admin management UI to add/remove admins
3. Implement audit logging for admin actions
4. Add role-based permission checks for sensitive operations
5. Create admin-only API endpoints with proper authorization

## Quick Start

To get started immediately:

1. Open `src/services/admin.ts`
2. Add your Firebase UID to `ADMIN_UIDS` array
3. Save the file (hot reload will update)
4. Navigate to `/admin`
5. You should have access!

Example:
```typescript
const ADMIN_UIDS: string[] = [
  'abc123def456', // Replace with your actual Firebase UID
];
```

---

**Need Help?**
- Check Firebase Console for your user UID
- Review browser console for error messages
- Verify you're signed in with the correct account
