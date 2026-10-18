import { AICompletionResult, AIOperation, AIPromptContext, AIProviderConfig } from '../../types/ai';
import { IAIProvider } from './types';

export class CustomProvider implements IAIProvider {
  name = 'Custom API';

  async generateCaption(context: AIPromptContext, config: AIProviderConfig): Promise<AICompletionResult> {
    return this.sendRequest('generate', context, config);
  }

  async transformCaption(
    operation: AIOperation,
    currentCaption: string,
    context: AIPromptContext,
    config: AIProviderConfig
  ): Promise<AICompletionResult> {
    return this.sendRequest(operation, { ...context, currentCaption }, config);
  }

  private async sendRequest(
    action: string,
    context: AIPromptContext,
    config: AIProviderConfig
  ): Promise<AICompletionResult> {
    const startTime = Date.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      headers['x-api-key'] = config.apiKey;
    }

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action,
          context,
          model: config.model,
          temperature: config.temperature,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Custom API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      // Support flexible output format: { content: "..." } or { text: "..." } or { result: "..." }
      const content = data.content || data.text || data.result || (typeof data === 'string' ? data : JSON.stringify(data));

      return {
        success: true,
        content: String(content).trim(),
        provider: 'custom',
        model: config.model || 'custom-model',
        durationMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        provider: 'custom',
        model: config.model || 'custom-model',
        error: errorMsg,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
