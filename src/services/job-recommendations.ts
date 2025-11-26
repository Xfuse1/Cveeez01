import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { Job } from '@/types/jobs';

/**
 * Job Recommendation Service - Match jobs with seeker profile
 */

interface SeekerProfile {
  id: string;
  jobTitle?: string; // Current or desired job title
  skills?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    industry?: string;
  }>;
  education?: Array<{
    degree?: string;
    field?: string;
  }>;
  location?: string;
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  desiredSalary?: number;
  [key: string]: any;
}

/**
 * Calculate match score between a job and seeker profile
 */
function calculateMatchScore(job: any, profile: SeekerProfile): number {
  let score = 0;
  let maxScore = 0;
  let hasJobTitleMatch = false;

  // Job Title matching (50 points) - MUST CONTAIN SEEKER'S JOB TITLE
  maxScore += 50;
  
  // Get seeker's job titles
  let seekerTitles: string[] = [];
  
  if (profile.experience && profile.experience.length > 0) {
    seekerTitles = profile.experience
      .map(exp => exp.title?.toLowerCase())
      .filter(Boolean) as string[];
  }
  
  if (profile.jobTitle) {
    seekerTitles.push(profile.jobTitle.toLowerCase());
  }
  
  const jobTitle = (job.title || '').toLowerCase();
  
  if (seekerTitles.length > 0) {
    // Check if job title contains any of the seeker's job titles
    for (const seekerTitle of seekerTitles) {
      if (jobTitle.includes(seekerTitle) || seekerTitle.includes(jobTitle)) {
        // Direct match - job title contains seeker's title (e.g., "Senior Developer" contains "developer")
        score += 50;
        hasJobTitleMatch = true;
        break;
      }
    }
  }

  // If no job title match at all, return 0 (don't show this job)
  if (!hasJobTitleMatch) {
    return 0;
  }

  // Skills matching (25 points)
  maxScore += 25;
  if (profile.skills && profile.skills.length > 0) {
    const jobRequirements = (job.requirements || '').toLowerCase();
    const jobDescription = (job.description || '').toLowerCase();
    const jobText = `${jobRequirements} ${jobDescription}`;
    
    const matchingSkills = profile.skills.filter(skill => 
      jobText.includes(skill.toLowerCase())
    );
    
    if (profile.skills.length > 0) {
      score += (matchingSkills.length / profile.skills.length) * 25;
    }
  }

  // Location matching (10 points)
  maxScore += 10;
  if (profile.location && job.location) {
    const profileLocation = profile.location.toLowerCase();
    const jobLocation = job.location.toLowerCase();
    
    if (jobLocation.includes(profileLocation) || profileLocation.includes(jobLocation)) {
      score += 10;
    } else if (job.isRemote) {
      score += 8; // Remote jobs get partial location score
    }
  } else if (job.isRemote) {
    score += 10; // Full score if job is remote and no preference
  }

  // Experience level matching (10 points)
  maxScore += 10;
  if (profile.experience && profile.experience.length > 0) {
    const yearsOfExperience = profile.experience.length;
    const jobLevel = job.experienceLevel?.toLowerCase() || '';
    
    if (
      (yearsOfExperience === 0 && jobLevel.includes('entry')) ||
      (yearsOfExperience >= 1 && yearsOfExperience <= 3 && (jobLevel.includes('entry') || jobLevel.includes('mid'))) ||
      (yearsOfExperience >= 3 && yearsOfExperience <= 5 && jobLevel.includes('mid')) ||
      (yearsOfExperience > 5 && (jobLevel.includes('senior') || jobLevel.includes('lead')))
    ) {
      score += 10;
    } else if (jobLevel === 'n/a' || !job.experienceLevel) {
      score += 7; // Partial score if no experience level specified
    }
  } else {
    score += 7; // Partial score for entry-level seekers
  }

  // Industry/Field matching (5 points)
  maxScore += 5;
  if (profile.experience && profile.experience.length > 0) {
    const industries = profile.experience
      .map(exp => exp.industry?.toLowerCase())
      .filter(Boolean);
    
    const jobText = `${job.description || ''} ${job.title || ''}`.toLowerCase();
    
    if (industries.some(industry => jobText.includes(industry || ''))) {
      score += 5;
    }
  }

  // Normalize score to 0-100
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Get recommended jobs for a seeker based on their profile
 */
export async function getRecommendedJobs(
  profile: SeekerProfile,
  limitCount: number = 20
): Promise<Array<Job & { matchScore: number }>> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const jobsRef = collection(db, 'jobs');
    
    // Fetch active jobs
    const q = query(
      jobsRef,
      where('status', '==', 'active'),
      limit(100) // Fetch more to filter and sort
    );

    const snapshot = await getDocs(q);
    
    // Map jobs and calculate match scores
    // TODO: strict type: replace (doc: any) with QueryDocumentSnapshot type
    const jobsWithScores = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      const job = {
        id: doc.id,
        title: data.title || 'Untitled Job',
        company: data.company || 'Unknown Company',
        location: data.location || 'N/A',
        salaryRange: data.salaryRange || 'Competitive',
        type: data.type || 'Full-time',
        experienceLevel: data.experienceLevel || 'N/A',
        isRemote: data.isRemote || false,
        description: data.description || '',
        requirements: data.requirements || '',
        employerId: data.employerId || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as Job;

      const matchScore = calculateMatchScore(data, profile);

      return {
        ...job,
        matchScore,
      };
    });

    // Sort by match score (highest first) and limit results
    // TODO: strict type: add type annotations to job, a, b parameters
    const recommendedJobs = jobsWithScores
      .filter((job: any) => job.matchScore > 0) // Only show jobs with title match
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, limitCount);

    return recommendedJobs;
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    return [];
  }
}

/**
 * Get all active jobs (fallback when no profile data)
 */
export async function getActiveJobs(limit: number = 10): Promise<Job[]> {
  if (!db) {
    return [];
  }

  try {
    const jobsRef = collection(db, 'jobs');
    const q = query(
      jobsRef,
      where('status', '==', 'active'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    // TODO: strict type: replace (doc: any) with QueryDocumentSnapshot
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Job',
        company: data.company || 'Unknown Company',
        location: data.location || 'N/A',
        salaryRange: data.salaryRange || 'Competitive',
        type: data.type || 'Full-time',
        experienceLevel: data.experienceLevel || 'N/A',
        isRemote: data.isRemote || false,
        description: data.description || '',
        employerId: data.employerId || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as Job;
    });
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    return [];
  }
}
