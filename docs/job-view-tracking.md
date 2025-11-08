# Job View Tracking System

This system automatically tracks when users view job postings and provides accurate analytics for employers.

## Features

✅ **Automatic View Tracking** - Views are tracked when users click "View Details" on any job
✅ **Real Database Integration** - View counts stored in Firestore and displayed in employer dashboard
✅ **User-Specific Tracking** - Optional tracking of which users viewed which jobs
✅ **Atomic Counters** - Uses Firestore's `increment()` for accurate concurrent updates
✅ **Analytics Ready** - Supports detailed view history per job

## How It Works

### 1. When a User Views a Job

When a user clicks to view job details, the system:
1. Increments the `views` counter in the job document
2. Updates `lastViewedAt` timestamp
3. Optionally tracks individual user view events

### 2. Data Structure

#### Jobs Collection (`jobs/{jobId}`)
```typescript
{
  title: "Software Engineer",
  views: 125,              // ← Auto-incremented counter
  lastViewedAt: Timestamp,
  // ... other job fields
}
```

#### Optional: View Events Subcollection (`jobs/{jobId}/views/{userId}`)
```typescript
{
  userId: "user123",
  firstViewedAt: Timestamp,
  lastViewedAt: Timestamp,
  viewCount: 3
}
```

### 3. Employer Dashboard

The employer dashboard shows:
- **Views**: Total number of times the job was viewed
- **Applies**: Number of applications received
- **Conversion**: Percentage of views that resulted in applications

## Implementation

### Files Created

1. **`src/services/job-tracking.ts`** - Core tracking service
   - `trackJobView(jobId, userId?)` - Increment view counter
   - `initializeJobViews(jobId)` - Initialize views field for a job
   - `getUniqueViewCount(jobId)` - Get number of unique viewers

2. **`src/scripts/initialize-job-views.ts`** - Migration script
   - `initializeAllJobViews()` - Add views field to all existing jobs
   - `getJobViewsStats()` - Get statistics about job views

### Files Modified

1. **`src/app/jobs/page.tsx`** - Main jobs listing page
   - Added `trackJobView()` call in `handleViewDetails()`

2. **`src/components/dashboard/seeker/RecommendedJobsList.tsx`**
   - Added `trackJobView()` call in `handleViewDetails()`

3. **`src/services/employer-data.ts`**
   - Changed from mock views to real database: `data.views || 0`

## Setup Instructions

### For New Jobs

Views will automatically start at 0 and increment as users view them. No setup needed!

### For Existing Jobs (Migration)

Run this once to initialize the `views` field for all existing jobs:

```typescript
import { initializeAllJobViews } from '@/scripts/initialize-job-views';

// In your admin dashboard or API route:
const result = await initializeAllJobViews();
console.log(`Updated ${result.updated} jobs`);
```

### Check Migration Status

```typescript
import { getJobViewsStats } from '@/scripts/initialize-job-views';

const stats = await getJobViewsStats();
console.log(`Total Jobs: ${stats.totalJobs}`);
console.log(`Jobs with views field: ${stats.jobsWithViews}`);
console.log(`Jobs without views field: ${stats.jobsWithoutViews}`);
console.log(`Total views: ${stats.totalViews}`);
```

## Usage Examples

### Track a Job View (Manual)

```typescript
import { trackJobView } from '@/services/job-tracking';

// Simple tracking (no user tracking)
await trackJobView(jobId);

// With user tracking (for analytics)
await trackJobView(jobId, userId);
```

### Initialize a Single Job

```typescript
import { initializeJobViews } from '@/services/job-tracking';

await initializeJobViews(jobId);
```

### Get Unique Viewer Count

```typescript
import { getUniqueViewCount } from '@/services/job-tracking';

const uniqueViewers = await getUniqueViewCount(jobId);
console.log(`${uniqueViewers} unique users viewed this job`);
```

## Dashboard Display

The employer dashboard (`src/app/employer/page.tsx`) shows:

```
Job Performance Chart:
┌─────────────────────────────────────────┐
│ Software Engineer       11.1% conversion│
│ Views: 225      [████████████████]      │
│ Applies: 25     [████]                  │
└─────────────────────────────────────────┘
```

## Firestore Security Rules

Add these rules to allow tracking (if not already present):

```javascript
match /jobs/{jobId} {
  // Allow authenticated users to increment views
  allow update: if request.auth != null 
    && request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['views', 'lastViewedAt']);
  
  // Allow tracking user view events
  match /views/{userId} {
    allow create, update: if request.auth != null 
      && request.auth.uid == userId;
  }
}
```

## Benefits

✅ **Accurate Analytics** - Real data instead of mock calculations
✅ **Performance Insights** - See which jobs attract the most attention
✅ **Conversion Tracking** - Understand how many viewers become applicants
✅ **User Behavior** - Optional tracking shows which users viewed which jobs
✅ **Scalable** - Uses Firestore's atomic operations for reliability

## Testing

1. **Post a new job** as an employer
2. **View the job** as a job seeker (click "View Details")
3. **Check employer dashboard** - views counter should increment
4. **Apply to the job** - conversion percentage should update

## Notes

- Views are tracked when users click "View Details" (not just browsing the list)
- The system uses Firestore's `increment()` for atomic, concurrent-safe updates
- User-specific tracking is optional but useful for analytics
- Migration script is idempotent (safe to run multiple times)

---

**Created:** November 7, 2025
**Status:** ✅ Implemented and Ready to Use
