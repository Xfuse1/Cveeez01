'use server';
/**
 * @fileOverview An AI CV builder agent.
 *
 * - aiCvBuilderFromPrompt - A function that handles the CV generation process from a prompt.
 * - AICVBuilderFromPromptInput - The input type for the aiCvBuilderFromPrompt function.
 * - AICVBuilderFromPromptOutput - The return type for the aiCvBuilderFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICVBuilderFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A prompt describing the desired job and skills to generate a CV from.'
    ),
});
export type AICVBuilderFromPromptInput = z.infer<typeof AICVBuilderFromPromptInputSchema>;

const AICVBuilderFromPromptOutputSchema = z.object({
  cv: z.string().describe('The generated CV in markdown format.'),
});
export type AICVBuilderFromPromptOutput = z.infer<typeof AICVBuilderFromPromptOutputSchema>;

export async function aiCvBuilderFromPrompt(input: AICVBuilderFromPromptInput): Promise<AICVBuilderFromPromptOutput> {
  return aiCvBuilderFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCvBuilderFromPromptPrompt',
  input: {schema: AICVBuilderFromPromptInputSchema},
  output: {schema: AICVBuilderFromPromptOutputSchema},
  prompt: `You are an expert CV writer. Generate a CV based on the following prompt:\n\nPrompt: {{{prompt}}}\n\nMake sure the CV is in markdown format. Do not include any personal contact information. Omit any references to phone, email, address, or social media.
`,
});

const aiCvBuilderFromPromptFlow = ai.defineFlow(
  {
    name: 'aiCvBuilderFromPromptFlow',
    inputSchema: AICVBuilderFromPromptInputSchema,
    outputSchema: AICVBuilderFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
