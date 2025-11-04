
import type { Service } from "@/types/service";

export const services: Service[] = [
  {
    id: "ats-cv",
    name: "ATS-Friendly CV",
    description: "A CV optimized to pass through Applicant Tracking Systems.",
    longDescription: "Get a professionally crafted CV that is specifically designed to be easily parsed and understood by Applicant Tracking Systems (ATS), increasing your chances of landing an interview.",
    price: "$29.99",
    creationMethods: [
      {
        type: "ai",
        title: "AI-Powered Generation",
        description: "Use our AI to automatically generate a CV based on your input.",
      },
      {
        type: "manual",
        title: "Manual Creation",
        description: "Fill out a detailed form and our experts will craft your CV.",
      },
    ],
  },
  {
    id: "cover-letter",
    name: "Cover Letter",
    description: "A compelling cover letter tailored to your job application.",
    longDescription: "A personalized and persuasive cover letter that highlights your skills and experience, written to capture the attention of hiring managers.",
    price: "$19.99",
    creationMethods: [
      {
        type: "ai",
        title: "AI-Powered Generation",
        description: "Our AI will write a compelling cover letter for you in minutes.",
      },
    ],
  },
];
