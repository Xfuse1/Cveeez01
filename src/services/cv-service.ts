import { db } from '@/firebase/config';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * CV Service - Manage CV versions in Firestore
 */

export interface CVData {
  id?: string;
  userId: string;
  title: string;
  status: 'draft' | 'ai_running' | 'ready' | 'completed';
  score: number;
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    jobTitle?: string;
    bio?: string;
  };
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    current?: boolean;
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills?: string[];
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  template?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create a new CV
 */
export async function createCV(cvData: CVData): Promise<string> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  try {
    const cvRef = collection(db, 'cvVersions');
    const docRef = await addDoc(cvRef, {
      ...cvData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating CV:', error);
    throw error;
  }
}

/**
 * Update an existing CV
 */
export async function updateCV(cvId: string, cvData: Partial<CVData>): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  try {
    const cvRef = doc(db, 'cvVersions', cvId);
    await updateDoc(cvRef, {
      ...cvData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating CV:', error);
    throw error;
  }
}

/**
 * Get a CV by ID
 */
export async function getCV(cvId: string): Promise<CVData | null> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  try {
    const cvRef = doc(db, 'cvVersions', cvId);
    const cvDoc = await getDoc(cvRef);

    if (!cvDoc.exists()) {
      return null;
    }

    const data = cvDoc.data();
    return {
      id: cvDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as CVData;
  } catch (error) {
    console.error('Error getting CV:', error);
    return null;
  }
}

/**
 * Get all CVs for a user
 */
export async function getUserCVs(userId: string): Promise<CVData[]> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  try {
    const cvRef = collection(db, 'cvVersions');
    const q = query(
      cvRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as CVData;
    });
  } catch (error) {
    console.error('Error getting user CVs:', error);
    return [];
  }
}

/**
 * Calculate CV score based on completeness
 */
export function calculateCVScore(cvData: CVData): number {
  let score = 0;
  let maxScore = 0;

  // Personal Info (30 points)
  maxScore += 30;
  if (cvData.personalInfo) {
    const fields = [
      cvData.personalInfo.name,
      cvData.personalInfo.email,
      cvData.personalInfo.phone,
      cvData.personalInfo.location,
      cvData.personalInfo.jobTitle,
      cvData.personalInfo.bio,
    ];
    const filledFields = fields.filter(Boolean).length;
    score += (filledFields / fields.length) * 30;
  }

  // Experience (30 points)
  maxScore += 30;
  if (cvData.experience && cvData.experience.length > 0) {
    score += Math.min(cvData.experience.length * 10, 30);
  }

  // Education (20 points)
  maxScore += 20;
  if (cvData.education && cvData.education.length > 0) {
    score += Math.min(cvData.education.length * 10, 20);
  }

  // Skills (15 points)
  maxScore += 15;
  if (cvData.skills && cvData.skills.length > 0) {
    score += Math.min(cvData.skills.length * 3, 15);
  }

  // Additional sections (5 points)
  maxScore += 5;
  if (cvData.languages && cvData.languages.length > 0) {
    score += 2.5;
  }
  if (cvData.certifications && cvData.certifications.length > 0) {
    score += 2.5;
  }

  return Math.round((score / maxScore) * 100);
}
