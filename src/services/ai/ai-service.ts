import { AICompletionResult, AIOperation, AIPromptContext, AIProviderConfig, AIProviderType } from '../../types/ai';
import { getSettings } from '../storage/chrome-storage';
import { logger } from '../logger/logger';
import { IAIProvider } from './types';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { CustomProvider } from './custom-provider';

class AIService {
  private providers: Record<AIProviderType, IAIProvider> = {
    openai: new OpenAIProvider(),
    gemini: new GeminiProvider(),
    custom: new CustomProvider(),
  };

  private getProvider(type: AIProviderType): IAIProvider {
    const provider = this.providers[type];
    if (!provider) {
      throw new Error(`Unsupported AI provider: ${type}`);
    }
    return provider;
  }

  async generateCaption(context: AIPromptContext, overrideConfig?: Partial<AIProviderConfig>): Promise<AICompletionResult> {
    const settings = await getSettings();
    const config: AIProviderConfig = {
      provider: overrideConfig?.provider || settings.ai.provider,
      endpoint: overrideConfig?.endpoint || settings.ai.endpoint,
      apiKey: overrideConfig?.apiKey || settings.ai.apiKey,
      model: overrideConfig?.model || settings.ai.model,
      temperature: overrideConfig?.temperature ?? settings.ai.temperature,
    };

    if (!config.apiKey && config.provider !== 'custom') {
      return {
        success: false,
        content: '',
        provider: config.provider,
        model: config.model,
        error: `Please configure your ${config.provider.toUpperCase()} API key in Settings before generating captions.`,
      };
    }

    const provider = this.getProvider(config.provider);
    await logger.info('ai', `Generating caption using ${provider.name} (${config.model})`);

    const result = await provider.generateCaption(context, config);

    if (result.success) {
      await logger.success('ai', `Caption generated successfully (${result.durationMs}ms)`);
    } else {
      await logger.error('ai', `Caption generation failed: ${result.error}`);
    }

    return result;
  }

  async transformCaption(
    operation: AIOperation,
    currentCaption: string,
    context: AIPromptContext,
    overrideConfig?: Partial<AIProviderConfig>
  ): Promise<AICompletionResult> {
    const settings = await getSettings();
    const config: AIProviderConfig = {
      provider: overrideConfig?.provider || settings.ai.provider,
      endpoint: overrideConfig?.endpoint || settings.ai.endpoint,
      apiKey: overrideConfig?.apiKey || settings.ai.apiKey,
      model: overrideConfig?.model || settings.ai.model,
      temperature: overrideConfig?.temperature ?? settings.ai.temperature,
    };

    if (!config.apiKey && config.provider !== 'custom') {
      return {
        success: false,
        content: '',
        provider: config.provider,
        model: config.model,
        error: `Please configure your ${config.provider.toUpperCase()} API key in Settings before transforming captions.`,
      };
    }

    const provider = this.getProvider(config.provider);
    await logger.info('ai', `Transforming caption (${operation}) using ${provider.name}`);

    const result = await provider.transformCaption(operation, currentCaption, context, config);

    if (result.success) {
      await logger.success('ai', `Caption transformed (${operation}) successfully`);
    } else {
      await logger.error('ai', `Caption transformation failed: ${result.error}`);
    }

    return result;
  }
}

export const aiService = new AIService();
