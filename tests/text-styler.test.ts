import { describe, it, expect } from 'vitest';
import {
  applyTextStyle,
  applyBulletList,
  autoBeautifyCaption,
  toNormalText,
  convertToRichHtml,
  htmlToStyledText,
  deduplicateRepeatedCaption,
} from '../src/utils/text-styler';

describe('Text Styler & Caption Designer', () => {
  it('converts plain Latin text to Sans-Serif Italic matching user screenshot font', () => {
    const raw = 'sale or exchange';
    const styled = applyTextStyle(raw, 'sans-italic');
    expect(styled).toBe('𝘴𝘢𝘭𝘦 𝘰𝘳 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦');
  });

  it('converts plain Latin text to Sans-Serif Bold', () => {
    const raw = 'sale or exchange';
    const styled = applyTextStyle(raw, 'sans-bold');
    expect(styled).toBe('𝘀𝗮𝗹𝗲 𝗼𝗿 𝗲𝘅𝗰𝗵𝗮𝗻𝗴𝗲');
  });

  it('normalizes styled unicode text back to standard ASCII', () => {
    const styled = '𝘴𝘢𝘭𝘦 𝘰𝘳 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦';
    const normal = toNormalText(styled);
    expect(normal).toBe('sale or exchange');
  });

  it('formats bullet list with indentation', () => {
    const text = 'Ram : 12gb\nSTOREGE : 256 gb\ngaming joss\nphone ekdom smotooth ase';
    const bulleted = applyBulletList(text);
    expect(bulleted).toContain('  • Ram : 12gb');
    expect(bulleted).toContain('  • STOREGE : 256 gb');
    expect(bulleted).toContain('  • gaming joss');
    expect(bulleted).toContain('  • phone ekdom smotooth ase');
  });

  it('replicates the exact user post design via autoBeautifyCaption', () => {
    const input = [
      'sale or exchange',
      '',
      'model : SAMSUNG S20 5G',
      'Ram : 12gb',
      'STOREGE : 256 gb',
      'gaming joss',
      'phone ekdom smotooth ase',
      'Jekono phone er sathe exchange hbe add lagbe',
      'price inbox',
    ].join('\n');

    const beautified = autoBeautifyCaption(input);

    // Title should be Sans-Serif Italic
    expect(beautified).toContain('𝘴𝘢𝘭𝘦 𝘰𝘳 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦');

    // Label should be Italic
    expect(beautified).toContain('𝘮𝘰𝘥𝘦𝘭 : SAMSUNG S20 5G');

    // Features should be indented bullets
    expect(beautified).toContain('  • Ram : 12gb');
    expect(beautified).toContain('  • STOREGE : 256 gb');
    expect(beautified).toContain('  • gaming joss');
    expect(beautified).toContain('  • phone ekdom smotooth ase');

    // Conditions and price lines should be Italic
    expect(beautified).toContain('𝘑𝘦𝘬𝘰𝘯𝘰 𝘱𝘩𝘰𝘯𝘦 𝘦𝘳 𝘴𝘢𝘵𝘩𝘦 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦 𝘩𝘣𝘦 𝘢𝘥𝘥 𝘭𝘢𝘨𝘣𝘦');
    expect(beautified).toContain('𝘱𝘳𝘪𝘤𝘦 𝘪𝘯𝘣𝘰𝘹');
  });

  it('converts markdown and styled text into rich HTML for Facebook Lexical', () => {
    const caption = [
      '*sale or exchange*',
      '',
      '  • Ram : 12gb',
      '  • STOREGE : 256 gb',
      '**price inbox**',
    ].join('\n');

    const html = convertToRichHtml(caption);
    expect(html).toContain('<em style="font-style: italic;">sale or exchange</em>');
    expect(html).toContain('<ul><li>Ram : 12gb</li><li>STOREGE : 256 gb</li></ul>');
    expect(html).toContain('<strong>price inbox</strong>');
    expect(html).toContain('<p><br></p>');
  });

  it('parses pasted HTML with italic/bold/lists into unicode-styled text', () => {
    const html = '<p><i>sale or exchange</i></p><ul><li>Ram : 12gb</li><li>STOREGE : 256 gb</li></ul><p><i>price inbox</i></p>';
    const styledText = htmlToStyledText(html);
    expect(styledText).toContain('𝘴𝘢𝘭𝘦 𝘰𝘳 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦');
    expect(styledText).toContain('  • Ram : 12gb');
    expect(styledText).toContain('  • STOREGE : 256 gb');
    expect(styledText).toContain('𝘱𝘳𝘪𝘤𝘦 𝘪𝘯𝘣𝘰𝘹');
  });

  it('generates rich HTML with H1, H2, blockquotes, and numbered lists', () => {
    const caption = [
      '# Big Title Header',
      '## Subtitle Info',
      '> This is a highlighted customer review',
      '  1. First step',
      '  2. Second step',
      '~~old price 2500~~',
    ].join('\n');

    const html = convertToRichHtml(caption);
    expect(html).toContain('<h1>Big Title Header</h1>');
    expect(html).toContain('<h2>Subtitle Info</h2>');
    expect(html).toContain('<blockquote><p>This is a highlighted customer review</p></blockquote>');
    expect(html).toContain('<ol><li>First step</li><li>Second step</li></ol>');
    expect(html).toContain('<s>old price 2500</s>');
  });

  it('deduplicateRepeatedCaption does NOT truncate posts with multiple decorative borders', () => {
    const caption = [
      '══════════════════════════════',
      'Samsung Galaxy S23 Ultra',
      '══════════════════════════════',
      '  • 12GB RAM, 256GB Storage',
      '  • 100% Fresh Condition',
      '══════════════════════════════',
      'Price: 75,000 BDT',
      'Location: Dhaka',
      '══════════════════════════════',
    ].join('\n');

    const deduplicated = deduplicateRepeatedCaption(caption);
    // Must preserve the entire post, never truncated to just the top divider!
    expect(deduplicated).toContain('Samsung Galaxy S23 Ultra');
    expect(deduplicated).toContain('Price: 75,000 BDT');
    expect(deduplicated).toContain('Location: Dhaka');
  });

  it('deduplicateRepeatedCaption removes accidental full double-paste duplicates', () => {
    const singlePost = [
      '🔥 Special Deal Available 🔥',
      'Apple iPhone 14 Pro Max 256GB',
      'Battery health 92%, full fresh',
      'Price: 95,000 BDT only',
    ].join('\n');

    const doublePasted = `${singlePost}\n\n${singlePost}`;
    const cleaned = deduplicateRepeatedCaption(doublePasted);
    expect(cleaned.trim()).toBe(singlePost.trim());
  });
});
