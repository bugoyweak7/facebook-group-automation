import { describe, it, expect, beforeEach } from 'vitest';
import {
  bengaliToAsciiDigits,
  parseJoinedGroupsTargetCount,
  verifyGroupCandidate,
  detectEndOfListIndicator,
  extractCanonicalGroupIdentity,
} from '../src/services/facebook/selectors/selector-adapter';
import {
  performProgressiveGroupScan,
  checkFacebookLoginStatus,
  detectFacebookUserProfile,
  cleanGroupName,
  extractGroupsFromHtml,
} from '../src/services/facebook/detectors/group-discovery';
import {
  mergeDiscoveredGroups,
} from '../src/services/facebook/discovery-manager';
import {
  getGroups,
  setGroups,
  getAccountGroups,
  saveAccountGroups,
  clearAllGroups,
  getFacebookAccount,
  setFacebookAccount,
} from '../src/services/storage/chrome-storage';
import { Group, DiscoveredGroupCandidate } from '../src/types/group';

// Minimal DOM node structure for Node.js test environment
interface SimpleNode {
  tagName: string;
  attributes: Record<string, string>;
  textContent: string;
  innerHTML: string;
  innerText: string;
  children: SimpleNode[];
  parentElement: SimpleNode | null;
  href?: string;
  getAttribute: (name: string) => string | null;
  setAttribute: (name: string, value: string) => void;
  querySelector: (selector: string) => SimpleNode | null;
  querySelectorAll: (selector: string) => SimpleNode[];
  closest: (selector: string) => SimpleNode | null;
  scrollIntoView?: (options?: any) => void;
  dispatchEvent?: (evt: any) => boolean;
}

function createNode(tagName: string, text = '', attrs: Record<string, string> = {}): SimpleNode {
  const node: SimpleNode = {
    tagName: tagName.toUpperCase(),
    attributes: { ...attrs },
    textContent: text,
    innerText: text,
    innerHTML: text,
    children: [],
    parentElement: null,
    href: attrs['href'],
    getAttribute(name: string) {
      if (name === 'href') return this.href || this.attributes['href'] || null;
      return this.attributes[name] || null;
    },
    setAttribute(name: string, value: string) {
      this.attributes[name] = value;
      if (name === 'href') this.href = value;
    },
    querySelector(selector: string) {
      return this.querySelectorAll(selector)[0] || null;
    },
    querySelectorAll(selector: string) {
      const results: SimpleNode[] = [];
      const sel = selector.toLowerCase();

      for (const child of this.children) {
        let match = false;
        const childHref = child.href || child.getAttribute('href') || '';
        if (sel.includes('a[href*="/groups/"]') && child.tagName === 'A' && childHref.includes('/groups/')) match = true;
        else if (sel.includes('h1') && child.tagName === 'H1') match = true;
        else if (sel.includes('h2') && child.tagName === 'H2') match = true;
        else if (sel.includes('h3') && child.tagName === 'H3') match = true;
        else if (sel.includes('span') && child.tagName === 'SPAN') match = true;
        else if (sel.includes('img') && (child.tagName === 'IMG' || child.tagName === 'IMAGE')) match = true;
        else if (sel.includes('button') && (child.tagName === 'BUTTON' || child.getAttribute('role') === 'button')) match = true;
        else if (sel.includes('role="listitem"') && child.getAttribute('role') === 'listitem') match = true;
        else if (sel.includes('role="status"') && child.getAttribute('role') === 'status') match = true;
        else if (sel.includes('role="navigation"') && child.getAttribute('role') === 'navigation') match = true;
        else if (sel.includes('data-pagelet') && child.getAttribute('data-pagelet')) match = true;

        if (match) results.push(child);
        results.push(...child.querySelectorAll(selector));
      }
      return results;
    },
    closest(selector: string) {
      const sel = selector.toLowerCase();
      let curr: SimpleNode | null = this;
      while (curr) {
        if (sel.includes('role="listitem"') && curr.getAttribute('role') === 'listitem') return curr;
        if (sel.includes('role="status"') && curr.getAttribute('role') === 'status') return curr;
        if (sel.includes('role="navigation"') && curr.getAttribute('role') === 'navigation') return curr;
        if (sel.includes('data-pagelet') && curr.getAttribute('data-pagelet')) return curr;
        if (sel.includes('notification') && (curr.getAttribute('aria-label') || '').toLowerCase().includes('notification')) return curr;
        if (sel.includes('role="feed"') && curr.getAttribute('role') === 'feed') return curr;
        curr = curr.parentElement;
      }
      return null;
    },
    scrollIntoView() {},
    dispatchEvent() { return true; },
  };
  return node;
}

function setupMockDocument() {
  const root = createNode('BODY');
  const doc = {
    body: root,
    documentElement: root,
    scrollingElement: root,
    cookie: 'c_user=1000987654321',
    createElement(tagName: string) {
      return createNode(tagName);
    },
    querySelector(selector: string) {
      return root.querySelector(selector);
    },
    querySelectorAll(selector: string) {
      return root.querySelectorAll(selector);
    },
  };

  const win = {
    location: { href: 'https://www.facebook.com/groups/joins/' },
    scrollTo() {},
    scrollBy() {},
    dispatchEvent() { return true; },
    getComputedStyle() { return { overflowY: 'visible' }; },
  };

  (globalThis as any).document = doc;
  (globalThis as any).window = win;
  return { doc, root };
}

describe('Facebook Joined Groups Sync System — 13 Mandatory Test Cases', () => {
  let mockDoc: ReturnType<typeof setupMockDocument>;

  beforeEach(async () => {
    mockDoc = setupMockDocument();
    await clearAllGroups();
  });

  // Test 1: Session detection without passwords or tokens
  describe('Test 1 — Session Detection Without Passwords or Tokens', () => {
    it('detects authenticated Facebook session via visible DOM indicators and cookies without passwords/tokens', () => {
      const nav = createNode('DIV', '', { role: 'navigation', 'aria-label': 'Facebook' });
      const anchor = createNode('A', '', { href: 'https://www.facebook.com/me/' });
      const span = createNode('SPAN', 'Md Nahid');
      anchor.children.push(span);
      span.parentElement = anchor;
      nav.children.push(anchor);
      anchor.parentElement = nav;

      const rail = createNode('DIV', "What's on your mind, Md Nahid?", { 'data-pagelet': 'LeftRail' });
      mockDoc.root.children.push(nav, rail);
      nav.parentElement = mockDoc.root;
      rail.parentElement = mockDoc.root;

      const isLoggedIn = checkFacebookLoginStatus();
      const profile = detectFacebookUserProfile();

      expect(isLoggedIn).toBe(true);
      expect(profile.name).toBe('Md Nahid');
      expect(profile.isLoggedIn).toBe(true);
      expect((profile as any).password).toBeUndefined();
      expect((profile as any).token).toBeUndefined();
      expect((profile as any).accessToken).toBeUndefined();
    });
  });

  // Test 2: Confident target count extraction (English & Bengali numerals)
  describe('Test 2 — Confident Target Count Extraction (English & Bengali)', () => {
    it('correctly parses English numerals (194, 1,234) with CONFIRMED status', () => {
      const h1 = createNode('H1', "All groups you've joined (194)");
      mockDoc.root.children = [h1];
      h1.parentElement = mockDoc.root;

      const result = parseJoinedGroupsTargetCount();
      expect(result.status).toBe('CONFIRMED');
      expect(result.count).toBe(194);
    });

    it('correctly parses Bengali numerals (১৯৪, ১,২৩৪) with CONFIRMED status', () => {
      const h2 = createNode('H2', 'যোগ দেওয়া সমস্ত গ্রুপ (১৯৪)');
      mockDoc.root.children = [h2];
      h2.parentElement = mockDoc.root;

      const result = parseJoinedGroupsTargetCount();
      expect(result.status).toBe('CONFIRMED');
      expect(result.count).toBe(194);

      const h2b = createNode('H2', 'সব গ্রুপ (১,২৩৪)');
      mockDoc.root.children = [h2b];
      h2b.parentElement = mockDoc.root;

      const result2 = parseJoinedGroupsTargetCount();
      expect(result2.status).toBe('CONFIRMED');
      expect(result2.count).toBe(1234);
    });

    it('converts Bengali digits to ASCII correctly', () => {
      expect(bengaliToAsciiDigits('১৯৪')).toBe('194');
      expect(bengaliToAsciiDigits('১,২৩৪')).toBe('1,234');
      expect(bengaliToAsciiDigits('০১২৩৪৫৬৭৮৯')).toBe('0123456789');
    });
  });

  // Test 3: Reject uncertain target counts
  describe('Test 3 — Reject Uncertain Target Counts', () => {
    it('rejects member counts, post counts, notification badges, and arbitrary numbers', () => {
      const notif = createNode('DIV', '15', { 'aria-label': 'Notifications' });
      const members = createNode('DIV', '50K members');
      const posts = createNode('DIV', '12 posts today');
      mockDoc.root.children = [notif, members, posts];

      const result = parseJoinedGroupsTargetCount();
      expect(result.status).toBe('UNAVAILABLE');
      expect(result.count).toBeNull();
    });
  });

  // Test 4: 8-step candidate verification pipeline
  describe('Test 4 — 8-Step Candidate Verification Pipeline', () => {
    it('rejects Pages, profiles, ads, recommendations, unjoined groups, and permalinks', () => {
      // Unjoined card with Join button
      const card = createNode('DIV', '', { role: 'listitem' });
      const unjoinedAnchor = createNode('A', 'Suggested Group', { href: 'https://www.facebook.com/groups/suggested.group/' });
      const joinBtn = createNode('BUTTON', 'Join', { 'aria-label': 'Join group' });
      card.children.push(unjoinedAnchor, joinBtn);
      unjoinedAnchor.parentElement = card;
      joinBtn.parentElement = card;

      expect(verifyGroupCandidate(unjoinedAnchor as any).valid).toBe(false);

      // Notification / Permalink
      const permalinkAnchor = createNode('A', 'User commented on a post', { href: 'https://www.facebook.com/groups/mygroup/permalink/123456789/' });
      expect(verifyGroupCandidate(permalinkAnchor as any).valid).toBe(false);

      // System slug
      const systemAnchor = createNode('A', 'Your Feed', { href: 'https://www.facebook.com/groups/feed/' });
      expect(verifyGroupCandidate(systemAnchor as any).valid).toBe(false);
    });

    it('accepts legitimate joined group cards', () => {
      const card = createNode('DIV', '', { role: 'listitem' });
      const img = createNode('IMG', '', { src: 'https://fbcdn.net/group-cover.jpg' });
      const anchor = createNode('A', '', { href: 'https://www.facebook.com/groups/dhaka.tech.marketplace/' });
      const h2 = createNode('H2', 'Dhaka Tech & Gadget Marketplace');
      const span = createNode('SPAN', 'Public group');
      anchor.children.push(h2);
      h2.parentElement = anchor;
      card.children.push(img, anchor, span);
      img.parentElement = card;
      anchor.parentElement = card;
      span.parentElement = card;

      const result = verifyGroupCandidate(anchor as any);
      expect(result.valid).toBe(true);
      expect(result.name).toBe('Dhaka Tech & Gadget Marketplace');
      expect(result.groupId).toBe('dhaka.tech.marketplace');
      expect(result.privacy).toBe('PUBLIC');
    });
  });

  // Test 5: Canonical identity extraction (slug vs ID vs URL, no fake IDs)
  describe('Test 5 — Canonical Group Identity Extraction (No Fake IDs)', () => {
    it('extracts numeric ID when available', () => {
      const identity = extractCanonicalGroupIdentity('https://www.facebook.com/groups/123456789012345/?ref=share');
      expect(identity.groupId).toBe('123456789012345');
      expect(identity.canonicalUrl).toBe('https://www.facebook.com/groups/123456789012345/');
    });

    it('extracts slug when canonical slug is provided', () => {
      const identity = extractCanonicalGroupIdentity('https://www.facebook.com/groups/example-community-bangladesh/?mibextid=6aamW6');
      expect(identity.groupId).toBe('example-community-bangladesh');
      expect(identity.canonicalUrl).toBe('https://www.facebook.com/groups/example-community-bangladesh/');
    });

    it('never invents fake IDs or uses Math.random', () => {
      const identity = extractCanonicalGroupIdentity('https://www.facebook.com/groups/valid.slug.only/');
      expect(identity.groupId).not.toMatch(/^fake/i);
      expect(identity.groupId).not.toMatch(/^mock/i);
      expect(identity.groupId).toBe('valid.slug.only');
    });
  });

  // Test 6: 3-tier canonical deduplication
  describe('Test 6 — 3-Tier Canonical Deduplication', () => {
    it('deduplicates across ID, Slug, URL variations, and normalized names', async () => {
      const batch: DiscoveredGroupCandidate[] = [
        {
          name: 'Dhaka Bike Riders',
          url: 'https://www.facebook.com/groups/dhaka.bikers/?ref=share',
          groupId: 'dhaka.bikers',
          privacy: 'PUBLIC',
        },
        {
          name: 'Dhaka Bike Riders · Public group',
          url: 'https://www.facebook.com/groups/dhaka.bikers/',
          groupId: 'dhaka.bikers',
          privacy: 'PUBLIC',
        },
        {
          name: 'Dhaka Bike Riders',
          url: 'https://web.facebook.com/groups/dhaka.bikers?mibextid=123',
          groupId: 'dhaka.bikers',
          privacy: 'PUBLIC',
        },
      ];

      const result = await mergeDiscoveredGroups(batch as any, { syncMode: 'merge' });
      expect(result.imported).toBe(1);
      expect(result.duplicates).toBe(2);

      const stored = await getGroups();
      expect(stored.length).toBe(1);
      expect(stored[0].name).toBe('Dhaka Bike Riders');
    });
  });

  // Test 7: Account isolation in storage
  describe('Test 7 — Account Isolation in Storage', () => {
    it('keeps Account A groups strictly isolated from Account B groups', async () => {
      const accountAGroups: Group[] = [
        {
          id: 'grp_a_1',
          name: 'Account A Group 1',
          url: 'https://www.facebook.com/groups/acc.a.1/',
          groupId: 'acc.a.1',
          enabled: true,
          status: 'READY',
          postCount: 0,
          createdAt: 1000,
          updatedAt: 1000,
        },
      ];

      const accountBGroups: Group[] = [
        {
          id: 'grp_b_1',
          name: 'Account B Group 1',
          url: 'https://www.facebook.com/groups/acc.b.1/',
          groupId: 'acc.b.1',
          enabled: true,
          status: 'READY',
          postCount: 0,
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];

      await saveAccountGroups('user_1001', accountAGroups);
      await saveAccountGroups('user_2002', accountBGroups);

      const storedA = await getAccountGroups('user_1001');
      const storedB = await getAccountGroups('user_2002');

      expect(storedA.length).toBe(1);
      expect(storedA[0].name).toBe('Account A Group 1');

      expect(storedB.length).toBe(1);
      expect(storedB[0].name).toBe('Account B Group 1');

      expect(storedA.some(g => g.groupId === 'acc.b.1')).toBe(false);
      expect(storedB.some(g => g.groupId === 'acc.a.1')).toBe(false);
    });
  });

  // Test 8: Controlled progressive scroll and lazy-load observation
  describe('Test 8 — Controlled Progressive Scroll & Lazy Load Observation', () => {
    it('progressively scans new DOM nodes as scroll expands content', async () => {
      const card = createNode('DIV', '', { role: 'listitem' });
      const a = createNode('A', 'Round 1 Group', { href: 'https://www.facebook.com/groups/round1.group/' });
      card.children.push(a);
      a.parentElement = card;
      mockDoc.root.children.push(card);
      card.parentElement = mockDoc.root;

      let batchesReported = 0;
      const scanPromise = performProgressiveGroupScan({
        maxRounds: 3,
        stagnantLimit: 2,
        scrollDelayMs: 20,
        onBatchDiscovered: () => {
          batchesReported++;
        },
      });

      const result = await scanPromise;
      expect(result.groups.length).toBeGreaterThanOrEqual(1);
      expect(batchesReported).toBeGreaterThanOrEqual(1);
    });
  });

  // Test 9: Stagnant but incomplete
  describe('Test 9 — Stagnant But Incomplete Scan (Must be PARTIAL, not COMPLETE)', () => {
    it('marks outcome as PARTIAL with STAGNANT_TIMEOUT when target count is 194 but verified is 1 and DOM stops changing', async () => {
      const h1 = createNode('H1', "All groups you've joined (194)");
      const card = createNode('DIV', '', { role: 'listitem' });
      const a = createNode('A', 'Test Group 1', { href: 'https://www.facebook.com/groups/test.group.1/' });
      card.children.push(a);
      a.parentElement = card;
      mockDoc.root.children.push(h1, card);
      h1.parentElement = mockDoc.root;
      card.parentElement = mockDoc.root;

      const result = await performProgressiveGroupScan({
        maxRounds: 2,
        stagnantLimit: 1,
        scrollDelayMs: 20,
      });

      expect(result.outcome).toBe('PARTIAL');
      expect(result.completionReason).toBe('STAGNANT_TIMEOUT');
      expect(result.isPartial).toBe(true);
      expect(result.targetCount).toBe(194);
      expect(result.debugMetrics.targetCountStatus).toBe('CONFIRMED');
    });
  });

  // Test 10: Target count reached
  describe('Test 10 — Target Count Reached (Must be COMPLETE with TARGET_REACHED)', () => {
    it('marks outcome as COMPLETE with TARGET_REACHED when verified count reaches CONFIRMED target count', async () => {
      const h1 = createNode('H1', "All groups you've joined (2)");
      const card1 = createNode('DIV', '', { role: 'listitem' });
      const a1 = createNode('A', 'Group One', { href: 'https://www.facebook.com/groups/group.one/' });
      card1.children.push(a1);
      a1.parentElement = card1;

      const card2 = createNode('DIV', '', { role: 'listitem' });
      const a2 = createNode('A', 'Group Two', { href: 'https://www.facebook.com/groups/group.two/' });
      card2.children.push(a2);
      a2.parentElement = card2;

      mockDoc.root.children.push(h1, card1, card2);
      h1.parentElement = mockDoc.root;
      card1.parentElement = mockDoc.root;
      card2.parentElement = mockDoc.root;

      const result = await performProgressiveGroupScan({
        maxRounds: 5,
        stagnantLimit: 3,
        scrollDelayMs: 20,
      });

      expect(result.outcome).toBe('COMPLETE');
      expect(result.completionReason).toBe('TARGET_REACHED');
      expect(result.isPartial).toBe(false);
      expect(result.totalFound).toBe(2);
      expect(result.targetCount).toBe(2);
    });
  });

  // Test 11: No reliable target count
  describe('Test 11 — No Reliable Target Count (Must be PARTIAL unless explicit list end)', () => {
    it('marks outcome as PARTIAL when target count is unavailable and scanner stops', async () => {
      const card = createNode('DIV', '', { role: 'listitem' });
      const a = createNode('A', 'Group Alpha', { href: 'https://www.facebook.com/groups/group.alpha/' });
      card.children.push(a);
      a.parentElement = card;
      mockDoc.root.children.push(card);
      card.parentElement = mockDoc.root;

      const result = await performProgressiveGroupScan({
        maxRounds: 2,
        stagnantLimit: 1,
        scrollDelayMs: 20,
      });

      expect(result.outcome).toBe('PARTIAL');
      expect(result.isPartial).toBe(true);
      expect(result.targetCount).toBeNull();
      expect(result.debugMetrics.targetCountStatus).toBe('UNAVAILABLE');
    });

    it('marks outcome as COMPLETE with LIST_END if explicit end-of-list sentinel is present', async () => {
      const card = createNode('DIV', '', { role: 'listitem' });
      const a = createNode('A', 'Group Beta', { href: 'https://www.facebook.com/groups/group.beta/' });
      card.children.push(a);
      a.parentElement = card;

      const sentinel = createNode('DIV', 'End of results', { role: 'status' });
      mockDoc.root.children.push(card, sentinel);
      card.parentElement = mockDoc.root;
      sentinel.parentElement = mockDoc.root;

      expect(detectEndOfListIndicator()).toBe(true);

      const result = await performProgressiveGroupScan({
        maxRounds: 2,
        stagnantLimit: 1,
        scrollDelayMs: 20,
      });

      expect(result.outcome).toBe('COMPLETE');
      expect(result.completionReason).toBe('LIST_END');
      expect(result.isPartial).toBe(false);
    });
  });

  // Test 12: Duplicate group through multiple DOM paths
  describe('Test 12 — Duplicate Group Through Multiple DOM Paths', () => {
    it('results in 1 verified group with 1 canonical identity', async () => {
      const card1 = createNode('DIV', '', { role: 'listitem' });
      const a1 = createNode('A', 'Unique Group Name', { href: 'https://www.facebook.com/groups/1122334455/' });
      card1.children.push(a1);
      a1.parentElement = card1;

      const rail = createNode('DIV', '', { 'data-pagelet': 'LeftRail' });
      const a2 = createNode('A', 'Unique Group Name · 12K members', { href: 'https://www.facebook.com/groups/1122334455/?ref=bookmarks' });
      rail.children.push(a2);
      a2.parentElement = rail;

      mockDoc.root.children.push(card1, rail);
      card1.parentElement = mockDoc.root;
      rail.parentElement = mockDoc.root;

      const result = await performProgressiveGroupScan({
        maxRounds: 1,
        stagnantLimit: 1,
        scrollDelayMs: 20,
      });

      expect(result.groups.length).toBe(1);
      expect(result.groups[0].groupId).toBe('1122334455');
      expect(result.groups[0].name).toBe('Unique Group Name');
    });
  });

  // Test 13: Account switch
  describe('Test 13 — Account Switch Context Isolation', () => {
    it('ensures Account A groups disappear and are never mixed with Account B', async () => {
      // Account A scan
      const accountAGroups: Group[] = [
        {
          id: 'grp_a_1',
          name: 'Group A1',
          url: 'https://www.facebook.com/groups/a1/',
          groupId: 'a1',
          enabled: true,
          status: 'READY',
          postCount: 0,
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: 'grp_a_2',
          name: 'Group A2',
          url: 'https://www.facebook.com/groups/a2/',
          groupId: 'a2',
          enabled: true,
          status: 'READY',
          postCount: 0,
          createdAt: 1000,
          updatedAt: 1000,
        },
      ];
      await saveAccountGroups('user_account_a', accountAGroups);
      await setFacebookAccount({
        isLoggedIn: true,
        name: 'Account A User',
        userId: 'user_account_a',
        profileUrl: 'https://facebook.com/a',
        totalGroupsCount: 2,
        lastSyncedAt: Date.now(),
      });

      // Switch to Account B
      const accountBGroups: Group[] = [
        {
          id: 'grp_b_x',
          name: 'Group BX',
          url: 'https://www.facebook.com/groups/bx/',
          groupId: 'bx',
          enabled: true,
          status: 'READY',
          postCount: 0,
          createdAt: 2000,
          updatedAt: 2000,
        },
        {
          id: 'grp_b_y',
          name: 'Group BY',
          url: 'https://www.facebook.com/groups/by/',
          groupId: 'by',
          enabled: true,
          status: 'READY',
          postCount: 0,
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];
      await saveAccountGroups('user_account_b', accountBGroups);
      await setFacebookAccount({
        isLoggedIn: true,
        name: 'Account B User',
        userId: 'user_account_b',
        profileUrl: 'https://facebook.com/b',
        totalGroupsCount: 2,
        lastSyncedAt: Date.now(),
      });

      // Load active groups for Account B
      const activeGroups = await getAccountGroups('user_account_b');
      expect(activeGroups.length).toBe(2);
      expect(activeGroups.map(g => g.groupId)).toEqual(['bx', 'by']);

      // Account A's groups are completely isolated
      const previousAccountGroups = await getAccountGroups('user_account_a');
      expect(previousAccountGroups.length).toBe(2);
      expect(previousAccountGroups.map(g => g.groupId)).toEqual(['a1', 'a2']);

      // Never mixed
      expect(activeGroups.some(g => g.groupId.startsWith('a'))).toBe(false);
    });
  });
});
