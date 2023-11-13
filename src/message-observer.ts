import { type Browser } from 'webextension-polyfill';

import { type FoundTwoFactorAuthenticationCodePayload } from './common/payload';

declare const browser: Browser;

function initMessageObserver() {
  console.log('Initializing MutationObserver to process incoming messages');
  const observer = new MutationObserver(async (mutations) => {
    for (const { addedNodes } of mutations) {
      for (const addedNode of addedNodes) {
        if (addedNode.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }

        const addedElement = addedNode as Element;
        if (
          !addedElement.matches('p[aria-live="polite"][aria-atomic="true"]')
        ) {
          continue;
        }

        initLogTextListener(addedElement);
      }
    }
  });

  observer.observe(document.body, { childList: true });
}

function initLogTextListener(logElement: Element) {
  const observer = new MutationObserver(async (mutations) => {
    for (const { target } of mutations) {
      const { textContent: fullMessage } = target;
      if (!fullMessage) {
        continue;
      }

      const code = fullMessage.match(/:\s+.*(\b\d{4,8}\b)/)?.[1];
      if (!code) {
        continue;
      }

      const payload: FoundTwoFactorAuthenticationCodePayload = {
        code,
        fullMessage,
      };
      console.log('Found possible 2FA code. Payload:', payload);
      browser.runtime.sendMessage(payload);
    }
  });

  observer.observe(logElement, { childList: true });
}

console.log('Copy 2FA from Android Messages starting');
initMessageObserver();
