import { Group, GroupValidationResult } from '../types/group';
import { Post } from '../types/post';
import { BackupData } from '../types/settings';

/**
 * Validates and normalizes Facebook Group URLs.
 * Accepts patterns like:
 * - https://www.facebook.com/groups/123456789
 * - https://facebook.com/groups/group_name/
 * - https://web.facebook.com/groups/group.name
 * - https://m.facebook.com/groups/group-slug
 */
export function validateFacebookGroupUrl(rawUrl: string): GroupValidationResult {
  const errors: string[] = [];
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, errors: ['URL is required'] };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, errors: ['URL cannot be empty'] };
  }

  // Ensure scheme
  let urlToTest = trimmed;
  if (!/^https?:\/\//i.test(urlToTest)) {
    urlToTest = 'https://' + urlToTest;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlToTest);
  } catch {
    return { valid: false, errors: ['Invalid URL format'] };
  }

  // Check host
  const validHosts = ['facebook.com', 'www.facebook.com', 'web.facebook.com', 'm.facebook.com'];
  const host = parsed.hostname.toLowerCase();
  const isValidHost = validHosts.some(vh => host === vh || host.endsWith('.' + vh));

  if (!isValidHost) {
    errors.push('URL must be a Facebook domain (e.g. facebook.com, web.facebook.com)');
  }

  // Check pathname for /groups/<slug_or_id>
  const pathParts = parsed.pathname.split('/').filter(Boolean);
  const groupsIndex = pathParts.indexOf('groups');

  if (groupsIndex === -1 || groupsIndex >= pathParts.length - 1) {
    errors.push('URL must point directly to a Facebook group (e.g. /groups/group_name)');
    return { valid: false, errors };
  }

  const groupIdOrSlug = decodeURIComponent(pathParts[groupsIndex + 1]);
  const INVALID_SYSTEM_SLUGS = ['feed', 'discover', 'joins', 'about', 'settings', 'notifications', 'search', 'categories', 'create', 'help', 'privacy', 'support'];
  if (!groupIdOrSlug || INVALID_SYSTEM_SLUGS.includes(groupIdOrSlug.toLowerCase())) {
    errors.push('URL must point to a specific group, not a feed or discovery page');
    return { valid: false, errors };
  }

  // Check if this is an individual post, permalink, or notification link rather than a group page
  const subPaths = pathParts.slice(groupsIndex + 2).map(p => p.toLowerCase());
  const invalidSubPaths = ['permalink', 'posts', 'user', 'photos', 'videos', 'events', 'files', 'stories'];
  if (subPaths.some(sp => invalidSubPaths.includes(sp))) {
    errors.push('URL points to an individual post or permalink inside a group, not the group itself');
    return { valid: false, errors };
  }

  if (parsed.searchParams.has('comment_id') || parsed.searchParams.has('notif_id') || parsed.searchParams.has('notif_t')) {
    errors.push('URL is a notification or comment permalink, not a group page');
    return { valid: false, errors };
  }

  // Clean canonical group URL
  const cleanUrl = `https://www.facebook.com/groups/${groupIdOrSlug}/`;

  return {
    valid: errors.length === 0,
    errors,
    cleanUrl,
    groupId: groupIdOrSlug,
  };
}

/**
 * Checks for duplicate group URLs or IDs.
 */
export function detectDuplicateGroup(
  urlOrId: string,
  existingGroups: Group[],
  currentGroupId?: string
): boolean {
  if (!urlOrId) return false;

  const validation = validateFacebookGroupUrl(urlOrId);
  const normalizedIncomingId = validation.valid ? validation.groupId?.toLowerCase() : null;
  const normalizedIncomingUrl = validation.valid ? validation.cleanUrl?.toLowerCase() : urlOrId.trim().toLowerCase();

  return existingGroups.some(g => {
    if (currentGroupId && g.id === currentGroupId) return false;

    // Direct URL match
    if (g.url.trim().toLowerCase() === normalizedIncomingUrl) return true;

    // Clean URL match
    const existingVal = validateFacebookGroupUrl(g.url);
    if (existingVal.valid) {
      if (normalizedIncomingUrl && existingVal.cleanUrl?.toLowerCase() === normalizedIncomingUrl) {
        return true;
      }
      if (normalizedIncomingId && existingVal.groupId?.toLowerCase() === normalizedIncomingId) {
        return true;
      }
    }

    // Direct groupId match
    if (g.groupId && normalizedIncomingId && g.groupId.toLowerCase() === normalizedIncomingId) {
      return true;
    }

    return false;
  });
}

/**
 * Validates a Post before saving or queueing.
 */
export function validatePost(post: Partial<Post>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!post.title || !post.title.trim()) {
    errors.push('Post title is required');
  }

  if (!post.productName || !post.productName.trim()) {
    errors.push('Product name is required');
  }

  if (!post.description || !post.description.trim()) {
    errors.push('Post description is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates imported backup JSON payload structure.
 */
export function validateBackupData(data: unknown): { valid: boolean; errors: string[]; parsed?: BackupData } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Backup data must be a valid JSON object'] };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.groups)) {
    errors.push('Missing or invalid "groups" array');
  }

  if (!Array.isArray(obj.posts)) {
    errors.push('Missing or invalid "posts" array');
  }

  if (obj.settings && typeof obj.settings !== 'object') {
    errors.push('Invalid "settings" object format');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    parsed: data as BackupData,
  };
}
