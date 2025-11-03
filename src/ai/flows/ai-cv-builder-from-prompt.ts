
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
1.  **Extract Work Experience:** Identify all job roles. For each role, extract the job title, company, location, start date, end date, and a list of responsibilities/achievements.
2.  **Extract Education:** Identify all educational qualifications. For each, extract the institution, degree, field of study, and graduation year.
3.  **Extract Skills:** Identify a list of key technical and soft skills.
4.  **Write a Professional Summary:** Based on the entire text, write a concise and compelling professional summary of 2-3 sentences.
5.  **Format:** Return the data strictly in the requested JSON format. Do not include any personal contact information like phone numbers, email addresses, or physical addresses.
6.  **Language:** Ensure all generated text (summary, responsibilities, etc.) is in the target language: {{{language}}}.
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
