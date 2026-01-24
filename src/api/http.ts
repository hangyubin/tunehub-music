import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { SourceSwitchInfo } from '@/types/models';

const API_PRIMARY = '/api';
const API_FALLBACK = '/api';
const API_TIMEOUT = 15000;

let currentApiUrl: string = API_PRIMARY;
let apiHealthy = true;

export const getCurrentApiUrl = (): string => currentApiUrl;
export const isApiHealthy = (): boolean => apiHealthy;

export const switchToFallbackApi = (): boolean => {
  if (currentApiUrl !== API_FALLBACK) {
    console.log('[HTTP] Switching to fallback API:', API_FALLBACK);
    currentApiUrl = API_FALLBACK;
    httpClient.defaults.baseURL = currentApiUrl;
    directHttpClient.defaults.baseURL = currentApiUrl;
    apiHealthy = false;
    return true;
  }
  return false;
};

export const resetToPrimaryApi = (): boolean => {
  if (currentApiUrl !== API_PRIMARY) {
    console.log('[HTTP] Resetting to primary API:', API_PRIMARY);
    currentApiUrl = API_PRIMARY;
    httpClient.defaults.baseURL = currentApiUrl;
    directHttpClient.defaults.baseURL = currentApiUrl;
    apiHealthy = true;
    return true;
  }
  return false;
};

export const getProxyBaseUrl = (): string => '/api';
const getApiBaseUrl = (): string => '/api';

type SourceSwitchCallback = (info: SourceSwitchInfo) => void;
const sourceSwitchCallbacks: Set<SourceSwitchCallback> = new Set();

export const onSourceSwitch = (callback: SourceSwitchCallback): (() => void) => {
  sourceSwitchCallbacks.add(callback);
  return () => sourceSwitchCallbacks.delete(callback);
};

export const emitSourceSwitch = (info: SourceSwitchInfo): void => {
  sourceSwitchCallbacks.forEach(cb => cb(info));
};

const httpClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const directHttpClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT,
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log('[HTTP] Request:', config.method?.toUpperCase(), config.url, config.params);
    }
    return config;
  },
  (error) => {
    console.error('[HTTP] Request error:', error);
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const sourceSwitchHeader = response.headers['x-source-switch'];
    if (sourceSwitchHeader && typeof sourceSwitchHeader === 'string') {
      const match = sourceSwitchHeader.match(/(\w+)\s*->\s*(\w+)/);
      if (match) {
        emitSourceSwitch({
          from: match[1] as SourceSwitchInfo['from'],
          to: match[2] as SourceSwitchInfo['to'],
          timestamp: Date.now(),
        });
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (switchToFallbackApi()) {
        console.log('[HTTP] Retrying with fallback API...');
        originalRequest.baseURL = currentApiUrl;
        return httpClient(originalRequest);
      }
    }

    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message;
      
      if (status === 500 && !originalRequest._retry) {
        originalRequest._retry = true;
        if (switchToFallbackApi()) {
          originalRequest.baseURL = currentApiUrl;
          return httpClient(originalRequest);
        }
      }
      
      console.error(`[HTTP] Error [${status}]:`, message);
    } else if (error.request) {
      console.error('[HTTP] Network Error:', error.message);
    } else {
      console.error('[HTTP] Error:', error.message);
    }

    return Promise.reject(error);
  }
);

directHttpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log('[HTTP Direct] Request:', config.method?.toUpperCase(), config.url, config.params);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

directHttpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (switchToFallbackApi()) {
        originalRequest.baseURL = currentApiUrl;
        return directHttpClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
export { directHttpClient };
