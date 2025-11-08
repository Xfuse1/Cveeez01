export type UserRole = "seeker" | "employer";

export interface SeekerKPIs {
  profileCompleteness: number;
  cvVersions: number;
  activeApplications: number;
  savedJobs: number;
  walletBalance: number;
  lastOrderStatus: string;
}

export interface EmployerKPIs {
  openJobs: number;
  applicantsToday?: number;
  shortlisted?: number;
  interviewsThisWeek?: number;
  totalEmployers?: number;
  totalSeekers?: number;
  planUsage: number;
  kycStatus: "pending" | "verified" | "rejected";
}

export interface CVData {
  id: string;
  title: string;
  status: "draft" | "ai_running" | "ready";
  score: number;
  updatedAt: Date;
}

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  stage: "Applied" | "Shortlisted" | "Interview" | "Offer" | "Rejected";
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  matchScore?: number;
}

export interface Order {
  id: string;
  service: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  amount: number;
  date: Date;
}

export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  unread: boolean;
  timestamp: Date;
}

export interface JobPerformance {
  jobId: string;
  jobTitle: string;
  views: number;
  applies: number;
  conversion: number;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  stage: "New" | "Screened" | "Shortlist" | "Interview" | "Offer";
  matchScore: number;
  appliedDate: Date;
}

export interface BillingInfo {
  currentPlan: string;
  nextInvoiceDate: Date;
  amount: number;
}

export interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: "paid" | "pending" | "overdue";
}

export interface TeamActivity {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
}
