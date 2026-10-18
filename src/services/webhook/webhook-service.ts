import { getSettings } from '../storage/chrome-storage';
import { logger } from '../logger/logger';

export type WebhookEvent =
  | 'GROUP_ADDED'
  | 'POST_CREATED'
  | 'QUEUE_STARTED'
  | 'POST_READY'
  | 'POST_MARKED_POSTED'
  | 'POST_SKIPPED'
  | 'POST_FAILED'
  | 'QUEUE_COMPLETED';

export async function dispatchWebhookEvent(event: WebhookEvent, payload: Record<string, unknown>): Promise<void> {
  try {
    const settings = await getSettings();
    if (!settings.webhook.enabled || !settings.webhook.endpoint) {
      return; // Disabled by default
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AIGroupPoster-Extension/1.0',
    };

    if (settings.webhook.secret) {
      headers['x-agp-secret'] = settings.webhook.secret;
    }

    const body = {
      event,
      timestamp: Date.now(),
      payload,
    };

    // Non-blocking fetch
    fetch(settings.webhook.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }).catch(err => {
      logger.warning('queue', `Webhook dispatch to ${settings.webhook.endpoint} failed: ${err}`);
    });
  } catch (err) {
    // Non-fatal
    console.warn('Webhook error:', err);
  }
}
