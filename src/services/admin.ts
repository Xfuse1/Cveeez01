import { db } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Admin service for managing admin users and permissions
 */

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
}

/**
 * Check if a user is an admin by checking their UID against a whitelist
 * You can also use email or check Firestore for admin status
 */
const ADMIN_UIDS: string[] = [
  // Add your admin user IDs here
  // Example: 'abc123xyz456',
];

const ADMIN_EMAILS: string[] = [
  // Add your admin emails here
  // 'admin@gmail.com', // This was causing the issue
  // Example: 'owner@cveeez.com',
];

/**
 * Check if user is admin by UID or email
 */
export function isAdminByCredentials(uid: string, email: string | null): boolean {
  return ADMIN_UIDS.includes(uid) || (email !== null && ADMIN_EMAILS.includes(email));
}

/**
 * Get admin user data from Firestore
 */
export async function getAdminUser(uid: string): Promise<AdminUser | null> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return null;
  }

  try {
    const adminRef = doc(db, 'admins', uid);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {
      const data = adminSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        isAdmin: data.isAdmin || false,
        role: data.role || 'admin',
        permissions: data.permissions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
}

/**
 * Check if user has admin access
 * First checks hardcoded lists, then checks Firestore
 */
export async function checkAdminAccess(
  uid: string,
  email: string | null
): Promise<{ isAdmin: boolean; role?: string; message?: string }> {
  // First check hardcoded admin lists
  if (isAdminByCredentials(uid, email)) {
    return { isAdmin: true, role: 'super_admin' };
  }

  // Then check Firestore admin collection
  try {
    const adminUser = await getAdminUser(uid);
    if (adminUser && adminUser.isAdmin) {
      return { isAdmin: true, role: adminUser.role };
    }
  } catch (error) {
    console.error('Error checking admin access:', error);
  }

  return { 
    isAdmin: false, 
    message: 'You do not have permission to access the admin dashboard.' 
  };
}

/**
 * Create or update admin user in Firestore
 * Use this to grant admin access to a user
 */
export async function setAdminUser(
  uid: string,
  email: string,
  role: 'super_admin' | 'admin' | 'moderator' = 'admin',
  permissions: string[] = []
): Promise<boolean> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return false;
  }

  try {
    const adminRef = doc(db, 'admins', uid);
    await setDoc(adminRef, {
      uid,
      email,
      isAdmin: true,
      role,
      permissions,
      createdAt: new Date(),
      lastLogin: new Date(),
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error setting admin user:', error);
    return false;
  }
}

/**
 * Update last login time for admin
 */
export async function updateAdminLastLogin(uid: string): Promise<void> {
  if (!db) return;

  try {
    const adminRef = doc(db, 'admins', uid);
    await setDoc(adminRef, {
      lastLogin: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating admin last login:', error);
  }
}
