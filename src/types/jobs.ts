
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  experienceLevel: "Entry-level" | "Mid-level" | "Senior" | "Lead" | "Manager";
  isRemote: boolean;
  description: string;
  companyEmail?: string;
  companyPhone?: string;
  employerId: string;
  createdAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  currentRole: string;
  location: string;
  skills: string[];
  email: string | null;
  phone: string | null;
  nationality: string | null;
  bio: string | null;
}
