import { type Permissions } from 'webextension-polyfill';

export const ANDROID_MESSAGES_HOST_PERMISSION: Permissions.Permissions = {
  origins: ['https://messages.google.com/*'],
};
