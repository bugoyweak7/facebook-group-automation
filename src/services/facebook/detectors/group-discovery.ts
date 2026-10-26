import {
  Group,
  GroupPrivacy,
  DiscoveryScanResult,
  DebugMetrics,
  ScanOutcome,
  CompletionReason,
  TargetCountStatus,
  FacebookUserProfile,
} from '../../../types';
import {
  NON_GROUP_SLUGS,
  verifyGroupCandidate,
  parseJoinedGroupsTargetCount,
  detectEndOfListIndicator,
  CandidateVerificationResult,
} from '../selectors/selector-adapter';

export interface DiscoveredGroupItem {
  name: string;
  url: string;
  groupId: string;
  privacy: GroupPrivacy;
  imageUrl?: string;
  verified?: boolean;
  source?: 'facebook-ui';
  accountContext?: string;
  discoveredAt?: number;
}

export interface ProgressiveScanOptions {
  maxRounds?: number;
  stagnantLimit?: number;
  scrollDelayMs?: number;
  accountContext?: string;
  onProgress?: (foundCount: number, status: string, targetTotal?: number | null, metrics?: DebugMetrics) => void;
  onBatchDiscovered?: (newItems: DiscoveredGroupItem[], totalSoFar: number, metrics?: DebugMetrics) => Promise<void> | void;
}

/**
 * Checks if the current page has an authenticated Facebook session.
 */
export function checkFacebookLoginStatus(): boolean {
  if (typeof document === 'undefined') return false;

  const url = typeof window !== 'undefined' ? window.location.href : '';
  if (url.includes('/login') || url.includes('/recover') || url.includes('/checkpoint')) {
    return false;
  }

  const bodyText = document.body ? (document.body.innerText || document.body.textContent || '') : '';
  if (
    bodyText.includes("What's on your mind") ||
    bodyText.includes('আপনার মনে কী আছে') ||
    bodyText.includes('কী ভাবছেন') ||
    bodyText.includes('Professional dashboard') ||
    bodyText.includes('Ads Manager') ||
    bodyText.includes('Meta Business Suite')
  ) {
    return true;
  }

  const hasUserNav = Boolean(
    document.querySelector(
      '[role="navigation"], [data-pagelet="LeftRail"], [aria-label="Facebook"], input[placeholder*="Search" i], [aria-label*="profile" i], [aria-label*="Account" i], a[href*="/me/"], a[href*="/groups/"]'
    )
  );

  return hasUserNav || Boolean(document.cookie && document.cookie.includes('c_user'));
}

/**
 * Detects the logged-in Facebook user profile name, avatar, and userId.
 */
export function detectFacebookUserProfile(): FacebookUserProfile {
  if (typeof document === 'undefined') {
    return { isLoggedIn: false, name: '', profileUrl: '' };
  }

  let name = '';
  let profileUrl = '';
  let avatarUrl = '';
  let userId = '';

  // 1. Post composer prompt
  if (document.body) {
    const bodyText = document.body.innerText || document.body.textContent || '';
    const composerMatch = bodyText.match(
      /(?:What['’]s on your mind|আপনার মনে কী আছে|কী ভাবছেন)[,?\s]+([^?!\n]+?)(?:\?|$)/i
    );
    if (composerMatch && composerMatch[1]) {
      const cand = composerMatch[1].trim().replace(/[?,!]+$/, '').trim();
      if (cand.length >= 2 && cand.length <= 50 && !cand.toLowerCase().includes('facebook')) {
        name = cand;
      }
    }
  }

  // 2. Profile anchors (left rail, header, or /me/ link)
  const profileAnchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/me/"], a[href*="facebook.com/profile"], [role="navigation"] a[href]'));
  for (const a of profileAnchors) {
    const href = a.getAttribute('href') || a.href || '';
    const textSpan = a.querySelector('span[dir="auto"], span, strong, h1');
    const text = (textSpan ? textSpan.textContent : (a as HTMLElement).innerText || a.textContent || '').trim();
    if (text && text.length >= 2 && text.length <= 35) {
      const sysWords = [
        'Home', 'Friends', 'Feeds', 'Groups', 'Watch', 'Marketplace', 'Memories',
        'Saved', 'Video', 'Settings', 'Meta AI', 'Professional dashboard',
        'Ads Manager', 'Ad Center', 'Meta Business Suite', 'See more', 'See all',
        'Facebook', 'Menu', 'Notifications',
      ];
      if (!sysWords.includes(text)) {
        if (!name) name = text;
        if (!profileUrl && href) profileUrl = href;
        const img = a.querySelector('image, img') as HTMLImageElement;
        if (img && !avatarUrl) {
          avatarUrl = img.getAttribute('src') || (img as any).href?.baseVal || '';
        }
        if (name) break;
      }
    }
  }

  // 3. Top-right profile menu button
  const topProfileBtn = document.querySelector(
    '[aria-label="Your profile" i], [aria-label*="Your profile" i], [aria-label*="Account Controls" i], [aria-label*="আপনার প্রোফাইল" i]'
  );
  if (topProfileBtn && !avatarUrl) {
    const img = topProfileBtn.querySelector('image, img') as HTMLImageElement;
    if (img) {
      avatarUrl = img.getAttribute('src') || (img as any).href?.baseVal || '';
    }
  }

  // 4. Scripts for CurrentUserInitialData / DTSG
  try {
    const scripts = Array.from(document.querySelectorAll('script'));
    for (const s of scripts) {
      const txt = s.textContent || '';
      if (txt.includes('"NAME":') || txt.includes('"USER_ID":') || txt.includes('"short_name":')) {
        const nameMatch = txt.match(/"NAME":\s*"([^"]+)"/) || txt.match(/"short_name":\s*"([^"]+)"/);
        if (nameMatch && nameMatch[1] && !name) {
          try {
            name = JSON.parse(`"${nameMatch[1]}"`);
          } catch {
            name = nameMatch[1];
          }
        }
        const idMatch = txt.match(/"USER_ID":\s*"(\d+)"/);
        if (idMatch && idMatch[1] && !userId) {
          userId = idMatch[1];
        }
        if (name) break;
      }
    }
  } catch {}

  // 5. Cookie userId fallback
  if (!userId && document.cookie) {
    const cm = document.cookie.match(/c_user=(\d+)/);
    if (cm) userId = cm[1];
  }

  const isLoggedIn = checkFacebookLoginStatus() || Boolean(name || userId);

  return {
    isLoggedIn,
    name: name || (isLoggedIn ? 'Facebook User' : ''),
    profileUrl: profileUrl || 'https://www.facebook.com',
    avatarUrl,
    userId,
  };
}

/**
 * Extracts groups from embedded script tags (Relay/GraphQL initial payload).
 */
export function extractGroupsFromScriptTags(accountContext?: string): DiscoveredGroupItem[] {
  if (typeof document === 'undefined') return [];

  const foundMap = new Map<string, DiscoveredGroupItem>();
  const now = Date.now();

  try {
    const scripts = Array.from(document.querySelectorAll('script'));
    for (const script of scripts) {
      const text = script.textContent || '';
      if (text.length < 40) continue;

      const patterns = [
        // Strictly require __typename:"Group"
        /"__typename"\s*:\s*"Group"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,
        /"__typename"\s*:\s*"Group"[\s\S]{0,500}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,500}?"id"\s*:\s*"(\d+)"/g,
        // Node with explicit __typename:"Group"
        /"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g,
        /"node"\s*:\s*\{[\s\S]{0,120}?"__typename"\s*:\s*"Group"[\s\S]{0,350}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,350}?"id"\s*:\s*"(\d+)"/g,
        // Direct id and name within Relay group node with explicit group URL
        /\{"id"\s*:\s*"(\d+)"[\s\S]{0,300}?"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g,
        /\{"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]{0,300}?"id"\s*:\s*"(\d+)"[\s\S]{0,300}?(?:"__typename"\s*:\s*"Group"|url"\s*:\s*"https:[^"]*?\/groups\/[^"]+?")/g,
      ];

      for (const regex of patterns) {
        let m: RegExpExecArray | null;
        while ((m = regex.exec(text)) !== null) {
          let gId = '';
          let gName = '';
          if (/^\d+$/.test(m[1])) {
            gId = m[1];
            gName = m[2];
          } else if (/^\d+$/.test(m[2])) {
            gId = m[2];
            gName = m[1];
          }

          if (gId && gName) {
            gName = gName.trim();
            try {
              gName = gName.replace(/\\u[\dA-Fa-f]{4}/g, c =>
                String.fromCharCode(parseInt(c.replace('\\u', ''), 16))
              );
            } catch {}

            // Reject if surrounding chunk indicates this is a User, Actor, Story, Comment, or Page
            const surrounding = text.slice(
              Math.max(0, m.index - 350),
              Math.min(text.length, m.index + 600)
            );
            if (
              surrounding.includes('"__typename":"User"') ||
              surrounding.includes('"__typename":"Actor"') ||
              surrounding.includes('"__typename":"Story"') ||
              surrounding.includes('"__typename":"Comment"') ||
              surrounding.includes('"__typename":"Page"')
            ) {
              continue;
            }

            // Reject if extracted name matches the user's own profile name
            if (accountContext && gName.toLowerCase() === accountContext.toLowerCase()) {
              continue;
            }

            if (gName.length >= 2 && !foundMap.has(gId)) {
              let imageUrl = '';
              const nearbyChunk = text.slice(
                Math.max(0, m.index - 500),
                Math.min(text.length, m.index + 1000)
              );
              const imgMatch = nearbyChunk.match(
                /"(?:uri|url|cover_photo|image)"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/
              );
              if (imgMatch && imgMatch[1]) {
                let img = imgMatch[1];
                try {
                  img = img.replace(/\\u[\dA-Fa-f]{4}/g, c =>
                    String.fromCharCode(parseInt(c.replace('\\u', ''), 16))
                  );
                } catch {}
                if (!img.includes('/rsrc.php/') && !img.includes('1x1')) {
                  imageUrl = img.replace(/\\\//g, '/');
                }
              }

              foundMap.set(gId, {
                name: cleanGroupName(gName, gId),
                url: `https://www.facebook.com/groups/${gId}/`,
                groupId: gId,
                privacy: 'UNKNOWN',
                imageUrl,
                verified: true,
                source: 'facebook-ui',
                accountContext,
                discoveredAt: now,
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[AGP:Discovery] Script tags extraction warning:', err);
  }

  return Array.from(foundMap.values());
}

/**
 * Scans the current DOM elements for verified group links using the 8-step verification pipeline.
 */
export function scanPageForGroups(accountContext?: string): { items: DiscoveredGroupItem[]; rejectedCount: number } {
  if (typeof document === 'undefined') return { items: [], rejectedCount: 0 };

  const foundMap = new Map<string, DiscoveredGroupItem>();
  let rejectedCount = 0;
  const now = Date.now();

  // 1. Initial script tags extraction
  const scriptGroups = extractGroupsFromScriptTags(accountContext);
  for (const g of scriptGroups) {
    foundMap.set(g.groupId.toLowerCase(), g);
  }

  // 2. DOM anchors verification
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/groups/"]'));
  for (const anchor of anchors) {
    const result = verifyGroupCandidate(anchor);
    if (!result.valid || !result.name || !result.url || !result.groupId) {
      rejectedCount++;
      continue;
    }

    const key = result.groupId.toLowerCase();
    const existing = foundMap.get(key);

    if (existing) {
      if (!existing.imageUrl && result.imageUrl) {
        existing.imageUrl = result.imageUrl;
      }
      if (result.name && existing.name.length < result.name.length) {
        existing.name = result.name;
      }
      if (result.privacy !== 'UNKNOWN') {
        existing.privacy = result.privacy;
      }
    } else {
      foundMap.set(key, {
        name: result.name,
        url: result.url,
        groupId: result.groupId,
        privacy: result.privacy,
        imageUrl: result.imageUrl,
        verified: true,
        source: 'facebook-ui',
        accountContext,
        discoveredAt: now,
      });
    }
  }

  return { items: Array.from(foundMap.values()), rejectedCount };
}

/**
 * Clicks any visible "See more" or "See all" group expansion buttons.
 */
export function expandSeeMoreButtons(): number {
  if (typeof document === 'undefined') return 0;

  let clicked = 0;
  const buttons = Array.from(
    document.querySelectorAll<HTMLElement>(
      'div[role="button"], button, span[dir="auto"], [role="navigation"] [role="button"], [data-pagelet="LeftRail"] [role="button"]'
    )
  );

  for (const btn of buttons) {
    const text = (btn.textContent || btn.getAttribute('aria-label') || '').trim().toLowerCase();
    if (
      text === 'see more' ||
      text === 'আরও দেখুন' ||
      text === 'see all' ||
      text === 'সব দেখুন' ||
      text === 'see all groups' ||
      text === 'সব গ্রুপ দেখুন' ||
      text === 'view more'
    ) {
      try {
        const clickable = btn.closest<HTMLElement>('[role="button"], button') || btn;
        clickable.click();
        clicked++;
      } catch {}
    }
  }
  return clicked;
}

/**
 * Production-Grade Progressive Group Discovery Engine.
 * 
 * Rules:
 * - Stagnant scroll = PARTIAL (Reason: STAGNANT_TIMEOUT)
 * - COMPLETE permitted ONLY on:
 *   1. Verified Target Count Reached (CONFIRMED targetCount, Reason: TARGET_REACHED)
 *   2. Explicit List End Indicator (Reason: LIST_END)
 */
export async function performProgressiveGroupScan(
  options: ProgressiveScanOptions = {}
): Promise<DiscoveryScanResult> {
  const maxRounds = options.maxRounds || 350;
  const stagnantLimit = options.stagnantLimit || 35;
  const scrollDelayMs = options.scrollDelayMs !== undefined ? options.scrollDelayMs : 75;
  const accountContext = options.accountContext;

  const startTime = Date.now();
  const isLoggedIn = checkFacebookLoginStatus();

  const allFound = new Map<string, DiscoveredGroupItem>();
  let totalDuplicatesRemoved = 0;
  let totalRejectedCandidates = 0;
  let mutationEventCount = 0;
  let scrollIterationCount = 0;

  // 1. Detect target count and confidence status
  const targetParse = parseJoinedGroupsTargetCount();
  const targetCount = targetParse.count;
  const targetCountStatus: TargetCountStatus = targetParse.status;

  console.log(
    `[AGP:Engine] Discovery started. Target count: ${targetCount ?? 'N/A'} (Status: ${targetCountStatus})`
  );

  const buildMetrics = (
    reason: CompletionReason | null
  ): DebugMetrics => ({
    candidateCount: allFound.size + totalRejectedCandidates,
    verifiedCount: allFound.size,
    duplicatesRemoved: totalDuplicatesRemoved,
    rejectedCount: totalRejectedCandidates,
    scrollIterations: scrollIterationCount,
    mutationEvents: mutationEventCount,
    targetCount,
    targetCountStatus,
    completionReason: reason,
    scanDurationMs: Date.now() - startTime,
    lastNewGroupTimestamp: allFound.size > 0 ? Date.now() : null,
  });

  const recordFound = (batch: DiscoveredGroupItem[]) => {
    let added = 0;
    for (const g of batch) {
      const key = g.groupId.toLowerCase();
      if (!allFound.has(key)) {
        allFound.set(key, g);
        added++;
      } else {
        totalDuplicatesRemoved++;
      }
    }
    return added;
  };

  // 2. Setup MutationObserver for DOM changes
  let observer: MutationObserver | null = null;
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
    observer = new MutationObserver(mutations => {
      mutationEventCount += mutations.length;
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  try {
    // 3. Expand buttons and perform initial scan
    try {
      expandSeeMoreButtons();
    } catch {}

    const initial = scanPageForGroups(accountContext);
    totalRejectedCandidates += initial.rejectedCount;
    const initialAdded = recordFound(initial.items);

    if (initialAdded > 0 && options.onBatchDiscovered) {
      try {
        await options.onBatchDiscovered(Array.from(allFound.values()), allFound.size, buildMetrics(null));
      } catch {}
    }

    if (options.onProgress) {
      const statusMsg = targetCount
        ? `Found ${allFound.size} of ${targetCount} groups...`
        : `Found ${allFound.size} groups...`;
      options.onProgress(allFound.size, statusMsg, targetCount, buildMetrics(null));
    }

    // Check if initial scan already satisfied CONFIRMED target count
    if (targetCountStatus === 'CONFIRMED' && targetCount !== null && allFound.size >= targetCount) {
      const metrics = buildMetrics('TARGET_REACHED');
      console.log(`[AGP:Engine] Target count of ${targetCount} confirmed on initial scan.`);
      return {
        isLoggedIn,
        groups: Array.from(allFound.values()),
        totalFound: allFound.size,
        targetCount,
        isPartial: false,
        outcome: 'COMPLETE',
        completionReason: 'TARGET_REACHED',
        debugMetrics: metrics,
      };
    }

    // 4. Controlled Progressive Scrolling Loop
    let consecutiveStagnant = 0;
    let finalOutcome: ScanOutcome = 'PARTIAL';
    let finalReason: CompletionReason = 'STAGNANT_TIMEOUT';

    for (let round = 0; round < maxRounds; round++) {
      scrollIterationCount++;

      // Click "See more" / "See all" buttons periodically
      if (round % 3 === 0) {
        try {
          expandSeeMoreButtons();
        } catch {}
      }

      // 4A. Scroll the very last group anchor card into view
      const currentAnchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/groups/"]'));
      if (currentAnchors.length > 0) {
        const lastAnchor = currentAnchors[currentAnchors.length - 1];
        try {
          lastAnchor.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'smooth' });
        } catch {}
      }

      // 4B. Scroll main content container
      const mainEl = document.querySelector('[role="main"], [data-pagelet*="Group"]');
      if (mainEl && mainEl.lastElementChild) {
        try {
          (mainEl.lastElementChild as HTMLElement).scrollIntoView({ block: 'end', behavior: 'smooth' });
        } catch {}
      }

      // 4C. Scroll document & scrollingElement
      const docHeight = Math.max(
        document.documentElement?.scrollHeight || 0,
        document.scrollingElement?.scrollHeight || 0,
        document.body?.scrollHeight || 0
      );
      window.scrollTo(0, docHeight);
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = docHeight;
      }
      if (document.documentElement) {
        document.documentElement.scrollTop = docHeight;
      }

      // 4D. Scroll internal containers with overflow
      const scrollables = Array.from(document.querySelectorAll<HTMLElement>('div, main, section'));
      for (const el of scrollables) {
        if (el.scrollHeight > el.clientHeight + 80) {
          const st = window.getComputedStyle(el);
          if (st.overflowY === 'auto' || st.overflowY === 'scroll') {
            el.scrollTop = el.scrollHeight;
            el.dispatchEvent(new Event('scroll', { bubbles: true }));
          }
        }
      }

      // Dispatch wake-up events
      window.dispatchEvent(new Event('scroll', { bubbles: true }));
      try {
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 2500, bubbles: true }));
        document.body?.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', code: 'PageDown', bubbles: true }));
      } catch {}

      // Pacing delay to allow Facebook's Relay GraphQL and React DOM to render
      await new Promise(res => setTimeout(res, scrollDelayMs));

      // 4E. Rescan and verify candidates
      const scanned = scanPageForGroups(accountContext);
      totalRejectedCandidates += scanned.rejectedCount;
      const added = recordFound(scanned.items);

      if (added > 0) {
        consecutiveStagnant = 0;

        if (options.onBatchDiscovered) {
          try {
            await options.onBatchDiscovered(Array.from(allFound.values()), allFound.size, buildMetrics(null));
          } catch {}
        }

        if (options.onProgress) {
          const msg = targetCount
            ? `Scanning Facebook Groups... ${allFound.size} of ${targetCount} discovered`
            : `Scanning Facebook Groups... ${allFound.size} groups discovered`;
          options.onProgress(allFound.size, msg, targetCount, buildMetrics(null));
        }

        // Check Condition A: Confirmed Target Count Reached
        if (targetCountStatus === 'CONFIRMED' && targetCount !== null && allFound.size >= targetCount) {
          console.log(`[AGP:Engine] Target count reached: ${allFound.size} >= ${targetCount}.`);
          finalOutcome = 'COMPLETE';
          finalReason = 'TARGET_REACHED';
          break;
        }
      } else {
        consecutiveStagnant++;

        // Check Condition B: Explicit End-of-List Indicator
        if (detectEndOfListIndicator()) {
          console.log('[AGP:Engine] Explicit end-of-list indicator detected.');
          finalOutcome = 'COMPLETE';
          finalReason = 'LIST_END';
          break;
        }

        // Perform jiggle recovery scroll
        window.scrollBy(0, -600);
        if (currentAnchors.length > 5) {
          currentAnchors[Math.max(0, currentAnchors.length - 6)]?.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
        await new Promise(res => setTimeout(res, 300));
        window.scrollBy(0, 1200);
        if (currentAnchors.length > 0) {
          currentAnchors[currentAnchors.length - 1]?.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }

        // Bounded retry if target count is confirmed but not reached yet
        if (targetCountStatus === 'CONFIRMED' && targetCount !== null && allFound.size < targetCount && consecutiveStagnant < 45) {
          window.scrollBy(0, -1000);
          await new Promise(res => setTimeout(res, 350));
          window.scrollBy(0, 2500);
          continue;
        }

        // Stagnation limit reached without evidence -> Mark PARTIAL
        if (consecutiveStagnant >= stagnantLimit) {
          console.log(
            `[AGP:Engine] Scan complete/stagnant after ${consecutiveStagnant} attempts. Total verified: ${allFound.size}`
          );
          finalOutcome = 'PARTIAL';
          finalReason = 'STAGNANT_TIMEOUT';
          break;
        }
      }
    }

    // Scroll back to top smoothly
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}

    const isPartial = finalOutcome !== 'COMPLETE';
    const metrics = buildMetrics(finalReason);

    return {
      isLoggedIn,
      groups: Array.from(allFound.values()),
      totalFound: allFound.size,
      targetCount,
      isPartial,
      outcome: finalOutcome,
      completionReason: finalReason,
      debugMetrics: metrics,
    };
  } finally {
    if (observer) {
      observer.disconnect();
    }
  }
}

/**
 * Cleans Facebook group name by stripping member counts, privacy tags, and action prefixes.
 */
export function cleanGroupName(rawName: string, fallbackSlug?: string): string {
  if (!rawName || !rawName.trim()) {
    if (fallbackSlug) {
      return fallbackSlug
        .split(/[-_.]+/)
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    return 'Facebook Group';
  }

  let name = rawName.trim();
  name = name.replace(/^(?:Visit|Open|View|গ্রুপ দেখুন|দেখুন)\s+/i, '');
  name = name.replace(/\s*(?:Last active|You last visited|last visited|active)\s+[^\n]+/i, '');
  name = name.replace(/\s*(?:গত|আগে|মিনিট আগে|ঘণ্টা আগে|দিন আগে)[^\n]*/i, '');
  name = name.replace(/\s*·\s*(?:Public group|Private group|পাবলিক গ্রুপ|প্রাইভেট গ্রুপ).*$/i, '');
  name = name.replace(/\s*·\s*\d+.*members.*$/i, '');
  name = name.replace(/\s*·\s*[০-৯\d]+.*সদস্য.*$/i, '');
  name = name.replace(/\s*·\s*[^\n]+/i, '');

  if (name.toLowerCase() === 'visit' || name.toLowerCase() === 'group' || name.toLowerCase() === 'view group') {
    if (fallbackSlug) {
      return fallbackSlug
        .split(/[-_.]+/)
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }

  return name.trim() || 'Facebook Group';
}

/**
 * Extracts groups from HTML string containing Relay/GraphQL payload.
 */
export function extractGroupsFromHtml(html: string): DiscoveredGroupItem[] {
  const groups: DiscoveredGroupItem[] = [];
  const regex = /"__typename"\s*:\s*"Group"[^}]*?"id"\s*:\s*"(\d+)"[^}]*?"name"\s*:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    const id = m[1];
    let rawName = m[2];
    try {
      rawName = rawName.replace(/\\u[\dA-Fa-f]{4}/g, c =>
        String.fromCharCode(parseInt(c.replace('\\u', ''), 16))
      );
    } catch {}
    groups.push({
      groupId: id,
      name: cleanGroupName(rawName),
      url: `https://www.facebook.com/groups/${id}/`,
      privacy: 'PUBLIC',
      verified: true,
      source: 'facebook-ui',
    });
  }
  return groups;
}

/**
 * Predicate to check if candidate is inside unjoined/suggested card or feed.
 */
export function isUnjoinedOrSuggestedGroup(element: Element): boolean {
  if (element.closest('[role="feed"]')) return true;

  const card =
    element.closest('[role="listitem"], [role="article"], div[data-pagelet*="Group"]') ||
    element.parentElement;
  if (!card) return false;

  const text = (card.textContent || '').toLowerCase();
  if (text.includes('requested to join') || text.includes('answer questions') || text.includes('pending')) {
    return true;
  }

  const buttons = Array.from(card.querySelectorAll('button, div[role="button"], [aria-label]'));
  for (const b of buttons) {
    const bText = (b.textContent || b.getAttribute('aria-label') || '').trim().toLowerCase();
    if (bText === 'join' || bText === 'join group' || bText === 'যোগ দিন' || bText.includes('join group')) {
      return true;
    }
  }
  return false;
}

/**
 * Predicate to check if candidate anchor is a notification, post, comment, or media link.
 */
export function isNotificationOrPostAnchor(anchor: Element): boolean {
  const href = (anchor.getAttribute('href') || (anchor as HTMLAnchorElement).href || '').toLowerCase();
  if (
    href.includes('/permalink/') ||
    href.includes('/posts/') ||
    href.includes('/photos/') ||
    href.includes('/videos/') ||
    href.includes('comment_id=') ||
    href.includes('notif_id=')
  ) {
    return true;
  }
  if (anchor.closest('[aria-label*="Notification" i], [aria-label*="বিজ্ঞপ্তি" i], div[role="menu"], div[role="dialog"]')) {
    return true;
  }
  return false;
}

/**
 * Fallback session groups fetcher stub.
 */
export async function fetchJoinedGroupsViaSession(): Promise<DiscoveredGroupItem[]> {
  return [];
}
