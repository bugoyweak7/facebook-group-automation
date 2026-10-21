import {
  AutoJoinConfig,
  AutoJoinGroupItem,
  AutoJoinState,
  INITIAL_AUTO_JOIN_STATE,
} from '../../types/auto-joiner';
import { Group } from '../../types/group';
import { NON_GROUP_SLUGS } from './selectors/selector-adapter';
import { generateId } from '../../utils/helpers';
import { getGroups, setGroups } from '../storage/chrome-storage';

/**
 * Normalizes any Facebook search input into a valid Facebook Group Search URL.
 * Handles keywords, raw URLs, mobile URLs, web.facebook.com, etc.
 */
export function normalizeSearchUrl(rawInput: string): string {
  if (!rawInput) return 'https://www.facebook.com/search/groups/?q=';
  const trimmed = rawInput.trim();

  // If already a full Facebook search URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname.includes('facebook.com') || parsed.hostname.includes('fb.com')) {
        // If it's already a group search URL
        if (parsed.pathname.includes('/search/groups')) {
          return trimmed;
        }
        // If it's another search page with ?q=
        const q = parsed.searchParams.get('q');
        if (q) {
          return `https://www.facebook.com/search/groups/?q=${encodeURIComponent(q)}`;
        }
        return trimmed;
      }
    } catch (_) {}
  }

  // If user pasted "facebook.com/search/groups/?q=..."
  if (trimmed.includes('facebook.com/search/groups') || trimmed.includes('fb.com/search/groups')) {
    return `https://${trimmed.replace(/^https?:\/\//, '')}`;
  }

  // If user pasted search keywords like "shoes bangladesh" or "cars buy and sell"
  return `https://www.facebook.com/search/groups/?q=${encodeURIComponent(trimmed)}`;
}

/**
 * Extracts the search query text from a Facebook search URL.
 */
export function extractSearchQuery(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const q = parsed.searchParams.get('q');
    return q ? decodeURIComponent(q.replace(/\+/g, ' ')) : '';
  } catch (_) {
    return '';
  }
}

/**
 * Checks if current page is a Facebook search page.
 */
export function isFacebookSearchPage(): boolean {
  if (typeof window === 'undefined') return false;
  const href = window.location.href.toLowerCase();
  return (
    (href.includes('facebook.com') || href.includes('fb.com')) &&
    href.includes('/search')
  );
}

interface ScannedCardResult {
  cardElement: HTMLElement;
  item: AutoJoinGroupItem;
  joinButton: HTMLElement | null;
}

/**
 * Detects whether a DOM element is a Facebook Group Join button.
 * Supports English ("Join", "Join group", "+ Join", "Request to join", etc.)
 * and Bengali ("যোগ দিন", "গ্রুপে যোগ দিন", "যুক্ত হোন", "যোগ দেওয়ার অনুরোধ", etc.)
 * and aria-labels, buttons, div[role="button"], a[role="button"].
 */
export function isJoinButton(el: HTMLElement): boolean {
  if (!el) return false;
  const tagName = el.tagName.toLowerCase();
  const role = el.getAttribute('role') || '';
  const isInteractive = tagName === 'button' || role === 'button' || tagName === 'a' || el.getAttribute('tabindex') !== null;

  const text = (el.innerText || el.textContent || '').trim().toLowerCase();
  const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
  const childAria = (el.querySelector('[aria-label]')?.getAttribute('aria-label') || '').trim().toLowerCase();
  const combined = `${text} | ${aria} | ${childAria}`.toLowerCase();

  // Exclude buttons that clearly mean already member, requested, or other non-join actions
  if (
    combined.includes('joined') ||
    combined.includes('view group') ||
    combined.includes('edit membership') ||
    combined.includes('যোগ দিয়েছেন') ||
    combined.includes('যুক্ত হয়েছেন') ||
    combined.includes('গ্রুপ দেখুন') ||
    combined.includes('requested') ||
    combined.includes('pending') ||
    combined.includes('cancel request') ||
    combined.includes('অনুরোধ পাঠানো') ||
    combined.includes('অনুরোধ করা হয়েছে') ||
    combined.includes('share') ||
    combined.includes('শেয়ার') ||
    combined.includes('message') ||
    combined.includes('মেসেজ') ||
    combined.includes('close') ||
    combined.includes('menu') ||
    combined.includes('search') ||
    combined.includes('notifications')
  ) {
    return false;
  }

  // Exact or prominent join labels
  if (
    text === 'join' ||
    text === 'join group' ||
    text === '+ join' ||
    text === '+ join group' ||
    text === 'request to join' ||
    text === 'answer questions' ||
    text === 'যোগ দিন' ||
    text === '+ যোগ দিন' ||
    text === 'গ্রুপে যোগ দিন' ||
    text === 'যুক্ত হোন' ||
    text === '+ যুক্ত হোন' ||
    text === 'গ্রুপে যুক্ত হোন' ||
    text === 'যোগ দেওয়ার অনুরোধ' ||
    text === 'যোগ দেয়ার অনুরোধ'
  ) {
    return true;
  }

  if (
    aria === 'join' ||
    aria === 'join group' ||
    aria.includes('join group') ||
    aria.includes('request to join') ||
    aria.includes('যোগ দিন') ||
    aria.includes('যুক্ত হোন') ||
    aria.includes('অনুরোধ')
  ) {
    return true;
  }

  // Broader interactive check
  if (isInteractive && (
    text.startsWith('join ') ||
    text.endsWith(' join') ||
    text.includes('join group') ||
    text.includes('যোগ দিন') ||
    text.includes('যুক্ত হোন') ||
    (text.includes('join') && text.length <= 16)
  )) {
    return true;
  }

  return false;
}

export function isAlreadyJoinedButton(el: HTMLElement): boolean {
  if (!el) return false;
  const text = (el.innerText || el.textContent || '').trim().toLowerCase();
  const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
  const combined = `${text} ${aria}`.toLowerCase();
  return (
    combined.includes('joined') ||
    combined.includes('view group') ||
    combined.includes('edit membership') ||
    combined.includes('যোগ দিয়েছেন') ||
    combined.includes('যুক্ত হয়েছেন') ||
    combined.includes('গ্রুপ দেখুন')
  );
}

export function isRequestedButton(el: HTMLElement): boolean {
  if (!el) return false;
  const text = (el.innerText || el.textContent || '').trim().toLowerCase();
  const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
  const combined = `${text} ${aria}`.toLowerCase();
  return (
    combined.includes('requested') ||
    combined.includes('pending') ||
    combined.includes('cancel request') ||
    combined.includes('অনুরোধ পাঠানো') ||
    combined.includes('অনুরোধ করা হয়েছে')
  );
}

function extractGroupName(anchor: HTMLElement, card: HTMLElement, slugOrId: string): string {
  let name = '';
  const aria = (anchor.getAttribute('aria-label') || '').trim();
  if (aria && aria.length >= 2 && !aria.toLowerCase().includes('view group') && !aria.toLowerCase().includes('গ্রুপ দেখুন')) {
    name = aria;
  } else {
    const heading = card.querySelector('h1, h2, h3, h4, span[dir="auto"], strong');
    name = (heading?.textContent || anchor.textContent || '').trim();
  }
  name = name.split('\n')[0].trim();
  if (!name || name.length < 2) {
    name = slugOrId
      .split(/[-_.]+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return name;
}

function extractPrivacy(card: HTMLElement): 'PUBLIC' | 'PRIVATE' | 'UNKNOWN' {
  const cardText = (card.innerText || card.textContent || '').toLowerCase();
  if (cardText.includes('public') || cardText.includes('পাবলিক')) return 'PUBLIC';
  if (cardText.includes('private') || cardText.includes('প্রাইভেট')) return 'PRIVATE';
  return 'UNKNOWN';
}

function extractMembersText(card: HTMLElement): string {
  const textLines = (card.innerText || '').split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of textLines) {
    const lower = line.toLowerCase();
    if (
      (lower.includes('member') || lower.includes('সদস্য') || lower.includes('post') || lower.includes('পোস্ট')) &&
      (lower.includes('public') || lower.includes('private') || lower.includes('পাবলিক') || lower.includes('প্রাইভেট') || /\d/.test(line))
    ) {
      return line;
    }
  }
  return '';
}

/**
 * Scans the current DOM for Facebook group search result cards.
 * Uses a robust dual-strategy approach:
 * 1. Direct Join Button Search: Finds all join buttons on the screen and maps them to group cards.
 * 2. Group Anchor Search: Walks up from group links to capture cards and status.
 */
export function scanPageForGroupCards(): ScannedCardResult[] {
  if (typeof document === 'undefined') return [];

  const results: ScannedCardResult[] = [];
  const seenGroupIds = new Set<string>();

  // =========================================================================
  // Strategy 1: Find Join Buttons directly anywhere in the search results!
  // =========================================================================
  const allButtonsOnPage = Array.from(document.querySelectorAll<HTMLElement>(
    'div[role="button"], button, a[role="button"], [role="button"], [aria-label*="Join" i], [aria-label*="যোগ" i], [aria-label*="যুক্ত" i]'
  ));

  for (const btn of allButtonsOnPage) {
    if (!isJoinButton(btn)) continue;

    // Walk UP from this join button to find its enclosing card container
    let card: HTMLElement | null = btn.parentElement;
    let targetAnchor: HTMLAnchorElement | null = null;
    let targetCard: HTMLElement | null = null;

    for (let depth = 0; depth < 12 && card && card !== document.body; depth++) {
      const gAnchors = Array.from(card.querySelectorAll<HTMLAnchorElement>('a[href*="/groups/"]')).filter(a => {
        const href = a.href || a.getAttribute('href') || '';
        const m = href.match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);
        return m && !NON_GROUP_SLUGS.has(m[1].toLowerCase());
      });

      if (gAnchors.length > 0) {
        const distinct = new Set(
          gAnchors.map(a => {
            const m = (a.href || a.getAttribute('href') || '').match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);
            return m ? m[1].toLowerCase() : '';
          }).filter(Boolean)
        );

        if (distinct.size === 1) {
          targetAnchor = gAnchors[0];
          targetCard = card;
        } else if (distinct.size > 1) {
          break; // Outer list wrapper reached
        }
      }
      card = card.parentElement;
    }

    if (!targetAnchor) continue;
    const href = targetAnchor.href || targetAnchor.getAttribute('href') || '';
    const match = href.match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);
    if (!match) continue;

    const slugOrId = match[1].toLowerCase();
    if (seenGroupIds.has(slugOrId)) continue;
    seenGroupIds.add(slugOrId);

    const enclosingCard = targetCard || btn.closest('div[role="feed"] > div') || btn.parentElement || btn;
    const name = extractGroupName(targetAnchor, enclosingCard, slugOrId);
    const privacy = extractPrivacy(enclosingCard);
    const membersText = extractMembersText(enclosingCard);

    results.push({
      cardElement: enclosingCard,
      item: {
        id: slugOrId,
        groupId: slugOrId,
        name,
        url: `https://www.facebook.com/groups/${slugOrId}/`,
        privacy,
        membersText: membersText || undefined,
        status: 'READY_TO_JOIN',
      },
      joinButton: btn,
    });
  }

  // =========================================================================
  // Strategy 2: Scan all group anchors on the page
  // =========================================================================
  const groupAnchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/groups/"]'));

  for (const anchor of groupAnchors) {
    const href = anchor.href || anchor.getAttribute('href') || '';
    const match = href.match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);
    if (!match) continue;

    const slugOrId = match[1].toLowerCase();
    if (NON_GROUP_SLUGS.has(slugOrId)) continue;
    if (seenGroupIds.has(slugOrId)) continue;

    let card: HTMLElement | null = anchor.parentElement;
    let foundCard: HTMLElement | null = null;
    let foundJoinButton: HTMLElement | null = null;
    let status: AutoJoinGroupItem['status'] = 'READY_TO_JOIN';

    for (let depth = 0; depth < 12 && card && card !== document.body; depth++) {
      const gAnchors = Array.from(card.querySelectorAll<HTMLAnchorElement>('a[href*="/groups/"]')).filter(a => {
        const h = a.href || a.getAttribute('href') || '';
        const m = h.match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);
        return m && !NON_GROUP_SLUGS.has(m[1].toLowerCase());
      });

      const distinct = new Set(
        gAnchors.map(a => {
          const m = (a.href || a.getAttribute('href') || '').match(/(?:facebook\.com|fb\.com)?\/groups\/([a-zA-Z0-9._-]+)(?:\/|\?|$)/i);
          return m ? m[1].toLowerCase() : '';
        }).filter(Boolean)
      );

      if (distinct.size > 1) {
        break;
      }

      foundCard = card;

      const btns = Array.from(card.querySelectorAll<HTMLElement>(
        'div[role="button"], button, a[role="button"], [role="button"], [aria-label]'
      ));

      for (const btn of btns) {
        if (isAlreadyJoinedButton(btn)) {
          status = 'ALREADY_JOINED';
          foundJoinButton = null;
          break;
        }
        if (isRequestedButton(btn)) {
          status = 'REQUESTED';
          foundJoinButton = null;
          break;
        }
        if (isJoinButton(btn)) {
          status = 'READY_TO_JOIN';
          foundJoinButton = btn;
          break;
        }
      }

      if (foundJoinButton || status !== 'READY_TO_JOIN') {
        break;
      }

      card = card.parentElement;
    }

    if (!foundCard) {
      foundCard = anchor.closest('div[role="feed"] > div') || anchor.closest('div[role="article"]') || anchor.parentElement || anchor;
    }

    // Fallback join button if card is ready to join
    if (status === 'READY_TO_JOIN' && !foundJoinButton && foundCard) {
      const fallbackBtns = Array.from(foundCard.querySelectorAll<HTMLElement>('div[role="button"], button, a[role="button"], [role="button"]'));
      for (const fb of fallbackBtns) {
        if (!isAlreadyJoinedButton(fb) && !isRequestedButton(fb)) {
          const t = (fb.innerText || fb.textContent || fb.getAttribute('aria-label') || '').trim().toLowerCase();
          if (t && !t.includes('more') && !t.includes('menu') && !t.includes('share') && !t.includes('close')) {
            foundJoinButton = fb;
            break;
          }
        }
      }
    }

    seenGroupIds.add(slugOrId);
    const name = extractGroupName(anchor, foundCard, slugOrId);
    const privacy = extractPrivacy(foundCard);
    const membersText = extractMembersText(foundCard);

    results.push({
      cardElement: foundCard,
      item: {
        id: slugOrId,
        groupId: slugOrId,
        name,
        url: `https://www.facebook.com/groups/${slugOrId}/`,
        privacy,
        membersText: membersText || undefined,
        status,
      },
      joinButton: foundJoinButton,
    });
  }

  return results;
}

/**
 * Triggers a realistic user click on an HTMLElement.
 * Works across div[role="button"], button, a[role="button"], and nested spans.
 */
function triggerClick(element: HTMLElement) {
  if (!element) return;
  try {
    element.scrollIntoView({ behavior: 'auto', block: 'center' });
  } catch (_) {}
  element.focus();

  const clickable = element.closest<HTMLElement>('div[role="button"], button, a[role="button"]') || element;
  clickable.focus();

  const opts = { bubbles: true, cancelable: true, view: window };
  clickable.dispatchEvent(new PointerEvent('pointerdown', opts));
  clickable.dispatchEvent(new MouseEvent('mousedown', opts));
  clickable.dispatchEvent(new PointerEvent('pointerup', opts));
  clickable.dispatchEvent(new MouseEvent('mouseup', opts));
  clickable.click();

  if (clickable !== element) {
    try {
      element.dispatchEvent(new MouseEvent('click', opts));
      element.click();
    } catch (_) {}
  }
}

/**
 * Fast helper to answer questions and agree to rules in Facebook's membership modal.
 * Optimized for instant auto-joining without multi-second dead waits.
 */
async function handleMembershipQuestionsModal(defaultAnswer: string): Promise<boolean> {
  // Ultra-fast check: if Facebook opened questions modal/rules dialog
  let dialog = document.querySelector<HTMLElement>('div[role="dialog"]');
  if (!dialog || (dialog.offsetParent === null && dialog.getBoundingClientRect().height <= 50)) {
    // Brief 30ms check in case modal is mounting
    await new Promise(r => setTimeout(r, 30));
    dialog = document.querySelector<HTMLElement>('div[role="dialog"]');
  }

  if (!dialog || (dialog.offsetParent === null && dialog.getBoundingClientRect().height <= 50)) {
    return false;
  }

  console.log('[AGP:AutoJoiner] Membership questions modal detected. Fast auto-answering...');

  // 1. Agree to rules (checkboxes)
  const checkboxes = Array.from(dialog.querySelectorAll<HTMLElement>('input[type="checkbox"], div[role="checkbox"]'));
  for (const cb of checkboxes) {
    const isChecked = cb instanceof HTMLInputElement ? cb.checked : cb.getAttribute('aria-checked') === 'true';
    if (!isChecked) {
      triggerClick(cb);
    }
  }

  // 2. Select radio button options if required
  const radios = Array.from(dialog.querySelectorAll<HTMLElement>('input[type="radio"], div[role="radio"]'));
  if (radios.length > 0) {
    const isSelected = radios.some(r => r instanceof HTMLInputElement ? r.checked : r.getAttribute('aria-checked') === 'true');
    if (!isSelected) {
      triggerClick(radios[0]);
    }
  }

  // 3. Fill textareas and text inputs
  const textInputs = Array.from(dialog.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>('textarea, input[type="text"]'));
  for (const inp of textInputs) {
    if (!inp.value || inp.value.trim() === '') {
      inp.focus();
      inp.value = defaultAnswer || 'Yes, I agree to the group rules and guidelines.';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // 4. Click Submit / Next / Confirm
  const buttons = Array.from(dialog.querySelectorAll<HTMLElement>('button, div[role="button"]'));
  for (const btn of buttons) {
    const t = (btn.innerText || btn.textContent || btn.getAttribute('aria-label') || '').trim().toLowerCase();
    if (
      t === 'submit' ||
      t === 'জমা দিন' ||
      t === 'send' ||
      t === 'confirm' ||
      t === 'next' ||
      t === 'পরবর্তী' ||
      t === 'done' ||
      t === 'অনুরোধ পাঠান' ||
      t.includes('submit') ||
      t.includes('জমা')
    ) {
      triggerClick(btn);
      await new Promise(r => setTimeout(r, 60));
      break;
    }
  }

  // Check if modal still open and has a final submit button
  const remainingDialog = document.querySelector<HTMLElement>('div[role="dialog"]');
  if (remainingDialog) {
    const finalBtns = Array.from(remainingDialog.querySelectorAll<HTMLElement>('button, div[role="button"]'));
    for (const fb of finalBtns) {
      const ft = (fb.innerText || fb.textContent || fb.getAttribute('aria-label') || '').trim().toLowerCase();
      if (ft === 'submit' || ft === 'জমা দিন' || ft === 'done' || ft.includes('submit')) {
        triggerClick(fb);
        await new Promise(r => setTimeout(r, 60));
        break;
      }
    }
  }

  return true;
}

export type AutoJoinProgressCallback = (state: AutoJoinState) => void;

/**
 * Singleton AutoJoiner Controller for running inside Facebook Content Script.
 */
export class AutoJoinerController {
  private static instance: AutoJoinerController;
  private state: AutoJoinState = { ...INITIAL_AUTO_JOIN_STATE };
  private config: AutoJoinConfig = {
    searchUrl: '',
    delaySec: 0,
    maxGroups: 0,
    autoAnswerQuestions: true,
    defaultAnswer: 'Yes, I agree to the group rules and guidelines.',
    saveToGroups: true,
  };
  private isRunning = false;
  private isPaused = false;
  private shouldStop = false;
  private onProgressCallbacks: AutoJoinProgressCallback[] = [];

  private constructor() {}

  public static getInstance(): AutoJoinerController {
    if (!AutoJoinerController.instance) {
      AutoJoinerController.instance = new AutoJoinerController();
    }
    return AutoJoinerController.instance;
  }

  public subscribe(cb: AutoJoinProgressCallback) {
    this.onProgressCallbacks.push(cb);
  }

  public getState(): AutoJoinState {
    return { ...this.state };
  }

  private broadcastState() {
    for (const cb of this.onProgressCallbacks) {
      try {
        cb(this.state);
      } catch (_) {}
    }
    // Also notify chrome extension background / popup
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'AUTO_JOIN_PROGRESS',
          payload: this.state,
        });
      }
    } catch (_) {}
  }

  public pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.state.status = 'PAUSED';
      this.state.message = 'Auto-Join paused by user.';
      this.broadcastState();
    }
  }

  public resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.state.status = 'JOINING';
      this.state.message = 'Resuming group auto-joining...';
      this.broadcastState();
    }
  }

  public stop() {
    this.shouldStop = true;
    this.isRunning = false;
    this.isPaused = false;
    this.state.status = 'STOPPED';
    this.state.message = 'Auto-Join stopped by user.';
    this.broadcastState();
  }

  /**
   * Main execution loop: Scans cards, joins groups, scrolls for more, and manages delays.
   */
  public async start(config: AutoJoinConfig): Promise<AutoJoinState> {
    if (this.isRunning) {
      console.warn('[AGP:AutoJoiner] Already running.');
      return this.state;
    }

    this.config = {
      ...this.config,
      ...config,
      delaySec: typeof config.delaySec === 'number' ? config.delaySec : 0,
    };
    this.isRunning = true;
    this.isPaused = false;
    this.shouldStop = false;

    const query = extractSearchQuery(window.location.href);
    this.state = {
      ...INITIAL_AUTO_JOIN_STATE,
      status: 'SEARCHING',
      searchUrl: window.location.href,
      query,
      message: `Scanning Facebook group search results for "${query}"...`,
      startedAt: Date.now(),
    };
    this.broadcastState();

    try {
      let consecutiveStagnantScrolls = 0;
      const joinedOrRequestedGroupIds = new Set<string>();

      while (!this.shouldStop) {
        // Check pause state
        while (this.isPaused && !this.shouldStop) {
          await new Promise(r => setTimeout(r, 500));
        }
        if (this.shouldStop) break;

        // 1. Scan current cards on page
        const scanned = scanPageForGroupCards();

        // Update total discovered
        this.state.groups = scanned.map(s => s.item);
        this.state.totalFound = scanned.length;
        this.state.alreadyJoinedCount = scanned.filter(s => s.item.status === 'ALREADY_JOINED').length;
        this.state.requestedCount = scanned.filter(s => s.item.status === 'REQUESTED').length;
        this.state.joinedCount = scanned.filter(s => s.item.status === 'JOINED').length;

        // Auto-save any already-joined groups on this search page so they are ready for posting
        if (this.config.saveToGroups) {
          for (const s of scanned) {
            if (s.item.status === 'ALREADY_JOINED' && !joinedOrRequestedGroupIds.has(s.item.groupId)) {
              joinedOrRequestedGroupIds.add(s.item.groupId);
              await this.saveGroupToDatabase(s.item);
            }
          }
        }

        // Find the next card that is READY_TO_JOIN and hasn't been processed yet
        const nextTarget = scanned.find(
          s => s.item.status === 'READY_TO_JOIN' && !joinedOrRequestedGroupIds.has(s.item.groupId)
        );

        if (nextTarget) {
          consecutiveStagnantScrolls = 0;
          const { cardElement, item } = nextTarget;
          let joinBtn = nextTarget.joinButton;

          // If join button was not directly found, check cardElement for any button
          if (!joinBtn && cardElement) {
            const btns = Array.from(cardElement.querySelectorAll<HTMLElement>(
              'div[role="button"], button, a[role="button"], [role="button"]'
            ));
            for (const b of btns) {
              if (isJoinButton(b)) {
                joinBtn = b;
                break;
              }
            }
            if (!joinBtn) {
              for (const b of btns) {
                if (!isAlreadyJoinedButton(b) && !isRequestedButton(b)) {
                  const t = (b.innerText || b.textContent || b.getAttribute('aria-label') || '').toLowerCase();
                  if (!t.includes('more') && !t.includes('menu') && !t.includes('share') && !t.includes('close')) {
                    joinBtn = b;
                    break;
                  }
                }
              }
            }
          }

          // Mark this group as processed in this session so we NEVER loop indefinitely on it
          joinedOrRequestedGroupIds.add(item.groupId);

          // Check if max limit reached
          if (this.config.maxGroups > 0 && this.state.joinedCount + this.state.requestedCount >= this.config.maxGroups) {
            this.state.message = `Reached target limit of ${this.config.maxGroups} groups.`;
            break;
          }

          if (joinBtn) {
            // Update current state
            this.state.status = 'JOINING';
            this.state.currentGroupName = item.name;
            item.status = 'JOINING';
            this.state.message = `Joining: "${item.name}"...`;
            this.broadcastState();

            // Scroll card into view & highlight vividly
            try {
              cardElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
              cardElement.style.outline = '3px solid #10b981';
              cardElement.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.45)';
              cardElement.style.borderRadius = '8px';
            } catch (_) {}

            // Click join button
            try {
              console.log(`[AGP:AutoJoiner] Triggering instant click on Join button for: "${item.name}"`);
              triggerClick(joinBtn);

              // Check if questions modal appeared (ultra-fast check)
              if (this.config.autoAnswerQuestions) {
                await handleMembershipQuestionsModal(this.config.defaultAnswer);
              }

              item.status = 'JOINED';
              item.joinedAt = Date.now();
              this.state.joinedCount++;

              // Auto-save group to extension storage if configured
              if (this.config.saveToGroups) {
                await this.saveGroupToDatabase(item);
              }

              this.state.message = `Joined "${item.name}" (${item.status})`;
              this.broadcastState();
            } catch (joinErr: any) {
              console.error('[AGP:AutoJoiner] Join error on', item.name, joinErr);
              item.status = 'FAILED';
              item.error = String(joinErr);
              this.state.failedCount++;
              this.broadcastState();
            } finally {
              try {
                // Leave subtle green border on joined card so user clearly sees it
                cardElement.style.outline = '2px solid rgba(16, 185, 129, 0.35)';
                cardElement.style.boxShadow = 'none';
              } catch (_) {}
            }

            // Zero Wait / Instant mode: immediately proceed to the next group!
            const targetDelay = typeof this.config.delaySec === 'number' ? this.config.delaySec : 0;
            if (targetDelay <= 0) {
              // Zero Wait: tiny 30ms yield to allow browser event loop to process DOM events
              this.state.countdownSec = 0;
              await new Promise(r => setTimeout(r, 30));
            } else {
              for (let sec = targetDelay; sec > 0 && !this.shouldStop; sec--) {
                while (this.isPaused && !this.shouldStop) {
                  await new Promise(r => setTimeout(r, 200));
                }
                if (this.shouldStop) break;

                this.state.countdownSec = sec;
                this.state.message = `Waiting ${sec}s before next group...`;
                this.broadcastState();
                await new Promise(r => setTimeout(r, 1000));
              }
              this.state.countdownSec = 0;
            }
          }
        } else {
          // No more eligible visible cards; scroll down fast to load more!
          this.state.message = 'Loading more Facebook groups on this page...';
          this.broadcastState();

          const prevHeight = document.body.scrollHeight;
          window.scrollBy({ top: 1800, behavior: 'auto' });
          window.dispatchEvent(new Event('scroll', { bubbles: true }));
          await new Promise(r => setTimeout(r, 400));

          const newScanned = scanPageForGroupCards();
          const hasNewEligible = newScanned.some(
            s => s.item.status === 'READY_TO_JOIN' && !joinedOrRequestedGroupIds.has(s.item.groupId)
          );

          if (!hasNewEligible && document.body.scrollHeight === prevHeight) {
            consecutiveStagnantScrolls++;
            if (consecutiveStagnantScrolls >= 3) {
              // Reached end of search results
              break;
            }
          } else {
            consecutiveStagnantScrolls = 0;
          }
        }
      }

      // Finish up
      if (!this.shouldStop) {
        this.state.status = 'COMPLETED';
        this.state.message = `Auto-join complete! Joined ${this.state.joinedCount} groups, requested ${this.state.requestedCount} groups.`;
      }
    } catch (err: any) {
      console.error('[AGP:AutoJoiner] Execution error:', err);
      this.state.status = 'ERROR';
      this.state.message = `Error: ${err?.message || String(err)}`;
    } finally {
      this.isRunning = false;
      this.isPaused = false;
      this.state.finishedAt = Date.now();
      this.broadcastState();
    }

    return this.state;
  }

  /**
   * Saves newly joined or already-joined group into Extension's persistent Group database.
   */
  private async saveGroupToDatabase(item: AutoJoinGroupItem) {
    try {
      const existing = await getGroups();
      const isAlreadySaved = existing.some(
        g => (g.groupId && g.groupId.toLowerCase() === item.groupId.toLowerCase()) || 
             (g.url && g.url.toLowerCase().includes(item.groupId.toLowerCase()))
      );

      if (!isAlreadySaved) {
        const newGroup: Group = {
          id: generateId(),
          name: item.name,
          url: item.url,
          groupId: item.groupId,
          privacy: item.privacy,
          category: this.config.selectedCategory || 'Auto Joined',
          enabled: true,
          selected: false,
          status: 'READY',
          postCount: 0,
          verified: true,
          source: 'facebook-ui',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await setGroups([...existing, newGroup]);
        console.log(`[AGP:AutoJoiner] Saved "${item.name}" (${item.groupId}) to My Facebook Groups database.`);

        // Notify background service worker & all open UI tabs
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage({
              type: 'AUTO_JOIN_SAVE_GROUPS',
              payload: { group: newGroup },
            });
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn('[AGP:AutoJoiner] Save to database error:', err);
    }
  }
}
