import { AICompletionResult, AIOperation, AIPromptContext, AIProviderConfig } from '../../types/ai';

export interface IAIProvider {
  name: string;
  generateCaption(context: AIPromptContext, config: AIProviderConfig): Promise<AICompletionResult>;
  transformCaption(
    operation: AIOperation,
    currentCaption: string,
    context: AIPromptContext,
    config: AIProviderConfig
  ): Promise<AICompletionResult>;
}
