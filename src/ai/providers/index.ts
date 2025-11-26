/**
 * AI Provider Factory
 * Central point to get AI providers
 */

import { GeminiProvider } from './gemini-provider';
import { HuggingFaceProvider } from './huggingface-provider';
import { GroqProvider } from './groq-provider';
import type { AIProvider, AIProviderInterface } from './types';

export * from './types';

const providers: Record<AIProvider, AIProviderInterface> = {
  gemini: new GeminiProvider(),
  huggingface: new HuggingFaceProvider(),
  groq: new GroqProvider(),
};

export function getAIProvider(provider: AIProvider): AIProviderInterface {
  const p = providers[provider];
  if (!p) {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
  return p;
}

export function getAvailableProviders(): Array<{
  id: AIProvider;
  name: string;
  description: string;
  available: boolean;
  models: Array<{ id: string; name: string; description: string }>;
}> {
  return [
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Fast and powerful AI by Google',
      available: providers.gemini.isAvailable(),
      models: [
        {
          id: 'gemini-1.5-flash-latest',
          name: 'Gemini 1.5 Flash',
          description: 'Fast and efficient',
        },
        {
          id: 'gemini-1.5-pro-latest',
          name: 'Gemini 1.5 Pro',
          description: 'Most capable model',
        },
      ],
    },
    {
      id: 'groq',
      name: 'Groq (Llama)',
      description: 'Ultra-fast inference with Llama models',
      available: providers.groq.isAvailable(),
      models: GroqProvider.getAvailableModels(),
    },
    {
      id: 'huggingface',
      name: 'HuggingFace',
      description: 'Free open-source models',
      available: providers.huggingface.isAvailable(),
      models: HuggingFaceProvider.getAvailableModels(),
    },
  ];
}

export { default as geminiProvider } from './gemini-provider';
export { default as groqProvider } from './groq-provider';
export { default as huggingfaceProvider } from './huggingface-provider';
