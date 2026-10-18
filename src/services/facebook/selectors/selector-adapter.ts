import { Group, GroupPrivacy, TargetCountStatus } from '../../../types/group';

export interface TargetCountParseResult {
  count: number | null;
  status: TargetCountStatus;
  rawText: string;
}

export interface CandidateVerificationResult {
  valid: boolean;
  reason?: string;
  name: string;
  url: string;
  groupId: string;
  imageUrl?: string;
  privacy: GroupPrivacy;
}

/**
 * Known non-group URL slugs and system paths in Facebook.
 */
export const NON_GROUP_SLUGS = new Set([
  'feed',
  'discover',
  'create',
  'notifications',
  'search',
  'categories',
  'joins',
  'member-requests',
  'expert_badge',
  'settings',
  'about',
  'events',
  'media',
  'files',
  'chats',
  'manage',
  'canvas',
  'support',
  'buy_sell_discussion',
  'permalink',
  'user',
  'profile.php',
  'hashtag',
  'messages',
  'marketplace',
  'stories',
  'reels',
  'watch',
  'gaming',
  'members',
  'photos',
  'videos',
  'posts',
]);

const ACTION_SKIP_WORDS = new Set([
  'view group',
  'visit',
  'open',
  'view',
  'join',
  'group',
  'groups',
  'view all',
  'see all',
  'see more',
  'গ্রুপ দেখুন',
  'দেখুন',
  'সব দেখুন',
  'যোগ দিন',
  'গ্রুপে যান',
  'আরও দেখুন',
]);

/**
 * Converts Bengali digits (০-৯) to standard ASCII Arabic numerals (0-9).
 */
export function convertBengaliToAscii(str: string): string {
  const bengaliMap: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return str.replace(/[০-৯]/g, d => bengaliMap[d] || d);
}

export const bengaliToAsciiDigits = convertBengaliToAscii;

/**
 * Extracts and strictly validates the total joined-groups target count from Facebook's UI.
 * Only marks status as 'CONFIRMED' when the count is unambiguously bound to joined-group membership.
 */
export function parseJoinedGroupsTargetCount(docOrElement?: Document | Element): TargetCountParseResult {
  if (typeof document === 'undefined' && !docOrElement) {
    return { count: null, status: 'UNAVAILABLE', rawText: '' };
  }

  const root = docOrElement || document;
  const elements = Array.from(root.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, div, p'));

  const confirmedPatterns = [
    /(?:All groups you['’]?ve joined|Groups you['’]?ve joined)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,
    /(?:আপনার যোগ দেওয়া সমস্ত গ্রুপ|আপনার যোগ দেওয়া সব গ্রুপ|আপনি যেসব গ্রুপে যোগ দিয়েছেন|যোগ দেওয়া সমস্ত গ্রুপ|যোগ দেওয়া সব গ্রুপ|যোগ দেওয়া গ্রুপ|সব গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,
    /^All groups you['’]?ve joined\s*[:\-•]?\s*([0-9,kKmM\u09E6-\u09EF.]+)$/i,
  ];

  const uncertainPatterns = [
    /(?:Joined Groups|Your Groups|আমার গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,
    /(?:Groups|গ্রুপ)\s*\(([0-9,kKmM\u09E6-\u09EF.]+)\)/i,
  ];

  const parseNumber = (raw: string): number | null => {
    const ascii = convertBengaliToAscii(raw).replace(/,/g, '').trim().toLowerCase();
    if (ascii.endsWith('k')) {
      const n = parseFloat(ascii.replace('k', ''));
      return isNaN(n) ? null : Math.round(n * 1000);
    }
    if (ascii.endsWith('m')) {
      const n = parseFloat(ascii.replace('m', ''));
      return isNaN(n) ? null : Math.round(n * 1000000);
    }
    const n = parseInt(ascii, 10);
    return isNaN(n) ? null : n;
  };

  // 1. Check for high-confidence confirmed patterns first
  for (const el of elements) {
    const text = (el.textContent || '').trim();
    if (text.length > 120 || text.length < 3) continue;

    for (const pattern of confirmedPatterns) {
      const m = text.match(pattern);
      if (m && m[1]) {
        const parsed = parseNumber(m[1]);
        if (parsed !== null && parsed > 0) {
          return { count: parsed, status: 'CONFIRMED', rawText: text };
        }
      }
    }
  }

  // 2. Check for lower-confidence patterns
  for (const el of elements) {
    const text = (el.textContent || '').trim();
    if (text.length > 80 || text.length < 3) continue;

    for (const pattern of uncertainPatterns) {
      const m = text.match(pattern);
      if (m && m[1]) {
        const parsed = parseNumber(m[1]);
        if (parsed !== null && parsed > 0) {
          return { count: parsed, status: 'UNCERTAIN', rawText: text };
        }
      }
    }
  }

  return { count: null, status: 'UNAVAILABLE', rawText: '' };
}

/**
 * Checks if Facebook's UI visibly exposes a reliable end-of-list/end-of-results state.
 */
export function detectEndOfListIndicator(root: Document | Element = document): boolean {
  const endKeywords = [
    'end of results',
    'no more groups to show',
    'you’ve reached the end',
    "you've reached the end",
    'সব গ্রুপ দেখানো হয়েছে',
    'ফলাফলের সমাপ্তি',
  ];

  const candidateElements = root.querySelectorAll('div[role="status"], span[dir="auto"], div, p');
  for (const el of candidateElements) {
    const text = (el.textContent || '').trim().toLowerCase();
    if (text.length > 100 || text.length < 5) continue;
    for (const kw of endKeywords) {
      if (text.includes(kw)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Cleans candidate group text by removing subtitle artifacts, time strings, member counts.
 */
function cleanCandidateText(raw: string): string {
  if (!raw) return '';
  let s = raw.trim();
  s = s.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i, '');
  s = s.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i, '');
  s = s.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i, '');
  s = s.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i, '');
  s = s.replace(/\s*·\s*\d+.*members.*$/i, '');
  s = s.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i, '');
  s = s.replace(/\s*·\s*[^\n]+/i, '');
  return s.trim();
}

/**
 * Validates a candidate group link/card element through the strict 8-step verification pipeline.
 */
export function verifyGroupCandidate(anchor: HTMLAnchorElement | Element): CandidateVerificationResult {
  const invalidResult = (reason: string): CandidateVerificationResult => ({
    valid: false,
    reason,
    name: '',
    url: '',
    groupId: '',
    privacy: 'UNKNOWN',
  });

  const rawHref = (anchor as HTMLAnchorElement).href || anchor.getAttribute('href') || '';
  if (!rawHref || !rawHref.includes('/groups/')) {
    return invalidResult('Not a group link');
  }

  // Check 1: Exclude post permalinks, comment links, photo/video popups
  if (
    rawHref.includes('/permalink/') ||
    rawHref.includes('/posts/') ||
    rawHref.includes('/photos/') ||
    rawHref.includes('/videos/') ||
    rawHref.includes('comment_id=') ||
    rawHref.includes('notif_id=')
  ) {
    return invalidResult('Post or photo permalink, not a group home');
  }

  // Check 2: Extract slug/ID from canonical path
  let slug = '';
  try {
    const urlObj = new URL(rawHref, 'https://www.facebook.com');
    const parts = urlObj.pathname.split('/').filter(Boolean);
    const gIdx = parts.indexOf('groups');
    if (gIdx !== -1 && parts[gIdx + 1]) {
      slug = parts[gIdx + 1];
      // Check if it's an individual post or comment permalink
      if (parts.length > gIdx + 2) {
        const sub = parts[gIdx + 2].toLowerCase();
        if (['posts', 'permalink', 'photos', 'videos', 'user', 'media'].includes(sub)) {
          return invalidResult('Post or photo permalink, not a group home');
        }
      }
    }
  } catch {
    return invalidResult('Malformed URL');
  }

  if (!slug || NON_GROUP_SLUGS.has(slug.toLowerCase())) {
    return invalidResult('Non-group system path');
  }

  // Check 3: Container verification - reject notification flyouts, user menus
  if (
    anchor.closest(
      '[aria-label*="Notification" i], [aria-label*="বিজ্ঞপ্তি" i], [data-pagelet*="Notification" i]'
    )
  ) {
    return invalidResult('Inside notification flyout');
  }

  // Check 4 & 5: Check bounded card context
  const card =
    anchor.closest('div[role="listitem"], div[role="article"], div[role="gridcell"], li, div[role="row"]') ||
    anchor.parentElement?.parentElement ||
    anchor.parentElement;

  if (card) {
    const cardText = (card.textContent || '').toLowerCase();

    if (
      cardText.includes('sponsored') ||
      cardText.includes('বিজ্ঞাপন') ||
      card.querySelector('[aria-label*="Sponsored" i], [aria-label*="বিজ্ঞাপন" i]')
    ) {
      return invalidResult('Sponsored advertisement');
    }

    // Check if card explicitly is an unjoined/suggested recommendation card
    // Only check if card is bounded (does not contain multiple different group links)
    const cardGroupAnchors = card.querySelectorAll ? Array.from(card.querySelectorAll('a[href*="/groups/"]')) : [];
    const isSingleCard = cardGroupAnchors.length <= 4;

    if (isSingleCard) {
      if (
        cardText.includes('requested to join') ||
        cardText.includes('অনুরোধ পাঠানো হয়েছে') ||
        cardText.includes('answer questions') ||
        cardText.includes('update responses') ||
        cardText.includes('suggested for you') ||
        cardText.includes('আপনার জন্য প্রস্তাবিত') ||
        cardText.includes('suggested groups') ||
        cardText.includes('প্রস্তাবিত গ্রুপ')
      ) {
        return invalidResult('Unjoined or suggested group');
      }

      // Check for explicit "Join" button only if single item card without "View group"
      if (card.querySelectorAll) {
        const buttons = Array.from(card.querySelectorAll('button, [role="button"]'));
        for (const btn of buttons) {
          const btnText = (btn.textContent || btn.getAttribute('aria-label') || '').trim().toLowerCase();
          if (
            (btnText === 'join' || btnText === 'join group' || btnText === 'যোগ দিন' || btnText === 'গ্রুপে যোগ দিন' || btnText === 'request to join') &&
            !cardText.includes('view group') && !cardText.includes('গ্রুপ দেখুন') && !cardText.includes('visited') && !cardText.includes('last active')
          ) {
            return invalidResult('Card has Join button, not joined');
          }
        }
      }
    }
  }

  // Check 6: Extract Group Name
  let name = '';

  // Priority 0: Anchor's aria-label if meaningful
  const ariaLabel = (anchor.getAttribute('aria-label') || '').trim();
  if (ariaLabel && ariaLabel.length >= 2 && !ACTION_SKIP_WORDS.has(ariaLabel.toLowerCase())) {
    name = cleanCandidateText(ariaLabel);
  }

  // Priority 1: Direct text inside the anchor (or heading inside anchor)
  if (!name) {
    const rawDirect = (anchor.textContent || (anchor as HTMLElement).innerText || '').trim();
    const cleaned = cleanCandidateText(rawDirect);
    if (cleaned && cleaned.length >= 2 && !ACTION_SKIP_WORDS.has(cleaned.toLowerCase())) {
      name = cleaned;
    }
  }

  // Priority 2: Direct spans / headings inside anchor
  if (!name) {
    const directSpans = Array.from(anchor.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, span'));
    for (const sp of directSpans) {
      const t = cleanCandidateText((sp.textContent || '').trim());
      const lower = t.toLowerCase();
      if (
        t.length >= 2 &&
        !ACTION_SKIP_WORDS.has(lower) &&
        !lower.includes('last active') &&
        !lower.includes('you last visited') &&
        !lower.includes('members') &&
        !lower.includes('সদস্য') &&
        !lower.includes('ago')
      ) {
        name = t;
        break;
      }
    }
  }

  // Priority 3: Card heading (Comet design uses h1/h2/h3/h4/role="heading")
  if (!name && card) {
    const heading = card.querySelector('h1, h2, h3, h4, [role="heading"]');
    if (heading && heading.textContent) {
      const hText = cleanCandidateText(heading.textContent.trim());
      if (hText.length >= 2 && !ACTION_SKIP_WORDS.has(hText.toLowerCase())) {
        name = hText;
      }
    }
  }

  // Priority 4: Meaningful spans in card
  if (!name && card) {
    const spans = Array.from(
      card.querySelectorAll('h1, h2, h3, h4, span[dir="auto"], strong, a[href*="/groups/"] > span')
    );
    for (const sp of spans) {
      if (sp === anchor) continue;
      const txt = cleanCandidateText((sp.textContent || '').trim());
      const lower = txt.toLowerCase();
      if (
        txt.length >= 2 &&
        txt.length < 200 &&
        !ACTION_SKIP_WORDS.has(lower) &&
        !lower.includes('view group') &&
        !lower.includes('you last visited') &&
        !lower.includes('last active') &&
        !lower.includes('members') &&
        !lower.includes('সদস্য') &&
        !lower.includes('hours ago') &&
        !lower.includes('minutes ago') &&
        !lower.includes('days ago') &&
        !lower.includes('ঘণ্টা আগে') &&
        !lower.includes('দিন আগে') &&
        !/^\d+ (hours?|minutes?|days?|weeks?) ago$/i.test(lower)
      ) {
        name = txt;
        break;
      }
    }
  }

  // Fallback to formatted slug
  if (!name) {
    name = slug
      .split(/[-_.]+/)
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Check 7: Extract Image Thumbnail
  let imageUrl = '';
  const imgEl = card?.querySelector ? (card.querySelector('img, image') || anchor.querySelector('img, image')) : null;
  if (imgEl) {
    imageUrl = imgEl.getAttribute('src') || imgEl.getAttribute('href') || (imgEl as any).href?.baseVal || '';
    if (imageUrl.includes('/rsrc.php/') || imageUrl.includes('spacer') || imageUrl.includes('1x1')) {
      imageUrl = '';
    }
  }

  // Check 8: Extract Privacy Type
  let privacy: GroupPrivacy = 'UNKNOWN';
  const privacyCheck = (t: string): GroupPrivacy => {
    const l = (t || '').toLowerCase();
    if (l.includes('public group') || l.includes('পাবলিক গ্রুপ') || l.includes('public') || l.includes('পাবলিক')) return 'PUBLIC';
    if (l.includes('private group') || l.includes('প্রাইভেট গ্রুপ') || l.includes('private') || l.includes('প্রাইভেট')) return 'PRIVATE';
    return 'UNKNOWN';
  };

  if (card) {
    const p1 = privacyCheck(card.textContent || '');
    if (p1 !== 'UNKNOWN') {
      privacy = p1;
    } else if (card.querySelectorAll) {
      const spans = Array.from(card.querySelectorAll('span, div, p'));
      for (const sp of spans) {
        const p2 = privacyCheck(sp.textContent || '');
        if (p2 !== 'UNKNOWN') {
          privacy = p2;
          break;
        }
      }
    }
  }
  if (privacy === 'UNKNOWN') {
    privacy = privacyCheck(anchor.textContent || '');
  }

  return {
    valid: true,
    name,
    url: `https://www.facebook.com/groups/${slug}/`,
    groupId: slug,
    imageUrl,
    privacy,
  };
}

/**
 * Extracts canonical group slug/ID and canonical URL without fake IDs.
 */
export function extractCanonicalGroupIdentity(urlOrSlug: string): { groupId: string; canonicalUrl: string } {
  if (!urlOrSlug) return { groupId: '', canonicalUrl: '' };
  let slug = urlOrSlug.trim();
  try {
    if (slug.includes('://')) {
      const u = new URL(slug);
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('groups');
      if (idx !== -1 && parts[idx + 1]) {
        slug = parts[idx + 1];
      }
    }
  } catch {}

  slug = slug
    .replace(/^https?:\/\/(?:www\.|web\.|m\.)?facebook\.com\/groups\//i, '')
    .replace(/\/.*$/, '')
    .replace(/[?#].*$/, '');

  const canonicalUrl = `https://www.facebook.com/groups/${slug}/`;
  return { groupId: slug, canonicalUrl };
}

