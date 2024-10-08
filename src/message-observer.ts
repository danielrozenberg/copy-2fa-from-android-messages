import { type Browser } from 'webextension-polyfill';

import { type FoundTwoFactorAuthenticationCodePayload } from './common/payload';

declare const browser: Browser;

function initMessageObserver() {
  console.log('Initializing MutationObserver to process incoming messages');
  let lastFoundCode = '';

  const observer = new MutationObserver(async () => {
    const topMessageElement = document.querySelector(
      'mws-conversations-list mws-conversation-list-item:first-of-type .text-content.unread',
    );
    const sender = topMessageElement?.querySelector('.name')?.textContent;
    const fullMessage =
      topMessageElement?.querySelector('.snippet-text')?.textContent;
    const code = fullMessage?.match(/:\s+.*(\b\d{4,8}\b)/)?.[1];
    if (!sender || !fullMessage || !code) {
      return;
    }

    // Prevent repeats because `document` changes a lot.
    if (code === lastFoundCode) {
      return;
    }
    lastFoundCode = code;

    const payload: FoundTwoFactorAuthenticationCodePayload = {
      code,
      sender,
      fullMessage,
    };
    console.log('Found possible 2FA code. Payload:', payload);
    await browser.runtime.sendMessage(payload);
  });

  observer.observe(document, { childList: true, subtree: true });
}

console.log('Copy 2FA from Android Messages starting');
initMessageObserver();
