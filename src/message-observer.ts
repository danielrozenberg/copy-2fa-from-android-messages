import { type Browser } from 'webextension-polyfill';

import { type FoundTwoFactorAuthenticationCodePayload } from './common/payload';

declare const browser: Browser;

function waitForConversationsList() {
  console.log('Initializing MutationObserver to find mws-conversations-list');
  const initialObserver = new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
      for (const addedNode of mutation.addedNodes) {
        if (
          addedNode.nodeType === Node.ELEMENT_NODE &&
          addedNode.nodeName.startsWith('MW') &&
          (addedNode as Element).querySelector('mws-conversations-list')
        ) {
          console.log('mws-conversations-list was added to the DOM');
          initMessageObserver();
          observer.disconnect();
        }
      }
    });
  });
  initialObserver.observe(document, { childList: true, subtree: true });
}

function initMessageObserver() {
  console.log('Initializing MutationObserver to process incoming messages');
  const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target as Element;
      if (
        !target.classList.contains('text-content') ||
        !target.classList.contains('unread')
      ) {
        continue;
      }

      const messageSnippet = target.querySelector('mws-conversation-snippet');
      const code = messageSnippet?.textContent?.match(/\b\d{4,8}\b/)?.[0];
      if (!code) {
        continue;
      }

      const payload: FoundTwoFactorAuthenticationCodePayload = {
        code,
        sender: target.querySelector('.name')?.textContent ?? '<Unknown>',
        fullMessage: messageSnippet.textContent ?? '',
      };
      console.log('Found possible 2FA code. Payload:', payload);
      browser.runtime.sendMessage(payload);
    }
  });

  const conversationList = document.querySelector('mws-conversations-list');
  if (!conversationList) {
    console.error(
      'Could not initialize Copy 2FA from Android Messages. Unexpected error occured',
    );
    return;
  }

  observer.observe(conversationList, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class'],
    subtree: true,
  });
}

console.log('Copy 2FA from Android Messages starting');
if (document.querySelector('mws-conversations-list')) {
  console.log('mws-conversations-list is already present');
  initMessageObserver();
} else {
  console.log('mws-conversations-list is not present');
  waitForConversationsList();
}
