# CVEEEZ Dashboard System

A comprehensive role-aware dashboard system for CVEEEZ with both Seeker and Employer modes.

## Features

### Global Features
- **Role Toggle**: Switch between Seeker and Employer views at top-right
- **Responsive Design**: Mobile-first with sticky navigation
- **Loading States**: Skeleton screens while data loads
- **Empty States**: Friendly messages with clear CTAs
- **Toast Notifications**: Feedback on all actions
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

### Seeker Dashboard (`/dashboard-demo` with role="seeker")

**KPI Cards (6):**
- Profile completeness %
- CV versions count
- Active applications
- Saved jobs
- Wallet balance
- Last order status

**Quick Actions:**
- Build CV with AI
- Export PDF
- Find Jobs

**AI CV Builder Card:**
- Current CV title
- Status badge (draft | ai_running | ready)
- CV score progress bar
- Actions: Improve, Create New, Download

**Applications Timeline:**
- Table view with job, company, stage chip, updated date
- Stage colors: Applied (yellow), Shortlisted (purple), Interview (blue), Offer (green), Rejected (red)

**Recommended Jobs:**
- Match score percentage
- Job details with location, salary, type
- Apply button with toast feedback

**Orders & Services:**
- Last 5 orders with status chips
- Button to view all orders

**Inbox Preview:**
- Last 3 messages
- Unread indicator
- Link to full messages page

### Employer Dashboard (`/dashboard-demo` with role="employer")

**KPI Cards (6):**
- Open jobs
- Applicants today
- Shortlisted candidates
- Interviews this week
- Plan usage %
- KYC status

**Quick Actions:**
- Post Job
- Invite Candidates
- Upgrade Plan

**Job Performance Chart:**
- Views and applies per job
- Conversion rate percentage
- Visual progress bars

**Candidate Pipeline:**
- 5 columns: New → Screened → Shortlist → Interview → Offer
- Draggable candidate cards
- Match score badges
- Stage-specific colors

**Billing & Plan:**
- Current plan badge
- Next invoice date
- Recent invoices table (paid/pending/overdue)
- Download invoice buttons
- Upgrade plan CTA

**Team Activity Feed:**
- Recent actions by team members
- Timestamps
- User avatars

## Routes

All routes have placeholder pages:

- `/dashboard-demo` - Main dashboard (toggle role at top-right)
- `/services/ai-cv-builder` - CV builder (seeker)
- `/jobs` - Job listings (seeker)
- `/employer/jobs` - Manage jobs (employer)
- `/orders` - Order history
- `/wallet` - Wallet management
- `/messages` - Message inbox
- `/notifications` - Notifications center
- `/settings` - Account settings

## Usage

### Start the Dashboard

```bash
npm run dev
```

Navigate to: **http://localhost:9004/dashboard-demo**

### Toggle Between Roles

Click the **"View as: Seeker"** or **"View as: Employer"** button at the top-right of the navigation bar.

### Mock Data

All data is mocked with simulated loading delays (800-1000ms) to demonstrate loading states. Mock data is in:
- `src/lib/mock-data.ts`
- `src/types/dashboard.ts`

## Components

### Shared Components
- `DashboardNav` - Top navigation with role toggle
- `KPICard` - Metric cards with icons
- `EmptyState` - Friendly empty states with CTAs

### Seeker Components
- `AIBuilderCard` - CV builder status and actions
- `ApplicationsTimeline` - Application tracking table
- `RecommendedJobsList` - Job recommendations

### Employer Components
- `JobPerformanceChart` - Job metrics visualization
- `CandidatePipeline` - Kanban-style pipeline
- `BillingCard` - Plan and invoice management

## Styling

- Clean card-based layout
- Rounded corners (8px)
- Subtle shadows for depth
- Neutral color palette
- Strong contrast for badges/buttons
- System fonts for performance

## Accessibility

- Semantic HTML5 headings
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast ratios
- Focus indicators

## Next Steps

To integrate with real data:

1. Replace mock API calls in `src/lib/mock-data.ts` with real API endpoints
2. Add authentication to determine user role
3. Implement drag-and-drop for candidate pipeline
4. Add real-time updates for notifications
5. Connect payment processing for billing

## Technologies

- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI components
- Lucide icons
