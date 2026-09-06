import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';

export const USE_MOCK_DATA = Constants.expoConfig?.extra?.useMockData ?? true;
export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

export const api = {
  async request(path, { method = 'GET', body, auth = true, retry = true } = {}) {
    const store = useAuthStore.getState();
    const headers = { 'Content-Type': 'application/json' };
    if (auth && store.accessToken) headers.Authorization = `Bearer ${store.accessToken}`;

    let response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new Error('NETWORK_ERROR');
    }

    if (response.status === 401 && auth && retry && store.refreshToken) {
      // Try refresh once, then retry the original request.
      try {
        const refreshed = await authServiceRefresh(store.refreshToken);
        store.setTokens({ access: refreshed.access, refresh: store.refreshToken });
        return api.request(path, { method, body, auth, retry: false });
      } catch {
        store.logout();
        throw new Error('SESSION_EXPIRED');
      }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || data?.detail || `Request failed (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      error.details = data?.error?.details;
      throw error;
    }
    return data;
  },
};

async function authServiceRefresh(refresh) {
  const response = await fetch(`${API_URL}/api/accounts/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) throw new Error('REFRESH_FAILED');
  return response.json();
}

export const get = (path, opts) => api.request(path, { method: 'GET', ...opts });
export const post = (path, body, opts) => api.request(path, { method: 'POST', body, ...opts });
export const patch = (path, body, opts) => api.request(path, { method: 'PATCH', body, ...opts });
export const del = (path, opts) => api.request(path, { method: 'DELETE', ...opts });

export const apiUpload = {
  upload(path, formData, { onProgress, method = 'POST' } = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const token = useAuthStore.getState().accessToken;
      xhr.open(method, `${API_URL}${path}`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) onProgress(event.loaded / event.total);
      };
      xhr.onload = () => {
        let payload = xhr.responseText;
        try { payload = JSON.parse(xhr.responseText); } catch {}
        if (xhr.status >= 200 && xhr.status < 300) resolve(payload);
        else reject(Object.assign(new Error(`Upload failed: ${xhr.status}`), { status: xhr.status }));
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.onabort = () => reject(new Error('UPLOAD_CANCELLED'));
      xhr.send(formData);
    });
  },
};
