import { TokenKey } from '@renderer/constant/storage';

const TOKEN_KEY = TokenKey;
const DEFAULT_REDIRECT = '/';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const normalizeRedirect = (value: unknown): string => {
  if (typeof value !== 'string') return DEFAULT_REDIRECT;
  if (!value.startsWith('/')) return DEFAULT_REDIRECT;
  if (value.startsWith('//')) return DEFAULT_REDIRECT;
  if (value.startsWith('/login')) return DEFAULT_REDIRECT;

  return value;
};
