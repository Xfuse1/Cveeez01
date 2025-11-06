'use client';

import { db } from '@/firebase/config';
import { collection, addDoc, Timestamp, getDocs, query, limit } from 'firebase/firestore';

/**
 * Seed sample job applications for testing
 * This creates sample applications with different statuses including 'shortlisted' and 'interview'
 */
export async function seedSampleApplications(employerId: string, jobId: string, jobTitle: string) {
  if (!db) {
    console.error('Firestore is not initialized.');
    return { success: false, error: 'Firestore not initialized' };
  }

  try {
    const applicationsRef = collection(db, 'applications');

    // Sample candidates with different statuses
    const sampleApplications = [
      {
        jobId: jobId,
        jobTitle: jobTitle,
        employerId: employerId,
        candidateName: 'Ahmed Hassan',
        seekerName: 'Ahmed Hassan',
        seekerId: 'seeker_001',
        status: 'shortlisted',
        stage: 'Shortlist',
        matchScore: 92,
        email: 'ahmed.hassan@example.com',
        phone: '+20 100 123 4567',
        resume: 'https://example.com/resume1.pdf',
        coverLetter: 'I am very interested in this position...',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        jobId: jobId,
        jobTitle: jobTitle,
        employerId: employerId,
        candidateName: 'Sara Mohamed',
        seekerName: 'Sara Mohamed',
        seekerId: 'seeker_002',
        status: 'shortlisted',
        stage: 'Shortlist',
        matchScore: 88,
        email: 'sara.mohamed@example.com',
        phone: '+20 101 234 5678',
        resume: 'https://example.com/resume2.pdf',
        coverLetter: 'My experience aligns perfectly with your requirements...',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        jobId: jobId,
        jobTitle: jobTitle,
        employerId: employerId,
        candidateName: 'Omar Khalil',
        seekerName: 'Omar Khalil',
        seekerId: 'seeker_003',
        status: 'interview',
        stage: 'Interview',
        matchScore: 95,
        email: 'omar.khalil@example.com',
        phone: '+20 102 345 6789',
        resume: 'https://example.com/resume3.pdf',
        coverLetter: 'I have 5 years of relevant experience...',
        interviewDate: Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)), // 2 days from now
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        jobId: jobId,
        jobTitle: jobTitle,
        employerId: employerId,
        candidateName: 'Fatma Ali',
        seekerName: 'Fatma Ali',
        seekerId: 'seeker_004',
        status: 'applied',
        stage: 'New',
        matchScore: 78,
        email: 'fatma.ali@example.com',
        phone: '+20 103 456 7890',
        resume: 'https://example.com/resume4.pdf',
        coverLetter: 'I would like to apply for this position...',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        jobId: jobId,
        jobTitle: jobTitle,
        employerId: employerId,
        candidateName: 'Youssef Ibrahim',
        seekerName: 'Youssef Ibrahim',
        seekerId: 'seeker_005',
        status: 'shortlisted',
        stage: 'Shortlist',
        matchScore: 85,
        email: 'youssef.ibrahim@example.com',
        phone: '+20 104 567 8901',
        resume: 'https://example.com/resume5.pdf',
        coverLetter: 'As a passionate professional with strong skills...',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    // Add each application to Firestore
    const promises = sampleApplications.map(app => addDoc(applicationsRef, app));
    await Promise.all(promises);

    console.log(`✅ Successfully seeded ${sampleApplications.length} sample applications`);
    return { success: true, count: sampleApplications.length };
  } catch (error) {
    console.error('Error seeding applications:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Quick helper to get the first active job for an employer
 */
export async function getFirstEmployerJob(employerId: string) {
  if (!db) {
    return null;
  }

  try {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      title: doc.data().title || 'Sample Job',
      ...doc.data()
    };
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

/**
 * Usage example - call this from browser console or a page:
 * 
 * import { seedSampleApplications, getFirstEmployerJob } from '@/services/seed-applications';
 * 
 * // In your component or console:
 * const job = await getFirstEmployerJob('YOUR_EMPLOYER_ID');
 * if (job) {
 *   await seedSampleApplications('YOUR_EMPLOYER_ID', job.id, job.title);
 * }
 */
