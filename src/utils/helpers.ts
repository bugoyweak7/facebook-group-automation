/**
 * Generates a unique ID with an optional prefix.
 */
export function generateId(prefix = 'id'): string {
  const rand = Math.random().toString(36).substring(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}

/**
 * Formats a timestamp into a human-readable date.
 */
export function formatDate(timestamp: number): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a timestamp into time with seconds.
 */
export function formatTime(timestamp: number): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Formats seconds into MM:SS format.
 */
export function formatDuration(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Safe clipboard copy with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Navigator clipboard failed, attempting execCommand fallback', err);
  }

  // Fallback for non-secure or extension contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error('Copy to clipboard failed completely:', fallbackErr);
    return false;
  }
}

/**
 * Triggers a file download in the browser.
 */
export function downloadFile(filename: string, content: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Truncates text with an ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Resolves spintax variations like {option1|option2|option3} into a single choice.
 * Handles nested spintax, Bengali text, emojis, and auto-repairs unclosed spintax.
 */
export function resolveSpintax(text: string): string {
  if (!text) return '';
  if (!text.includes('{') || !text.includes('|')) return text;

  let resolved = text;
  let iterations = 0;
  const spintaxRegex = /\{([^{}]+)\}/g;

  while (iterations < 10 && spintaxRegex.test(resolved)) {
    iterations++;
    resolved = resolved.replace(spintaxRegex, (match, choices) => {
      if (choices.includes('|')) {
        const options = choices.split('|').map((s: string) => s.trim()).filter(Boolean);
        if (options.length > 0) {
          return options[Math.floor(Math.random() * options.length)];
        }
      }
      return match;
    });
  }

  // Auto-repair unclosed or trailing spintax like "... {পছন্দ|পছন্দ"
  resolved = resolved.replace(/\{([^{}\r\n]+?)(?=[.,!?\r\n]|$)/g, (match, choices) => {
    if (choices.includes('|')) {
      const options = choices.split('|').map((s: string) => s.trim()).filter(Boolean);
      return options[0] || '';
    }
    return match;
  });

  return resolved;
}
