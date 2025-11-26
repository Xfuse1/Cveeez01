import { NextRequest, NextResponse } from 'next/server';
import { checkEnv } from '@/lib/env-validation';
import { buildCvFromPrompt } from '@/ai/flows/ai-cv-builder-from-prompt';

export async function POST(request: NextRequest) {
  const { ok, missing } = checkEnv(['GEMINI_API_KEY']);
  if (!ok) {
    return NextResponse.json({ error: 'Missing environment variables', missing }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const prompt = body?.prompt ?? '';
  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  const result = await buildCvFromPrompt(prompt);
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'AI generation failed' }, { status: 500 });
  }
  return NextResponse.json({ data: result.data }, { status: 200 });
}
