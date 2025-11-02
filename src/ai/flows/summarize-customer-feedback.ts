'use server';
/**
 * @fileOverview Summarizes customer feedback to provide a quick overview for admins.
 *
 * - summarizeCustomerFeedback - A function that summarizes customer reviews.
 * - SummarizeCustomerFeedbackInput - The input type for the summarizeCustomerFeedback function.
 * - SummarizeCustomerFeedbackOutput - The return type for the summarizeCustomerFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCustomerFeedbackInputSchema = z.object({
  reviews: z.string().describe('Customer reviews to summarize.'),
});
export type SummarizeCustomerFeedbackInput = z.infer<typeof SummarizeCustomerFeedbackInputSchema>;

const SummarizeCustomerFeedbackOutputSchema = z.object({
  summary: z.string().describe('A summary of the customer reviews.'),
});
export type SummarizeCustomerFeedbackOutput = z.infer<typeof SummarizeCustomerFeedbackOutputSchema>;

export async function summarizeCustomerFeedback(input: SummarizeCustomerFeedbackInput): Promise<SummarizeCustomerFeedbackOutput> {
  return summarizeCustomerFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCustomerFeedbackPrompt',
  input: {schema: SummarizeCustomerFeedbackInputSchema},
  output: {schema: SummarizeCustomerFeedbackOutputSchema},
  prompt: `Summarize the following customer reviews:

{{{reviews}}}

Provide a concise summary of the main themes and sentiments expressed in the reviews.`,
});

const summarizeCustomerFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeCustomerFeedbackFlow',
    inputSchema: SummarizeCustomerFeedbackInputSchema,
    outputSchema: SummarizeCustomerFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
