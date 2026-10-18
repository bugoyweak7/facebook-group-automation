import { validateFacebookGroupUrl } from '../../../utils/validators';
import { FACEBOOK_SELECTORS } from '../selectors/group-selectors';

export interface FacebookPageInfo {
  isGroupPage: boolean;
  groupIdOrSlug: string;
  groupName: string;
  canonicalUrl: string;
  isReady: boolean;
}

/**
 * Detects if the current browser window is on a supported Facebook group page.
 */
export function detectCurrentFacebookPage(): FacebookPageInfo {
  if (typeof window === 'undefined') {
    return { isGroupPage: false, groupIdOrSlug: '', groupName: '', canonicalUrl: '', isReady: false };
  }

  const currentUrl = window.location.href;
  const validation = validateFacebookGroupUrl(currentUrl);

  if (!validation.valid || !validation.groupId) {
    return {
      isGroupPage: false,
      groupIdOrSlug: '',
      groupName: '',
      canonicalUrl: currentUrl,
      isReady: false,
    };
  }

  // Extract group name with fallbacks
  let detectedName = '';

  // Fallback 1: OpenGraph Title
  const ogTitleEl = document.querySelector<HTMLMetaElement>(FACEBOOK_SELECTORS.META_OG_TITLE);
  if (ogTitleEl && ogTitleEl.content) {
    detectedName = ogTitleEl.content.replace(/\s*\|\s*Facebook.*$/i, '').trim();
  }

  // Fallback 2: H1 heading inside main container
  if (!detectedName) {
    const h1El = document.querySelector<HTMLElement>(FACEBOOK_SELECTORS.HEADER_H1);
    if (h1El && h1El.innerText) {
      detectedName = h1El.innerText.trim();
    }
  }

  // Fallback 3: Document title
  if (!detectedName && document.title) {
    detectedName = document.title.replace(/\s*\|\s*Facebook.*$/i, '').trim();
  }

  // Fallback 4: Format slug into title case
  if (!detectedName) {
    detectedName = validation.groupId.replace(/[-_.]+/g, ' ');
    detectedName = detectedName.charAt(0).toUpperCase() + detectedName.slice(1);
  }

  // Readiness check: Body exists and document is interactive or complete
  const isReady = document.readyState === 'interactive' || document.readyState === 'complete';

  return {
    isGroupPage: true,
    groupIdOrSlug: validation.groupId,
    groupName: detectedName,
    canonicalUrl: validation.cleanUrl || currentUrl,
    isReady,
  };
}
