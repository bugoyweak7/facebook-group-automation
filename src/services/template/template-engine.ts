import { Post, VariableMap } from '../../types/post';
import { resolveSpintax } from '../../utils/helpers';

export { resolveSpintax };

/**
 * Extracts variable names from template string like {product_name}, {price}.
 */
export function extractVariables(template: string): string[] {
  if (!template) return [];
  const regex = /\{([a-zA-Z0-9_-]+)\}/g;
  const matches = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    if (match[1]) {
      matches.add(match[1].toLowerCase());
    }
  }

  return Array.from(matches);
}

/**
 * Builds standard variable map from a Post object.
 */
export function buildVariableMapFromPost(post: Partial<Post>, customVars?: Record<string, string>): VariableMap {
  const map: VariableMap = {
    product_name: post.productName || '',
    title: post.title || '',
    price: post.price || '',
    old_price: post.oldPrice || '',
    old_price_tag: post.oldPrice ? `(Regular: ${post.oldPrice})` : '',
    description: post.description || '',
    features: post.features || '',
    location: post.location || '',
    delivery_info: post.deliveryInfo || '',
    contact_info: post.contactInfo || '',
    call_to_action: post.callToAction || '',
    caption: post.caption || '',
  };

  if (customVars) {
    for (const [key, value] of Object.entries(customVars)) {
      map[key.toLowerCase()] = value;
    }
  }

  return map;
}

/**
 * Renders template by replacing {var} placeholders with values from variable map.
 * Cleans up empty label lines when values are missing.
 */
export function renderTemplate(template: string, variableMap: VariableMap): string {
  if (!template) return '';

  const raw = template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, varName) => {
    const key = varName.toLowerCase();
    if (key in variableMap && variableMap[key] !== undefined) {
      return variableMap[key]!;
    }
    return ''; // Clear missing placeholders
  });

  const withSpintax = resolveSpintax(raw);

  // Clean up lines that only contain empty labels, like "📍 Location: " or "🚚 Delivery: "
  return withSpintax
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return true; // Keep purposeful line breaks
      // Remove lines that are just lone prefixes with no value
      if (
        /^(💰\s*Price:\s*|📍\s*Location:\s*|🚚\s*Delivery:\s*|📞\s*Contact:\s*|✨\s*Key Features:\s*|📝\s*Details:\s*|👉\s*|📋\s*Condition.*:\s*|⚙️\s*Specifications:\s*|📦\s*Delivery.*:\s*|📱\s*Call.*:\s*|💵\s*Asking Price:\s*)$/i.test(
          trimmed
        )
      ) {
        return false;
      }
      return true;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Quick helper: Renders post into a full formatted string using a given template or fallback format.
 */
export function formatPostWithTemplate(post: Post, templateContent?: string): string {
  // If post already has a direct complete caption and no custom template is specified, use caption directly
  if (post.caption && !templateContent) {
    return resolveSpintax(post.caption);
  }

  if (templateContent) {
    const vars = buildVariableMapFromPost(post);
    const rendered = renderTemplate(templateContent, vars);
    if (rendered.trim()) return resolveSpintax(rendered);
  }

  // Fallback: If post has a direct caption, return it
  if (post.caption && post.caption.trim()) {
    return resolveSpintax(post.caption.trim());
  }

  // Default clean format for structured posts
  const sections: string[] = [];

  const mainTitle = post.productName || post.title;
  if (mainTitle && mainTitle !== 'Facebook Group Listing' && mainTitle !== 'Untitled Post') {
    sections.push(mainTitle);
  }

  if (post.price && post.price.trim()) {
    const priceLine = post.oldPrice ? `Price: ${post.price} (Prev: ${post.oldPrice})` : `Price: ${post.price}`;
    sections.push(priceLine);
  }

  if (post.description && post.description.trim()) {
    sections.push(post.description.trim());
  }

  if (post.features && post.features.trim()) {
    sections.push(`Features:\n${post.features.trim()}`);
  }

  if (post.location && post.location.trim()) {
    sections.push(`Location: ${post.location.trim()}`);
  }

  if (post.deliveryInfo && post.deliveryInfo.trim()) {
    sections.push(`Delivery: ${post.deliveryInfo.trim()}`);
  }

  if (post.contactInfo && post.contactInfo.trim()) {
    sections.push(`Contact: ${post.contactInfo.trim()}`);
  }

  if (post.callToAction && post.callToAction.trim()) {
    sections.push(post.callToAction.trim());
  }

  return sections.join('\n\n').trim();
}

