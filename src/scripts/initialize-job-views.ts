/**
 * Migration Script: Initialize views field for all existing jobs
 * 
 * Run this once to add the "views" field to all job documents in Firestore
 * that don't already have it.
 * 
 * Usage:
 * 1. Import this in your admin dashboard or run via API route
 * 2. Call initializeAllJobViews()
 */

import { db } from '@/firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

/**
 * Initialize views field for all existing jobs
 */
export async function initializeAllJobViews(): Promise<{
  success: boolean;
  updated: number;
  skipped: number;
  errors: number;
}> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return { success: false, updated: 0, skipped: 0, errors: 0 };
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const jobsRef = collection(db, 'jobs');
    const jobsSnapshot = await getDocs(jobsRef);

    console.log(`Found ${jobsSnapshot.size} jobs to process...`);

    for (const jobDoc of jobsSnapshot.docs) {
      try {
        const data = jobDoc.data();
        
        // Only update if views field doesn't exist
        if (data.views === undefined) {
          const jobRef = doc(db, 'jobs', jobDoc.id);
          await updateDoc(jobRef, {
            views: 0,
          });
          updated++;
          console.log(`✓ Initialized views for job: ${data.title || jobDoc.id}`);
        } else {
          skipped++;
          console.log(`- Skipped job (already has views): ${data.title || jobDoc.id}`);
        }
      } catch (err) {
        errors++;
        console.error(`✗ Error updating job ${jobDoc.id}:`, err);
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`✓ Updated: ${updated} jobs`);
    console.log(`- Skipped: ${skipped} jobs`);
    console.log(`✗ Errors: ${errors} jobs`);

    return { success: true, updated, skipped, errors };
  } catch (error) {
    console.error('Error initializing job views:', error);
    return { success: false, updated, skipped, errors };
  }
}

/**
 * Get statistics about job views
 */
export async function getJobViewsStats(): Promise<{
  totalJobs: number;
  jobsWithViews: number;
  jobsWithoutViews: number;
  totalViews: number;
}> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return { totalJobs: 0, jobsWithViews: 0, jobsWithoutViews: 0, totalViews: 0 };
  }

  try {
    const jobsRef = collection(db, 'jobs');
    const jobsSnapshot = await getDocs(jobsRef);

    let jobsWithViews = 0;
    let jobsWithoutViews = 0;
    let totalViews = 0;

    // TODO: strict type: replace (doc: any) with QueryDocumentSnapshot in strict pass
    jobsSnapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      if (data.views !== undefined) {
        jobsWithViews++;
        totalViews += data.views || 0;
      } else {
        jobsWithoutViews++;
      }
    });

    return {
      totalJobs: jobsSnapshot.size,
      jobsWithViews,
      jobsWithoutViews,
      totalViews,
    };
  } catch (error) {
    console.error('Error getting job views stats:', error);
    return { totalJobs: 0, jobsWithViews: 0, jobsWithoutViews: 0, totalViews: 0 };
  }
}
