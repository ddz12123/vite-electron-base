import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import router from '@renderer/router';
import { ROUTE_NAMES } from '@renderer/constant/route';
import { clearToken, getToken, normalizeRedirect } from '@renderer/utils/auth';

/** 后端统一响应结构 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 扩展字段：是否跳过 token */
export interface RequestConfig extends AxiosRequestConfig {
  ignoreToken?: boolean;
}

const SUCCESS_CODES = new Set([0, 200]);

const HTTP_ERROR_MAP: Record<number, string> = {
  400: '请求参数错误',
  401: '登录状态已失效',
  403: '无权限访问',
  404: '请求资源不存在',
  409: '请求冲突',
  422: '参数校验失败',
  429: '请求过于频繁',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
};

const isApiResponse = (data: unknown): data is ApiResponse => {
  return (
    !!data && typeof data === 'object' && 'code' in data && 'message' in data && 'data' in data
  );
};

// 下载类接口出错时，后端会把 JSON 错误体塞进二进制响应里，不解析就会被当成文件保存
const unwrapJsonBody = async (data: unknown, headers: unknown): Promise<unknown> => {
  const headerMap = headers as Record<string, unknown> | undefined;
  if (!/application\/json/i.test(String(headerMap?.['content-type'] ?? ''))) return data;

  let text: string | null = null;
  if (data instanceof Blob) text = await data.text();
  else if (data instanceof ArrayBuffer) text = new TextDecoder().decode(data);
  if (text === null) return data;

  try {
    return JSON.parse(text);
  } catch {
    return data;
  }
};

const pickMessage = (payload: unknown): string => {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return '';
};

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 120000,
});

const redirectToLogin = (): void => {
  clearToken();

  // 基础框架默认没有 login 路由，业务侧注册后自动生效
  if (!router.hasRoute(ROUTE_NAMES.login)) return;
  if (router.currentRoute.value.name === ROUTE_NAMES.login) return;

  const currentPath = normalizeRedirect(router.currentRoute.value.fullPath);

  void router.replace({
    name: ROUTE_NAMES.login,
    query: { redirect: currentPath },
  });
};

// 业务错误体未必带 data 字段，但至少要像统一响应体，否则 { code: 110000 } 这类业务字段会被误判
const pickBusinessError = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object' || !('code' in payload)) return null;
  const code = (payload as { code: unknown }).code;
  if (typeof code !== 'number' || SUCCESS_CODES.has(code)) return null;
  if (!('message' in payload) && !('data' in payload)) return null;
  if (code === 401) redirectToLogin();
  return pickMessage(payload) || '请求失败';
};

request.interceptors.request.use((config: InternalAxiosRequestConfig & RequestConfig) => {
  if (!config.ignoreToken) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = token;
    }
  }
  return config;
});

request.interceptors.response.use(
  async (response) => {
    const payload = await unwrapJsonBody(response.data, response.headers);
    const businessError = pickBusinessError(payload);
    if (businessError) return Promise.reject(new Error(businessError));

    // 文件流原样返回，统一响应体只取 data
    const responseType = response.config.responseType;
    if (responseType === 'blob' || responseType === 'arraybuffer') return response.data;
    return isApiResponse(payload) ? payload.data : payload;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      redirectToLogin();
    }

    const serverMessage = pickMessage(
      await unwrapJsonBody(error.response?.data, error.response?.headers),
    );
    const message =
      serverMessage ||
      (status
        ? HTTP_ERROR_MAP[status] || `请求失败（${status}）`
        : error.code === 'ECONNABORTED'
          ? '请求超时，请稍后再试'
          : '网络异常，请检查网络连接');

    return Promise.reject(new Error(message));
  },
);

export const http = {
  request<T = unknown>(config: RequestConfig) {
    return request.request<unknown, T>(config);
  },
  get<T = unknown>(url: string, params?: object, config?: RequestConfig) {
    return request.get<unknown, T>(url, { ...config, params: params ?? config?.params });
  },
  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
    return request.post<unknown, T>(url, data, config);
  },
  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
    return request.put<unknown, T>(url, data, config);
  },
  patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
    return request.patch<unknown, T>(url, data, config);
  },
  delete<T = unknown>(url: string, params?: object, config?: RequestConfig) {
    return request.delete<unknown, T>(url, { ...config, params: params ?? config?.params });
  },
};
