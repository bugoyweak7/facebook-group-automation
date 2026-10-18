import { AICompletionResult, AIOperation, AIPromptContext, AIProviderConfig } from '../../types/ai';
import { IAIProvider } from './types';

export class OpenAIProvider implements IAIProvider {
  name = 'OpenAI';

  private buildSystemPrompt(context: AIPromptContext): string {
    return `You are an expert social media copywriter specializing in Facebook Marketplace and Facebook Group buy-and-sell posts.
Your goal is to write high-converting, attractive, clear captions that encourage genuine buyer engagement and inquiries.

Follow these rules:
1. Language: Write in ${context.language}. If language is Banglish, write Bengali phonetically in English alphabet like native Facebook sellers do. If Bangla, write in proper Bengali script. If English, write fluent, clean English.
2. Tone/Style: ${context.style}.
3. Formatting: Use neat line breaks, bullet points, and appropriate emojis to make the post readable and attractive.
4. Essential info: Highlight product name, price, key features, condition, and location clearly.
5. Safety: Do not make exaggerated false claims. Include a clear call to action (e.g. Inbox for details or call).`;
  }

  private buildUserPrompt(context: AIPromptContext): string {
    let prompt = `Create an engaging Facebook Group caption for the following product:\n`;
    prompt += `Product Name: ${context.productName}\n`;
    if (context.price) prompt += `Price: ${context.price}\n`;
    if (context.condition) prompt += `Condition: ${context.condition}\n`;
    if (context.location) prompt += `Location: ${context.location}\n`;
    if (context.productDetails) prompt += `Product Details: ${context.productDetails}\n`;
    if (context.targetAudience) prompt += `Target Audience: ${context.targetAudience}\n`;
    prompt += `\nPlease output only the ready-to-post caption text.`;
    return prompt;
  }

  private buildTransformPrompt(operation: AIOperation, currentCaption: string, context: AIPromptContext): string {
    let instruction = '';
    switch (operation) {
      case 'shorten':
        instruction = 'Make this caption much shorter, concise, and punchy while retaining the product name, price, and primary call to action.';
        break;
      case 'expand':
        instruction = 'Expand this caption by adding more engaging details, buyer benefits, and a stronger call to action.';
        break;
      case 'make_professional':
        instruction = 'Rewrite this caption in a polished, professional, and trustworthy commercial tone.';
        break;
      case 'make_natural':
        instruction = 'Rewrite this caption to sound very natural, friendly, and human, like an everyday local seller speaking directly to neighbors.';
        break;
      case 'translate':
        instruction = `Translate and adapt this caption into ${context.targetLanguage || context.language}, keeping the same tone and formatting.`;
        break;
      case 'regenerate':
      default:
        instruction = 'Rewrite this caption with a fresh, creative angle while keeping all the core product details intact.';
        break;
    }

    return `${instruction}\n\nLanguage to use: ${context.targetLanguage || context.language}\nStyle: ${context.style}\n\nOriginal Caption:\n"""\n${currentCaption}\n"""\n\nOutput only the revised caption text.`;
  }

  async generateCaption(context: AIPromptContext, config: AIProviderConfig): Promise<AICompletionResult> {
    const startTime = Date.now();
    const endpoint = config.endpoint.replace(/\/+$/, '') + '/chat/completions';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          temperature: config.temperature ?? 0.7,
          messages: [
            { role: 'system', content: this.buildSystemPrompt(context) },
            { role: 'user', content: this.buildUserPrompt(context) },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';

      return {
        success: true,
        content,
        provider: 'openai',
        model: config.model,
        durationMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        provider: 'openai',
        model: config.model,
        error: errorMsg,
        durationMs: Date.now() - startTime,
      };
    }
  }

  async transformCaption(
    operation: AIOperation,
    currentCaption: string,
    context: AIPromptContext,
    config: AIProviderConfig
  ): Promise<AICompletionResult> {
    const startTime = Date.now();
    const endpoint = config.endpoint.replace(/\/+$/, '') + '/chat/completions';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          temperature: config.temperature ?? 0.7,
          messages: [
            { role: 'system', content: this.buildSystemPrompt(context) },
            { role: 'user', content: this.buildTransformPrompt(operation, currentCaption, context) },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';

      return {
        success: true,
        content,
        provider: 'openai',
        model: config.model,
        durationMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        provider: 'openai',
        model: config.model,
        error: errorMsg,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
