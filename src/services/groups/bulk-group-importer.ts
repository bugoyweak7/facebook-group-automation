import { Group, GroupPrivacy } from '../../types/group';
import { validateFacebookGroupUrl, detectDuplicateGroup } from '../../utils/validators';
import { generateId } from '../../utils/helpers';

export interface ParsedGroupItem {
  raw: string;
  name: string;
  url: string;
  cleanUrl: string;
  groupId: string;
  category: string;
  privacy: GroupPrivacy;
  notes?: string;
  isDuplicate: boolean;
  duplicateReason?: string;
  isValid: boolean;
  error?: string;
}

export interface BulkParseSummary {
  totalLines: number;
  validItems: ParsedGroupItem[];
  duplicateItems: ParsedGroupItem[];
  invalidItems: ParsedGroupItem[];
  groupsToCreate: Group[];
}

export interface GroupJsonItem {
  name: string;
  url: string;
  groupId?: string;
  category?: string;
  privacy?: GroupPrivacy;
  notes?: string;
}

export interface GroupJsonExportPayload {
  version: '1.0.0';
  exportedAt: number;
  totalGroups: number;
  sourceAccount?: string;
  groups: GroupJsonItem[];
}

/**
 * Exports group list into a clean, portable JSON string that can be copied
 * and pasted into any other browser/device running this extension.
 */
export function exportGroupsToJson(
  groups: Group[],
  accountName?: string,
  format: 'pretty' | 'compact' = 'pretty'
): string {
  const payload: GroupJsonExportPayload = {
    version: '1.0.0',
    exportedAt: Date.now(),
    totalGroups: groups.length,
    sourceAccount: accountName || undefined,
    groups: groups.map(g => ({
      name: g.name,
      url: g.url,
      groupId: g.groupId,
      category: g.category || 'General',
      privacy: g.privacy || 'PUBLIC',
      notes: g.notes || undefined,
    })),
  };
  return format === 'pretty' ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
}

/**
 * 10 realistic Facebook group templates for instant testing & demo.
 */
export const SAMPLE_10_GROUPS_TEXT = [
  'Dhaka Buy & Sell Market, https://www.facebook.com/groups/dhakabuysellmarket',
  'Bangladesh Online Shopping & Deals, https://www.facebook.com/groups/bdonlineshoppingdeals',
  'Chittagong Business & Trade Hub, https://www.facebook.com/groups/ctgtradehub',
  'Sylhet Buy, Sell & Exchange, https://www.facebook.com/groups/sylhetbuysellandexchange',
  'Khulna E-Commerce & Marketplace, https://www.facebook.com/groups/khulnamarketplace',
  'Rajshahi Silk & Electronics Corner, https://www.facebook.com/groups/rajshahimarketbd',
  'Rangpur Wholesale & Retail Traders, https://www.facebook.com/groups/rangpurwholesalers',
  'Barisal Digital Bazar & Sellers, https://www.facebook.com/groups/barisaldigitalbazar',
  'Comilla Fashion, Gadgets & Shoes, https://www.facebook.com/groups/comillafashionhub',
  'Gazipur Industrial & Factory Direct Deals, https://www.facebook.com/groups/gazipurfactorydirect',
].join('\n');

/**
 * 20 realistic Facebook group templates for instant testing & demo.
 */
export const SAMPLE_20_GROUPS_TEXT = [
  'Dhaka Buy & Sell Market, https://www.facebook.com/groups/dhakabuysellmarket',
  'Bangladesh Online Shopping & Deals, https://www.facebook.com/groups/bdonlineshoppingdeals',
  'Chittagong Business & Trade Hub, https://www.facebook.com/groups/ctgtradehub',
  'Sylhet Buy, Sell & Exchange, https://www.facebook.com/groups/sylhetbuysellandexchange',
  'Khulna E-Commerce & Marketplace, https://www.facebook.com/groups/khulnamarketplace',
  'Rajshahi Silk & Electronics Corner, https://www.facebook.com/groups/rajshahimarketbd',
  'Rangpur Wholesale & Retail Traders, https://www.facebook.com/groups/rangpurwholesalers',
  'Barisal Digital Bazar & Sellers, https://www.facebook.com/groups/barisaldigitalbazar',
  'Comilla Fashion, Gadgets & Shoes, https://www.facebook.com/groups/comillafashionhub',
  'Gazipur Industrial & Factory Direct Deals, https://www.facebook.com/groups/gazipurfactorydirect',
  'Narayanganj Clothing & Fabric Outlet, https://www.facebook.com/groups/narayanganjclothing',
  'Bogra Electronics & Mobile Zone, https://www.facebook.com/groups/bogramobilezone',
  'Mymensingh Student & Community Bazaar, https://www.facebook.com/groups/mymensinghbazaar',
  'Coxs Bazar Tourism & Hotel Offers, https://www.facebook.com/groups/coxsbazartourism',
  'Feni Wholesale Business Community, https://www.facebook.com/groups/feniwholesalebd',
  'Kushtia Crafts & Handloom Gallery, https://www.facebook.com/groups/kushtiacraftshub',
  'Tangail Sharee & Heritage Mart, https://www.facebook.com/groups/tangailheritagebazaar',
  'Jessore Motor Parts & Auto Hub, https://www.facebook.com/groups/jessoreautohub',
  'Dinajpur Rice, Agri & Food Products, https://www.facebook.com/groups/dinajpuragrimarket',
  'All Bangladesh Resellers & Dropshippers, https://www.facebook.com/groups/allbdresellershub',
].join('\n');

/**
 * Normalizes group slug/id into a human-friendly group name.
 */
export function formatDefaultGroupName(slugOrId: string): string {
  if (!slugOrId) return 'Facebook Group';
  // If pure numbers, label nicely
  if (/^\d+$/.test(slugOrId)) {
    return `Facebook Group (${slugOrId})`;
  }
  // Replace hyphens, underscores, dots with spaces and capitalize
  return slugOrId
    .replace(/[-_.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extracts URL and optional Name from a raw line of text.
 */
/**
 * Extracts URL and optional Name from a raw line of text.
 * Supports standard URLs, missing http schemes, JSON-like key-values, and numeric group IDs.
 */
export function extractGroupInfoFromLine(line: string): { name: string; url: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // 1. Check if line contains a standard facebook group URL pattern
  const fbUrlMatch = trimmed.match(/(https?:\/\/(?:www\.|web\.|m\.)?facebook\.com\/groups\/[^\s,;"'<>]+)/i);

  if (fbUrlMatch) {
    const rawUrl = fbUrlMatch[1].replace(/[.,;:!?)]+$/, ''); // Strip trailing punctuation
    let customName = '';

    const beforeUrl = trimmed.substring(0, fbUrlMatch.index).trim();
    const afterUrl = trimmed.substring((fbUrlMatch.index || 0) + fbUrlMatch[0].length).trim();

    if (beforeUrl) {
      let cleanedName = beforeUrl.replace(/^\s*(?:\[\d+\]|\d+[\.\)\-:]|\*\s*)/, '').trim();
      cleanedName = cleanedName.replace(/[\s,\-\|:]+$/, '').trim();
      if (cleanedName) {
        customName = cleanedName;
      }
    } else if (afterUrl) {
      const cleanedAfter = afterUrl.replace(/^[\s,\-\|:]+/, '').trim();
      if (cleanedAfter) {
        customName = cleanedAfter;
      }
    }

    return {
      name: customName,
      url: rawUrl,
    };
  }

  // 2. If no http prefix was given, but starts with facebook.com/groups/
  const noHttpMatch = trimmed.match(/((?:www\.|web\.|m\.)?facebook\.com\/groups\/[^\s,;"'<>]+)/i);
  if (noHttpMatch) {
    const rawUrl = 'https://' + noHttpMatch[1].replace(/[.,;:!?)]+$/, '');
    const before = trimmed.substring(0, noHttpMatch.index).replace(/^\s*(?:\[\d+\]|\d+[\.\)\-:]|\*\s*)/, '').replace(/[\s,\-\|:]+$/, '').trim();
    return {
      name: before,
      url: rawUrl,
    };
  }

  // 3. JSON-like line containing groupId or id: e.g. "groupId": "274906757200196"
  const groupIdKeyMatch = trimmed.match(/["']?(?:groupId|group_id|id)["']?\s*[:=]\s*["']?([0-9a-zA-Z._-]+)["']?/i);
  if (groupIdKeyMatch) {
    const gId = groupIdKeyMatch[1].replace(/[.,;:!?)]+$/, '');
    if (gId && !/^(feed|discover|joins|about|settings|search|true|false|null)$/i.test(gId)) {
      return {
        name: formatDefaultGroupName(gId),
        url: `https://www.facebook.com/groups/${gId}/`,
      };
    }
  }

  // 4. Standalone numeric Facebook group ID (8-25 digits), optionally with name:
  // "My Group, 274906757200196" OR "274906757200196, My Group" OR "274906757200196"
  const idFirstNameMatch = trimmed.match(/^["']?(\d{8,25})["']?\s*[,\t|\-]+\s*(.+)$/);
  if (idFirstNameMatch) {
    const gId = idFirstNameMatch[1];
    const namePart = idFirstNameMatch[2].trim().replace(/^["']|["']$/g, '');
    return {
      name: namePart || formatDefaultGroupName(gId),
      url: `https://www.facebook.com/groups/${gId}/`,
    };
  }

  const nameFirstOrPureIdMatch = trimmed.match(/^(?:["']?(\d{8,25})["']?|(.*?)[,\t|\-]+\s*["']?(\d{8,25})["']?)$/);
  if (nameFirstOrPureIdMatch) {
    const gId = nameFirstOrPureIdMatch[1] || nameFirstOrPureIdMatch[3];
    const namePart = (nameFirstOrPureIdMatch[2] || '').trim().replace(/^["']|["']$/g, '');
    if (gId) {
      return {
        name: namePart || formatDefaultGroupName(gId),
        url: `https://www.facebook.com/groups/${gId}/`,
      };
    }
  }

  return null;
}

interface CandidateEntry {
  name: string;
  url: string;
  groupId?: string;
  category?: string;
  privacy?: GroupPrivacy;
  notes?: string;
  raw: string;
}

/**
 * Builds a standardized candidate entry from an object or raw fields.
 */
function buildCandidate(item: any, rawStr?: string): CandidateEntry | null {
  if (!item) return null;

  if (typeof item === 'string') {
    const extracted = extractGroupInfoFromLine(item);
    if (extracted) {
      return {
        name: extracted.name,
        url: extracted.url,
        raw: item,
      };
    }
    const trimmedStr = item.trim();
    if (/^\d{8,25}$/.test(trimmedStr)) {
      return {
        name: formatDefaultGroupName(trimmedStr),
        url: `https://www.facebook.com/groups/${trimmedStr}/`,
        groupId: trimmedStr,
        raw: item,
      };
    }
    return null;
  }

  if (typeof item === 'object') {
    let rawUrl = String(item.url || item.cleanUrl || item.link || '').trim();
    const rawGroupId = String(item.groupId || item.id || item.group_id || '').trim();
    const rawName = String(item.name || item.groupName || item.title || '').trim();

    // Auto-generate canonical URL if only groupId/id was given
    if (!rawUrl && rawGroupId) {
      rawUrl = `https://www.facebook.com/groups/${rawGroupId}/`;
    }

    // If rawUrl is just a numeric ID or slug without slashes/domain
    if (rawUrl && /^\d{8,25}$/.test(rawUrl)) {
      rawUrl = `https://www.facebook.com/groups/${rawUrl}/`;
    }

    if (!rawUrl && !rawGroupId) return null;

    let privacy: GroupPrivacy | undefined = undefined;
    if (item.privacy) {
      const pStr = String(item.privacy).toUpperCase();
      if (pStr === 'PUBLIC' || pStr === 'PRIVATE') {
        privacy = pStr as GroupPrivacy;
      }
    }

    return {
      name: rawName || (rawGroupId ? formatDefaultGroupName(rawGroupId) : ''),
      url: rawUrl,
      groupId: rawGroupId || undefined,
      category: item.category ? String(item.category).trim() : undefined,
      privacy,
      notes: item.notes ? String(item.notes).trim() : undefined,
      raw: rawStr || JSON.stringify(item),
    };
  }

  return null;
}

/**
 * Extracts a candidate from an unparsed text block using regex heuristics.
 */
function extractCandidateFromRegexBlock(block: string): CandidateEntry | null {
  const gIdMatch = block.match(/["']?(?:groupId|group_id|id)["']?\s*[:=]\s*["']?([0-9a-zA-Z._-]+)["']?/i);
  const urlMatch = block.match(/["']?(?:url|cleanUrl|link)["']?\s*[:=]\s*["']([^"']+)["']/i);
  const nameMatch = block.match(/["']?(?:name|groupName|title)["']?\s*[:=]\s*["']([^"']+)["']/i);
  const catMatch = block.match(/["']?category["']?\s*[:=]\s*["']([^"']+)["']/i);
  const privMatch = block.match(/["']?privacy["']?\s*[:=]\s*["'](PUBLIC|PRIVATE)["']/i);
  const notesMatch = block.match(/["']?notes["']?\s*[:=]\s*["']([^"']+)["']/i);

  const rawGroupId = gIdMatch ? gIdMatch[1].trim() : '';
  let rawUrl = urlMatch ? urlMatch[1].trim() : '';
  const rawName = nameMatch ? nameMatch[1].trim() : '';

  if (!rawUrl && rawGroupId) {
    rawUrl = `https://www.facebook.com/groups/${rawGroupId}/`;
  }

  if (!rawUrl && !rawGroupId) return null;

  let privacy: GroupPrivacy | undefined = undefined;
  if (privMatch) {
    const pStr = privMatch[1].toUpperCase();
    if (pStr === 'PUBLIC' || pStr === 'PRIVATE') {
      privacy = pStr as GroupPrivacy;
    }
  }

  return {
    name: rawName || (rawGroupId ? formatDefaultGroupName(rawGroupId) : ''),
    url: rawUrl,
    groupId: rawGroupId || undefined,
    category: catMatch ? catMatch[1].trim() : undefined,
    privacy,
    notes: notesMatch ? notesMatch[1].trim() : undefined,
    raw: block,
  };
}

/**
 * Multi-layer structured extractor that repairs broken JSON, handles partial snippets,
 * extracts array objects, and handles missing brackets gracefully.
 */
function extractStructuredCandidates(trimmedInput: string): { candidates: CandidateEntry[]; handled: boolean } {
  const hasJsonIndicators =
    /["']?(?:groupId|group_id|cleanUrl|privacy|category|groups|items)["']?\s*:|[{}\[\]]/.test(trimmedInput);

  if (!hasJsonIndicators) {
    return { candidates: [], handled: false };
  }

  // --- Layer 1: Sanitized whole JSON.parse ---
  const stripped = trimmedInput
    .replace(/^[\s,;]+/, '') // Strip leading commas, semicolons, whitespace
    .replace(/[\s,;]+$/, ''); // Strip trailing commas, semicolons, whitespace

  const attempts = [
    stripped,
    `[${stripped}]`,
    stripped.replace(/,\s*([}\]])/g, '$1'),
    `[${stripped.replace(/,\s*([}\]])/g, '$1')}]`,
  ];

  for (const textAttempt of attempts) {
    try {
      const parsed = JSON.parse(textAttempt);
      let itemsList: any[] = [];
      if (Array.isArray(parsed)) {
        itemsList = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.groups)) {
          itemsList = parsed.groups;
        } else if (Array.isArray(parsed.items)) {
          itemsList = parsed.items;
        } else if (parsed.groupId || parsed.url || parsed.cleanUrl || parsed.link) {
          itemsList = [parsed];
        }
      }

      if (itemsList.length > 0) {
        const foundCandidates: CandidateEntry[] = [];
        for (const it of itemsList) {
          const c = buildCandidate(it);
          if (c) foundCandidates.push(c);
        }
        if (foundCandidates.length > 0) {
          return { candidates: foundCandidates, handled: true };
        }
      }
    } catch {
      // Continue to next attempt
    }
  }

  // --- Layer 2: Unified Chunk Splitting by '}' (handles both '{...}' objects and truncated objects missing opening '{') ---
  const chunks = trimmedInput.split('}');
  const recoveredCandidates: CandidateEntry[] = [];

  for (const rawChunk of chunks) {
    const chunk = rawChunk.trim();
    if (!chunk) continue;

    // Must contain group identifier
    if (!/["']?(?:groupId|group_id|url|cleanUrl|link)["']?\s*[:=]/i.test(chunk)) {
      continue;
    }

    let cleanedChunk = chunk.replace(/^[\s,;\[\]]+/, '').trim();
    const openBraceIdx = cleanedChunk.lastIndexOf('{');
    if (openBraceIdx !== -1) {
      cleanedChunk = cleanedChunk.substring(openBraceIdx);
    } else {
      cleanedChunk = '{' + cleanedChunk;
    }
    cleanedChunk = cleanedChunk + '}';

    try {
      const sanitized = cleanedChunk.replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(sanitized);
      const c = buildCandidate(parsed, chunk);
      if (c) {
        recoveredCandidates.push(c);
        continue;
      }
    } catch {
      // Fallback to regex extraction
    }

    const c = extractCandidateFromRegexBlock(chunk);
    if (c) {
      recoveredCandidates.push(c);
    }
  }

  if (recoveredCandidates.length > 0) {
    return { candidates: recoveredCandidates, handled: true };
  }

  return { candidates: [], handled: false };
}

/**
 * Parses multi-line text input OR JSON code into validated Group items,
 * detecting duplicates and preparing ready-to-save objects.
 */
export function parseBulkGroupText(
  inputText: string,
  existingGroups: Group[] = [],
  defaultCategory = 'General',
  defaultPrivacy: GroupPrivacy = 'PUBLIC',
  autoSelect = true
): BulkParseSummary {
  const trimmedInput = (inputText || '').trim();
  const validItems: ParsedGroupItem[] = [];
  const duplicateItems: ParsedGroupItem[] = [];
  const invalidItems: ParsedGroupItem[] = [];

  if (!trimmedInput) {
    return {
      totalLines: 0,
      validItems,
      duplicateItems,
      invalidItems,
      groupsToCreate: [],
    };
  }

  const seenGroupIds = new Set<string>();
  const seenCleanUrls = new Set<string>();

  let candidates: CandidateEntry[] = [];
  let isStructuredInput = false;

  // 1. Try multi-layer structured / JSON / fragment parser
  const structuredResult = extractStructuredCandidates(trimmedInput);
  if (structuredResult.handled && structuredResult.candidates.length > 0) {
    candidates = structuredResult.candidates;
    isStructuredInput = true;
  }

  // 2. Fallback to line-by-line parsing if not structured or no candidates found
  if (candidates.length === 0) {
    const lines = trimmedInput.split('\n');
    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Skip lone punctuation or noise lines like commas or stray braces
      if (/^[,\{\}\[\];:()]+$/.test(trimmed)) {
        continue;
      }

      const extracted = extractGroupInfoFromLine(trimmed);
      if (!extracted) {
        invalidItems.push({
          raw: trimmed,
          name: '',
          url: '',
          cleanUrl: '',
          groupId: '',
          category: defaultCategory,
          privacy: defaultPrivacy,
          isDuplicate: false,
          isValid: false,
          error: 'No valid Facebook group URL or ID found in this line',
        });
        continue;
      }

      candidates.push({
        name: extracted.name,
        url: extracted.url,
        raw: trimmed,
      });
    }
  }

  // 3. Process candidates
  for (const candidate of candidates) {
    const val = validateFacebookGroupUrl(candidate.url);
    if (!val.valid) {
      invalidItems.push({
        raw: candidate.raw,
        name: candidate.name || 'Unknown',
        url: candidate.url,
        cleanUrl: '',
        groupId: candidate.groupId || '',
        category: candidate.category || defaultCategory,
        privacy: candidate.privacy || defaultPrivacy,
        isDuplicate: false,
        isValid: false,
        error: val.errors?.join('; ') || 'Invalid Facebook group URL',
      });
      continue;
    }

    const cleanUrl = val.cleanUrl || candidate.url;
    const finalGroupId = (val.groupId || candidate.groupId || '').toLowerCase();
    const finalName = candidate.name || formatDefaultGroupName(val.groupId || candidate.groupId || '');

    const isExistingDuplicate = detectDuplicateGroup(cleanUrl, existingGroups);
    const isBatchDuplicate =
      (finalGroupId && seenGroupIds.has(finalGroupId)) ||
      seenCleanUrls.has(cleanUrl.toLowerCase());

    const item: ParsedGroupItem = {
      raw: candidate.raw,
      name: finalName,
      url: candidate.url,
      cleanUrl,
      groupId: val.groupId || candidate.groupId || '',
      category: candidate.category || defaultCategory.trim() || 'General',
      privacy: candidate.privacy || defaultPrivacy,
      notes: candidate.notes,
      isDuplicate: isExistingDuplicate || isBatchDuplicate,
      duplicateReason: isExistingDuplicate
        ? 'Already exists in your saved groups'
        : isBatchDuplicate
        ? 'Duplicate URL within this batch'
        : undefined,
      isValid: true,
    };

    if (item.isDuplicate) {
      duplicateItems.push(item);
    } else {
      validItems.push(item);
      if (finalGroupId) seenGroupIds.add(finalGroupId);
      seenCleanUrls.add(cleanUrl.toLowerCase());
    }
  }

  const now = Date.now();
  const groupsToCreate: Group[] = validItems.map((item, index) => ({
    id: generateId('grp'),
    name: item.name,
    url: item.cleanUrl,
    groupId: item.groupId,
    category: item.category,
    privacy: item.privacy,
    notes: item.notes,
    enabled: true,
    selected: autoSelect,
    status: 'READY',
    postCount: 0,
    verified: true,
    source: 'import',
    createdAt: now + index,
    updatedAt: now,
  }));

  const totalLinesCount = isStructuredInput
    ? validItems.length + duplicateItems.length + invalidItems.length
    : trimmedInput.split('\n').filter(l => l.trim() && !/^[,\{\}\[\];:()]+$/.test(l.trim())).length;

  return {
    totalLines: totalLinesCount,
    validItems,
    duplicateItems,
    invalidItems,
    groupsToCreate,
  };
}
