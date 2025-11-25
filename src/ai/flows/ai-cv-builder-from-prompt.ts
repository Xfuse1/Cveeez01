'use server';
/**
 * @fileOverview An AI CV builder agent that structures raw text into a CV format using Groq.
 *
 * - aiCvBuilderFromPrompt - A function that handles the CV structuring process.
 * - AICVBuilderFromPromptInput - The input type for the aiCvBuilderFromPrompt function.
 * - AICVBuilderFromPromptOutput - The return type for the aiCvBuilderFromPrompt function.
 */

import { z } from 'zod';
import { callGroqWithFallback } from '@/ai/groq';

const AICVBuilderFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe('A raw block of text containing a user\'s professional history, skills, and education.'),
  language: z.enum(['en', 'ar']).describe("The language for the CV output ('en' for English, 'ar' for Arabic)."),
});
export type AICVBuilderFromPromptInput = z.infer<typeof AICVBuilderFromPromptInputSchema>;

const ExperienceSchema = z.object({
  jobTitle: z.string().describe("The user's job title."),
  company: z.string().describe("The company where the user worked."),
  location: z.string().describe("The location of the company (e.g., 'City, State')."),
  startDate: z.string().describe("The start date of the employment (e.g., 'Month YYYY')."),
  endDate: z.string().describe("The end date of the employment or 'Present'."),
  responsibilities: z.array(z.string()).describe("A list of key responsibilities and achievements in this role.")
});

const EducationSchema = z.object({
  institution: z.string().describe("The name of the educational institution."),
  degree: z.string().describe("The degree obtained (e.g., 'Bachelor of Science')."),
  fieldOfStudy: z.string().describe("The field of study (e.g., 'Computer Science')."),
  graduationYear: z.string().describe("The year of graduation."),
});

const CertificationSchema = z.object({
  name: z.string().describe("Name of the certification or course."),
  issuer: z.string().optional().describe("Issuing organization."),
  year: z.string().optional().describe("Year awarded or completed."),
});

const LanguageSchema = z.object({
  name: z.string().describe("Language name."),
  proficiency: z.string().optional().describe("Proficiency level if provided."),
});

const ProjectSchema = z.object({
  name: z.string().describe("Project name."),
  description: z.string().describe("Short description or outcomes."),
  link: z.string().optional().describe("Optional link or reference."),
});

const AICVBuilderFromPromptOutputSchema = z.object({
  fullName: z.string().describe("Full Name"),
  jobTitle: z.string().describe("Job Title"),
  contactInfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
    location: z.string().optional(),
  }),
  headings: z.object({
    summary: z.string(),
    experience: z.string(),
    education: z.string(),
    skills: z.string(),
  }),
  summary: z.string(),
  experiences: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  certifications: z.array(CertificationSchema),
  coreSkills: z.array(z.string()),
  technicalSkills: z.array(z.string()),
  softSkills: z.array(z.string()),
  languages: z.array(LanguageSchema),
  projects: z.array(ProjectSchema),
  additionalSections: z
    .array(
      z.object({
        title: z.string(),
        items: z.array(z.string()),
      })
    )
    .optional(),
  skills: z.array(z.string()).optional(), // legacy compatibility
});
export type AICVBuilderFromPromptOutput = z.infer<typeof AICVBuilderFromPromptOutputSchema>;

export async function aiCvBuilderFromPrompt(input: AICVBuilderFromPromptInput): Promise<AICVBuilderFromPromptOutput> {
  const promptTemplate = `
You are an expert Resume Writer and ATS (Applicant Tracking System) Specialist.
Language: ${input.language}
USER INPUT: ${input.prompt}

GOAL: Rewrite and reformat the user's CV content to be strictly ATS-compatible.

STRICT ATS REQUIREMENTS:
1.  **Layout**: Clean, minimal, text-only. No tables, icons, or graphics.
2.  **Headings**: Use simple standard headings: Summary, Experience, Projects, Skills, Education, Languages, Certifications.
3.  **Summary**: Rewrite to be keyword-rich and job-targeted. Focus on the user's core value proposition.
4.  **Experience**:
    *   Use bullet points.
    *   Start every bullet with a strong ACTION VERB (e.g., Developed, Implemented, Optimized, Built, Collaborated).
    *   Focus on RESULTS and ACHIEVEMENTS, not just duties.
    *   Highlight technical keywords naturally.
5.  **Skills**: Group and categorize skills (e.g., Frontend, Backend, Tools, Soft Skills).
6.  **Formatting**:
    *   Dates: Consistent format "YYYY" or "Month YYYY". Use "Present" for current roles.
    *   No filler words. Clear, professional, concise.
7.  **Content**: Do NOT fabricate information, but optimize the wording of existing facts.

OUTPUT SCHEMA (JSON ONLY):
{
  "fullName": "string",
  "jobTitle": "string",
  "contactInfo": { "email": "...", "phone": "...", "linkedin": "...", "github": "...", "website": "...", "location": "..." },
  "headings": { "summary": "Summary", "experience": "Experience", "education": "Education", "skills": "Skills" },
  "summary": "string (keyword-rich, professional summary)",
  "experiences": [{ "jobTitle": "...", "company": "...", "location": "...", "startDate": "...", "endDate": "...", "responsibilities": ["Action Verb + Result...", "Action Verb + Result..."] }],
  "education": [{ "institution": "...", "degree": "...", "fieldOfStudy": "...", "graduationYear": "..." }],
  "certifications": [{ "name": "...", "issuer": "...", "year": "..." }],
  "coreSkills": ["..."],
  "technicalSkills": ["..."],
  "softSkills": ["..."],
  "languages": [{ "name": "...", "proficiency": "..." }],
  "projects": [{ "name": "...", "description": "...", "link": "..." }],
  "additionalSections": [{ "title": "...", "items": ["..."] }]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just the JSON object.
`;

  try {
    const response = await callGroqWithFallback(
      [
        {
          role: 'system',
          content: 'You are a professional CV builder. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: promptTemplate,
        },
      ],
      0.2
    );

    // Clean the response to extract JSON
    let jsonStr = response.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonStr);

    // Validate against schema
    const validated = AICVBuilderFromPromptOutputSchema.parse(parsed);

    return validated;
  } catch (error) {
    console.error('Error in aiCvBuilderFromPrompt:', error);
    throw new Error(`Failed to generate CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
