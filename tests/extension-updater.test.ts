import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatRelativeTime,
  getCurrentCommitSha,
  setCurrentCommitSha,
  recordReloadTime,
  checkJustReloaded,
  fetchLatestGithubCommit,
  pingLocalCompanion,
  requestCompanionUpdate,
  reloadChromeExtension,
} from '../src/services/updater/extension-updater';

describe('Extension Auto-Updater Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatRelativeTime', () => {
    it('should format seconds ago properly', () => {
      const now = new Date();
      const tenSecAgo = new Date(now.getTime() - 10000).toISOString();
      const formatted = formatRelativeTime(tenSecAgo);
      expect(formatted).toMatch(/\d+s ago/);
    });

    it('should format minutes ago properly', () => {
      const now = new Date();
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      const formatted = formatRelativeTime(fiveMinAgo);
      expect(formatted).toBe('5m ago');
    });

    it('should format hours ago properly', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
      const formatted = formatRelativeTime(twoHoursAgo);
      expect(formatted).toBe('2h ago');
    });

    it('should format days ago properly', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 86400 * 1000).toISOString();
      const formatted = formatRelativeTime(threeDaysAgo);
      expect(formatted).toBe('3d ago');
    });

    it('should gracefully handle invalid dates', () => {
      expect(formatRelativeTime('invalid-date')).toBe('invalid-date');
    });
  });

  describe('Storage helpers (commit SHA and reload time)', () => {
    it('returns default fallback SHA when chrome.storage is not present', async () => {
      const originalChrome = (globalThis as any).chrome;
      (globalThis as any).chrome = undefined;

      const sha = await getCurrentCommitSha();
      expect(sha).toBe('a5bb018');

      (globalThis as any).chrome = originalChrome;
    });

    it('stores and retrieves commit SHA using chrome.storage.local mock', async () => {
      const storageMock: Record<string, any> = {};
      (globalThis as any).chrome = {
        storage: {
          local: {
            get: vi.fn((keys: string[], cb: (res: any) => void) => {
              const res: Record<string, any> = {};
              keys.forEach(k => { res[k] = storageMock[k]; });
              cb(res);
            }),
            set: vi.fn((items: Record<string, any>, cb?: () => void) => {
              Object.assign(storageMock, items);
              if (cb) cb();
            }),
            remove: vi.fn((keys: string[], cb?: () => void) => {
              keys.forEach(k => delete storageMock[k]);
              if (cb) cb();
            }),
          },
        },
      };

      await setCurrentCommitSha('9876abc');
      const retrieved = await getCurrentCommitSha();
      expect(retrieved).toBe('9876abc');

      await recordReloadTime();
      const justReloaded = await checkJustReloaded();
      expect(justReloaded).toBe(true);

      // Second check should be false because it was cleared
      const secondCheck = await checkJustReloaded();
      expect(secondCheck).toBe(false);
    });
  });

  describe('fetchLatestGithubCommit', () => {
    it('fetches latest commit info correctly from GitHub API response', async () => {
      const mockCommitData = [
        {
          sha: 'a5bb01818cacca27c702783677dc0005a12e5828',
          commit: {
            message: 'feat: implement Facebook group auto-joiner\n\nDetailed body',
            author: {
              name: 'mdnahid7653959-spec',
              date: new Date().toISOString(),
            },
          },
          author: {
            login: 'mdnahid7653959-spec',
            avatar_url: 'https://avatars.githubusercontent.com/u/266942571?v=4',
          },
          html_url: 'https://github.com/mdnahid7653959-spec/facebook-group-automation/commit/a5bb018',
        },
      ];

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommitData,
      } as any);

      const commit = await fetchLatestGithubCommit();
      expect(commit).not.toBeNull();
      expect(commit?.shortSha).toBe('a5bb018');
      expect(commit?.message).toBe('feat: implement Facebook group auto-joiner');
      expect(commit?.author).toBe('mdnahid7653959-spec');
    });

    it('returns null if fetch fails or network is disconnected', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      const commit = await fetchLatestGithubCommit();
      expect(commit).toBeNull();
    });
  });

  describe('pingLocalCompanion & requestCompanionUpdate', () => {
    it('returns true when companion server responds ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      } as any);

      const isLive = await pingLocalCompanion();
      expect(isLive).toBe(true);
    });

    it('returns false when companion server is not running', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Connection refused'));
      const isLive = await pingLocalCompanion();
      expect(isLive).toBe(false);
    });

    it('requestCompanionUpdate returns output on successful build', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Updated from GitHub & rebuilt!',
          pullOutput: 'Already up to date.',
        }),
      } as any);

      const res = await requestCompanionUpdate();
      expect(res.success).toBe(true);
      expect(res.message).toContain('Updated');
    });
  });

  describe('reloadChromeExtension', () => {
    it('calls chrome.runtime.reload when available', async () => {
      const reloadSpy = vi.fn();
      (globalThis as any).chrome = {
        storage: { local: { set: vi.fn((_, cb) => cb && cb()) } },
        runtime: { reload: reloadSpy },
      };

      reloadChromeExtension();
      // Wait microtask for recordReloadTime
      await new Promise(r => setTimeout(r, 10));
      expect(reloadSpy).toHaveBeenCalled();
    });
  });
});
