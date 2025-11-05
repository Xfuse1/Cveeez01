'use client';
import { db } from '@/firebase/config';
import type { Job, Candidate } from '@/types/jobs';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';

// --- Job Service Functions ---

export async function getJobs(filters: {
  jobType?: 'full-time' | 'part-time';
  remoteOnly?: boolean;
}): Promise<Job[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }
  const jobsCollection = collection(db, 'jobs');
  const constraints: QueryConstraint[] = [];

  if (filters.jobType && filters.jobType !== 'all') {
    constraints.push(where('jobType', '==', filters.jobType));
  }
  if (filters.remoteOnly) {
    constraints.push(where('remote', '==', true));
  }

  const q = query(jobsCollection, ...constraints);

  try {
    const querySnapshot = await getDocs(q);
    const jobs: Job[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        id: doc.id,
        title: data.title || '',
        company: data.company || '',
        type: data.jobType || 'Full-time',
        salaryRange: data.salary || '',
        experienceLevel: data.experience || 'N/A',
        isRemote: data.remote || false,
        location: data.location || '',
        description: data.description || 'No description available.',
        companyEmail: data.companyEmail || '',
        companyPhone: data.companyPhone || '',
      } as Job);
    });
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs: ', error);
    return [];
  }
}

// --- Candidate Service Functions ---

export async function getCandidates(filters: {
  // Filters can be added here in the future
}): Promise<Candidate[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }
  const candidatesCollection = collection(db, 'seekers');
  const constraints: QueryConstraint[] = [];

  const q = query(candidatesCollection, ...constraints);

  try {
    const querySnapshot = await getDocs(q);
    const candidates: Candidate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      candidates.push({
        id: doc.id,
        name: data.fullName || 'Unnamed Seeker',
        currentRole: data.jobTitle || 'N/A', // Correctly map jobTitle to currentRole
        location: data.country || 'Unknown',
        skills: data.skills || [],
        email: data.email || null,
        phone: data.phoneNumber ? `${data.phoneCode || ''} ${data.phoneNumber}` : null,
        nationality: data.nationality || null,
        bio: data.bio || null,
      } as Candidate);
    });
    return candidates;
  } catch (error) {
    console.error('Error fetching candidates: ', error);
    return [];
  }
}

// جلب بيانات الباحث عن عمل
export const getSeekerProfile = async (userId: string) => {
  try {
    const seekerDoc = await getDoc(doc(db, "seekers", userId));
    if (seekerDoc.exists()) {
      return {
        id: seekerDoc.id,
        ...seekerDoc.data(),
        userType: "seeker" // إضافة نوع المستخدم
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching seeker profile:', error);
    return null;
  }
};

// جلب بيانات صاحب العمل
export const getEmployerProfile = async (userId: string) => {
  try {
    const employerDoc = await getDoc(doc(db, "employers", userId));
    if (employerDoc.exists()) {
      return {
        id: employerDoc.id,
        ...employerDoc.data(),
        userType: "employer" // إضافة نوع المستخدم
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return null;
  }
};

// دالة التحقق من نوع المستخدم
export const getUserType = async (userId: string): Promise<"seeker" | "employer" | null> => {
  try {
    // تحقق أولاً إذا كان seeker
    const seekerProfile = await getSeekerProfile(userId);
    if (seekerProfile) return "seeker";
    
    // إذا لم يكن seeker، تحقق إذا كان employer
    const employerProfile = await getEmployerProfile(userId);
    if (employerProfile) return "employer";
    
    return null;
  } catch (error) {
    console.error('Error determining user type:', error);
    return null;
  }
};
