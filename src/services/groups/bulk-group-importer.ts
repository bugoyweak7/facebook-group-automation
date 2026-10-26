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
  groupsToUpdate: Group[];
  mergedGroups: Group[];
  addedCount: number;
  updatedCount: number;
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
  const groupIdKeyMatch = trimmed.match(/["']?(?:groupId|group_id|id|uid|gid|fbid)["']?\s*[:=]\s*["']?([0-9a-zA-Z._-]+)["']?/i);
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
 * Builds a standardized candidate entry from an object, string, or number,
 * handling all property aliases found across various Facebook extensions.
 */
function buildCandidate(item: any, rawStr?: string): CandidateEntry | null {
  if (item === null || item === undefined) return null;

  // Case 1: Pure number (e.g. 274906757200196)
  if (typeof item === 'number') {
    const numStr = String(item).trim();
    if (/^\d{8,25}$/.test(numStr)) {
      return {
        name: formatDefaultGroupName(numStr),
        url: `https://www.facebook.com/groups/${numStr}/`,
        groupId: numStr,
        raw: String(item),
      };
    }
    return null;
  }

  // Case 2: String
  if (typeof item === 'string') {
    const trimmedStr = item.trim();
    if (!trimmedStr) return null;

    const extracted = extractGroupInfoFromLine(trimmedStr);
    if (extracted) {
      return {
        name: extracted.name,
        url: extracted.url,
        raw: item,
      };
    }

    if (/^\d{8,25}$/.test(trimmedStr)) {
      return {
        name: formatDefaultGroupName(trimmedStr),
        url: `https://www.facebook.com/groups/${trimmedStr}/`,
        groupId: trimmedStr,
        raw: item,
      };
    }

    if (trimmedStr.startsWith('/groups/') || trimmedStr.startsWith('groups/')) {
      const fixed = 'https://www.facebook.com/' + trimmedStr.replace(/^\/+/, '');
      return {
        name: '',
        url: fixed,
        raw: item,
      };
    }

    return null;
  }

  // Case 3: Object (handles formats from all other extensions)
  if (typeof item === 'object') {
    // 1. Extract URL (checking all common aliases across other extensions)
    let rawUrl = String(
      item.url ||
      item.cleanUrl ||
      item.link ||
      item.fb_url ||
      item.fbUrl ||
      item.groupUrl ||
      item.group_url ||
      item.href ||
      item.uri ||
      item.targetUrl ||
      item.target_url ||
      item.permalink ||
      item.facebookUrl ||
      item.facebook_url ||
      item.web_url ||
      item.webUrl ||
      item.fb_link ||
      item.groupLink ||
      ''
    ).trim();

    // 2. Extract Group ID (checking all aliases)
    let rawGroupId = String(
      item.groupId ||
      item.id ||
      item.group_id ||
      item.uid ||
      item.gid ||
      item.fbid ||
      item.fb_id ||
      item.group_uid ||
      item.target_id ||
      item.id_group ||
      item.fbId ||
      item.groupUid ||
      ''
    ).trim();

    // 3. Extract Name (checking all aliases)
    const rawName = String(
      item.name ||
      item.groupName ||
      item.group_name ||
      item.title ||
      item.groupTitle ||
      item.group_title ||
      item.label ||
      item.text ||
      item.description ||
      item.subject ||
      item.headline ||
      item.caption ||
      item.group_text ||
      item.name_group ||
      ''
    ).trim();

    // Fix relative or bare paths
    if (rawUrl) {
      if (rawUrl.startsWith('/groups/')) {
        rawUrl = 'https://www.facebook.com' + rawUrl;
      } else if (rawUrl.startsWith('groups/')) {
        rawUrl = 'https://www.facebook.com/' + rawUrl;
      } else if (/^\d{8,25}$/.test(rawUrl)) {
        if (!rawGroupId) rawGroupId = rawUrl;
        rawUrl = `https://www.facebook.com/groups/${rawUrl}/`;
      } else if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        if (rawUrl.includes('facebook.com/groups/')) {
          rawUrl = 'https://' + rawUrl.replace(/^\/+/, '');
        }
      }
    }

    // Auto-generate canonical URL if only groupId/id was given
    if (!rawUrl && rawGroupId) {
      rawUrl = `https://www.facebook.com/groups/${rawGroupId}/`;
    }

    if (!rawUrl && !rawGroupId) return null;

    // 4. Privacy
    let privacy: GroupPrivacy | undefined = undefined;
    const rawPriv = item.privacy || item.privacyType || item.privacy_type || item.type || item.groupPrivacy || item.group_privacy;
    if (rawPriv) {
      const pStr = String(rawPriv).toUpperCase();
      if (pStr === 'PUBLIC' || pStr === 'PRIVATE') {
        privacy = pStr as GroupPrivacy;
      }
    } else if (item.is_private === true || item.isPrivate === true) {
      privacy = 'PRIVATE';
    } else if (item.is_private === false || item.isPrivate === false) {
      privacy = 'PUBLIC';
    }

    // 5. Category
    const category = item.category || item.groupCategory || item.group_category || item.tag || item.tags || item.folder || item.typeCategory;

    // 6. Notes
    const notes = item.notes || item.note || item.comment || item.comments || item.remarks || item.desc || item.extra;

    return {
      name: rawName || (rawGroupId ? formatDefaultGroupName(rawGroupId) : ''),
      url: rawUrl,
      groupId: rawGroupId || undefined,
      category: category ? String(category).trim() : undefined,
      privacy,
      notes: notes ? String(notes).trim() : undefined,
      raw: rawStr || JSON.stringify(item),
    };
  }

  return null;
}

/**
 * Recursively locates any array of group items or key-value dictionary in parsed JSON.
 */
function findArrayOfCandidates(obj: any, depth = 0): any[] | null {
  if (!obj || typeof obj !== 'object' || depth > 4) return null;

  if (Array.isArray(obj)) {
    return obj;
  }

  const RESERVED_KEYS = new Set([
    'name', 'title', 'category', 'privacy', 'status', 'version', 'type', 'notes',
    'description', 'groups', 'items', 'data', 'results', 'settings', 'options', 'config', 'url', 'id', 'groupId'
  ]);

  // Common wrapper keys used by other Chrome extensions and backup files
  const preferredKeys = [
    'groups',
    'items',
    'data',
    'results',
    'groupList',
    'groupsList',
    'fb_groups',
    'fbGroups',
    'my_groups',
    'myGroups',
    'joined_groups',
    'joinedGroups',
    'list',
    'rows',
    'savedGroups',
    'allGroups',
    'groupsData',
  ];

  for (const k of preferredKeys) {
    if (Array.isArray(obj[k]) && obj[k].length > 0) {
      return obj[k];
    }
  }

  // Check direct property holding an array
  for (const [_, val] of Object.entries(obj)) {
    if (Array.isArray(val) && val.length > 0) {
      return val;
    }
  }

  // Check if obj itself is an ID-to-group map (e.g. { "274906757200196": { "name": "Dhaka Market" } })
  const entries = Object.entries(obj);
  if (entries.length > 0) {
    const isIdMap = entries.every(([k, v]) =>
      ((/^\d{5,25}$/.test(k)) || (/^[a-zA-Z0-9._-]{5,}$/.test(k) && !RESERVED_KEYS.has(k.toLowerCase()))) &&
      (typeof v === 'object' || typeof v === 'string')
    );

    if (isIdMap) {
      return entries.map(([key, val]) => {
        if (typeof val === 'string') {
          return { groupId: key, name: val, url: `https://www.facebook.com/groups/${key}/` };
        }
        return { groupId: key, ...(val as any) };
      });
    }
  }

  // Check nested objects (e.g. obj.data.groups or obj.state.groups)
  for (const [k, val] of entries) {
    if (val && typeof val === 'object' && !Array.isArray(val) && !RESERVED_KEYS.has(k.toLowerCase())) {
      const nested = findArrayOfCandidates(val, depth + 1);
      if (nested && nested.length > 0) return nested;
    }
  }

  return null;
}

/**
 * Extracts a candidate from an unparsed text block using regex heuristics.
 */
function extractCandidateFromRegexBlock(block: string): CandidateEntry | null {
  const gIdMatch = block.match(/["']?(?:groupId|group_id|id|uid|gid|fbid)["']?\s*[:=]\s*["']?([0-9a-zA-Z._-]+)["']?/i);
  const urlMatch = block.match(/["']?(?:url|cleanUrl|link|fb_url|href|permalink)["']?\s*[:=]\s*["']([^"']+)["']/i);
  const nameMatch = block.match(/["']?(?:name|groupName|group_name|title|label|text)["']?\s*[:=]\s*["']([^"']+)["']/i);
  const catMatch = block.match(/["']?(?:category|tag)["']?\s*[:=]\s*["']([^"']+)["']/i);
  const privMatch = block.match(/["']?(?:privacy|type)["']?\s*[:=]\s*["'](PUBLIC|PRIVATE)["']/i);
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
    /["']?(?:groupId|group_id|cleanUrl|privacy|category|groups|items|data|results|id|name|url|link|uid|gid)["']?\s*:|[{}\[\]]/.test(trimmedInput);

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
      const itemsList = findArrayOfCandidates(parsed);

      if (itemsList && itemsList.length > 0) {
        const foundCandidates: CandidateEntry[] = [];
        for (const it of itemsList) {
          const c = buildCandidate(it);
          if (c) foundCandidates.push(c);
        }
        if (foundCandidates.length > 0) {
          return { candidates: foundCandidates, handled: true };
        }
      } else if (parsed && typeof parsed === 'object') {
        const c = buildCandidate(parsed);
        if (c) {
          return { candidates: [c], handled: true };
        }
      }
    } catch {
      // Continue to next attempt
    }
  }

  // --- Layer 2: Unified Chunk Splitting by '}' (handles multiple objects or fragmented objects) ---
  const chunks = trimmedInput.split('}');
  const recoveredCandidates: CandidateEntry[] = [];

  for (const rawChunk of chunks) {
    const chunk = rawChunk.trim();
    if (!chunk) continue;

    // Must contain group identifier
    if (!/["']?(?:groupId|group_id|id|uid|gid|url|cleanUrl|link|name|fb_url)["']?\s*[:=]/i.test(chunk)) {
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
 * Matches an incoming group candidate to an existing group in saved storage.
 */
export function findMatchingExistingGroup(
  cleanUrl: string,
  groupId: string | undefined,
  existingGroups: Group[]
): Group | undefined {
  if (!existingGroups || existingGroups.length === 0) return undefined;

  const normCleanUrl = (cleanUrl || '').trim().toLowerCase();
  const normGroupId = (groupId || '').trim().toLowerCase();

  return existingGroups.find(g => {
    // 1. Direct URL match
    if (g.url && g.url.trim().toLowerCase() === normCleanUrl) return true;

    // 2. Clean URL match using validator
    const gVal = validateFacebookGroupUrl(g.url);
    if (gVal.valid) {
      if (normCleanUrl && gVal.cleanUrl && gVal.cleanUrl.toLowerCase() === normCleanUrl) return true;
      if (normGroupId && gVal.groupId && gVal.groupId.toLowerCase() === normGroupId) return true;
    }

    // 3. Match by numeric or slug groupId
    if (normGroupId && g.groupId && g.groupId.toLowerCase() === normGroupId) return true;

    return false;
  });
}

/**
 * Checks if incoming candidate has new information to update an existing group.
 */
function checkAndUpdateGroup(
  existingGroup: Group,
  candidate: CandidateEntry,
  defaultCategory: string,
  defaultPrivacy: GroupPrivacy,
  now: number
): { updatedGroup: Group; wasModified: boolean } {
  let wasModified = false;

  const candidateName = (candidate.name || '').trim();
  const isCandidateNameValid = Boolean(
    candidateName &&
    !/^Facebook Group(?: \(\d+\))?$/i.test(candidateName) &&
    !/^\d+$/.test(candidateName)
  );

  const existingName = (existingGroup.name || '').trim();
  const isExistingNameGeneric = Boolean(
    !existingName ||
    /^Facebook Group(?: \(\d+\))?$/i.test(existingName) ||
    /^\d+$/.test(existingName)
  );

  let newName = existingGroup.name;
  if (isCandidateNameValid && (isExistingNameGeneric || candidateName.toLowerCase() !== existingName.toLowerCase())) {
    newName = candidateName;
    wasModified = true;
  }

  // Category update
  let newCategory = existingGroup.category || defaultCategory;
  if (candidate.category && candidate.category.trim() && candidate.category.trim() !== existingGroup.category) {
    newCategory = candidate.category.trim();
    wasModified = true;
  }

  // Privacy update
  let newPrivacy = existingGroup.privacy || defaultPrivacy;
  if (candidate.privacy && candidate.privacy !== existingGroup.privacy) {
    newPrivacy = candidate.privacy;
    wasModified = true;
  }

  // Notes update
  let newNotes = existingGroup.notes;
  if (candidate.notes && candidate.notes.trim()) {
    const cNotes = candidate.notes.trim();
    if (!existingGroup.notes) {
      newNotes = cNotes;
      wasModified = true;
    } else if (!existingGroup.notes.includes(cNotes)) {
      newNotes = `${existingGroup.notes} | ${cNotes}`;
      wasModified = true;
    }
  }

  // Numeric GroupId if existing was missing it
  let newGroupId = existingGroup.groupId;
  if (candidate.groupId && /^\d+$/.test(candidate.groupId) && (!existingGroup.groupId || !/^\d+$/.test(existingGroup.groupId))) {
    newGroupId = candidate.groupId;
    wasModified = true;
  }

  const updatedGroup: Group = {
    ...existingGroup,
    name: newName,
    category: newCategory,
    privacy: newPrivacy,
    notes: newNotes,
    groupId: newGroupId,
    verified: true,
    updatedAt: wasModified ? now : existingGroup.updatedAt,
  };

  return { updatedGroup, wasModified };
}

/**
 * Parses multi-line text input OR JSON code into validated Group items,
 * detecting duplicates, intelligently updating existing groups with new details,
 * and creating ready-to-save merged objects.
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
  const groupsToCreate: Group[] = [];
  const groupsToUpdate: Group[] = [];

  if (!trimmedInput) {
    return {
      totalLines: 0,
      validItems,
      duplicateItems,
      invalidItems,
      groupsToCreate: [],
      groupsToUpdate: [],
      mergedGroups: existingGroups,
      addedCount: 0,
      updatedCount: 0,
    };
  }

  const now = Date.now();

  // Create mutable map of existing groups to track in-place updates
  const existingMap = new Map<string, Group>();
  for (const g of existingGroups) {
    existingMap.set(g.id, { ...g });
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

  // 3. Process each candidate: validate, dedupe, update existing, or create new
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

    // Check duplicate within incoming batch
    const isBatchDuplicate =
      (finalGroupId && seenGroupIds.has(finalGroupId)) ||
      seenCleanUrls.has(cleanUrl.toLowerCase());

    if (isBatchDuplicate) {
      duplicateItems.push({
        raw: candidate.raw,
        name: finalName,
        url: candidate.url,
        cleanUrl,
        groupId: val.groupId || candidate.groupId || '',
        category: candidate.category || defaultCategory.trim() || 'General',
        privacy: candidate.privacy || defaultPrivacy,
        notes: candidate.notes,
        isDuplicate: true,
        duplicateReason: 'Duplicate URL within this batch',
        isValid: true,
      });
      continue;
    }

    if (finalGroupId) seenGroupIds.add(finalGroupId);
    seenCleanUrls.add(cleanUrl.toLowerCase());

    // Check if group already exists in saved list
    const matchingExisting = findMatchingExistingGroup(cleanUrl, val.groupId || candidate.groupId, existingGroups);

    if (matchingExisting) {
      // Group already exists! Apply intelligent update to existing group
      const currentStored = existingMap.get(matchingExisting.id) || matchingExisting;
      const { updatedGroup, wasModified } = checkAndUpdateGroup(
        currentStored,
        candidate,
        defaultCategory,
        defaultPrivacy,
        now
      );

      existingMap.set(matchingExisting.id, updatedGroup);

      if (wasModified) {
        groupsToUpdate.push(updatedGroup);
      }

      duplicateItems.push({
        raw: candidate.raw,
        name: updatedGroup.name,
        url: candidate.url,
        cleanUrl,
        groupId: updatedGroup.groupId || '',
        category: updatedGroup.category || defaultCategory,
        privacy: updatedGroup.privacy || defaultPrivacy,
        notes: updatedGroup.notes,
        isDuplicate: true,
        duplicateReason: wasModified ? 'Updated existing group with new details' : 'Already exists in your saved groups',
        isValid: true,
      });
    } else {
      // Brand new group!
      const item: ParsedGroupItem = {
        raw: candidate.raw,
        name: finalName,
        url: candidate.url,
        cleanUrl,
        groupId: val.groupId || candidate.groupId || '',
        category: candidate.category || defaultCategory.trim() || 'General',
        privacy: candidate.privacy || defaultPrivacy,
        notes: candidate.notes,
        isDuplicate: false,
        isValid: true,
      };

      validItems.push(item);

      const newGroup: Group = {
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
        createdAt: now + groupsToCreate.length,
        updatedAt: now,
      };

      groupsToCreate.push(newGroup);
    }
  }

  // Merged result: newly created groups at top, followed by all existing groups (with updates applied)
  const mergedGroups: Group[] = [...groupsToCreate, ...Array.from(existingMap.values())];

  const totalLinesCount = isStructuredInput
    ? validItems.length + duplicateItems.length + invalidItems.length
    : trimmedInput.split('\n').filter(l => l.trim() && !/^[,\{\}\[\];:()]+$/.test(l.trim())).length;

  return {
    totalLines: totalLinesCount,
    validItems,
    duplicateItems,
    invalidItems,
    groupsToCreate,
    groupsToUpdate,
    mergedGroups,
    addedCount: groupsToCreate.length,
    updatedCount: groupsToUpdate.length,
  };
}
