
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  type: "Full-time" | "Part-time";
  experienceLevel: "Entry-level" | "Mid-level" | "Senior";
  isRemote: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  currentRole: string;
  location: string;
  experienceLevel: "Entry-level" | "Mid-level" | "Senior";
  skills: string[];
}
