import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosRequestConfig } from 'axios';
import type { Citation } from '@/types/pillar1';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

let getAuthState: () => { accessToken: string | null; refreshToken: string | null } = () => ({ accessToken: null, refreshToken: null });
let schoolIdGetter: () => string | null = () => null;
let onAuthRefreshed: (token: string) => void = () => {};
let onAuthFailed: () => void = () => {};

export function configureApiAuth(opts: {
  getAuthState: () => { accessToken: string | null; refreshToken: string | null };
  onAuthRefreshed: (token: string) => void;
  onAuthFailed: () => void;
}) {
  getAuthState = opts.getAuthState;
  onAuthRefreshed = opts.onAuthRefreshed;
  onAuthFailed = opts.onAuthFailed;
}

export function configureApiSchool(getter: () => string | null) {
  schoolIdGetter = getter;
}

export function getSchoolId(): string | null {
  return schoolIdGetter();
}

// Attach access token to every request unless explicitly skipped
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const skipAuth = (config as InternalAxiosRequestConfig & { skipAuth?: boolean }).skipAuth;
  if (!skipAuth) {
    const { accessToken } = getAuthState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  const schoolId = getSchoolId();
  if (schoolId) {
    config.headers['X-School-Id'] = schoolId;
  }
  return config;
});

// Shared in-flight refresh promise so concurrent 401s only trigger one refresh
let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  const { refreshToken } = getAuthState();
  if (!refreshToken) throw new Error('No refresh token');
  refreshPromise = axios
    .post(`${API_BASE}/api/accounts/token/refresh/`, { refresh: refreshToken })
    .then((res) => {
      const newToken = res.data.access as string;
      onAuthRefreshed(newToken);
      return newToken;
    })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const skipAuth = (originalRequest as InternalAxiosRequestConfig & { skipAuth?: boolean }).skipAuth;
      if (skipAuth) return Promise.reject(error);
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        onAuthFailed();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export type ApiRequestConfig = AxiosRequestConfig & { skipAuth?: boolean };

export async function get<T = unknown>(url: string, config?: ApiRequestConfig): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}

export async function post<T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
  const res = await api.post<T>(url, data, config);
  return res.data;
}

export async function patch<T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
  const res = await api.patch<T>(url, data, config);
  return res.data;
}

export async function del<T = unknown>(url: string, config?: ApiRequestConfig): Promise<T> {
  const res = await api.delete<T>(url, config);
  return res.data;
}

// ─── Multipart upload with progress (XMLHttpRequest) ───────────

export function uploadFile(
  url: string,
  file: File,
  fields: Record<string, string>,
  onProgress?: (percent: number) => void,
  fileField = 'file',
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append(fileField, file);
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(data);
      } catch {
        reject({ error: { message: 'Upload failed' } });
      }
    });

    xhr.addEventListener('error', () => reject({ error: { message: 'Network error during upload' } }));
    xhr.addEventListener('abort', () => reject({ error: { message: 'Upload cancelled' } }));

    xhr.open('POST', `${API_BASE}${url}`);
    const { accessToken } = getAuthState();
    if (accessToken) xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    const schoolId = getSchoolId();
    if (schoolId) xhr.setRequestHeader('X-School-Id', schoolId);
    xhr.send(formData);
  });
}

// ─── SSE streaming helper (fetch + ReadableStream) ─────────────

export type SSECallbacks = {
  onToken?: (token: string) => void;
  onCitation?: (citation: Citation) => void;
  onDone?: (fullText: string, sessionId: string, citations: Citation[]) => void;
  onError?: (error: Error) => void;
};

export async function streamSSE(
  url: string,
  body: Record<string, unknown>,
  callbacks: SSECallbacks,
): Promise<void> {
  const { onToken, onCitation, onDone, onError } = callbacks;
  try {
    const { accessToken } = getAuthState();
    const schoolId = getSchoolId();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    if (schoolId) headers['X-School-Id'] = schoolId;
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) throw new Error('Stream request failed');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let sessionId = '';
    const citations: Citation[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';
      for (const block of blocks) {
        const lines = block.split('\n');
        let isDoneEvent = false;
        for (const line of lines) {
          if (line.startsWith('event: done')) {
            isDoneEvent = true;
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                fullText += data.token;
                onToken?.(data.token);
              }
              if (data.session_id) sessionId = data.session_id;
              if (data.citation) {
                citations.push(data.citation);
                onCitation?.(data.citation);
              }
              if (data.done) isDoneEvent = true;
            } catch {
              // skip malformed chunks
            }
          }
        }
        if (isDoneEvent && fullText) {
          onDone?.(fullText, sessionId, citations);
          return;
        }
      }
    }
    if (fullText) onDone?.(fullText, sessionId, citations);
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error('Stream failed'));
  }
}

// ─── Typed error envelope parsing ──────────────────────────────

export function parseApiError(err: unknown): string {
  if (err && typeof err === 'object' && 'error' in err) {
    const errorObj = (err as { error: { message?: string } }).error;
    if (errorObj?.message) return errorObj.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export { API_BASE };
