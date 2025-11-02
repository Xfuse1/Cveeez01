'use server';

/**
 * @fileOverview A GDPR compliance privacy policy generator AI agent.
 *
 * - generatePrivacyPolicy - A function that generates a privacy policy compliant with GDPR.
 * - GeneratePrivacyPolicyInput - The input type for the generatePrivacyPolicy function.
 * - GeneratePrivacyPolicyOutput - The return type for the generatePrivacyPolicy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePrivacyPolicyInputSchema = z.object({
  dataCollected: z
    .string()
    .describe(
      'The types of data collected from users, such as name, email, IP address, cookies, etc.'
    ),
  dataUsage: z
    .string()
    .describe('How the collected data is used, such as for marketing, analytics, etc.'),
  dataSharing: z
    .string()
    .describe(
      'How the collected data is shared with third parties, such as advertisers, service providers, etc.'
    ),
  dataRetention: z
    .string()
    .describe('How long the collected data is retained.'),
  userRights: z
    .string()
    .describe('The rights users have over their data, such as access, deletion, etc.'),
  gdprCompliance: z
    .string()
    .describe('How the website complies with GDPR regulations.'),
});
export type GeneratePrivacyPolicyInput = z.infer<typeof GeneratePrivacyPolicyInputSchema>;

const GeneratePrivacyPolicyOutputSchema = z.object({
  privacyPolicy: z.string().describe('The generated privacy policy.'),
});
export type GeneratePrivacyPolicyOutput = z.infer<typeof GeneratePrivacyPolicyOutputSchema>;

export async function generatePrivacyPolicy(
  input: GeneratePrivacyPolicyInput
): Promise<GeneratePrivacyPolicyOutput> {
  return generatePrivacyPolicyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePrivacyPolicyPrompt',
  input: {schema: GeneratePrivacyPolicyInputSchema},
  output: {schema: GeneratePrivacyPolicyOutputSchema},
  prompt: `You are an expert in GDPR compliance and privacy policies.

  Based on the information provided, generate a privacy policy that is compliant with GDPR.

  Data Collected: {{{dataCollected}}}
  Data Usage: {{{dataUsage}}}
  Data Sharing: {{{dataSharing}}}
  Data Retention: {{{dataRetention}}}
  User Rights: {{{userRights}}}
  GDPR Compliance: {{{gdprCompliance}}}

  Privacy Policy:`, // The output should be the privacy policy
});

const generatePrivacyPolicyFlow = ai.defineFlow(
  {
    name: 'generatePrivacyPolicyFlow',
    inputSchema: GeneratePrivacyPolicyInputSchema,
    outputSchema: GeneratePrivacyPolicyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
