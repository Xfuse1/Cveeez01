import {
  SeekerKPIs,
  EmployerKPIs,
  CVData,
  Application,
  Job,
  Order,
  Message,
  JobPerformance,
  Candidate,
  BillingInfo,
  Invoice,
  TeamActivity,
} from "@/types/dashboard";

// Seeker Mock Data
export const mockSeekerKPIs: SeekerKPIs = {
  profileCompleteness: 75,
  cvVersions: 3,
  activeApplications: 8,
  savedJobs: 12,
  walletBalance: 150.5,
  lastOrderStatus: "completed",
};

export const mockCVData: CVData = {
  id: "cv-1",
  title: "Senior Software Engineer CV",
  status: "ready",
  score: 85,
  updatedAt: new Date("2025-11-02"),
};

export const mockApplications: Application[] = [
  {
    id: "app-1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp",
    stage: "Interview",
    updatedAt: new Date("2025-11-03"),
  },
  {
    id: "app-2",
    jobTitle: "Full Stack Engineer",
    company: "StartupXYZ",
    stage: "Shortlisted",
    updatedAt: new Date("2025-11-02"),
  },
  {
    id: "app-3",
    jobTitle: "React Developer",
    company: "WebAgency",
    stage: "Applied",
    updatedAt: new Date("2025-11-01"),
  },
  {
    id: "app-4",
    jobTitle: "UI/UX Developer",
    company: "DesignHub",
    stage: "Rejected",
    updatedAt: new Date("2025-10-30"),
  },
];

export const mockRecommendedJobs: Job[] = [
  {
    id: "job-1",
    title: "Senior React Developer",
    company: "Innovation Labs",
    location: "Remote",
    salary: "$120k - $150k",
    type: "Full-time",
    matchScore: 92,
  },
  {
    id: "job-2",
    title: "Frontend Team Lead",
    company: "Digital Solutions",
    location: "New York, NY",
    salary: "$140k - $170k",
    type: "Full-time",
    matchScore: 88,
  },
  {
    id: "job-3",
    title: "JavaScript Developer",
    company: "CodeFactory",
    location: "San Francisco, CA",
    salary: "$110k - $140k",
    type: "Contract",
    matchScore: 85,
  },
];

export const mockOrders: Order[] = [
  {
    id: "order-1",
    service: "AI CV Builder Pro",
    status: "completed",
    amount: 29.99,
    date: new Date("2025-11-01"),
  },
  {
    id: "order-2",
    service: "CV Review Service",
    status: "processing",
    amount: 19.99,
    date: new Date("2025-11-03"),
  },
  {
    id: "order-3",
    service: "Premium Job Alerts",
    status: "completed",
    amount: 9.99,
    date: new Date("2025-10-28"),
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    from: "TechCorp Recruiter",
    subject: "Interview Invitation",
    preview: "We'd like to invite you for an interview...",
    unread: true,
    timestamp: new Date("2025-11-04T09:30:00"),
  },
  {
    id: "msg-2",
    from: "StartupXYZ HR",
    subject: "Application Update",
    preview: "Your application has been shortlisted...",
    unread: true,
    timestamp: new Date("2025-11-03T14:20:00"),
  },
  {
    id: "msg-3",
    from: "CVEEEZ Support",
    subject: "Your CV is ready!",
    preview: "Your AI-generated CV is now ready for download...",
    unread: false,
    timestamp: new Date("2025-11-02T11:00:00"),
  },
];

// Employer Mock Data
export const mockEmployerKPIs: EmployerKPIs = {
  openJobs: 12,
  applicantsToday: 24,
  shortlisted: 18,
  interviewsThisWeek: 7,
  planUsage: 65,
  kycStatus: "verified",
};

export const mockJobPerformance: JobPerformance[] = [
  {
    jobId: "job-1",
    jobTitle: "Senior Developer",
    views: 450,
    applies: 32,
    conversion: 7.1,
  },
  {
    jobId: "job-2",
    jobTitle: "Product Manager",
    views: 380,
    applies: 28,
    conversion: 7.4,
  },
  {
    jobId: "job-3",
    jobTitle: "UX Designer",
    views: 520,
    applies: 41,
    conversion: 7.9,
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "John Smith",
    position: "Senior Developer",
    stage: "Interview",
    matchScore: 95,
    appliedDate: new Date("2025-11-01"),
  },
  {
    id: "cand-2",
    name: "Sarah Johnson",
    position: "Senior Developer",
    stage: "Shortlist",
    matchScore: 88,
    appliedDate: new Date("2025-11-02"),
  },
  {
    id: "cand-3",
    name: "Mike Chen",
    position: "Product Manager",
    stage: "Screened",
    matchScore: 82,
    appliedDate: new Date("2025-11-03"),
  },
  {
    id: "cand-4",
    name: "Emily Davis",
    position: "UX Designer",
    stage: "New",
    matchScore: 90,
    appliedDate: new Date("2025-11-04"),
  },
];

export const mockBillingInfo: BillingInfo = {
  currentPlan: "Professional",
  nextInvoiceDate: new Date("2025-12-01"),
  amount: 99.0,
};

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    date: new Date("2025-11-01"),
    amount: 99.0,
    status: "paid",
  },
  {
    id: "inv-2",
    date: new Date("2025-10-01"),
    amount: 99.0,
    status: "paid",
  },
  {
    id: "inv-3",
    date: new Date("2025-09-01"),
    amount: 99.0,
    status: "paid",
  },
];

export const mockTeamActivity: TeamActivity[] = [
  {
    id: "act-1",
    user: "Alex Manager",
    action: "Shortlisted John Smith for Senior Developer",
    timestamp: new Date("2025-11-04T10:30:00"),
  },
  {
    id: "act-2",
    user: "Jane Recruiter",
    action: "Posted new job: Product Manager",
    timestamp: new Date("2025-11-04T09:15:00"),
  },
  {
    id: "act-3",
    user: "Alex Manager",
    action: "Scheduled interview with Sarah Johnson",
    timestamp: new Date("2025-11-03T16:45:00"),
  },
];

// Mock API functions with delays to simulate loading
export const fetchSeekerKPIs = async (): Promise<SeekerKPIs> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockSeekerKPIs;
};

export const fetchEmployerKPIs = async (): Promise<EmployerKPIs> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockEmployerKPIs;
};

export const fetchApplications = async (): Promise<Application[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockApplications;
};

export const fetchRecommendedJobs = async (): Promise<Job[]> => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return mockRecommendedJobs;
};

export const fetchCandidates = async (): Promise<Candidate[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockCandidates;
};
