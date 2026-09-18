import { pathToFileURL } from 'node:url';

export const isAllowedExternalUrl = (url: string): boolean => {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
};

export const isAllowedNavigation = (
  url: string,
  options: { isDev: boolean; devUrl?: string; appEntryPath: string },
): boolean => {
  try {
    const target = new URL(url);

    if (options.isDev && options.devUrl) {
      return target.origin === new URL(options.devUrl).origin;
    }

    const appEntry = new URL(pathToFileURL(options.appEntryPath).toString());
    return target.protocol === 'file:' && target.pathname === appEntry.pathname;
  } catch {
    return false;
  }
};
