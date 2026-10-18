/**
 * Isolated selector abstraction for Facebook Group DOM.
 * Facebook frequently alters class names, so selectors use semantic attributes,
 * ARIA roles, and standard meta tags with multiple resilient fallbacks.
 */
export const FACEBOOK_SELECTORS = {
  // Page Meta & Title
  META_OG_TITLE: 'meta[property="og:title"]',
  META_OG_URL: 'meta[property="og:url"]',
  HEADER_H1: 'h1[dir="auto"], h1 span',
  GROUP_HEADER_CONTAINER: '[role="main"] h1',

  // Post creation triggers
  WRITE_POST_TRIGGER: '[role="button"][aria-label*="Write something"], [role="button"][aria-label*="Create a public post"], [role="button"]:has(span:contains("Write something"))',
  POST_MODAL: '[role="dialog"][aria-label*="Create post"]',
  POST_TEXT_INPUT: '[role="textbox"][contenteditable="true"]',
  PHOTO_VIDEO_BUTTON: '[aria-label*="Photo/video"], [aria-label*="Add photo"]',
  SUBMIT_POST_BUTTON: '[role="button"][aria-label="Post"], [role="button"][aria-label="Publish"]',
};
