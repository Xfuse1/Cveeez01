import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Lazy factory for the Genkit instance. Avoids import-time initialization so
// builds or importers that don't actually call the AI won't fail at import.
let _aiInstance: ReturnType<typeof genkit> | null = null;

export function getAI() {
  if (typeof window !== 'undefined') {
    throw new Error('Genkit must only be used on the server.');
  }

  if (_aiInstance) return _aiInstance;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error('Missing required environment variable: GEMINI_API_KEY');
  }

  _aiInstance = genkit({
    plugins: [
      googleAI({ apiKey: GEMINI_API_KEY }),
    ],
  });

  return _aiInstance;
}

// Note: Do NOT export a pre-initialized `ai` instance — prefer callers to
// explicitly call `getAI()` so initialization happens under control.
