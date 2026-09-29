import axios from 'axios';
import Constants from 'expo-constants';

import { useAuthStore } from '../stores/authStore';

export const USE_MOCK_DATA = Constants.expoConfig?.extra?.useMockData ?? true;
export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.0.148:8000';

export function isNetworkError(err) {
  return err?.message === 'NETWORK_ERROR' || err?.code === 'ERR_NETWORK';
}

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the current access token to every request. Read from the store
// at request time (an interceptor, not something captured once at
// client-creation time) — the token changes across login/logout/refresh,
// and this always reflects whatever's current. Pass { auth: false } in a
// call's options to skip this (public endpoints).
client.interceptors.request.use((config) => {
  if (config.auth !== false) {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Shared in-flight refresh promise: if several requests 401 at once (e.g.
// a screen fires off three parallel fetches right as the access token
// expires), they should all await the SAME refresh call rather than each
// triggering their own — the backend would otherwise see redundant
// refresh requests, and only the first would actually still be valid
// depending on refresh-token rotation.
let refreshPromise = null;

async function refreshTokens() {
  const { refreshToken, setTokens } = useAuthStore.getState();
  if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');
  const response = await axios.post(`${API_URL}/api/accounts/token/refresh/`, { refresh: refreshToken });
  setTokens({ access: response.data.access, refresh: refreshToken });
  return response.data.access;
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) {
      throw new Error('NETWORK_ERROR');
    }

    if (response.status === 401 && config.auth !== false && !config._retried) {
      config._retried = true;
      try {
        refreshPromise = refreshPromise || refreshTokens();
        const newAccessToken = await refreshPromise;
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(config);
      } catch {
        useAuthStore.getState().logout();
        throw new Error('SESSION_EXPIRED');
      } finally {
        refreshPromise = null;
      }
    }

    const data = response.data || {};
    const message = data?.error?.message || data?.detail || `Request failed (${response.status})`;
    const normalized = new Error(message);
    normalized.status = response.status;
    normalized.details = data?.error?.details;
    throw normalized;
  }
);

export const get = (path, opts = {}) => client.get(path, opts).then((r) => r.data);
export const post = (path, body, opts = {}) => client.post(path, body, opts).then((r) => r.data);
export const patch = (path, body, opts = {}) => client.patch(path, body, opts).then((r) => r.data);
export const del = (path, opts = {}) => client.delete(path, opts).then((r) => r.data);

// Kept for any call site still using the older api.request(...) shape.
export const api = {
  request: (path, { method = 'GET', body, ...opts } = {}) =>
    client.request({ url: path, method, data: body, ...opts }).then((r) => r.data),
};

export const apiUpload = {
  // axios handles multipart FormData and upload progress natively — this
  // replaces what used to be a hand-rolled XMLHttpRequest wrapper.
  upload(path, formData, { onProgress, method = 'post' } = {}) {
    return client
      .request({
        url: path,
        method,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total && onProgress) onProgress(event.loaded / event.total);
        },
      })
      .then((r) => r.data);
  },
};
