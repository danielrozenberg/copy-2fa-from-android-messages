import { ANDROID_MESSAGES_HOST_PERMISSION } from './common/host-permission';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

document.querySelectorAll('[data-i18n-id]').forEach((element) => {
  element.textContent = browser.i18n.getMessage(
    element.getAttribute('data-i18n-id') ?? '',
  );
});

document.getElementById('grant')?.addEventListener('click', async () => {
  const granted = await browser.permissions.request(
    ANDROID_MESSAGES_HOST_PERMISSION,
  );
  if (granted) {
    window.close();
  }
});
