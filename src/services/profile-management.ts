import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface UserProfile {
  id: string;
  userType: 'seeker' | 'employer';
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  // Seeker specific
  jobTitle?: string;
  country?: string;
  city?: string;
  skills?: string[];
  experience?: any[];
  // Employer specific
  companyNameEn?: string;
  companyNameAr?: string;
  industry?: string;
  companySize?: string;
  // Common
  bio?: string;
  nationality?: string;
}

/**
 * Fetch all user profiles (seekers and employers)
 */
export async function getAllProfiles(): Promise<UserProfile[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const profiles: UserProfile[] = [];

    // Fetch all seekers
    const seekersRef = collection(db, 'seekers');
    const seekersSnapshot = await getDocs(seekersRef);
    
    seekersSnapshot.forEach((doc) => {
      const data = doc.data();
      profiles.push({
        id: doc.id,
        userType: 'seeker',
        name: data.fullName || data.name || 'Unknown',
        email: data.email || 'No email',
        phone: data.phoneNumber ? `${data.phoneCode || ''} ${data.phoneNumber}`.trim() : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        jobTitle: data.jobTitle,
        country: data.country,
        city: data.city,
        skills: data.skills || [],
        experience: data.experience || [],
        bio: data.bio,
        nationality: data.nationality,
      });
    });

    // Fetch all employers
    const employersRef = collection(db, 'employers');
    const employersSnapshot = await getDocs(employersRef);
    
    employersSnapshot.forEach((doc) => {
      const data = doc.data();
      profiles.push({
        id: doc.id,
        userType: 'employer',
        name: data.companyNameEn || data.companyNameAr || data.fullName || 'Unknown Company',
        email: data.email || 'No email',
        phone: data.phoneNumber ? `${data.phoneCode || ''} ${data.phoneNumber}`.trim() : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        companyNameEn: data.companyNameEn,
        companyNameAr: data.companyNameAr,
        industry: data.industry,
        companySize: data.companySize,
        bio: data.bio,
        country: data.country,
        city: data.city,
      });
    });

    // Sort by creation date (newest first)
    profiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return profiles;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
}

/**
 * Get detailed profile information
 */
export async function getProfileDetails(userId: string, userType: 'seeker' | 'employer'): Promise<any> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return null;
  }

  try {
    const collectionName = userType === 'seeker' ? 'seekers' : 'employers';
    const profileRef = doc(db, collectionName, userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      return {
        id: profileSnap.id,
        userType,
        ...profileSnap.data(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching profile details:', error);
    return null;
  }
}

/**
 * Delete a user profile
 */
export async function deleteProfile(userId: string, userType: 'seeker' | 'employer'): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const collectionName = userType === 'seeker' ? 'seekers' : 'employers';
    const profileRef = doc(db, collectionName, userId);
    
    await deleteDoc(profileRef);
    
    console.log(`Successfully deleted ${userType} profile: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return { success: false, error: 'Failed to delete profile.' };
  }
}

/**
 * Get profile statistics
 */
export async function getProfileStats() {
  if (!db) {
    console.error('Firestore is not initialized.');
    return { totalSeekers: 0, totalEmployers: 0, recentProfiles: 0 };
  }

  try {
    const seekersRef = collection(db, 'seekers');
    const employersRef = collection(db, 'employers');
    
    const [seekersSnapshot, employersSnapshot] = await Promise.all([
      getDocs(seekersRef),
      getDocs(employersRef),
    ]);

    const totalSeekers = seekersSnapshot.size;
    const totalEmployers = employersSnapshot.size;

    // Count profiles created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let recentProfiles = 0;
    seekersSnapshot.forEach(doc => {
      const createdAt = doc.data().createdAt?.toDate();
      if (createdAt && createdAt > thirtyDaysAgo) recentProfiles++;
    });
    employersSnapshot.forEach(doc => {
      const createdAt = doc.data().createdAt?.toDate();
      if (createdAt && createdAt > thirtyDaysAgo) recentProfiles++;
    });

    return { totalSeekers, totalEmployers, recentProfiles };
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return { totalSeekers: 0, totalEmployers: 0, recentProfiles: 0 };
  }
}
