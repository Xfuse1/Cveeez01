# Admin Account Setup Guide

## ✅ Fixed Issues

1. **Enabled admin email** in `src/services/admin.ts`
   - Added `admin@gmail.com` to ADMIN_EMAILS array
   
2. **Added admin access check** to migration page
   - Now properly verifies admin access before loading
   - Shows loading spinner during verification

## 🔐 Create Admin Account in Firebase

You need to create the admin user account in Firebase Authentication. Here's how:

### Method 1: Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Authentication**
   - Click "Authentication" in the left sidebar
   - Click "Users" tab

3. **Add User**
   - Click "Add user" button
   - Email: `admin@gmail.com`
   - Password: `Admin123`
   - Click "Add user"

4. **Done!** You can now login with these credentials

### Method 2: Using Your App's Signup Page

1. **Go to Signup Page**
   - Navigate to `/signup/employer` or `/signup/seeker`
   
2. **Create Account**
   - Email: `admin@gmail.com`
   - Password: `Admin123`
   - Fill other required fields
   
3. **The system will recognize this email as admin**
   - Because it's in the ADMIN_EMAILS whitelist
   - You'll have full admin access

### Method 3: Firebase CLI (Advanced)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create user (this requires Firebase Admin SDK setup)
```

## 🎯 What Happens After Login

When you login with `admin@gmail.com`:

1. ✅ Authentication succeeds
2. ✅ System checks if email is in ADMIN_EMAILS array
3. ✅ Grants admin access
4. ✅ Redirects to `/admin` dashboard
5. ✅ Shows "Welcome back, Admin!" toast message
6. ✅ Full access to:
   - Admin Dashboard
   - Manage Services
   - Migrate Services
   - Manage Admins
   - Pricing Management
   - All other admin features

## 🔍 Verification Steps

After creating the account, verify it works:

1. **Login Test**
   - Go to `/login`
   - Email: `admin@gmail.com`
   - Password: `Admin123`
   - Should redirect to `/admin` dashboard

2. **Access Test**
   - Try accessing `/admin/manage-services`
   - Try accessing `/admin/migrate-services`
   - Should NOT see "Access Denied" error

3. **Migration Test**
   - Go to `/admin/migrate-services`
   - Click "Start Migration"
   - Should see services being imported

## 🚨 Troubleshooting

### Issue: "Access Denied" error
**Solution**: 
- Make sure the account exists in Firebase Authentication
- Verify email is exactly `admin@gmail.com` (case-sensitive)
- Check that ADMIN_EMAILS array includes this email
- Clear browser cache and try again

### Issue: "User not found" at login
**Solution**: 
- Create the user account in Firebase Console first
- Make sure you're using the correct Firebase project

### Issue: Account exists but still denied
**Solution**:
- Check browser console for errors
- Verify Firebase config in `.env.local`
- Make sure Firestore security rules allow admin access

### Issue: Can't create account via signup
**Solution**:
- Use Firebase Console method instead
- Or create any account, then add email to ADMIN_EMAILS

## 📝 Adding More Admins

To add additional admin users:

1. **Open** `src/services/admin.ts`

2. **Add email to array**:
```typescript
const ADMIN_EMAILS: string[] = [
  'admin@gmail.com',
  'another-admin@example.com',  // Add here
  'owner@cveeez.com',            // Add here
];
```

3. **Or add UID** (if you know the Firebase UID):
```typescript
const ADMIN_UIDS: string[] = [
  'abc123xyz456',  // Firebase user UID
];
```

4. **Save and deploy**

## 🔒 Security Best Practices

1. **Use Strong Passwords**
   - `Admin123` is just for testing
   - Change to a stronger password in production

2. **Enable 2FA** (Two-Factor Authentication)
   - Set up in Firebase Console
   - Under Authentication > Sign-in method

3. **Limit Admin Emails**
   - Only add trusted users
   - Review list regularly

4. **Use Environment Variables** (Advanced)
   - Store admin emails in `.env.local`
   - Don't commit to Git

5. **Firestore Security Rules**
   - Restrict write access to admins only
   - Example rule:
   ```javascript
   match /ecommerce_services/{service} {
     allow read: if true;
     allow write: if request.auth.token.email in ['admin@gmail.com'];
   }
   ```

## ✨ Quick Start

**Fastest way to get started:**

1. Open Firebase Console
2. Go to Authentication > Users
3. Add user: `admin@gmail.com` / `Admin123`
4. Login at your app's `/login` page
5. Access admin dashboard at `/admin`
6. Start managing services!

---

**Status**: ✅ Admin system is now properly configured and ready to use!

**Next Step**: Create the admin account in Firebase, then login to access all admin features.
