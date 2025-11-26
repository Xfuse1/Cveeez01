/**
 * AI Provider Types
 * Defines interfaces for multiple AI model providers
 */

export type AIProvider = 'gemini' | 'huggingface' | 'groq';

export interface AIGenerateConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface AIGenerateRequest {
  prompt: string;
  provider: AIProvider;
  model?: string;
  config?: AIGenerateConfig;
}

export interface AIGenerateResponse {
  text: string;
  provider: AIProvider;
  model: string;
}

export interface AIProviderInterface {
  generate(request: Omit<AIGenerateRequest, 'provider'>): Promise<AIGenerateResponse>;
  isAvailable(): boolean;
  getDefaultModel(): string;
}
