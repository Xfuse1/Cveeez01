'use client';
import { db } from '@/firebase/config';
import type { Job, Candidate } from '@/types/jobs';
import {
  collection,
  getDocs,
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
        // Convert field names to match what the component expects
        type: data.jobType || 'Full-time', // ← jobType becomes type
        salaryRange: data.salary || '', // ← salary becomes salaryRange
        experienceLevel: data.experience || 'N/A', // ← experience becomes experienceLevel
        isRemote: data.remote || false, // ← remote becomes isRemote
        location: data.location || '',
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
  const candidatesCollection = collection(db, 'candidates');
  const constraints: QueryConstraint[] = [];

  const q = query(candidatesCollection, ...constraints);

  try {
    const querySnapshot = await getDocs(q);
    const candidates: Candidate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      candidates.push({
        id: doc.id,
        name: data.name || '',
        // Convert field names to match what the component expects
        currentRole: data.currentTitle || '', // ← currentTitle becomes currentRole
        experienceLevel: data.experience || 'N/A', // ← experience becomes experienceLevel
        location: data.location || '',
        skills: data.skills || [],
      } as Candidate);
    });
    return candidates;
  } catch (error) {
    console.error('Error fetching candidates: ', error);
    return [];
  }
}
