/**
 * Groq AI Provider
 * Free, fast inference with Llama models
 */

import Groq from 'groq-sdk';
import type { AIProviderInterface, AIGenerateRequest, AIGenerateResponse } from './types';

export class GroqProvider implements AIProviderInterface {
  private client: Groq | null = null;

  private getClient() {
    if (this.client) return this.client;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    this.client = new Groq({ apiKey });
    return this.client;
  }

  async generate(request: Omit<AIGenerateRequest, 'provider'>): Promise<AIGenerateResponse> {
    const client = this.getClient();
    const model = request.model || this.getDefaultModel();

    console.log(`⚡ Generating with Groq (${model})...`);

    const completion = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
      temperature: request.config?.temperature ?? 0.2,
      max_tokens: request.config?.maxTokens ?? 8000,
      top_p: request.config?.topP ?? 1,
    });

    const text = completion.choices[0]?.message?.content || '';

    if (!text) {
      throw new Error('No text generated from Groq');
    }

    return {
      text: text.trim(),
      provider: 'groq',
      model: model,
    };
  }

  isAvailable(): boolean {
    return !!process.env.GROQ_API_KEY;
  }

  getDefaultModel(): string {
    return 'llama-3.3-70b-versatile';
  }

  /**
   * Available Groq models
   */
  static getAvailableModels() {
    return [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        description: 'Latest Llama model - very capable',
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        description: 'Fast and efficient',
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'Mixture of experts model',
      },
    ];
  }
}
