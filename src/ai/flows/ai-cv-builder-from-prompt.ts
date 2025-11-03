
'use server';
/**
 * @fileOverview An AI CV builder agent that structures raw text into a CV format.
 *
 * - aiCvBuilderFromPrompt - A function that handles the CV structuring process.
 * - AICVBuilderFromPromptInput - The input type for the aiCvBuilderFromPrompt function.
 * - AICVBuilderFromPromptOutput - The return type for the aiCvBuilderFromPrompt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

const AICVBuilderFromPromptOutputSchema = z.object({
  fullName: z.string().describe("The full name of the user, extracted from the text. If not available, generate a placeholder like 'First Last Name'."),
  jobTitle: z.string().describe("The most recent or relevant job title for the user. If not available, generate a placeholder like 'Professional Title'."),
  contactInfo: z.object({
    email: z.string().optional().describe("User's email address. Omit if not provided."),
    phone: z.string().optional().describe("User's phone number. Omit if not provided."),
    linkedin: z.string().optional().describe("Link to user's LinkedIn profile. Omit if not provided."),
    location: z.string().optional().describe("User's city and country. Omit if not provided."),
  }).describe("User's contact information. Only include fields that are explicitly mentioned in the prompt."),
  headings: z.object({
    summary: z.string().describe("The heading for the professional summary section (e.g., 'Professional Summary', 'الملخص الاحترافي')."),
    experience: z.string().describe("The heading for the work experience section (e.g., 'Work Experience', 'الخبرة العملية')."),
    education: z.string().describe("The heading for the education section (e.g., 'Education', 'التعليم')."),
    skills: z.string().describe("The heading for the skills section (e.g., 'Skills', 'المهارات')."),
  }).describe("Dynamically generated headings for CV sections in the specified language."),
  summary: z.string().describe("A professional summary of 2-3 sentences based on the provided text."),
  experiences: z.array(ExperienceSchema).describe("A list of the user's work experiences."),
  education: z.array(EducationSchema).describe("A list of the user's educational background."),
  skills: z.array(z.string()).describe("A list of key skills extracted from the text."),
});
export type AICVBuilderFromPromptOutput = z.infer<typeof AICVBuilderFromPromptOutputSchema>;

export async function aiCvBuilderFromPrompt(input: AICVBuilderFromPromptInput): Promise<AICVBuilderFromPromptOutput> {
  return aiCvBuilderFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCvBuilderFromPromptPrompt',
  input: { schema: AICVBuilderFromPromptInputSchema },
  output: { schema: AICVBuilderFromPromptOutputSchema },
  prompt: `You are an expert CV writer and data extractor. Your task is to analyze the following raw text and structure it into a professional CV format. The final output must be in the specified language: {{{language}}}.

Analyze the user's input:
{{{prompt}}}

Follow these instructions:
1.  **Extract Core Information:** Extract the user's full name, most recent job title, and any available contact information (email, phone, LinkedIn, location). If a name or job title isn't provided, generate a plausible placeholder in the target language. Do not invent contact details if they are not in the prompt.
2.  **Generate Section Headings:** Create appropriate headings for the main CV sections (summary, experience, education, skills) in the target language ({{{language}}}).
3.  **Extract Work Experience:** Identify all job roles. For each role, extract the job title, company, location, start date, end date, and a list of responsibilities/achievements.
4.  **Extract Education:** Identify all educational qualifications. For each, extract the institution, degree, field of study, and graduation year.
5.  **Extract Skills:** Identify a list of key technical and soft skills.
6.  **Write a Professional Summary:** Based on the entire text, write a concise and compelling professional summary of 2-3 sentences.
7.  **Format:** Return the data strictly in the requested JSON format. Do not include any personal contact information in the main sections if it's not explicitly provided. Ensure all generated text (summary, headings, etc.) is in the target language: {{{language}}}.
`,
});

const aiCvBuilderFromPromptFlow = ai.defineFlow(
  {
    name: 'aiCvBuilderFromPromptFlow',
    inputSchema: AICVBuilderFromPromptInputSchema,
    outputSchema: AICVBuilderFromPromptOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
