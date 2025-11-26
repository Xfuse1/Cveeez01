'use server';
/**
 * @fileOverview An AI CV builder agent that structures raw text into a CV format using Gemini.
 *
 * - aiCvBuilderFromPrompt - A function that handles the CV structuring process.
 * - AICVBuilderFromPromptInput - The input type for the aiCvBuilderFromPrompt function.
 * - AICVBuilderFromPromptOutput - The return type for the aiCvBuilderFromPrompt function.
 */

import { z } from 'zod';
import { getAIProvider, type AIProvider } from '@/ai/providers';
import { getGenkitClient } from '@/ai/genkit';
import { geminiProvider } from '@/ai/providers';

const AICVBuilderFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe('A raw block of text containing a user\'s professional history, skills, and education.'),
  language: z.enum(['en', 'ar']).describe("The language for the CV output ('en' for English, 'ar' for Arabic)."),
  targetJobTitle: z.string().describe('Target job title the CV should be optimized for (e.g., "Senior React Developer").'),
  targetIndustry: z.string().describe('Target industry the CV should be optimized for (e.g., "Fintech").'),
  // Optional: hint to prefer quantified achievements where possible
  preferQuantified: z.boolean().optional().describe('If true, prefer quantifiable achievements where possible.'),
  // AI Provider selection
  aiProvider: z.enum(['gemini', 'huggingface', 'groq']).optional().describe('AI provider to use for generation'),
  aiModel: z.string().optional().describe('Specific model to use (provider-dependent)'),
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
TARGET JOB TITLE: ${input.targetJobTitle}
TARGET INDUSTRY: ${input.targetIndustry}
USER INPUT: ${input.prompt}

INSTRUCTION: Tailor every section to the Target Job Title and Target Industry. Optimize keywords, responsibilities, and summary so an ATS and a hiring manager for ${input.targetJobTitle} in ${input.targetIndustry} will recognize close matches.

GOAL: Rewrite and reformat the user's CV content to be strictly ATS-compatible and targeted.

STRICT ATS REQUIREMENTS:
1. Layout: Clean, minimal, text-only. No tables, icons, or graphics.
2. Headings: Use simple standard headings: Summary, Experience, Projects, Skills, Education, Languages, Certifications.
3. Summary: Rewrite to be keyword-rich and job-targeted. Focus on the user's core value proposition for ${input.targetJobTitle}.
4. Experience:
   - Use bullet points.
   - Start every bullet with a strong ACTION VERB (e.g., Led, Developed, Implemented, Optimized, Built, Collaborated).
   - Write each responsibility as an ACHIEVEMENT statement using this pattern: Action Verb + Specific Result (quantified when possible) + How/Tools used + Context.
   - Prefer numeric, verifiable metrics (percentage, absolute numbers, time saved, revenue impact). Do NOT fabricate numbers.
   - If numbers are not present in the user input, include a short actionable prompt in additionalSections titled "Suggested Metrics" that lists role-specific metric questions.
   - Focus on RESULTS and ACHIEVEMENTS, not just duties.
   - Highlight technical and domain keywords tailored to the target job and industry.
5. Skills: Group and categorize skills (e.g., Frontend, Backend, Tools, Soft Skills) and surface ATS-relevant keywords for ${input.targetJobTitle}.
6. Formatting:
   - Dates: Consistent format "YYYY" or "Month YYYY". Use "Present" for current roles.
   - No filler words. Clear, professional, concise.
7. Content: Do NOT fabricate information or invent metrics. If a numeric metric is not available, write the best non-quantified achievement and add a Suggested Metric prompt in additionalSections for the user to fill.

OUTPUT SCHEMA (JSON ONLY):
{
  "fullName": "string",
  "jobTitle": "string",
  "contactInfo": { "email": "...", "phone": "...", "linkedin": "...", "github": "...", "website": "...", "location": "..." },
  "headings": { "summary": "Summary", "experience": "Experience", "education": "Education", "skills": "Skills" },
  "summary": "string (keyword-rich, professional summary)",
  "experiences": [{ "jobTitle": "...", "company": "...", "location": "...", "startDate": "...", "endDate": "...", "responsibilities": ["Action Verb + Result (quantified if available)...", "Action Verb + Result..."] }],
  "education": [{ "institution": "...", "degree": "...", "fieldOfStudy": "...", "graduationYear": "..." }],
  "certifications": [{ "name": "...", "issuer": "...", "year": "..." }],
  "coreSkills": ["..."],
  "technicalSkills": ["..."],
  "softSkills": ["..."],
  "languages": [{ "name": "...", "proficiency": "..." }],
  "projects": [{ "name": "...", "description": "...", "link": "..." }],
  "additionalSections": [{ "title": "...", "items": ["..."] }]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just the JSON object. Ensure the additionalSections includes a section titled "Suggested Metrics" when the model could not confidently produce quantified metrics for roles. Each item should be a short question the UI can present to the user to collect the metric.
`;

  try {
    // Determine which AI provider to use
    const provider: AIProvider = input.aiProvider || 'gemini';
    console.log(`🚀 Starting CV generation with ${provider}...`);

    const aiProvider = getAIProvider(provider);

    if (!aiProvider.isAvailable()) {
      throw new Error(`AI provider "${provider}" is not available. Please configure the required API key.`);
    }

    const client = getGenkitClient(); // will throw if GEMINI_API_KEY missing

    // Use provider (example) - adapt actual call per provider API
    const result = await client.generate({ prompt: promptTemplate });

    console.log(`✅ Got response from ${provider} (${result.model})`);
    
    // Extract text from response
    
    // Clean the response to extract JSON
    let jsonStr = result.text.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    console.log('📝 Parsing JSON...');
    const parsed = JSON.parse(jsonStr);

    // Validate against schema
    console.log('✓ Validating schema...');
    const validated = AICVBuilderFromPromptOutputSchema.parse(parsed);

    console.log('✅ CV generated successfully!');
    return validated;
  } catch (error) {
    console.error('❌ Error in aiCvBuilderFromPrompt:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMsg);
    throw new Error(`Failed to generate CV: ${errorMsg}`);
  }
}
