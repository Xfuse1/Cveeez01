import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

/**
 * Seeker Data Service - Fetch real data for job seeker dashboard
 */

export interface CVVersion {
  id: string;
  title: string;
  status: 'draft' | 'ai_running' | 'ready' | 'completed';
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedJob {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salaryRange: string;
  savedAt: Date;
}

/**
 * Get CV versions for a seeker
 */
export async function getCVVersions(seekerId: string): Promise<CVVersion[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const cvRef = collection(db, 'cvVersions');
    const q = query(
      cvRef,
      where('userId', '==', seekerId)
    );
    
    const snapshot = await getDocs(q);
    
    const cvVersions: CVVersion[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled CV',
        status: data.status || 'draft',
        score: data.score || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });

    // Sort by most recent
    return cvVersions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error fetching CV versions:', error);
    return [];
  }
}

/**
 * Get saved jobs for a seeker
 */
export async function getSavedJobs(seekerId: string): Promise<SavedJob[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const savedJobsRef = collection(db, 'savedJobs');
    const q = query(
      savedJobsRef,
      where('seekerId', '==', seekerId)
    );
    
    const snapshot = await getDocs(q);
    
    const savedJobs: SavedJob[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobId: data.jobId || '',
        jobTitle: data.jobTitle || 'Untitled Job',
        company: data.company || 'Unknown Company',
        location: data.location || 'N/A',
        salaryRange: data.salaryRange || 'Competitive',
        savedAt: data.savedAt?.toDate() || new Date(),
      };
    });

    // Sort by most recent
    return savedJobs.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return [];
  }
}

/**
 * Calculate seeker KPIs from real data
 */
export async function calculateSeekerKPIs(
  seekerId: string,
  applications: any[],
  cvVersions: CVVersion[],
  savedJobs: SavedJob[],
  walletBalance: number
): Promise<{
  profileCompleteness: number;
  cvVersions: number;
  activeApplications: number;
  savedJobs: number;
  walletBalance: number;
  lastOrderStatus: string;
}> {
  // Calculate profile completeness based on available data
  let profileCompleteness = 0;
  
  // Count active applications (not rejected or withdrawn)
  const activeApplications = applications.filter(app => 
    app.status !== 'rejected' && app.status !== 'withdrawn'
  ).length;

  // Get last order status from recent transactions
  let lastOrderStatus = 'N/A';
  
  try {
    // Fetch seeker profile to calculate completeness
    const { getSeekerProfile } = await import('@/services/firestore');
    const profile = await getSeekerProfile(seekerId);
    
    if (!profile) {
      return {
        profileCompleteness: 0,
        cvVersions: cvVersions.length,
        activeApplications,
        savedJobs: savedJobs.length,
        walletBalance,
        lastOrderStatus,
      };
    }
    
    // Check which fields are filled
    const fields = [
      (profile as any).displayName,
      (profile as any).email,
      (profile as any).phoneNumber,
      (profile as any).location,
      (profile as any).bio,
      (profile as any).skills && (profile as any).skills.length > 0,
      (profile as any).experience && (profile as any).experience.length > 0,
      (profile as any).education && (profile as any).education.length > 0,
    ];
    
    const filledFields = fields.filter(Boolean).length;
    profileCompleteness = Math.round((filledFields / fields.length) * 100);
  } catch (error) {
    console.error('Error calculating profile completeness:', error);
    profileCompleteness = 50; // Default
  }

  try {
    const { getTransactionHistory } = await import('@/services/wallet');
    const transactions = await getTransactionHistory(seekerId, 1);
    if (transactions.length > 0) {
      lastOrderStatus = transactions[0].status === 'completed' ? 'Completed' : 'Pending';
    }
  } catch (error) {
    console.error('Error fetching last order status:', error);
  }

  return {
    profileCompleteness,
    cvVersions: cvVersions.length,
    activeApplications,
    savedJobs: savedJobs.length,
    walletBalance,
    lastOrderStatus,
  };
}
