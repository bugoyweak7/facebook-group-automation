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
export function extractGroupInfoFromLine(line: string): { name: string; url: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Check if line contains a facebook group URL pattern
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

  // If no http prefix was given, but starts with facebook.com/groups/
  const noHttpMatch = trimmed.match(/((?:www\.|web\.|m\.)?facebook\.com\/groups\/[^\s,;"'<>]+)/i);
  if (noHttpMatch) {
    const rawUrl = 'https://' + noHttpMatch[1].replace(/[.,;:!?)]+$/, '');
    const before = trimmed.substring(0, noHttpMatch.index).replace(/^\s*(?:\[\d+\]|\d+[\.\)\-:]|\*\s*)/, '').replace(/[\s,\-\|:]+$/, '').trim();
    return {
      name: before,
      url: rawUrl,
    };
  }

  return null;
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
  const trimmedInput = inputText.trim();
  const validItems: ParsedGroupItem[] = [];
  const duplicateItems: ParsedGroupItem[] = [];
  const invalidItems: ParsedGroupItem[] = [];

  const seenGroupIds = new Set<string>();
  const seenCleanUrls = new Set<string>();

  interface CandidateEntry {
    name: string;
    url: string;
    category?: string;
    privacy?: GroupPrivacy;
    notes?: string;
    raw: string;
  }

  let candidates: CandidateEntry[] = [];
  let isJsonInput = false;

  // 1. Try parsing as JSON (supporting arrays, objects with .groups, full backup files)
  if (trimmedInput.startsWith('[') || trimmedInput.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmedInput);
      let itemsList: any[] = [];

      if (Array.isArray(parsed)) {
        itemsList = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.groups)) {
          itemsList = parsed.groups;
        } else if (Array.isArray(parsed.items)) {
          itemsList = parsed.items;
        }
      }

      if (itemsList.length > 0) {
        isJsonInput = true;
        for (const item of itemsList) {
          if (!item) continue;
          if (typeof item === 'string') {
            candidates.push({
              name: '',
              url: item,
              raw: item,
            });
          } else if (typeof item === 'object') {
            const rawUrl = item.url || item.cleanUrl || item.link || '';
            const rawName = item.name || item.groupName || item.title || '';
            if (rawUrl) {
              candidates.push({
                name: rawName,
                url: rawUrl,
                category: item.category,
                privacy: item.privacy,
                notes: item.notes,
                raw: JSON.stringify(item),
              });
            }
          }
        }
      }
    } catch {
      // Not JSON or parse error, fallback to line-by-line
    }
  }

  // 2. Fallback to line-by-line parsing if not JSON
  if (!isJsonInput) {
    const lines = inputText.split('\n');
    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

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
          error: 'No valid Facebook group URL found in this line',
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
        groupId: '',
        category: candidate.category || defaultCategory,
        privacy: candidate.privacy || defaultPrivacy,
        isDuplicate: false,
        isValid: false,
        error: val.errors?.join('; ') || 'Invalid Facebook group URL',
      });
      continue;
    }

    const cleanUrl = val.cleanUrl || candidate.url;
    const groupId = (val.groupId || '').toLowerCase();
    const finalName = candidate.name || formatDefaultGroupName(val.groupId || '');

    const isExistingDuplicate = detectDuplicateGroup(cleanUrl, existingGroups);
    const isBatchDuplicate =
      (groupId && seenGroupIds.has(groupId)) ||
      seenCleanUrls.has(cleanUrl.toLowerCase());

    const item: ParsedGroupItem = {
      raw: candidate.raw,
      name: finalName,
      url: candidate.url,
      cleanUrl,
      groupId: val.groupId || '',
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
      if (groupId) seenGroupIds.add(groupId);
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

  const totalLinesCount = isJsonInput
    ? candidates.length
    : inputText.split('\n').filter(l => l.trim()).length;

  return {
    totalLines: totalLinesCount,
    validItems,
    duplicateItems,
    invalidItems,
    groupsToCreate,
  };
}
