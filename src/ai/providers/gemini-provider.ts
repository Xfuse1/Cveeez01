/**
 * Gemini AI Provider
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type { AIProviderInterface, AIGenerateRequest, AIGenerateResponse } from './types';

let _geminiInstance: ReturnType<typeof genkit> | null = null;

export class GeminiProvider implements AIProviderInterface {
  private getAI() {
    if (_geminiInstance) return _geminiInstance;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    _geminiInstance = genkit({
      plugins: [googleAI({ apiKey: GEMINI_API_KEY })],
    });

    return _geminiInstance;
  }

  async generate(request: Omit<AIGenerateRequest, 'provider'>): Promise<AIGenerateResponse> {
    const ai = this.getAI();
    const model = request.model || this.getDefaultModel();

    console.log(`🔮 Generating with Gemini (${model})...`);

    const response = await ai.generate({
      model: model,
      prompt: request.prompt,
      config: {
        temperature: request.config?.temperature ?? 0.2,
        maxOutputTokens: request.config?.maxTokens ?? 8000,
      },
    });

    return {
      text: response.text,
      provider: 'gemini',
      model: model,
    };
  }

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  getDefaultModel(): string {
    return process.env.GEMINI_MODEL_ID || 'gemini-1.5-flash-latest';
  }
}
