import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { requireEnvVar } from '@/lib/env-validation';

// Lazy factory for the Genkit instance. Avoids import-time initialization so
// builds or importers that don't actually call the AI won't fail at import.
let _aiInstance: ReturnType<typeof genkit> | null = null;

export function getAI() {
  if (typeof window !== 'undefined') {
    throw new Error('Genkit must only be used on the server.');
  }

  if (_aiInstance) return _aiInstance;

  const GEMINI_API_KEY = requireEnvVar('GEMINI_API_KEY');
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in environment variables');
    console.error('💡 Please ensure .env file contains: GEMINI_API_KEY=your_key_here');
    throw new Error('Missing required environment variable: GEMINI_API_KEY');
  }

  // Validate API key format
  if (!GEMINI_API_KEY.startsWith('AIza')) {
    console.warn('⚠️  GEMINI_API_KEY format looks unusual. Expected format: AIza...');
  }

  if (GEMINI_API_KEY.length < 30) {
    console.warn('⚠️  GEMINI_API_KEY appears too short. It may be invalid.');
  }

  console.log('🔑 Initializing Genkit with Gemini API...');

  try {
    _aiInstance = genkit({
      plugins: [
        googleAI({ apiKey: GEMINI_API_KEY }),
      ],
    });

    console.log('✅ Genkit initialized successfully');
    return _aiInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Genkit:', error);
    throw error;
  }
}

// Note: Do NOT export a pre-initialized `ai` instance — prefer callers to
// explicitly call `getAI()` so initialization happens under control.
