/**
 * AGP: Leave-Site Confirmation Prompt Suppressor & Main-World Caption Injector
 *
 * Runs in the MAIN world at `document_start` on facebook.com.
 * Safely stops the browser's native "Leave site? Changes you made may not be saved."
 * prompt, and provides high-fidelity native Lexical caption injection preserving
 * exact caption design, line breaks, blank spacer lines, emojis, and Bengali text.
 */

import { convertToRichHtml, deduplicateRepeatedCaption } from '../utils/text-styler';

(function () {
  'use strict';

  // 1. High-priority capture-phase listener at window level.
  try {
    window.addEventListener(
      'beforeunload',
      function (e) {
        if (e) {
          e.stopImmediatePropagation();
          e.stopPropagation();
          try {
            e.returnValue = '';
          } catch (_) {}
        }
      },
      true // capture phase
    );
  } catch (_) {}

  // 2. Suppress window.onbeforeunload setter so Facebook cannot register a beforeunload handler via property
  try {
    Object.defineProperty(window, 'onbeforeunload', {
      configurable: true,
      enumerable: true,
      get: function () {
        return null;
      },
      set: function () {
        // Discard
      },
    });
  } catch (_) {
    try {
      window.onbeforeunload = null;
    } catch (_) {}
  }

  // 3. High-Fidelity Main World Caption Injector for Facebook's Lexical Editor
  // Runs in MAIN world with direct DOM and React privileges to preserve exact caption formatting:
  // - Preserves all newlines, blank lines, indentation, emojis, and Bengali/English text
  // - Generates rich multi-line HTML (<p> and <p><br></p>) for Lexical's native HTML parser
  // - Dispatches native ClipboardEvent with DataTransfer
  // - Protects against duplicate injection (never fires paste + beforeinput simultaneously)
  // - Falls back to non-collapsing line-by-line keystroke simulation (\u00A0 on blank lines)
  try {
    window.addEventListener('message', async function (e) {
      if (e.source !== window || !e.data || e.data.type !== 'AGP_MAIN_INJECT_CAPTION') return;
      const { caption: rawCaption, messageId } = e.data;
      if (typeof rawCaption !== 'string') return;

      // Ensure any double-pasted or repeated text is cleaned immediately
      const caption = deduplicateRepeatedCaption(rawCaption);
      const lines = caption.split('\n');

      try {
        const editorSelectors = [
          'div[role="dialog"] div[role="textbox"][contenteditable="true"]',
          'div[role="dialog"] div[data-lexical-editor="true"][contenteditable="true"]',
          'div[data-lexical-editor="true"][contenteditable="true"]',
          'div[role="textbox"][contenteditable="true"]:not([aria-label*="comment" i]):not([aria-label*="মন্তব্য" i])',
          'div[data-editor="true"]',
        ];

        let editor: HTMLElement | null = null;
        for (const sel of editorSelectors) {
          const els = Array.from(document.querySelectorAll<HTMLElement>(sel));
          for (const el of els) {
            if (el.offsetParent !== null || el.getBoundingClientRect().height > 0) {
              editor = el;
              break;
            }
          }
          if (editor) break;
        }

        if (!editor) {
          window.postMessage({
            type: 'AGP_MAIN_INJECT_CAPTION_RESPONSE',
            messageId: messageId,
            success: false,
            reason: 'Editor not found in MAIN world',
          }, '*');
          return;
        }

        // Guard: If editor already has this caption (or >= 70% match), do NOT inject again!
        const existingText = (editor.textContent || '').trim();
        const snippet = caption.trim().slice(0, 30);
        if (existingText.length >= caption.trim().length * 0.7 && (!snippet || existingText.includes(snippet))) {
          window.postMessage({
            type: 'AGP_MAIN_INJECT_CAPTION_RESPONSE',
            messageId: messageId,
            success: true,
            charCount: existingText.length,
          }, '*');
          return;
        }

        // Focus editor
        editor.focus();
        window.focus();

        const mouseOpts = { bubbles: true, cancelable: true, view: window };
        editor.dispatchEvent(new PointerEvent('pointerdown', mouseOpts));
        editor.dispatchEvent(new MouseEvent('mousedown', mouseOpts));
        editor.dispatchEvent(new PointerEvent('pointerup', mouseOpts));
        editor.dispatchEvent(new MouseEvent('mouseup', mouseOpts));
        editor.dispatchEvent(new MouseEvent('click', mouseOpts));

        // Clear existing text cleanly
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(editor);
          sel.removeAllRanges();
          sel.addRange(range);
          editor.dispatchEvent(new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            inputType: 'deleteContentBackward',
          }));
        }
        document.execCommand('selectAll', false);
        document.execCommand('delete', false);

        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }

        // Prepare rich multi-line HTML preserving all paragraphs, bullets, and styled formatting
        const htmlParagraphs = convertToRichHtml(caption);

        let injected = false;

        // Method 1: Native Paste with DataTransfer in MAIN world
        // CRITICAL: Dispatch ONLY pasteEvent. Never dispatch paste + beforeinput together,
        // as modern Lexical handles both and will duplicate the post!
        try {
          const dt = new DataTransfer();
          dt.setData('text/plain', caption);
          dt.setData('text/html', htmlParagraphs);

          const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: dt,
          });
          editor.dispatchEvent(pasteEvent);

          await new Promise(function (r) { setTimeout(r, 80); });
          let textAfter = (editor.textContent || '').trim();

          // Only fallback to beforeinput if pasteEvent was completely ignored
          if (!textAfter || textAfter.length < 5) {
            editor.dispatchEvent(new InputEvent('beforeinput', {
              bubbles: true,
              cancelable: true,
              inputType: 'insertFromPaste',
              dataTransfer: dt,
            }));
            await new Promise(function (r) { setTimeout(r, 60); });
            textAfter = (editor.textContent || '').trim();
          }

          const pElements = editor.querySelectorAll('p');
          if (textAfter.length > 0 && (!caption.includes('\n') || pElements.length > 1 || textAfter.length >= caption.trim().length * 0.7)) {
            injected = true;
          }
        } catch (_) {}

        // Method 2: Keystroke simulation with non-collapsing empty lines
        if (!injected) {
          document.execCommand('selectAll', false);
          document.execCommand('delete', false);

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isLast = i === lines.length - 1;

            if (line.length > 0) {
              document.execCommand('insertText', false, line);
            } else {
              // Non-breaking space ensures empty spacer line / paragraph NEVER collapses in Facebook!
              document.execCommand('insertText', false, '\u00A0');
            }


            if (!isLast) {
              editor.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true,
              }));

              editor.dispatchEvent(new InputEvent('beforeinput', {
                inputType: 'insertParagraph',
                bubbles: true,
                cancelable: true,
              }));

              document.execCommand('insertParagraph', false);

              editor.dispatchEvent(new InputEvent('input', {
                inputType: 'insertParagraph',
                bubbles: true,
              }));

              editor.dispatchEvent(new KeyboardEvent('keyup', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
              }));
            }
          }
        }

        // Trigger input and selectionchange events to inform React & Lexical
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
        document.dispatchEvent(new Event('selectionchange'));

        await new Promise(function (r) { setTimeout(r, 50); });
        const finalText = (editor.textContent || '').trim();

        window.postMessage({
          type: 'AGP_MAIN_INJECT_CAPTION_RESPONSE',
          messageId: messageId,
          success: finalText.length > 0,
          charCount: finalText.length,
        }, '*');
      } catch (err: any) {
        window.postMessage({
          type: 'AGP_MAIN_INJECT_CAPTION_RESPONSE',
          messageId: messageId,
          success: false,
          error: err ? err.message : String(err),
        }, '*');
      }
    });

    // 4. Main-world Join Group Trigger
    window.addEventListener('message', async function (e) {
      if (e.source !== window || !e.data || e.data.type !== 'AGP_MAIN_JOIN_GROUP') return;
      const { messageId } = e.data;
      try {
        const joinSelectors = [
          '[aria-label*="Join group" i]',
          '[aria-label*="Join Group" i]',
          '[aria-label*="গ্রুপে যোগ দিন" i]',
          '[aria-label*="যোগ দিন" i]',
          '[aria-label*="গ্রুপে যুক্ত হন" i]',
          '[aria-label*="Request to join" i]',
          '[aria-label*="Request to Join" i]',
          '[aria-label*="গ্রুপে যোগ দেওয়ার অনুরোধ" i]',
          '[aria-label*="যোগ দেওয়ার অনুরোধ" i]',
          'div[role="button"][aria-label*="Join" i]',
          'div[role="button"][aria-label*="যোগ" i]',
        ];
        let joinBtn: HTMLElement | null = null;
        for (const sel of joinSelectors) {
          const el = document.querySelector<HTMLElement>(sel);
          if (el && (el.offsetParent !== null || el.getBoundingClientRect().height > 0)) {
            joinBtn = el;
            break;
          }
        }
        if (!joinBtn) {
          const allBtns = Array.from(document.querySelectorAll<HTMLElement>('div[role="button"], button'));
          for (const b of allBtns) {
            const t = (b.innerText || b.textContent || '').trim().toLowerCase();
            if (t === 'join group' || t === 'join' || t === 'গ্রুপে যোগ দিন' || t === 'যোগ দিন' || t === 'request to join') {
              joinBtn = b;
              break;
            }
          }
        }
        if (joinBtn) {
          joinBtn.focus();
          const mouseOpts = { bubbles: true, cancelable: true, view: window };
          joinBtn.dispatchEvent(new PointerEvent('pointerdown', mouseOpts));
          joinBtn.dispatchEvent(new MouseEvent('mousedown', mouseOpts));
          joinBtn.dispatchEvent(new PointerEvent('pointerup', mouseOpts));
          joinBtn.dispatchEvent(new MouseEvent('mouseup', mouseOpts));
          joinBtn.click();
          window.postMessage({ type: 'AGP_MAIN_JOIN_GROUP_RESPONSE', messageId, success: true }, '*');
        } else {
          window.postMessage({ type: 'AGP_MAIN_JOIN_GROUP_RESPONSE', messageId, success: false }, '*');
        }
      } catch (err: any) {
        window.postMessage({ type: 'AGP_MAIN_JOIN_GROUP_RESPONSE', messageId, success: false, error: String(err) }, '*');
      }
    });
  } catch (_) {}
})();
