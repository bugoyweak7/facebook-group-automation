/**
 * Text Styler Utility: Unicode Font Transforms & Rich Formatting
 *
 * Provides:
 * - Sans-Serif Italic, Bold, Bold-Italic, Serif Bold, Serif Italic, Monospace
 * - Script (Cursive), Bold Script, Fraktur (Gothic), Bold Fraktur
 * - Double-Struck (Blackboard), Bubble (Circled), Black Bubble, Square, Black Square
 * - Strikethrough (combining slash for price cuts), Underline, Small Caps, Case conversion
 * - List styles: Bullet, Checkmark, Arrow, Star, Diamond, Numbered
 * - Decorative dividers & borders for Facebook posts
 * - Ready-made Caption Design Presets for high-converting sales
 * - 1-Click Sales Element Injectors (Price cut, specs, delivery, contact, warranty)
 * - Popular Facebook Emojis catalog
 * - Rich HTML generator for Facebook Lexical editor
 */

export type FontStyleType =
  | 'sans-italic'
  | 'sans-bold'
  | 'sans-bold-italic'
  | 'serif-bold'
  | 'serif-italic'
  | 'monospace'
  | 'script'
  | 'bold-script'
  | 'fraktur'
  | 'bold-fraktur'
  | 'double-struck'
  | 'bubble'
  | 'bubble-black'
  | 'square'
  | 'square-black'
  | 'small-caps'
  | 'strikethrough'
  | 'underline'
  | 'uppercase'
  | 'lowercase'
  | 'titlecase'
  | 'normal';

export type ListStyleType = 'bullet' | 'check' | 'arrow' | 'star' | 'diamond' | 'number';

// Small caps character mapping
const SMALL_CAPS_MAP: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
};

const REVERSE_SMALL_CAPS: Record<string, string> = {
  'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ғ': 'f', 'ɢ': 'g', 'ʜ': 'h', 'ɪ': 'i',
  'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p', 'ǫ': 'q', 'ʀ': 'r',
  'ᴛ': 't', 'ᴜ': 'u', 'ᴠ': 'v', 'ᴡ': 'w', 'ʏ': 'y', 'ᴢ': 'z',
};

// Character transformation table
function transformChar(ch: string, style: FontStyleType): string {
  const code = ch.charCodeAt(0);

  if (style === 'normal') {
    return normalizeStyledChar(ch);
  }

  // Small Caps
  if (style === 'small-caps') {
    const lower = ch.toLowerCase();
    return SMALL_CAPS_MAP[lower] || ch;
  }

  // Uppercase A-Z (65-90)
  if (code >= 65 && code <= 90) {
    const offset = code - 65;
    switch (style) {
      case 'sans-italic':
        return String.fromCodePoint(0x1d608 + offset);
      case 'sans-bold':
        return String.fromCodePoint(0x1d5d4 + offset);
      case 'sans-bold-italic':
        return String.fromCodePoint(0x1d63c + offset);
      case 'serif-bold':
        return String.fromCodePoint(0x1d400 + offset);
      case 'serif-italic':
        return String.fromCodePoint(0x1d434 + offset);
      case 'monospace':
        return String.fromCodePoint(0x1d670 + offset);
      case 'script': {
        // Special unicode points for script uppercase
        const scriptUpperExceptions: Record<number, number> = {
          66: 0x212c, // B
          69: 0x2130, // E
          70: 0x2131, // F
          72: 0x210b, // H
          73: 0x2110, // I
          76: 0x2112, // L
          77: 0x2133, // M
          82: 0x211b, // R
        };
        return String.fromCodePoint(scriptUpperExceptions[code] || (0x1d49c + offset));
      }
      case 'bold-script':
        return String.fromCodePoint(0x1d4d0 + offset);
      case 'fraktur': {
        const frakturExceptions: Record<number, number> = {
          67: 0x212d, // C
          72: 0x210c, // H
          73: 0x2111, // I
          82: 0x211c, // R
          90: 0x2128, // Z
        };
        return String.fromCodePoint(frakturExceptions[code] || (0x1d504 + offset));
      }
      case 'bold-fraktur':
        return String.fromCodePoint(0x1d56c + offset);
      case 'double-struck': {
        const doubleStruckExceptions: Record<number, number> = {
          67: 0x2102, // C
          72: 0x210d, // H
          78: 0x2115, // N
          80: 0x2119, // P
          81: 0x211a, // Q
          82: 0x211d, // R
          90: 0x2124, // Z
        };
        return String.fromCodePoint(doubleStruckExceptions[code] || (0x1d538 + offset));
      }
      case 'bubble':
        return String.fromCodePoint(0x24b6 + offset);
      case 'bubble-black':
        return String.fromCodePoint(0x1f150 + offset);
      case 'square':
        return String.fromCodePoint(0x1f130 + offset);
      case 'square-black':
        return String.fromCodePoint(0x1f170 + offset);
    }
  }

  // Lowercase a-z (97-122)
  if (code >= 97 && code <= 122) {
    const offset = code - 97;
    switch (style) {
      case 'sans-italic':
        return String.fromCodePoint(0x1d622 + offset);
      case 'sans-bold':
        return String.fromCodePoint(0x1d5ee + offset);
      case 'sans-bold-italic':
        return String.fromCodePoint(0x1d656 + offset);
      case 'serif-bold':
        return String.fromCodePoint(0x1d41a + offset);
      case 'serif-italic':
        if (ch === 'h') return '\u210e'; // Planck constant / math italic h
        return String.fromCodePoint(0x1d44e + offset);
      case 'monospace':
        return String.fromCodePoint(0x1d68a + offset);
      case 'script': {
        const scriptLowerExceptions: Record<number, number> = {
          101: 0x212f, // e
          103: 0x210a, // g
          111: 0x2134, // o
        };
        return String.fromCodePoint(scriptLowerExceptions[code] || (0x1d4b6 + offset));
      }
      case 'bold-script':
        return String.fromCodePoint(0x1d4ea + offset);
      case 'fraktur':
        return String.fromCodePoint(0x1d51e + offset);
      case 'bold-fraktur':
        return String.fromCodePoint(0x1d586 + offset);
      case 'double-struck':
        return String.fromCodePoint(0x1d552 + offset);
      case 'bubble':
        return String.fromCodePoint(0x24d0 + offset);
      case 'bubble-black':
        return String.fromCodePoint(0x1f150 + offset);
      case 'square':
        return String.fromCodePoint(0x1f130 + offset);
      case 'square-black':
        return String.fromCodePoint(0x1f170 + offset);
    }
  }

  // Digits 0-9 (48-57)
  if (code >= 48 && code <= 57) {
    const numOffset = code - 48;
    switch (style) {
      case 'sans-bold':
      case 'sans-bold-italic':
        return String.fromCodePoint(0x1d7ec + numOffset);
      case 'serif-bold':
        return String.fromCodePoint(0x1d7ce + numOffset);
      case 'monospace':
        return String.fromCodePoint(0x1d7f6 + numOffset);
      case 'double-struck':
        return String.fromCodePoint(0x1d7d8 + numOffset);
      case 'bubble':
        if (numOffset === 0) return '⓪';
        return String.fromCodePoint(0x2460 + (numOffset - 1));
      case 'bubble-black':
        if (numOffset === 0) return '⓿';
        return String.fromCodePoint(0x278a + (numOffset - 1));
      default:
        return ch;
    }
  }

  return ch;
}

/**
 * Reverses styled mathematical alphanumeric characters back to plain standard ASCII letters.
 */
export function normalizeStyledChar(ch: string): string {
  if (REVERSE_SMALL_CAPS[ch]) return REVERSE_SMALL_CAPS[ch];

  const cp = ch.codePointAt(0);
  if (!cp) return ch;

  // Serif Italic h
  if (cp === 0x210e) return 'h';

  // Script uppercase exceptions
  if (cp === 0x212c) return 'B';
  if (cp === 0x2130) return 'E';
  if (cp === 0x2131) return 'F';
  if (cp === 0x210b) return 'H';
  if (cp === 0x2110) return 'I';
  if (cp === 0x2112) return 'L';
  if (cp === 0x2133) return 'M';
  if (cp === 0x211b) return 'R';

  // Script lowercase exceptions
  if (cp === 0x212f) return 'e';
  if (cp === 0x210a) return 'g';
  if (cp === 0x2134) return 'o';

  // Fraktur exceptions
  if (cp === 0x212d) return 'C';
  if (cp === 0x210c) return 'H';
  if (cp === 0x2111) return 'I';
  if (cp === 0x211c) return 'R';
  if (cp === 0x2128) return 'Z';

  // Double-struck exceptions
  if (cp === 0x2102) return 'C';
  if (cp === 0x210d) return 'H';
  if (cp === 0x2115) return 'N';
  if (cp === 0x2119) return 'P';
  if (cp === 0x211a) return 'Q';
  if (cp === 0x211d) return 'R';
  if (cp === 0x2124) return 'Z';

  // Math Bold (1D400 - 1D433)
  if (cp >= 0x1d400 && cp <= 0x1d419) return String.fromCharCode(65 + (cp - 0x1d400));
  if (cp >= 0x1d41a && cp <= 0x1d433) return String.fromCharCode(97 + (cp - 0x1d41a));

  // Math Italic (1D434 - 1D467)
  if (cp >= 0x1d434 && cp <= 0x1d44d) return String.fromCharCode(65 + (cp - 0x1d434));
  if (cp >= 0x1d44e && cp <= 0x1d467) return String.fromCharCode(97 + (cp - 0x1d44e));

  // Math Bold Italic (1D468 - 1D49B)
  if (cp >= 0x1d468 && cp <= 0x1d481) return String.fromCharCode(65 + (cp - 0x1d468));
  if (cp >= 0x1d482 && cp <= 0x1d49b) return String.fromCharCode(97 + (cp - 0x1d482));

  // Math Script (1D49C - 1D4CF)
  if (cp >= 0x1d49c && cp <= 0x1d4b5) return String.fromCharCode(65 + (cp - 0x1d49c));
  if (cp >= 0x1d4b6 && cp <= 0x1d4cf) return String.fromCharCode(97 + (cp - 0x1d4b6));

  // Bold Script (1D4D0 - 1D503)
  if (cp >= 0x1d4d0 && cp <= 0x1d4e9) return String.fromCharCode(65 + (cp - 0x1d4d0));
  if (cp >= 0x1d4ea && cp <= 0x1d503) return String.fromCharCode(97 + (cp - 0x1d4ea));

  // Fraktur (1D504 - 1D537)
  if (cp >= 0x1d504 && cp <= 0x1d51d) return String.fromCharCode(65 + (cp - 0x1d504));
  if (cp >= 0x1d51e && cp <= 0x1d537) return String.fromCharCode(97 + (cp - 0x1d51e));

  // Bold Fraktur (1D56C - 1D59F)
  if (cp >= 0x1d56c && cp <= 0x1d585) return String.fromCharCode(65 + (cp - 0x1d56c));
  if (cp >= 0x1d586 && cp <= 0x1d59f) return String.fromCharCode(97 + (cp - 0x1d586));

  // Double-Struck (1D538 - 1D56B)
  if (cp >= 0x1d538 && cp <= 0x1d551) return String.fromCharCode(65 + (cp - 0x1d538));
  if (cp >= 0x1d552 && cp <= 0x1d56b) return String.fromCharCode(97 + (cp - 0x1d552));

  // Sans-Serif Bold (1D5D4 - 1D607)
  if (cp >= 0x1d5d4 && cp <= 0x1d5ed) return String.fromCharCode(65 + (cp - 0x1d5d4));
  if (cp >= 0x1d5ee && cp <= 0x1d607) return String.fromCharCode(97 + (cp - 0x1d5ee));

  // Sans-Serif Italic (1D608 - 1D63B)
  if (cp >= 0x1d608 && cp <= 0x1d621) return String.fromCharCode(65 + (cp - 0x1d608));
  if (cp >= 0x1d622 && cp <= 0x1d63b) return String.fromCharCode(97 + (cp - 0x1d622));

  // Sans-Serif Bold Italic (1D63C - 1D66F)
  if (cp >= 0x1d63c && cp <= 0x1d655) return String.fromCharCode(65 + (cp - 0x1d63c));
  if (cp >= 0x1d656 && cp <= 0x1d66f) return String.fromCharCode(97 + (cp - 0x1d656));

  // Monospace (1D670 - 1D6A3)
  if (cp >= 0x1d670 && cp <= 0x1d689) return String.fromCharCode(65 + (cp - 0x1d670));
  if (cp >= 0x1d68a && cp <= 0x1d6a3) return String.fromCharCode(97 + (cp - 0x1d68a));

  // Circled / Bubble (24B6 - 24E9)
  if (cp >= 0x24b6 && cp <= 0x24cf) return String.fromCharCode(65 + (cp - 0x24b6));
  if (cp >= 0x24d0 && cp <= 0x24e9) return String.fromCharCode(97 + (cp - 0x24d0));

  // Black Circled (1F150 - 1F169)
  if (cp >= 0x1f150 && cp <= 0x1f169) return String.fromCharCode(65 + (cp - 0x1f150));

  // Square (1F130 - 1F149)
  if (cp >= 0x1f130 && cp <= 0x1f149) return String.fromCharCode(65 + (cp - 0x1f130));

  // Black Square (1F170 - 1F189)
  if (cp >= 0x1f170 && cp <= 0x1f189) return String.fromCharCode(65 + (cp - 0x1f170));

  // Numbers (1D7CE - 1D7FF)
  if (cp >= 0x1d7ce && cp <= 0x1d7d7) return String.fromCharCode(48 + (cp - 0x1d7ce));
  if (cp >= 0x1d7d8 && cp <= 0x1d7e1) return String.fromCharCode(48 + (cp - 0x1d7d8));
  if (cp >= 0x1d7ec && cp <= 0x1d7f5) return String.fromCharCode(48 + (cp - 0x1d7ec));
  if (cp >= 0x1d7f6 && cp <= 0x1d7ff) return String.fromCharCode(48 + (cp - 0x1d7f6));

  // Circled digits
  if (cp === 0x24ea) return '0';
  if (cp >= 0x2460 && cp <= 0x2468) return String.fromCharCode(49 + (cp - 0x2460));
  if (cp === 0x24ff) return '0';
  if (cp >= 0x278a && cp <= 0x2792) return String.fromCharCode(49 + (cp - 0x278a));

  return ch;
}

/**
 * Normalizes all styled unicode characters in a string back to standard letters.
 */
export function toNormalText(text: string): string {
  if (!text) return '';
  // Strip combining strikethrough and underline
  const cleaned = text.replace(/[\u0336\u0335\u0332]/g, '');
  let result = '';
  for (const ch of cleaned) {
    result += normalizeStyledChar(ch);
  }
  return result;
}

/**
 * Applies a chosen font or transform style to text.
 */
export function applyTextStyle(text: string, style: FontStyleType): string {
  if (!text) return '';
  if (style === 'normal') return toNormalText(text);

  if (style === 'strikethrough') {
    // Strip existing strikethrough first to avoid stacking
    const cleaned = text.replace(/[\u0336\u0335]/g, '');
    return cleaned
      .split('')
      .map(c => (c === '\n' || c === '\r' || c === ' ' ? c : c + '\u0336'))
      .join('');
  }

  if (style === 'underline') {
    const cleaned = text.replace(/\u0332/g, '');
    return cleaned
      .split('')
      .map(c => (c === '\n' || c === '\r' || c === ' ' ? c : c + '\u0332'))
      .join('');
  }

  if (style === 'uppercase') {
    return toNormalText(text).toUpperCase();
  }

  if (style === 'lowercase') {
    return toNormalText(text).toLowerCase();
  }

  if (style === 'titlecase') {
    const norm = toNormalText(text);
    return norm.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  let result = '';
  const base = toNormalText(text);
  for (const ch of base) {
    result += transformChar(ch, style);
  }
  return result;
}

/**
 * Prefixes lines with bullet points (•) and clean indentation.
 */
export function applyBulletList(text: string): string {
  return applyCustomList(text, 'bullet');
}

/**
 * Applies customized list prefix (Bullet, Checkmark, Arrow, Star, Diamond, or Numbered) to lines.
 */
export function applyCustomList(text: string, listStyle: ListStyleType): string {
  const getPrefix = (index: number): string => {
    switch (listStyle) {
      case 'bullet':
        return '  • ';
      case 'check':
        return '  ✓ ';
      case 'arrow':
        return '  ➤ ';
      case 'star':
        return '  ★ ';
      case 'diamond':
        return '  ❖ ';
      case 'number':
        return `  ${index + 1}. `;
    }
  };

  if (!text) return getPrefix(0);

  const lines = text.split('\n');
  return lines
    .map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      // Strip any existing list markers
      const cleanLine = trimmed.replace(/^([•*\-–—✓✔➤➔★⭐◆❖]|\d+[\.\)])\s*/, '');
      return getPrefix(idx) + cleanLine;
    })
    .join('\n');
}

/**
 * 1-Click Magic Auto-Beautify for Facebook Marketplace / Group sale posts.
 */
export function autoBeautifyCaption(rawCaption: string): string {
  if (!rawCaption || !rawCaption.trim()) return rawCaption;

  const normalized = toNormalText(rawCaption);
  const lines = normalized.split('\n');
  const result: string[] = [];

  let foundTitle = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    // 1. Title / Header Line (First non-empty line)
    if (!foundTitle) {
      foundTitle = true;
      result.push(applyTextStyle(trimmed, 'sans-italic'));
      continue;
    }

    // 2. Model / Brand / Product label line
    if (/^(model|brand|device|item|condition|color|varient|variant)\s*[:=]/i.test(trimmed)) {
      const match = trimmed.match(/^([^:=]+[:=]\s*)(.*)$/);
      if (match) {
        const label = applyTextStyle(match[1], 'sans-italic');
        const value = match[2];
        result.push(label + value);
        continue;
      }
    }

    // 3. Spec / Feature lines
    const isBulletOrSpec =
      /^[•*\-–—✓✔➤➔★⭐◆❖]/.test(trimmed) ||
      /^(ram|rom|storage|storege|camera|battery|display|processor|chipset|condition|screen|charger|box|accessories|sound|sim|dual|official|unofficial|gaming|phone|fast)/i.test(
        trimmed
      ) ||
      (!trimmed.includes('.') && trimmed.length < 40 && !trimmed.toLowerCase().includes('exchange') && !trimmed.toLowerCase().includes('price'));

    if (isBulletOrSpec && !trimmed.toLowerCase().includes('exchange') && !trimmed.toLowerCase().includes('inbox')) {
      const cleanContent = trimmed.replace(/^[•*\-–—✓✔➤➔★⭐◆❖\s]+/, '');
      result.push('  • ' + cleanContent);
      continue;
    }

    // 4. Notes / Condition / Exchange lines
    if (
      trimmed.toLowerCase().includes('exchange') ||
      trimmed.toLowerCase().includes('price') ||
      trimmed.toLowerCase().includes('inbox') ||
      trimmed.toLowerCase().includes('call') ||
      trimmed.toLowerCase().includes('contact') ||
      trimmed.toLowerCase().includes('location')
    ) {
      result.push(applyTextStyle(trimmed, 'sans-italic'));
      continue;
    }

    // Default line
    result.push(rawLine);
  }

  return result.join('\n');
}

/**
 * Converts a styled caption into rich HTML for Facebook Lexical's native HTML parser.
 */
export function convertToRichHtml(caption: string): string {
  if (!caption) return '<p><br></p>';

  const lines = caption.split('\n');
  const htmlParts: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      htmlParts.push('<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>');
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      htmlParts.push('<p><br></p>');
      continue;
    }

    // Check if line is a bullet item
    const bulletMatch = trimmed.match(/^[•✓✔➤➔★⭐◆❖]\s*(.*)$/) || trimmed.match(/^[\-*–—]\s+(.*)$/);
    if (bulletMatch) {
      inList = true;
      listItems.push(formatInlineFormatting(bulletMatch[1]));
      continue;
    }

    flushList();
    htmlParts.push(`<p>${formatInlineFormatting(rawLine)}</p>`);
  }

  flushList();
  return htmlParts.join('');
}

function formatInlineFormatting(text: string): string {
  if (!text) return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Bold Italic: ***text*** or ___text___
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em style="font-style: italic;">$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em style="font-style: italic;">$1</em></strong>');

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*([^*\n]+?)\*/g, '<em style="font-style: italic;">$1</em>');
  html = html.replace(/_([^_\n]+?)_/g, '<em style="font-style: italic;">$1</em>');

  return html;
}

export function htmlToStyledText(html: string): string {
  if (!html || !html.trim()) return '';

  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      if (doc && doc.body) {
        doc.querySelectorAll('i, em, span[style*="italic"]').forEach(el => {
          const txt = el.textContent || '';
          if (txt.trim()) el.textContent = applyTextStyle(txt, 'sans-italic');
        });

        doc.querySelectorAll('b, strong, span[style*="bold"], span[style*="700"]').forEach(el => {
          const txt = el.textContent || '';
          if (txt.trim()) el.textContent = applyTextStyle(txt, 'sans-bold');
        });

        doc.querySelectorAll('s, strike, del, span[style*="line-through"]').forEach(el => {
          const txt = el.textContent || '';
          if (txt.trim()) el.textContent = applyTextStyle(txt, 'strikethrough');
        });

        doc.querySelectorAll('u, ins, span[style*="underline"]').forEach(el => {
          const txt = el.textContent || '';
          if (txt.trim()) el.textContent = applyTextStyle(txt, 'underline');
        });

        doc.querySelectorAll('li').forEach(el => {
          const txt = (el.textContent || '').trim();
          el.textContent = '  • ' + txt + '\n';
        });

        doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        doc.querySelectorAll('p, div').forEach(block => {
          block.appendChild(document.createTextNode('\n'));
        });

        const result = (doc.body.textContent || '').trim();
        if (result.length > 0) {
          return result
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        }
      }
    } catch (_) {}
  }

  let text = html;
  text = text.replace(/<(i|em)\b[^>]*>(.*?)<\/\1>/gi, (_, __, content) => applyTextStyle(content, 'sans-italic'));
  text = text.replace(/<(b|strong)\b[^>]*>(.*?)<\/\1>/gi, (_, __, content) => applyTextStyle(content, 'sans-bold'));
  text = text.replace(/<(s|del|strike)\b[^>]*>(.*?)<\/\1>/gi, (_, __, content) => applyTextStyle(content, 'strikethrough'));
  text = text.replace(/<(u|ins)\b[^>]*>(.*?)<\/\1>/gi, (_, __, content) => applyTextStyle(content, 'underline'));
  text = text.replace(/<li\b[^>]*>(.*?)<\/li>/gi, (_, content) => '  • ' + content.trim() + '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/(p|div)>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');

  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============================================================================
// DECORATIVE DIVIDERS & BORDERS
// ============================================================================

export interface DividerItem {
  name: string;
  value: string;
}

export const DECORATIVE_DIVIDERS: DividerItem[] = [
  { name: 'Double Line (সমান লাইন)', value: '══════════════════════════════' },
  { name: 'Thick Line (মোটা লাইন)', value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
  { name: 'Thin Line (চিকন লাইন)', value: '──────────────────────────────' },
  { name: 'Star Sparkle (তারকা বর্ডার)', value: '•┈┈┈••✦••┈┈┈••✦••┈┈┈••✦••┈┈┈•' },
  { name: 'Flower Border (ফুলের বর্ডার)', value: '✿════════════════════════════✿' },
  { name: 'Block Blocks (বক্স প্যাটার্ন)', value: '▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄' },
  { name: 'Dashed Dots (ডট লাইন)', value: '┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈' },
  { name: 'Double Arrow Star (স্টার অ্যারো)', value: '»»————-　★　————-««' },
];

// ============================================================================
// POPULAR FACEBOOK SALES EMOJIS
// ============================================================================

export interface EmojiCategory {
  category: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    category: '🔥 Sales & Hot (হট ও অফার)',
    emojis: ['🔥', '⚡', '💥', '🚨', '📢', '🏷️', '💯', '🚀', '⭐', '✨', '👑', '🎯', '💫', '🌟'],
  },
  {
    category: '💰 Price & Shop (মূল্য ও কেনাকাটা)',
    emojis: ['💰', '💵', '৳', '💳', '🛒', '🛍️', '📦', '🎁', '💎', '🧾', '🔖', '🪙'],
  },
  {
    category: '📱 Tech & Gadget (মোবাইল ও গ্যাজেট)',
    emojis: ['📱', '💻', '🖥️', '🎧', '⌚', '📷', '🔋', '🔌', '⚙️', '📺', '🎮', '📸'],
  },
  {
    category: '🚚 Delivery & Place (ডেলিভারি ও ঠিকানা)',
    emojis: ['🚚', '🛵', '🚗', '🚲', '🏠', '📍', '🌍', '🕒', '✈️', '🏢', '🗺️'],
  },
  {
    category: '📞 Contact & Social (যোগাযোগ ও ইনবক্স)',
    emojis: ['📞', '📱', '💬', '✉️', '📩', '📲', '🤙', '💌', '🌐', '🔔', '🗨️'],
  },
  {
    category: '✅ Symbols & Badges (প্রতীক ও টিকচিহ্ন)',
    emojis: ['✅', '✔️', '❌', '👉', '➔', '➜', '✦', '★', '❖', '💎', '🔴', '🟢', '🔹', '🔸'],
  },
];

export const POPULAR_QUICK_EMOJIS: string[] = [
  '🔥', '⚡', '💥', '💰', '৳', '📍', '🚚', '📞', '💬', '👉', '📦', '🏷️', '🚨', '🚀', '💯', '🛒', '👑', '⭐', '✨', '✅', '🎁', '📱'
];

// ============================================================================
// 1-CLICK SALES ELEMENT SNIPPETS
// ============================================================================

export interface SalesSnippet {
  id: string;
  name: string;
  icon: string;
  content: string;
}

export const SALES_SNIPPETS: SalesSnippet[] = [
  {
    id: 'price-cut',
    name: 'Price Cut (ডিসকাউন্ট মূল্য)',
    icon: '💰',
    content: '💰 Regular Price: ̶২̶,̶৫̶০̶০̶ ৳  ➔  Offer Price: {price}',
  },
  {
    id: 'cod-delivery',
    name: 'Cash on Delivery (ক্যাশ অন ডেলিভারি)',
    icon: '🚚',
    content: '🚚 সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি (প্রোডাক্ট দেখে পেমেন্ট করার সুবিধা)!',
  },
  {
    id: 'location',
    name: 'Location (ঠিকানা / লোকেশন)',
    icon: '📍',
    content: '📍 Location: {location}',
  },
  {
    id: 'contact-whatsapp',
    name: 'Phone / WhatsApp (কল ও হোয়াটসঅ্যাপ)',
    icon: '📞',
    content: '📞 Call / WhatsApp: {contact_info}',
  },
  {
    id: 'condition-fresh',
    name: '100% Fresh Condition (কন্ডিশন)',
    icon: '⚡',
    content: '⚡ Condition: ১০০% ফুল ফ্রেশ, কোনো স্ক্র্যাচ বা সমস্যা নেই।',
  },
  {
    id: 'warranty',
    name: 'Warranty / Replacement (ওয়ারেন্টি)',
    icon: '🎁',
    content: '🎁 ৭ দিনের রিপ্লেসমেন্ট এবং ১ বছরের ফ্রি সার্ভিস ওয়ারেন্টি!',
  },
  {
    id: 'urgency-stock',
    name: 'Limited Stock (সীমিত স্টক সতর্কতা)',
    icon: '🚨',
    content: '🚨 Limited Stock Available! অফার শেষ হওয়ার আগেই দ্রুত অর্ডার করুন!',
  },
  {
    id: 'inbox-cta',
    name: 'Inbox CTA (ইনবক্স আহ্বান)',
    icon: '💬',
    content: '👉 অর্ডার করতে অথবা যেকোনো তথ্যের জন্য এখনই ইনবক্স করুন!',
  },
  {
    id: 'exchange-offer',
    name: 'Exchange Offer (এক্সচেঞ্জ অফার)',
    icon: '🔄',
    content: '🔄 যেকোনো ব্যবহৃত ফোন/ডিভাইসের সাথে এক্সচেঞ্জ পসিবল (শর্ত প্রযোজ্য)।',
  },
];

// ============================================================================
// READY-MADE CAPTION DESIGN PRESETS
// ============================================================================

export interface CaptionPreset {
  id: string;
  name: string;
  categoryName: string;
  icon: string;
  description: string;
  template: string;
}

export const CAPTION_PRESETS: CaptionPreset[] = [
  {
    id: 'mobile-gadget-sale',
    name: 'Mobile / Gadget Sale & Exchange',
    categoryName: 'মোবাইল ও গ্যাজেট',
    icon: '📱',
    description: 'Perfect for smartphones, tablets, and electronics sale or exchange.',
    template: `𝘴𝘢𝘭𝘦 𝘰𝘳 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦

𝘮𝘰𝘥𝘦𝘭 : {product_name}
  • 𝚁𝙰𝙼 / 𝚁𝙾𝙼 : 8GB / 128GB
  • 𝙲𝚊𝚖𝚎𝚛𝚊 : 100% Super Clear Lens
  • 𝙱𝚊𝚝𝚝𝚎𝚛𝚢 : 5000 mAh (Healthy backup)
  • 𝙲𝚘𝚗𝚍𝚒𝚝𝚒𝚘𝚗 : Full fresh, no scratch or internal issue

𝘑𝘦𝘬𝘰𝘯𝘰 𝘱𝘩𝘰𝘯𝘦 𝘦𝘳 𝘴𝘢𝘵𝘩𝘦 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦 𝘱𝘰𝘴𝘴𝘪𝘣𝘭𝘦 (𝘈𝘥𝘥 𝘭𝘢𝘨𝘣𝘦)
💰 𝘱𝘳𝘪𝘤𝘦 : {price}
📍 𝘭𝘰𝘤𝘢𝘵𝘪𝘰𝘯 : {location}
📞 𝘤𝘰𝘯𝘵𝘢𝘤𝘵 : {contact_info}`,
  },
  {
    id: 'ecommerce-flash-offer',
    name: 'E-Commerce Magic Flash Sale',
    categoryName: 'হট ডিল অফার',
    icon: '🔥',
    description: 'High-converting layout with regular vs offer price, benefits, and COD guarantee.',
    template: `🔥 𝗠𝗔𝗚𝗜𝗖 𝗦𝗔𝗟𝗘 𝗢𝗙𝗙𝗘𝗥! 🔥
══════════════════════════════
{product_name}
══════════════════════════════

✨ 𝗞𝗲𝘆 𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:
  ✓ ১০০% অরিজিনাল এবং প্রিমিয়াম কোয়ালিটি
  ✓ সাথে পাচ্ছেন ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি
  ✓ আকর্ষণীয় ডিজাইন ও দীর্ঘস্থায়ী ব্যবহার

💰 Regular Price: ̶২̶,̶৫̶০̶০̶ ৳
💥 Offer Price: {price}

🚚 সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি!
📦 প্রোডাক্ট হাতে পেয়ে দেখে মূল্য পরিশোধের সুবিধা।

👉 অর্ডার করতে এখনই ইনবক্স করুন অথবা কল করুন:
📞 {contact_info}`,
  },
  {
    id: 'fashion-boutique-collection',
    name: 'Fashion & Boutique Collection',
    categoryName: 'পোশাক ও ফ্যাশন',
    icon: '👗',
    description: 'Elegant design for clothing, footwear, watches, and boutique products.',
    template: `✨ 𝗡𝗲𝘄 𝗔𝗿𝗿𝗶𝘃𝗮𝗹 - 𝗘𝘅𝗰𝗹𝘂𝘀𝗶𝘃𝗲 𝗖𝗼𝗹𝗹𝗲𝗰𝘁𝗶𝗼𝗻 ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👗 {product_name}

  ❖ ফেব্রিক: প্রিমিয়াম কোয়ালিটি সফট ফ্যাব্রিক
  ❖ সাইজ: M, L, XL, XXL এভেইলেবল
  ❖ কালার: ছবিতে দেখানো সেইম কালার
  ❖ ফিনিশিং: ১০০% নিখুঁত স্টিচিং ও আরামদায়ক

💵 ধামাকা প্রাইস: {price}
🚚 ডেলিভারি চার্জ: ঢাকা ৮০ টাকা, ঢাকার বাইরে ১৩০ টাকা।

📩 আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিয়ে এখনই ইনবক্স করুন!`,
  },
  {
    id: 'bike-cycle-vehicle-sale',
    name: 'Bike & Vehicle Sale Listing',
    categoryName: 'বাইক ও সাইকেল',
    icon: '🏍️',
    description: 'Detailed specifications for motorbikes, cycles, and cars.',
    template: `🏍️ 𝗙𝗼𝗿 𝗦𝗮𝗹𝗲 / বিক্রয় 🏍️
•┈┈┈••✦••┈┈┈••✦••┈┈┈••✦••┈┈┈•
{product_name}

  ➤ মডেল ও ইয়ার: 2023 Model
  ➤ কিলোমিটার রান: 12,500 km
  ➤ পেপারস: 2 Years Registration (All papers 100% OK)
  ➤ কন্ডিশন: একদম নতুনের মতো, এক টাকারও কাজ নেই

💰 আস্কিং প্রাইস: {price} (কিছুটা সম্মান করা হবে)
📍 লোকেশন: {location}
📞 সরাসরি কল দিন: {contact_info}`,
  },
  {
    id: 'short-punchy-deal',
    name: 'Short & Punchy Flash Deal',
    categoryName: 'শর্ট ডিল',
    icon: '⚡',
    description: 'Quick 3-bullet listing for instant engagement on busy groups.',
    template: `⚡ 𝗙𝗟𝗔𝗦𝗛 𝗦𝗔𝗟𝗘 𝗔𝗟𝗘𝗥𝗧! ⚡

{product_name}
  • 100% Genuine & Authentic
  • Ready Stock Available
  • Instant Delivery Guaranteed

💰 Regular: ̶1̶9̶9̶9̶ ➔ Only: {price}
👉 দ্রুত ইনবক্স করুন, লিমিটেড স্টক!`,
  },
  {
    id: 'flat-room-property-rent',
    name: 'Property & Flat Rent Listing',
    categoryName: 'বাসা/ফ্ল্যাট ভাড়া',
    icon: '🏠',
    description: 'Structured layout for apartment, room, or office space rentals.',
    template: `🏠 𝗙𝗹𝗮𝘁 / 𝗥𝗼𝗼𝗺 𝗥𝗲𝗻𝘁 🏠
──────────────────────────────
{product_name}

  ◆ অবস্থান: {location}
  ◆ বেডরুম ও বাথরুম: 2 Bed, 2 Bath, Balcony
  ◆ সুবিধা: 24h Security, Lift, Generator backup
  ◆ ভাড়া: {price} (Service charge included)

📞 বিস্তারিত জানতে ও সরাসরি ভিজিট করতে কল করুন:
📱 {contact_info}`,
  },
];

// Re-export resolveSpintax so text utilities are centrally available
export { resolveSpintax } from './helpers';

/**
 * Automatically detects and cleans accidental duplicated post captions.
 * Fixes double-paste issues where the same caption is repeated twice:
 * (e.g. Text A followed immediately or separated by space/newline by Text A).
 */
export function deduplicateRepeatedCaption(text: string): string {
  if (!text || typeof text !== 'string') return text || '';
  const trimmed = text.trim();
  if (trimmed.length < 20) return text;

  // 1. Direct split in half check (exact or near-exact halves)
  const len = trimmed.length;
  const half = Math.floor(len / 2);

  for (let offset = -15; offset <= 15; offset++) {
    const mid = half + offset;
    if (mid > 10 && mid < len) {
      const first = trimmed.slice(0, mid).trim();
      const second = trimmed.slice(mid).trim();
      if (first.length >= 15 && first === second) {
        return first;
      }
    }
  }

  // 2. Prefix re-occurrence check: Find if the beginning of the text repeats later in the text
  const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
  if (lines.length >= 2) {
    const firstLine = lines[0].trim();
    if (firstLine.length >= 10) {
      let searchIdx = firstLine.length;
      while (searchIdx < trimmed.length) {
        const repeatIdx = trimmed.indexOf(firstLine, searchIdx);
        if (repeatIdx === -1) break;

        const firstHalf = trimmed.slice(0, repeatIdx).trim();
        const secondHalf = trimmed.slice(repeatIdx).trim();

        if (
          firstHalf.length >= 20 &&
          (firstHalf === secondHalf ||
            secondHalf.startsWith(firstHalf) ||
            firstHalf.startsWith(secondHalf) ||
            (firstHalf.length > 30 && secondHalf.length > 30 && (firstHalf.slice(0, 50) === secondHalf.slice(0, 50) && firstHalf.slice(-20) === secondHalf.slice(-20))))
        ) {
          return firstHalf;
        }

        searchIdx = repeatIdx + firstLine.length;
      }
    }
  }

  // 3. Fallback chunk search: first 35 chars
  if (trimmed.length > 60) {
    const sample = trimmed.slice(0, 35);
    const repeatPos = trimmed.indexOf(sample, 35);
    if (repeatPos > 0) {
      const part1 = trimmed.slice(0, repeatPos).trim();
      const part2 = trimmed.slice(repeatPos).trim();
      if (part1.length >= 25 && (part1 === part2 || part2.startsWith(part1.slice(0, Math.floor(part1.length * 0.85))))) {
        return part1;
      }
    }
  }

  return text;
}

