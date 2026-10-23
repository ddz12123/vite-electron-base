import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isAllowedExternalUrl, isAllowedNavigation } from './security';

const appEntryPath = resolve('out/renderer/index.html');

// 生产模式：只允许 file: 协议且路径与应用入口一致
const prodOptions = { isDev: false, appEntryPath };
// 开发模式：只允许 dev server 同源地址
const devOptions = { isDev: true, devUrl: 'http://localhost:5173', appEntryPath };

describe('isAllowedExternalUrl', () => {
  it('放行 http(s) 外链', () => {
    expect(isAllowedExternalUrl('https://example.com')).toBe(true);
    expect(isAllowedExternalUrl('http://example.com/path?q=1')).toBe(true);
  });

  it('拦截其他协议与非法输入', () => {
    expect(isAllowedExternalUrl('file:///C:/Windows/System32')).toBe(false);
    expect(isAllowedExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedExternalUrl('not a url')).toBe(false);
  });
});

describe('isAllowedNavigation', () => {
  it('生产环境只放行应用入口自身', () => {
    const entry = pathToFileURL(appEntryPath).href;
    expect(isAllowedNavigation(entry, prodOptions)).toBe(true);
    expect(isAllowedNavigation('https://example.com', prodOptions)).toBe(false);
    expect(isAllowedNavigation('file:///C:/other.html', prodOptions)).toBe(false);
  });

  it('开发环境只放行 dev server 同源地址', () => {
    expect(isAllowedNavigation('http://localhost:5173/home', devOptions)).toBe(true);
    expect(isAllowedNavigation('http://127.0.0.1:5173/home', devOptions)).toBe(false);
    expect(isAllowedNavigation(pathToFileURL(appEntryPath).href, devOptions)).toBe(false);
  });
});
