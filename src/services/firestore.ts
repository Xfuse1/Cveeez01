"use client";
import { db } from "@/firebase/config";
import type { Job, Candidate } from "@/types/jobs";
import {
  collection,
  getDocs,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";

// --- Job Service Functions ---

export async function getJobs(filters: {
  jobType?: "full-time" | "part-time";
  remoteOnly?: boolean;
}): Promise<Job[]> {
  if (!db) {
    console.error("Firestore is not initialized.");
    return [];
  }
  const jobsCollection = collection(db, "jobs");
  const constraints: QueryConstraint[] = [];

  if (filters.jobType) {
    constraints.push(where("type", "==", filters.jobType));
  }
  if (filters.remoteOnly) {
    constraints.push(where("isRemote", "==", true));
  }

  const q = query(jobsCollection, ...constraints);

  try {
    const querySnapshot = await getDocs(q);
    const jobs: Job[] = [];
    querySnapshot.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() } as Job);
    });
    return jobs;
  } catch (error) {
    console.error("Error fetching jobs: ", error);
    return [];
  }
}

// --- Candidate Service Functions ---

export async function getCandidates(filters: {
  jobType?: "full-time" | "part-time";
  remoteOnly?: boolean;
}): Promise<Candidate[]> {
  if (!db) {
    console.error("Firestore is not initialized.");
    return [];
  }
  const candidatesCollection = collection(db, "candidates");
    const constraints: QueryConstraint[] = [];

  // You can add filtering for candidates here if needed in the future
  // For now, it fetches all candidates.

  const q = query(candidatesCollection, ...constraints);

  try {
    const querySnapshot = await getDocs(q);
    const candidates: Candidate[] = [];
    querySnapshot.forEach((doc) => {
      candidates.push({ id: doc.id, ...doc.data() } as Candidate);
    });
    return candidates;
  } catch (error) {
    console.error("Error fetching candidates: ", error);
    return [];
  }
}
