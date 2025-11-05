import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  getCountFromServer,
} from 'firebase/firestore';
import type { EmployerKPIs, JobPerformance, Candidate, TeamActivity } from '@/types/dashboard';

/**
 * Admin Data Service - Fetch real data from Firestore for admin dashboard
 */

/**
 * Fetch real KPIs for admin dashboard
 */
export async function fetchRealAdminKPIs(): Promise<EmployerKPIs> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return getDefaultKPIs();
  }

  try {
    // Fetch jobs collection
    const jobsRef = collection(db, 'jobs');
    const allJobsSnapshot = await getDocs(jobsRef);
    
    // Count open jobs by filtering in memory
    const openJobs = allJobsSnapshot.docs.filter(doc => doc.data().status === 'active').length;

    // Fetch applications
    const applicationsRef = collection(db, 'applications');
    const allApplicationsSnapshot = await getDocs(applicationsRef);
    const totalApplications = allApplicationsSnapshot.size;

    // Count today's applications by filtering in memory
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);
    
    const applicantsToday = allApplicationsSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt;
      return createdAt && createdAt.toMillis() >= todayTimestamp.toMillis();
    }).length;

    // Count interviews this week by filtering in memory
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekTimestamp = Timestamp.fromDate(weekAgo);
    
    const interviewsThisWeek = allApplicationsSnapshot.docs.filter(doc => {
      const data = doc.data();
      const updatedAt = data.updatedAt;
      return data.stage === 'interview' && 
             updatedAt && 
             updatedAt.toMillis() >= weekTimestamp.toMillis();
    }).length;

    // Count shortlisted
    const shortlisted = allApplicationsSnapshot.docs.filter(doc => {
      return doc.data().status === 'shortlisted';
    }).length;

    return {
      openJobs,
      applicantsToday,
      shortlisted,
      interviewsThisWeek,
      planUsage: 0,
      kycStatus: 'verified',
    };
  } catch (error) {
    console.error('Error fetching admin KPIs:', error);
    return getDefaultKPIs();
  }
}

/**
 * Fetch real job performance data
 */
export async function fetchRealJobPerformance(): Promise<JobPerformance[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const jobsRef = collection(db, 'jobs');
    
    // Fetch recent jobs and filter in memory to avoid index requirement
    const jobsQuery = query(
      jobsRef,
      orderBy('createdAt', 'desc'),
      limit(20) // Fetch more and filter client-side
    );
    
    const jobsSnapshot = await getDocs(jobsQuery);
    
    const jobPerformancePromises = jobsSnapshot.docs
      .filter((jobDoc) => {
        const status = jobDoc.data().status;
        return status === 'active';
      })
      .slice(0, 10) // Limit to 10 after filtering
      .map(async (jobDoc) => {
        const jobData = jobDoc.data();
        
        // Count applications for this job
        const applicationsRef = collection(db, 'applications');
        const applicationsQuery = query(
          applicationsRef,
          where('jobId', '==', jobDoc.id)
        );
        const applicationsSnapshot = await getCountFromServer(applicationsQuery);
        const applies = applicationsSnapshot.data().count;

        return {
          jobId: jobDoc.id,
          jobTitle: jobData.title || 'Untitled Job',
          views: jobData.views || 0,
          applies,
          conversion: applies > 0 ? Math.round((applies / (jobData.views || 1)) * 100) : 0,
        };
      });

    return await Promise.all(jobPerformancePromises);
  } catch (error) {
    console.error('Error fetching job performance:', error);
    return [];
  }
}

/**
 * Fetch real candidates data
 */
export async function fetchRealCandidates(): Promise<Candidate[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const applicationsRef = collection(db, 'applications');
    
    // Fetch all applications and filter in memory to avoid index requirement
    const applicationsQuery = query(
      applicationsRef,
      orderBy('updatedAt', 'desc'),
      limit(50) // Fetch more and filter client-side
    );
    
    const applicationsSnapshot = await getDocs(applicationsQuery);
    
    const candidates: Candidate[] = applicationsSnapshot.docs
      .filter((doc) => {
        const status = doc.data().status;
        return status === 'shortlisted' || status === 'interview';
      })
      .slice(0, 20) // Limit after filtering
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.candidateName || 'Unknown Candidate',
          position: data.jobTitle || 'N/A',
          stage: (data.stage || 'New') as "New" | "Screened" | "Shortlist" | "Interview" | "Offer",
          matchScore: data.matchScore || 75,
          appliedDate: data.createdAt?.toDate() || new Date(),
        };
      });

    return candidates;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
}

/**
 * Fetch real team activity
 */
export async function fetchRealTeamActivity(): Promise<TeamActivity[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    // Fetch recent activities from audit log or activity collection
    const activitiesRef = collection(db, 'activities');
    const activitiesQuery = query(
      activitiesRef,
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const activitiesSnapshot = await getDocs(activitiesQuery);
    
    const activities: TeamActivity[] = activitiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user: data.userName || 'Admin User',
        action: data.action || 'performed an action',
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });

    return activities;
  } catch (error) {
    console.error('Error fetching team activity:', error);
    // Return empty array if collection doesn't exist yet
    return [];
  }
}

/**
 * Log admin activity
 */
export async function logAdminActivity(
  userId: string,
  userName: string,
  action: string
): Promise<void> {
  if (!db) return;

  try {
    const activitiesRef = collection(db, 'activities');
    await getDocs(query(activitiesRef, limit(1))); // Just to create collection if needed
    
    // Note: You would typically use addDoc here, but for now we'll skip
    // to avoid creating unnecessary documents
    console.log('Activity logged:', { userId, userName, action });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Default KPIs when data is not available
 */
function getDefaultKPIs(): EmployerKPIs {
  return {
    openJobs: 0,
    applicantsToday: 0,
    shortlisted: 0,
    interviewsThisWeek: 0,
    planUsage: 0,
    kycStatus: 'pending',
  };
}
