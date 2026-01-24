import httpClient, { directHttpClient, getProxyBaseUrl } from './http';
import type { TuneHubParams, ApiResponse } from '@/types/api';

export async function tunehubRequest<T = unknown>(params: TuneHubParams): Promise<T> {
  const queryParams: Record<string, string> = {
    type: params.type,
  };

  if (params.source) queryParams.source = params.source;
  if (params.id) queryParams.id = params.id;
  if (params.br) queryParams.br = params.br;
  if (params.keyword) queryParams.keyword = params.keyword;
  if (params.limit !== undefined) queryParams.limit = String(params.limit);
  if (params.page !== undefined) queryParams.page = String(params.page);

  const response = await httpClient.get<ApiResponse<T>>('/', { params: queryParams });
  const apiResp = response.data;

  if (apiResp.code !== 200) {
    throw new Error(apiResp.message || 'API request failed');
  }

  return apiResp.data;
}

function ensureHttps(url: string): string {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
}

export async function tunehubDirectRequest(params: TuneHubParams): Promise<string> {
  const queryParams: Record<string, string> = {
    type: params.type,
  };

  if (params.source) queryParams.source = params.source;
  if (params.id) queryParams.id = params.id;
  if (params.br) queryParams.br = params.br;

  if (params.type === 'url' || params.type === 'pic') {
    try {
      const response = await directHttpClient.get('/', {
        params: queryParams,
        maxRedirects: 5,
        headers: { 'Range': 'bytes=0-0' },
        validateStatus: (status) => (status >= 200 && status < 300) || (status >= 300 && status < 400),
      });

      const finalUrl = response.request?.responseURL || response.config?.url;
      
      if (finalUrl && !finalUrl.includes(directHttpClient.defaults.baseURL || '')) {
        return ensureHttps(finalUrl);
      }

      throw new Error(`Failed to get final URL, status: ${response.status}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; request?: { responseURL?: string } } };
      
      if (axiosError.response?.status === 500) {
        throw new Error('This track is currently unavailable. It may be restricted or the link has expired.');
      }

      if (axiosError.response?.request?.responseURL) {
        return ensureHttps(axiosError.response.request.responseURL);
      }

      const fallbackUrl = `${getProxyBaseUrl()}/?${new URLSearchParams(queryParams).toString()}`;
      console.log('[API] Using fallback URL:', fallbackUrl);
      return fallbackUrl;
    }
  }

  try {
    const response = await directHttpClient.get<string>('/', {
      params: queryParams,
      responseType: 'text',
    });

    return typeof response.data === 'string' ? response.data : String(response.data);
  } catch {
    const fallbackUrl = `${getProxyBaseUrl()}/?${new URLSearchParams(queryParams).toString()}`;
    const response = await directHttpClient.get<string>(fallbackUrl, {
      responseType: 'text',
      baseURL: '',
    });
    return typeof response.data === 'string' ? response.data : String(response.data);
  }
}
