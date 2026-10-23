import { describe, expect, it } from 'vitest';
import { normalizeRedirect } from './auth';

describe('normalizeRedirect', () => {
  it('放行单个前导斜杠的站内路径', () => {
    expect(normalizeRedirect('/home')).toBe('/home');
    expect(normalizeRedirect('/detail?id=1')).toBe('/detail?id=1');
  });

  it('拦截协议相对路径与反斜杠注入', () => {
    expect(normalizeRedirect('//evil.com')).toBe('/');
    expect(normalizeRedirect('/\\evil')).toBe('/');
  });

  it('非字符串与登录页回落首页', () => {
    expect(normalizeRedirect(undefined)).toBe('/');
    expect(normalizeRedirect('https://evil.com')).toBe('/');
    expect(normalizeRedirect('/login')).toBe('/');
  });
});
