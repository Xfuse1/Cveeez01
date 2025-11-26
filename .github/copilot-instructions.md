# AI Coding Agent Instructions for CVEEEZ

## Project Overview

**CVEEEZ** is a Next.js 15 full-stack platform for career development, job matching, and professional networking. Built with TypeScript, Tailwind CSS, Firebase, and Genkit AI integration.

### Core Feature Modules

- **Talent Space**: Social networking (posts, comments, groups, messaging)
- **Jobs**: Job board with employer/seeker matching and recommendations
- **Admin Dashboard**: Management of services, pricing, job tracking
- **E-Commerce**: Service selling and wallet system
- **Translation**: Arabic (RTL) and English support throughout
- **Chatbot/Chat**: WhatsApp integration, group chat functionality
- **CV Templates**: Professional CV generation and management

---

## Architecture & Data Flow

### Stack

```
Frontend: Next.js 15 App Router (React 18, TypeScript)
Styling: Tailwind CSS + shadcn/ui components
Database: Firestore (with offline persistence)
Auth: Firebase Authentication (Google OAuth)
AI: Genkit (Google AI models) + Groq SDK
Deployment: Vercel (configured in vercel.json)
```

### Key File Structure

```
src/
├── app/              # Next.js app router (pages, layouts, API routes)
├── components/       # React components (feature-organized: admin/, jobs/, etc.)
├── contexts/         # Global state (AuthProvider, LanguageProvider)
├── services/         # Business logic & Firestore operations
├── firebase/         # Firebase config & initialization
├── ai/              # Genkit flows & AI integrations
├── types/           # TypeScript interfaces (jobs.ts, service.ts, etc.)
├── data/            # Mock/seed data, constants
├── lib/             # Utilities (kashier payments, cloudinary, etc.)
└── hooks/           # React hooks (use-toast, use-mobile)
```

### State Management Pattern

- **Global Contexts**: Authentication state (AuthProvider) and language (LanguageProvider)
- **Component State**: useState for local UI state
- **Server-side Rendering**: Firestore data fetched server-side in services, passed to components
- **Offline Fallback**: Firestore + Tailwind CSS uses IndexedDB persistence; mock data in `src/data/` serves as fallback when DB is empty

---

## Critical Patterns & Conventions

### 1. Language & Internationalization (i18n)

- **Languages**: English (LTR) and Arabic (RTL)
- **Implementation**: `src/contexts/language-provider.tsx` sets `document.dir` and `lang` attributes dynamically
- **Pattern**: Use `const { language, setLanguage } = useLanguage()` in client components
- **Stored in**: LocalStorage (`cveeez-lang` key)
- **Example**: `document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'`

### 2. Authentication Flow

- **Provider**: `src/contexts/auth-provider.tsx` wraps app in RootLayout
- **Method**: Firebase Auth + Google OAuth (`GoogleAuthProvider`, `signInWithPopup`)
- **Usage**: `const { user, loading, signInWithGoogle, logOut } = useAuth()`
- **Guard Pattern**: Components check `loading` flag before rendering; layout delays children render until auth is loaded
- **Error Handling**: Errors toast via `useToast()` hook from shadcn/ui

### 3. API Route Pattern

- **Location**: `src/app/api/{feature}/{action}/route.ts`
- **Type**: All routes use `NextRequest`/`NextResponse`
- **Validation**: Manual JSON parsing + null coalescing (e.g., `const { sessionId, text } = body ?? {}`)
- **Error Responses**: Return `NextResponse.json({ error: "message" }, { status: 400 })`
- **Example**: `/api/chat/forward-user-message` forwards chat messages to WhatsApp

### 4. Service/Data Layer

- **Location**: `src/services/{entity}-service.ts` or `src/services/{operation}.ts`
- **Pattern**: Exported async functions that handle Firestore operations
- **Firebase Setup**: Initialize via `import { db, auth } from '@/firebase/config'`
- **Query Example**: Use `collection()`, `query()`, `where()`, `getDocs()` from `firebase/firestore`
- **Error Handling**: Try-catch with console logging; return empty arrays or null on failure
- **Timestamps**: Use `Timestamp` for server-side timestamps, convert to `Date` on retrieval with `.toDate()`

### 5. Component & UI Patterns

- **shadcn/ui**: Pre-built accessible Radix UI components in `src/components/ui/`
- **Forms**: Use React Hook Form + Zod validation (see `src/components/ui/form.tsx`)
- **Toast Notifications**: `const { toast } = useToast()` - call `toast({ title, description, variant })`
- **Client vs Server**: Mark interactive components with `"use client"`; keep data fetching in server components or API routes
- **Tailwind**: Dark mode via `darkMode: ['class']` in config; use CSS variables for colors (`var(--background)`, `var(--foreground)`)

### 6. Type System

- **Location**: `src/types/` (jobs.ts, service.ts, common.ts, etc.)
- **Naming**: Use `Interface` for data shapes (not `Type`)
- **Import Example**: `import type { Job, Candidate } from '@/types/jobs'`
- **Firestore Mapping**: Interface fields map directly to Firestore document fields; handle date conversion on retrieval

### 7. Mock Data & Fallback System

- **Location**: `src/data/{feature}.ts` (e.g., talent-space.ts, job-titles.ts)
- **Strategy**: Primary = Firestore; Fallback = Mock data if empty or offline
- **Use Case**: First-time setup, testing, offline mode, empty database
- **Example**: Talent Space loads mock posts/groups if Firestore is empty (see talent-space-setup.md)

### 8. AI Integration (Genkit)

- **Config**: `src/ai/genkit.ts` initializes Genkit with Google AI via `googleAI` plugin
- **API Key**: Set via `process.env.GEMINI_API_KEY`
- **Dev Mode**: `npm run genkit:dev` or `genkit:watch` for local testing
- **Flows**: Define AI workflows in `src/ai/flows/`
- **SDK**: Groq SDK also available for alternative AI model (groq.ts)

### 9. Image & Media Handling

- **Image Hosting**: Firestore Storage, Cloudinary, Unsplash, Picsum Photos
- **Remote Patterns**: `next.config.js` whitelists domains (firebasestorage.googleapis.com, res.cloudinary.com)
- **File Generation**: `html2canvas` + `jspdf` for CV export to PDF
- **Client**: `src/lib/cloudinary-client.ts` for Cloudinary integration

### 10. Payment Integration

- **Provider**: Kashier payment gateway
- **Location**: `src/lib/kashier.ts`, `src/lib/kashier-client.ts`
- **Flows**: View, wallet balance, payment processing
- **Firestore Tracking**: Payment records stored in Firestore

---

## Developer Workflows

### Build & Run

```bash
npm run dev          # Dev server on port 9004
npm run build        # Production build
npm start            # Production server
npm run typecheck    # TypeScript validation without emitting
npm run lint         # ESLint check
```

### AI Development

```bash
npm run genkit:dev          # Start Genkit dev server (watch mode off)
npm run genkit:watch        # Start Genkit with file watching
```

### Testing & Validation

- **No explicit test files found** - add tests to `src/__tests__/` if needed
- **Type Safety**: `npm run typecheck` catches TypeScript errors
- **Linting**: `npm run lint` validates code style

### Deployment

- **Platform**: Vercel (configured in `vercel.json`)
- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev`
- **Install Command**: `npm install`
- **Output**: `.next/` directory

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_AGENT_PHONE=...
KASHIER_API_KEY=...
CLOUDINARY_UPLOAD_PRESET=...
```

---

## Common Implementation Tasks

### Adding a New API Route

1. Create `src/app/api/{feature}/{action}/route.ts`
2. Export `async function POST/GET(req: NextRequest)` (or other method)
3. Validate input: `const { field } = await req.json()`
4. Call service function from `src/services/`
5. Return `NextResponse.json(data, { status: 200 })`

### Creating a New Service Module

1. Create `src/services/{entity}-service.ts`
2. Import `{ db } from '@/firebase/config'`
3. Export async functions with proper error handling
4. Use Firestore queries: `collection()`, `query()`, `getDocs()`, `getDoc()`, `addDoc()`, `updateDoc()`
5. Document expected Firestore collection structure

### Building a Feature Component

1. Create in `src/components/{feature}/ComponentName.tsx`
2. Add `"use client"` at top if interactive
3. Use shadcn/ui components from `src/components/ui/`
4. Call service functions for data via props or API routes
5. Handle loading/error states with proper TypeScript types
6. Use `useLanguage()` for i18n support if needed

### Adding i18n Support

1. Import `{ useLanguage } from '@/contexts/language-provider'`
2. Use `language` state to conditionally render/fetch translated content
3. For RTL layout: Tailwind handles via CSS; text direction auto-set in LanguageProvider
4. Store language preference in localStorage (handled by provider)

---

## Key External Dependencies

| Library | Purpose | Location |
|---------|---------|----------|
| **Next.js 15** | React framework | - |
| **Firebase** | Auth, Firestore, Storage | `src/firebase/` |
| **Genkit** | AI orchestration | `src/ai/` |
| **Groq SDK** | Alternative AI models | `src/ai/groq.ts` |
| **shadcn/ui** | UI components (Radix UI) | `src/components/ui/` |
| **React Hook Form** | Form state management | Components |
| **Zod** | Schema validation | Form validation |
| **Recharts** | Charts & data visualization | Dashboard components |
| **Tailwind CSS** | Styling | `tailwind.config.ts` |
| **next-themes** | Dark mode | `src/components/theme-provider.tsx` |
| **Kashier** | Payments | `src/lib/kashier.ts` |
| **Cloudinary** | Image hosting & CDN | `src/lib/cloudinary-client.ts` |
| **html2canvas + jsPDF** | PDF export | CV export flows |

---

## Quick Tips for Productivity

1. **TypeScript Strict Mode**: Always define types; use `type` imports for non-exported types
2. **Path Aliases**: Use `@/` prefix (configured in `tsconfig.json`); never use relative paths beyond current directory
3. **Error Handling**: All async Firestore calls need try-catch; return safe defaults (empty array, null, false)
4. **Component Organization**: Group related components by feature (e.g., `components/jobs/`, `components/admin/`)
5. **Avoid Data Duplication**: Use Firestore as source of truth; mock data only for fallback/offline
6. **RTL Testing**: Always test components in both English and Arabic before merging
7. **Environment Variables**: Prefix public vars with `NEXT_PUBLIC_` (visible in browser); others are server-only
8. **Dark Mode**: Use Tailwind dark mode class conditionally; colors auto-switch via CSS variables

---

## References

- **Talent Space**: `docs/talent-space-setup.md` - Architecture & Firestore schema
- **Admin/Pricing**: `docs/pricing-management-guide.md`
- **Service Management**: `docs/service-management-guide.md`
- **Firestore Setup**: `docs/firestore-setup-guide-ar.md`
- **Deployment**: `DEPLOYMENT.md`, `VERCEL_*.md` files

