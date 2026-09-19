import { LOGIN_PATH } from '@renderer/constant/route';
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
  // // 和 /\ 会被浏览器当成跨域地址，只有单个前导斜杠才是站内路径
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return DEFAULT_REDIRECT;
  }
  if (value.startsWith(LOGIN_PATH)) return DEFAULT_REDIRECT;

  return value;
};
