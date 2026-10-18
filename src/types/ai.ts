export type AIProviderType = 'openai' | 'gemini' | 'custom';

export type AILanguage = 'Bangla' | 'Banglish' | 'English';

export type AIStyle =
  | 'Professional'
  | 'Short'
  | 'Friendly'
  | 'Marketplace'
  | 'Sales'
  | 'Minimal'
  | 'Detailed';

export type AIOperation =
  | 'generate'
  | 'regenerate'
  | 'shorten'
  | 'expand'
  | 'make_professional'
  | 'make_natural'
  | 'translate';

export interface AIProviderConfig {
  provider: AIProviderType;
  endpoint: string;
  apiKey: string;
  model: string;
  temperature: number;
}

export interface AIPromptContext {
  productName: string;
  productDetails?: string;
  price?: string;
  condition?: string;
  location?: string;
  targetAudience?: string;
  language: AILanguage;
  style: AIStyle;
  currentCaption?: string;
  targetLanguage?: AILanguage;
}

export interface AICompletionResult {
  success: boolean;
  content: string;
  provider: AIProviderType;
  model: string;
  error?: string;
  durationMs?: number;
}
