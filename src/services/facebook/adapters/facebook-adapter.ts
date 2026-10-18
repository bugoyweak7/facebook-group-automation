import { detectCurrentFacebookPage, FacebookPageInfo } from '../detectors/page-detector';
import { FACEBOOK_SELECTORS } from '../selectors/group-selectors';

export class FacebookAdapter {
  getPageInfo(): FacebookPageInfo {
    return detectCurrentFacebookPage();
  }

  /**
   * Non-invasively brings the 'Write something...' post box into view to guide the user.
   * Does NOT auto-submit or click secretly.
   */
  focusPostArea(): boolean {
    const trigger = document.querySelector<HTMLElement>(FACEBOOK_SELECTORS.WRITE_POST_TRIGGER);
    if (trigger) {
      trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
      trigger.style.outline = '3px solid #6366f1';
      setTimeout(() => {
        trigger.style.outline = '';
      }, 3000);
      return true;
    }
    return false;
  }
}

export const facebookAdapter = new FacebookAdapter();
