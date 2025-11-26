import { db } from '@/firebase/config';
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';

/**
 * Job Tracking Service - Track views and interactions with job postings
 */

/**
 * Increment view count for a job when a user views it
 * Uses Firestore's increment() to atomically update the counter
 * 
 * @param jobId - The ID of the job being viewed
 * @param userId - Optional user ID for tracking (can be used for analytics later)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function trackJobView(jobId: string, userId?: string): Promise<boolean> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return false;
  }

  try {
    const jobRef = doc(db, 'jobs', jobId);
    
    // Check if job exists
    const jobSnap = await getDoc(jobRef);
    if (!jobSnap.exists()) {
      console.error(`Job ${jobId} does not exist.`);
      return false;
    }

    // Increment the views counter atomically
    await updateDoc(jobRef, {
      views: increment(1),
      lastViewedAt: new Date(),
    });

    // Optional: Track individual view events for analytics
    if (userId) {
      await trackViewEvent(jobId, userId);
    }

    return true;
  } catch (error) {
    console.error('Error tracking job view:', error);
    return false;
  }
}

/**
 * Track individual view events (optional - for detailed analytics)
 * Creates a subcollection under the job document to track who viewed it and when
 * 
 * @param jobId - The ID of the job
 * @param userId - The ID of the user viewing the job
 */
async function trackViewEvent(jobId: string, userId: string): Promise<void> {
  if (!db) return;

  try {
    const viewRef = doc(db, 'jobs', jobId, 'views', userId);
    const viewSnap = await getDoc(viewRef);

    if (!viewSnap.exists()) {
      // First time this user views this job
      await setDoc(viewRef, {
        userId,
        firstViewedAt: new Date(),
        lastViewedAt: new Date(),
        viewCount: 1,
      });
    } else {
      // User has viewed this job before - update
      await updateDoc(viewRef, {
        lastViewedAt: new Date(),
        viewCount: increment(1),
      });
    }
  } catch (error) {
    console.error('Error tracking view event:', error);
  }
}

/**
 * Initialize views field for existing jobs that don't have it
 * Useful for migration - run once to add views field to all existing jobs
 * 
 * @param jobId - The ID of the job
 */
export async function initializeJobViews(jobId: string): Promise<boolean> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return false;
  }

  try {
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      console.error(`Job ${jobId} does not exist.`);
      return false;
    }

    const data = jobSnap.data();
    
    // Only initialize if views field doesn't exist
    if (data.views === undefined) {
      await updateDoc(jobRef, {
        views: 0,
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing job views:', error);
    return false;
  }
}

/**
 * Get unique view count (number of unique users who viewed the job)
 * 
 * @param jobId - The ID of the job
 * @returns Promise<number> - Number of unique viewers
 */
export async function getUniqueViewCount(jobId: string): Promise<number> {
  if (!db) {
    return 0;
  }

  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const viewsRef = collection(db, 'jobs', jobId, 'views');
    const viewsSnap = await getDocs(viewsRef);
    
    return viewsSnap.size;
  } catch (error) {
    console.error('Error getting unique view count:', error);
    return 0;
  }
}
