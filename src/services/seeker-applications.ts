import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

export interface ApplicationWithJobDetails {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  salaryRange?: string;
  jobType?: string;
  jobDescription?: string;
  requirements?: string[];
  benefits?: string[];
  companyEmail?: string;
  companyPhone?: string;
  isRemote?: boolean;
  experienceLevel?: string;
  // Application-specific fields
  status: string;
  stage: string;
  appliedDate: Date;
  updatedAt?: Date;
  matchScore?: number;
  coverLetter?: string;
  resume?: string;
}

/**
 * Fetch seeker's applications with embedded job details
 * Applications store job data at time of application, so we read from the application document
 */
export async function getSeekerApplications(
  seekerId: string
): Promise<ApplicationWithJobDetails[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const applicationsRef = collection(db, 'applications');
    // Remove orderBy to avoid composite index requirement - we'll sort in memory
    const q = query(
      applicationsRef,
      where('seekerId', '==', seekerId)
    );

    const querySnapshot = await getDocs(q);

    const applications: ApplicationWithJobDetails[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        // Job details (stored in application at time of applying)
        jobTitle: data.jobTitle || 'Untitled Position',
        company: data.company || data.employerCompany || 'Company Name',
        location: data.location || data.jobLocation || 'Location not specified',
        salaryRange: data.salaryRange || data.salary,
        jobType: data.jobType || data.type,
        jobDescription: data.jobDescription || data.description,
        requirements: data.requirements || [],
        benefits: data.benefits || [],
        companyEmail: data.companyEmail,
        companyPhone: data.companyPhone,
        isRemote: data.isRemote || false,
        experienceLevel: data.experienceLevel,
        // Application status fields
        status: data.status || 'applied',
        stage: data.stage || 'Applied',
        appliedDate: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        matchScore: data.matchScore,
        coverLetter: data.coverLetter,
        resume: data.resume,
      };
    });

    // Sort by application date in memory (newest first) and limit to 50
    return applications
      .sort((a, b) => b.appliedDate.getTime() - a.appliedDate.getTime())
      .slice(0, 50);
  } catch (error) {
    console.error('Error fetching seeker applications:', error);
    return [];
  }
}

/**
 * Get application count by status
 */
export async function getApplicationStats(seekerId: string): Promise<{
  total: number;
  applied: number;
  shortlisted: number;
  interview: number;
  offered: number;
  rejected: number;
}> {
  const applications = await getSeekerApplications(seekerId);
  
  return {
    total: applications.length,
    applied: applications.filter(app => app.status === 'applied').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    interview: applications.filter(app => app.status === 'interview' || app.stage === 'interview').length,
    offered: applications.filter(app => app.status === 'offered' || app.stage === 'Offer').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };
}
