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
import type { Job } from '@/types/jobs';

/**
 * Employer Data Service - Fetch real data from Firestore for employer dashboard
 */

export interface EmployerKPIs {
  openJobs: number;
  applicantsToday: number;
  shortlisted: number;
  interviewsThisWeek: number;
  totalViews: number;
}

export interface JobWithStats extends Job {
  views: number;
  applies: number;
  conversion?: number;
}


/**
 * Fetch employer-specific KPIs
 */
export async function fetchEmployerKPIs(employerId: string): Promise<EmployerKPIs> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return getDefaultKPIs();
  }

  try {
    // Fetch employer's jobs
    const jobsRef = collection(db, 'jobs');
    const employerJobsQuery = query(jobsRef, where('employerId', '==', employerId));
    const employerJobsSnapshot = await getDocs(employerJobsQuery);
    
    // Count active jobs
    const openJobs = employerJobsSnapshot.docs.filter(doc => {
      const status = doc.data().status;
      return status === 'active' || status === 'open';
    }).length;

    // Get job IDs for filtering applications
    const jobIds = employerJobsSnapshot.docs.map(doc => doc.id);

    if (jobIds.length === 0) {
      return {
        openJobs: 0,
        applicantsToday: 0,
        shortlisted: 0,
        interviewsThisWeek: 0,
        totalViews: 0,
      };
    }

    // Fetch applications for employer's jobs
    const applicationsRef = collection(db, 'applications');
    const allApplicationsSnapshot = await getDocs(applicationsRef);

    // Filter applications that belong to employer's jobs
    const employerApplications = allApplicationsSnapshot.docs.filter(doc => {
      const jobId = doc.data().jobId;
      return jobIds.includes(jobId);
    });

    // Count today's applications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);
    
    const applicantsToday = employerApplications.filter(doc => {
      const createdAt = doc.data().createdAt;
      return createdAt && createdAt.toMillis() >= todayTimestamp.toMillis();
    }).length;

    // Count interviews this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekTimestamp = Timestamp.fromDate(weekAgo);
    
    const interviewsThisWeek = employerApplications.filter(doc => {
      const data = doc.data();
      const updatedAt = data.updatedAt;
      return data.stage === 'interview' && 
             updatedAt && 
             updatedAt.toMillis() >= weekTimestamp.toMillis();
    }).length;

    // Count shortlisted
    const shortlisted = employerApplications.filter(doc => {
      return doc.data().status === 'shortlisted';
    }).length;

    // Calculate total views
    const totalViews = employerJobsSnapshot.docs.reduce((acc, doc) => {
      return acc + (doc.data().views || 0);
    }, 0);

    return {
      openJobs,
      applicantsToday,
      shortlisted,
      interviewsThisWeek,
      totalViews,
    };
  } catch (error) {
    console.error('Error fetching employer KPIs:', error);
    return getDefaultKPIs();
  }
}

/**
 * Fetch employer's jobs with application statistics
 */
export async function fetchEmployerJobsWithStats(employerId: string): Promise<JobWithStats[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    // Fetch employer's jobs (without orderBy to avoid composite index requirement)
    const jobsRef = collection(db, 'jobs');
    const employerJobsQuery = query(
      jobsRef, 
      where('employerId', '==', employerId)
    );
    const employerJobsSnapshot = await getDocs(employerJobsQuery);

    if (employerJobsSnapshot.empty) {
      return [];
    }

    // Fetch all applications to count per job
    const applicationsRef = collection(db, 'applications');
    const allApplicationsSnapshot = await getDocs(applicationsRef);

    // Map jobs with statistics
    const jobsWithStats: JobWithStats[] = employerJobsSnapshot.docs
      .filter(doc => {
        const status = doc.data().status;
        return status === 'active' || status === 'open';
      })
      .map(doc => {
        const data = doc.data();
        const jobId = doc.id;

        // Count applications for this job
        const applies = allApplicationsSnapshot.docs.filter(appDoc => 
          appDoc.data().jobId === jobId
        ).length;

        // Get views from database (use views field from job document)
        const views = data.views || 0;

        return {
          id: jobId,
          title: data.title || 'Untitled Job',
          company: data.company || '',
          location: data.location || '',
          salaryRange: data.salaryRange || data.salary || 'Competitive',
          type: data.type || 'Full-time',
          experienceLevel: data.experienceLevel || 'N/A',
          isRemote: data.isRemote || false,
          description: data.description || '',
          companyEmail: data.companyEmail,
          companyPhone: data.companyPhone,
          employerId: data.employerId || employerId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          views,
          applies,
          conversion: applies > 0 && views > 0 ? parseFloat(((applies / views) * 100).toFixed(1)) : 0,
        } as JobWithStats;
      });

    // Sort by creation date in memory (newest first) and limit to 20
    return jobsWithStats
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);
  } catch (error) {
    console.error('Error fetching employer jobs with stats:', error);
    return [];
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
    totalViews: 0,
  };
}
