
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  // experienceLevel can be one of the defined levels, or 'N/A' when not provided by the employer
  // make it optional to reflect real-world data coming from Firestore where this field may be missing
  experienceLevel?: "Entry-level" | "Mid-level" | "Senior" | "Lead" | "Manager" | "N/A" | null;
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
