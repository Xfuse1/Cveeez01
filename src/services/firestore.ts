
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
  addDoc,
  updateDoc,
  Timestamp,
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
    constraints.push(where('isRemote', '==', true));
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
        company: data.company || 'Anonymous Company',
        type: data.type || 'Full-time',
        salaryRange: data.salaryRange || '',
        experienceLevel: data.experienceLevel || 'N/A',
        isRemote: data.isRemote || false,
        location: data.location || '',
        description: data.description || 'No description available.',
        companyEmail: data.companyEmail || '',
        companyPhone: data.companyPhone || '',
        employerId: data.employerId || '',
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Job);
    });
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs: ', error);
    return [];
  }
}

export async function getJobById(jobId: string): Promise<Job | null> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return null;
  }
  try {
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    if (jobSnap.exists()) {
      const data = jobSnap.data();
      return {
        id: jobSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Job;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    return null;
  }
}

export async function addJob(jobData: Omit<Job, 'id' | 'createdAt' | 'company'>): Promise<{ success: boolean; error?: string; jobId?: string }> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    console.log(`📝 [Firestore] Attempting to add a document to the 'jobs' collection.`);
    // Fetch employer company name
    const employerRef = doc(db, 'employers', jobData.employerId);
    const employerSnap = await getDoc(employerRef);
    const companyName = employerSnap.exists() ? employerSnap.data().companyNameEn || 'Anonymous Company' : 'Anonymous Company';

    const jobsCollection = collection(db, 'jobs');
    const docRef = await addDoc(jobsCollection, {
      ...jobData,
      company: companyName, // Add the fetched company name
      createdAt: Timestamp.now(),
      status: 'active', // Default status
    });
    console.log(`✅ [Firestore] Successfully added document to 'jobs' with ID: ${docRef.id}`);
    return { success: true, jobId: docRef.id };
  } catch (error) {
    console.error('Error adding job: ', error);
    return { success: false, error: 'Failed to add job.' };
  }
}

export async function updateJob(jobId: string, jobData: Partial<Omit<Job, 'id' | 'createdAt' | 'employerId' | 'company'>>): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, {
        ...jobData,
        updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating job: ', error);
    return { success: false, error: 'Failed to update job.' };
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
