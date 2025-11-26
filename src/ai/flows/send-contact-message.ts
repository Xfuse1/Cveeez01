'use server';
/**
 * @fileOverview Handles sending a contact message.
 *
 * - sendContactMessage - A function that processes and "sends" a contact message.
 * - SendContactMessageInput - The input type for the sendContactMessage function.
 * - SendContactMessageOutput - The return type for the sendContactMessage function.
 */

import { getAI } from '@/ai/genkit';
import { z } from 'genkit';

const SendContactMessageInputSchema = z.object({
  name: z.string().describe('The name of the person sending the message.'),
  email: z.string().email().describe('The email of the person sending the message.'),
  message: z.string().describe('The content of the message.'),
});
export type SendContactMessageInput = z.infer<typeof SendContactMessageInputSchema>;

const SendContactMessageOutputSchema = z.object({
  success: z.boolean().describe('Whether the message was sent successfully.'),
  message: z.string().describe('A confirmation or error message.'),
});
export type SendContactMessageOutput = z.infer<typeof SendContactMessageOutputSchema>;

export async function sendContactMessage(
  input: SendContactMessageInput
): Promise<SendContactMessageOutput> {
  return sendContactMessageFlow(input);
}

const sendContactMessageFlow = getAI().defineFlow(
  {
    name: 'sendContactMessageFlow',
    inputSchema: SendContactMessageInputSchema,
    outputSchema: SendContactMessageOutputSchema,
  },
  async (input) => {
    // In a real application, you would integrate with an email sending service
    // like SendGrid, Nodemailer, or AWS SES here.
    // For this example, we will just log the message to the console
    // and return a success response.
    console.log('New contact message received:');
    console.log(`Name: ${input.name}`);
    console.log(`Email: ${input.email}`);
    console.log(`Message: ${input.message}`);
    
    // Simulate a successful sending process
    return {
      success: true,
      message: 'Your message has been sent successfully! We will get back to you shortly.',
    };
  }
);
