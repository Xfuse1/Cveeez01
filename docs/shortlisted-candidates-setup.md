# Shortlisted Candidates Feature Setup

## Overview
The Shortlisted Candidates section on the Employer Dashboard now displays **real data from Firestore** instead of mock data. It shows candidates who have applied to your jobs and have been shortlisted or are in the interview stage.

## Changes Made

### 1. **New Service Function**
File: `src/services/admin-data.ts`

Added `fetchEmployerShortlistedCandidates(employerId)` function that:
- Fetches all jobs belonging to the employer
- Queries the `applications` collection for applications with status `'shortlisted'` or `'interview'`
- Returns only applications for the employer's jobs
- Includes candidate name, position, match score, and stage

### 2. **Updated Employer Dashboard**
File: `src/app/employer/page.tsx`

- Replaced `fetchRealCandidates()` with `fetchEmployerShortlistedCandidates(user.uid)`
- Added loading state for better UX
- Improved empty state message with helpful guidance
- Added click handler to view candidate details (navigates to `/candidate/:id`)
- Added debug button to seed sample applications for testing

### 3. **Sample Data Seeder**
File: `src/services/seed-applications.ts`

Created a utility to seed sample applications for testing:
- Creates 5 sample applications with different statuses
- 3 candidates with status `'shortlisted'`
- 1 candidate with status `'interview'`
- 1 candidate with status `'applied'`

### 4. **Type Fix**
File: `src/types/jobs.ts`

Fixed TypeScript error by making `experienceLevel` optional and allowing `'N/A'` value.

## Firestore Structure

### Applications Collection
Each document in the `applications` collection should have:

```typescript
{
  id: string,                    // Auto-generated document ID
  jobId: string,                 // Reference to job document
  jobTitle: string,              // Job title for display
  employerId: string,            // Employer who posted the job
  candidateName: string,         // Candidate's name
  seekerName: string,            // Alternate field for candidate name
  seekerId: string,              // Reference to seeker document
  status: 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired',
  stage: 'New' | 'Screened' | 'Shortlist' | 'Interview' | 'Offer',
  matchScore: number,            // 0-100 percentage match
  email: string,
  phone: string,
  resume: string,                // URL to resume
  coverLetter?: string,
  interviewDate?: Timestamp,     // For interview status
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## How to Test

### Option 1: Use the Debug Button (Recommended for Testing)

1. **Log in as an Employer**
2. **Create a Job** (if you don't have one):
   - Click "Post a Job" button on the dashboard
   - Fill in job details and submit
3. **Add Sample Applications**:
   - Click the "Add Sample Applications" button in Quick Actions
   - This will create 5 sample applications for your most recent job
4. **View Results**:
   - The "Shortlisted Candidates" section will now show 3 shortlisted candidates
   - Click on any candidate to view their profile

### Option 2: Manually Create Applications in Firestore

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Create a new collection called `applications`
4. Add documents with the structure shown above
5. Make sure to use:
   - Your actual `employerId` (user UID)
   - An actual `jobId` from your jobs collection
   - Status: `'shortlisted'` or `'interview'`

### Option 3: Build an Application Form (Future Implementation)

To allow real seekers to apply:
1. Create a job application form on the jobs page
2. When a seeker clicks "Apply", create a document in `applications` with status `'applied'`
3. Build an employer interface to review applications and change status to `'shortlisted'` or `'interview'`

## Production Deployment

### Before deploying to production:

1. **Remove the debug button**:
   - Open `src/app/employer/page.tsx`
   - Remove the "Add Sample Applications" button
   - Remove the `handleSeedApplications` function
   - Remove the `import { seedSampleApplications, getFirstEmployerJob }` line

2. **Build the application submission flow**:
   - Add "Apply" button on job details
   - Create application form for seekers
   - Store applications in Firestore with status `'applied'`

3. **Build the candidate management interface**:
   - Allow employers to review applications
   - Add buttons to shortlist/reject candidates
   - Update application status in Firestore
   - Send notifications to candidates when status changes

## Database Indexes (if needed)

If you encounter "Missing index" errors, create these composite indexes in Firestore:

1. **Applications by Status and Date**:
   - Collection: `applications`
   - Fields: `status` (Ascending), `updatedAt` (Descending)

2. **Applications by Job**:
   - Collection: `applications`
   - Fields: `jobId` (Ascending), `status` (Ascending), `updatedAt` (Descending)

## API Endpoints

Consider creating these API endpoints for better security:

```typescript
// POST /api/applications/apply
// POST /api/applications/[id]/shortlist
// POST /api/applications/[id]/interview
// POST /api/applications/[id]/reject
// GET /api/applications?employerId=xxx&status=shortlisted
```

## Security Rules

Update Firestore security rules:

```javascript
match /applications/{applicationId} {
  // Employers can read applications for their jobs
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/jobs/$(resource.data.jobId)).data.employerId == request.auth.uid;
  
  // Seekers can create applications
  allow create: if request.auth != null && 
    request.resource.data.seekerId == request.auth.uid;
  
  // Employers can update status of applications for their jobs
  allow update: if request.auth != null && 
    get(/databases/$(database)/documents/jobs/$(resource.data.jobId)).data.employerId == request.auth.uid;
}
```

## Troubleshooting

### No candidates showing up?
1. Check if you have any jobs posted (check `jobs` collection)
2. Check if there are applications in the `applications` collection
3. Verify applications have status `'shortlisted'` or `'interview'`
4. Verify `jobId` in applications matches jobs in your `jobs` collection
5. Verify `employerId` in applications matches your user UID

### "Add Sample Applications" button not working?
1. Make sure you have at least one job posted
2. Check browser console for errors
3. Verify Firebase initialization is working

### Match scores not showing?
- Match scores are currently random (85-99) or stored in the application document
- Implement a proper matching algorithm based on:
  - Skills match
  - Experience level
  - Location preferences
  - Salary expectations

## Future Enhancements

1. **Real-time Updates**: Use Firestore `onSnapshot` to update the list in real-time
2. **Filters**: Add filters for status, date range, match score
3. **Sorting**: Allow sorting by match score, date, name
4. **Bulk Actions**: Select multiple candidates for batch operations
5. **Notes**: Allow employers to add private notes about candidates
6. **Ratings**: Star rating system for candidates
7. **AI Matching**: Use AI to calculate match scores automatically
8. **Email Integration**: Send emails when candidates are shortlisted
9. **Calendar Integration**: Schedule interviews directly from the dashboard
10. **Video Interviews**: Integration with video call platforms

## Support

For questions or issues, please contact the development team or create an issue in the repository.
