import { AICompletionResult, AIOperation, AIPromptContext, AIProviderConfig } from '../../types/ai';
import { IAIProvider } from './types';

export class GeminiProvider implements IAIProvider {
  name = 'Google Gemini';

  private buildPrompt(context: AIPromptContext, transformOp?: AIOperation, currentCaption?: string): string {
    const instructions = `You are an expert social media copywriter for Facebook Marketplace and Facebook Group buy-and-sell posts.
Write in language: ${context.targetLanguage || context.language}. (If Banglish, write colloquial Bengali in English alphabet. If Bangla, write in Bengali script. If English, write fluent English).
Style: ${context.style}.
Format with emojis, clean line breaks, and clear details.

Product Details:
Product Name: ${context.productName}
${context.price ? `Price: ${context.price}` : ''}
${context.condition ? `Condition: ${context.condition}` : ''}
${context.location ? `Location: ${context.location}` : ''}
${context.productDetails ? `Details: ${context.productDetails}` : ''}
${context.targetAudience ? `Target Audience: ${context.targetAudience}` : ''}
`;

    if (transformOp && currentCaption) {
      return `${instructions}\nExisting Caption:\n"""\n${currentCaption}\n"""\nTask: ${transformOp.toUpperCase()} this caption according to the instructions above. Output only the final caption text.`;
    }

    return `${instructions}\nTask: Generate an attractive, high-converting Facebook Group post caption. Output only the final caption text.`;
  }

  async generateCaption(context: AIPromptContext, config: AIProviderConfig): Promise<AICompletionResult> {
    return this.executeGemini(this.buildPrompt(context), config);
  }

  async transformCaption(
    operation: AIOperation,
    currentCaption: string,
    context: AIPromptContext,
    config: AIProviderConfig
  ): Promise<AICompletionResult> {
    return this.executeGemini(this.buildPrompt(context, operation, currentCaption), config);
  }

  private async executeGemini(prompt: string, config: AIProviderConfig): Promise<AICompletionResult> {
    const startTime = Date.now();
    const model = config.model || 'gemini-1.5-flash';
    const baseUrl = config.endpoint || 'https://generativelanguage.googleapis.com';
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const url = `${cleanBase}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: config.temperature ?? 0.7,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      return {
        success: true,
        content,
        provider: 'gemini',
        model,
        durationMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        provider: 'gemini',
        model,
        error: errorMsg,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
