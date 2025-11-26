import { NextRequest, NextResponse } from 'next/server';
import { aiCvBuilderFromPrompt } from '@/ai/flows/ai-cv-builder-from-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, language = 'en', targetJobTitle, targetIndustry, preferQuantified } = body;

    if (!prompt || !targetJobTitle || !targetIndustry) {
      return NextResponse.json({ error: 'Missing required fields: prompt, targetJobTitle, targetIndustry' }, { status: 400 });
    }

    // Call the server-side AI flow
    const result = await aiCvBuilderFromPrompt({ prompt, language, targetJobTitle, targetIndustry, preferQuantified });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('CV generate API error:', err);
    return NextResponse.json({ error: err?.message || 'Generation failed' }, { status: 500 });
  }
}
