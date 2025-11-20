import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize with API key from environment
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  ],
});
