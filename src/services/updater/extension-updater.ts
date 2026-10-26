/**
 * GitHub & Extension Auto-Updater Service
 * 
 * Facilitates 1-click extension updating and reloading directly from GitHub:
 * 1. Checks GitHub repository (commits & releases) via GitHub API.
 * 2. Connects to optional local companion server (http://127.0.0.1:3959) to auto `git pull` & auto `build`.
 * 3. Triggers native Chrome extension reload (chrome.runtime.reload) so new features activate immediately.
 */

export interface GithubCommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  authorAvatar?: string;
  date: string;
  relativeTime: string;
  url: string;
}

export interface UpdateStatus {
  isChecking: boolean;
  isUpdating: boolean;
  hasUpdate: boolean;
  currentCommitSha: string;
  latestCommit: GithubCommitInfo | null;
  lastCheckedAt: number | null;
  companionAvailable: boolean;
  error: string | null;
  message: string | null;
}

export interface CompanionStatusResponse {
  ok: boolean;
  server?: string;
  branch?: string;
  commit?: {
    sha: string;
    shortSha: string;
    message: string;
    author: string;
    date: string;
  };
  hasUncommittedChanges?: boolean;
}

const GITHUB_REPO = 'mdnahid7653959-spec/facebook-group-automation';
const GITHUB_BRANCH = 'main';
const COMPANION_URL = 'http://127.0.0.1:3959';
const STORAGE_KEY_COMMIT = 'fb_auto_current_commit_sha';
const STORAGE_KEY_RELOADED_AT = 'fb_auto_last_reloaded_at';

// Current repo commit as default fallback
export const DEFAULT_FALLBACK_SHA = '33b84ad5f000c0e7f880c3543f8e8b64650f67dc';

// Calculate relative time (e.g. "5m ago", "2h ago", "yesterday")
export function formatRelativeTime(dateString: string): string {
  try {
    const then = new Date(dateString).getTime();
    if (isNaN(then)) return dateString;
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - then) / 1000));

    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

/**
 * Check if two commit SHAs match (supports full or 7-character short SHAs)
 */
export function isCommitUpToDate(currentSha: string, latestSha: string): boolean {
  if (!currentSha || !latestSha) return true;
  const a = currentSha.trim().toLowerCase();
  const b = latestSha.trim().toLowerCase();
  return a === b || a.startsWith(b) || b.startsWith(a);
}

/**
 * Get compile-time or recorded commit SHA
 */
export async function getCurrentCommitSha(): Promise<string> {
  // 1. Try compile-time baked SHA if available
  let bakedSha = '';
  try {
    if (typeof __APP_COMMIT_SHA__ !== 'undefined' && __APP_COMMIT_SHA__) {
      bakedSha = __APP_COMMIT_SHA__;
    }
  } catch {
    // ignore
  }

  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([STORAGE_KEY_COMMIT], (res) => {
        const storedSha = res[STORAGE_KEY_COMMIT];
        // If stored SHA is the old stale 'a5bb018', override with bakedSha or DEFAULT_FALLBACK_SHA
        if (storedSha && storedSha !== 'a5bb018') {
          resolve(storedSha);
        } else {
          const finalSha = bakedSha || DEFAULT_FALLBACK_SHA;
          chrome.storage.local.set({ [STORAGE_KEY_COMMIT]: finalSha }, () => {
            resolve(finalSha);
          });
        }
      });
    } else {
      resolve(bakedSha || DEFAULT_FALLBACK_SHA);
    }
  });
}

/**
 * Record the current commit SHA into storage
 */
export async function setCurrentCommitSha(sha: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [STORAGE_KEY_COMMIT]: sha }, () => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Record that a reload was just executed
 */
export async function recordReloadTime(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [STORAGE_KEY_RELOADED_AT]: Date.now() }, () => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Check if the extension was recently reloaded (e.g., within 20s)
 */
export async function checkJustReloaded(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([STORAGE_KEY_RELOADED_AT], (res) => {
        const time = res[STORAGE_KEY_RELOADED_AT];
        if (time && Date.now() - time < 20000) {
          // Clear it so it only shows once
          chrome.storage.local.remove([STORAGE_KEY_RELOADED_AT]);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
}

/**
 * Check GitHub repository for the latest commit on main branch
 */
export async function fetchLatestGithubCommit(): Promise<GithubCommitInfo | null> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/commits?sha=${GITHUB_BRANCH}&per_page=1`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const latest = data[0];
    const sha = latest.sha || '';
    const commitData = latest.commit || {};
    const authorData = latest.author || {};
    const message = (commitData.message || 'Updated code').split('\n')[0];
    const date = commitData.author?.date || commitData.committer?.date || new Date().toISOString();

    return {
      sha,
      shortSha: sha.substring(0, 7),
      message,
      author: authorData.login || commitData.author?.name || 'Contributor',
      authorAvatar: authorData.avatar_url,
      date,
      relativeTime: formatRelativeTime(date),
      url: latest.html_url || `https://github.com/${GITHUB_REPO}/commit/${sha}`,
    };
  } catch (err: any) {
    console.warn('[AutoUpdater] Failed to fetch latest GitHub commit:', err);
    return null;
  }
}

/**
 * Check if local companion updater server is running
 */
export async function pingLocalCompanion(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${COMPANION_URL}/status`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get detailed status from companion server
 */
export async function getCompanionStatus(): Promise<CompanionStatusResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${COMPANION_URL}/status`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Request local companion server to git pull and build
 */
export async function requestCompanionUpdate(): Promise<{
  success: boolean;
  message: string;
  pullOutput?: string;
  buildOutput?: string;
  commit?: any;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s max for pull + build

    const res = await fetch(`${COMPANION_URL}/update-from-github`, {
      method: 'POST',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    return {
      success: json.success ?? json.ok ?? res.ok,
      message: json.message || (res.ok ? 'Updated successfully!' : 'Update encountered an error'),
      pullOutput: json.pullOutput,
      buildOutput: json.buildOutput,
      commit: json.commit,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Local companion update error: ${err.message || 'Server did not respond'}`,
    };
  }
}

/**
 * Request local companion server to re-build extension bundle
 */
export async function requestCompanionRebuild(): Promise<{
  success: boolean;
  message: string;
  buildOutput?: string;
  commit?: any;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(`${COMPANION_URL}/rebuild`, {
      method: 'POST',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    return {
      success: json.success ?? json.ok ?? res.ok,
      message: json.message || (res.ok ? 'Rebuilt successfully!' : 'Rebuild failed'),
      buildOutput: json.buildOutput,
      commit: json.commit,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Rebuild error: ${err.message || 'Server did not respond'}`,
    };
  }
}

/**
 * Reload the Chrome Extension natively
 * Re-reads all files from dist/ and reloads background worker, popup and content scripts
 */
export function reloadChromeExtension(): void {
  recordReloadTime().finally(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.reload) {
      chrome.runtime.reload();
    } else {
      window.location.reload();
    }
  });
}
