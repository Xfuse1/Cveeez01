import { NextRequest, NextResponse } from 'next/server';
import { aiCvBuilderFromPrompt } from '@/ai/flows/ai-cv-builder-from-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, language = 'en', targetJobTitle, targetIndustry, preferQuantified, aiProvider = 'gemini', aiModel } = body;

    if (!prompt || !targetJobTitle || !targetIndustry) {
      return NextResponse.json({ error: 'Missing required fields: prompt, targetJobTitle, targetIndustry' }, { status: 400 });
    }

    console.log(`🤖 Requested AI Provider: ${aiProvider}, Model: ${aiModel || 'default'}`);

    // Validate environment variable based on provider
    const providerValidation: Record<string, string> = {
      'gemini': 'GEMINI_API_KEY',
      'groq': 'GROQ_API_KEY',
      'huggingface': '', // Optional for HuggingFace
    };

    const requiredKey = providerValidation[aiProvider];
    if (requiredKey && !process.env[requiredKey]) {
      console.error(`❌ ${requiredKey} is not configured for provider: ${aiProvider}`);
      return NextResponse.json({
        error: `Missing required environment variable: ${requiredKey}. Please contact the administrator or try a different AI provider.`
      }, { status: 500 });
    }

    // Call the server-side AI flow
    try {
      const result = await aiCvBuilderFromPrompt({
        prompt,
        language,
        targetJobTitle,
        targetIndustry,
        preferQuantified,
        aiProvider,
        aiModel
      });
      return NextResponse.json({ success: true, data: result });
    } catch (innerErr: any) {
      // Log full stack trace server-side for debugging but return safe JSON to clients
      console.error('CV generation failed:', innerErr?.stack || innerErr);

      // Check for specific error types and provide user-friendly messages
      let errorMessage = innerErr?.message || 'CV generation failed';

      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key expired')) {
        errorMessage = 'The AI service API key has expired. Please contact the administrator to renew it.';
      } else if (errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('GROQ_API_KEY')) {
        errorMessage = 'AI service configuration error. Please contact the administrator.';
      } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        errorMessage = 'AI service quota exceeded. Please try again later or contact support.';
      } else if (errorMessage.includes('not available')) {
        errorMessage = errorMessage; // Keep the provider error message
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (err: any) {
    console.error('CV generate API error:', err?.stack || err);
    return NextResponse.json({ error: err?.message || 'Generation failed' }, { status: 500 });
  }
}
