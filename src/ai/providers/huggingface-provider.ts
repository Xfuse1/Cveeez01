/**
 * HuggingFace AI Provider
 * Free inference API for text generation models
 */

import type { AIProviderInterface, AIGenerateRequest, AIGenerateResponse } from './types';

export class HuggingFaceProvider implements AIProviderInterface {
  private apiKey: string | undefined;
  private apiUrl = 'https://router.huggingface.co/models/';

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
  }

  async generate(request: Omit<AIGenerateRequest, 'provider'>): Promise<AIGenerateResponse> {
    const model = request.model || this.getDefaultModel();

    console.log(`🤗 Generating with HuggingFace (${model})...`);

    // HuggingFace Inference API endpoint
    const url = `${this.apiUrl}${model}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // API key is optional for public models but recommended for better rate limits
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: request.prompt,
        parameters: {
          temperature: request.config?.temperature ?? 0.7,
          max_new_tokens: request.config?.maxTokens ?? 2000,
          top_p: request.config?.topP ?? 0.95,
          do_sample: true,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HuggingFace API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // HuggingFace returns array of results
    let text = '';
    if (Array.isArray(data) && data.length > 0) {
      text = data[0].generated_text || data[0].text || '';
    } else if (typeof data === 'object' && data.generated_text) {
      text = data.generated_text;
    }

    if (!text) {
      throw new Error('No text generated from HuggingFace');
    }

    return {
      text: text.trim(),
      provider: 'huggingface',
      model: model,
    };
  }

  isAvailable(): boolean {
    // HuggingFace public API is always available (with rate limits)
    // Having an API key just improves rate limits
    return true;
  }

  getDefaultModel(): string {
    // Using Mistral-7B-Instruct - good free model for text generation
    return 'mistralai/Mistral-7B-Instruct-v0.2';
  }

  /**
   * Popular free HuggingFace models for CV generation
   */
  static getAvailableModels() {
    return [
      {
        id: 'mistralai/Mistral-7B-Instruct-v0.2',
        name: 'Mistral 7B Instruct',
        description: 'Fast and capable instruction-following model',
      },
      {
        id: 'meta-llama/Llama-2-7b-chat-hf',
        name: 'Llama 2 7B Chat',
        description: 'Meta\'s conversational model',
      },
      {
        id: 'google/flan-t5-xxl',
        name: 'FLAN-T5 XXL',
        description: 'Google\'s instruction-tuned model',
      },
      {
        id: 'bigscience/bloom-560m',
        name: 'BLOOM 560M',
        description: 'Multilingual model (smaller, faster)',
      },
    ];
  }
}
