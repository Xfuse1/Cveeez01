import { NextResponse } from 'next/server';

// Temporary health endpoint to verify presence of GEMINI_API_KEY on the server.
// Returns only a boolean flag; does NOT expose the key.
export async function GET() {
  try {
    return NextResponse.json({ hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
  } catch (err) {
    return NextResponse.json({ hasGeminiKey: false });
  }
}
