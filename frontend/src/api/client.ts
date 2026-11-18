import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Auth service (separate microservice) */
export const authClient = axios.create({ baseURL: `${API_URL}/auth` });

/** Content service (separate microservice) */
export const contentClient = axios.create({ baseURL: `${API_URL}/content` });

/** User service (separate microservice).
 *  Часть маршрутов описана без префикса (/id/:userId, /followers/:userId и т.д.),
 *  поэтому запросы к нему идут от корня API. */
export const userClient = axios.create({ baseURL: `${API_URL}/user` });

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken as string;
}

function attachInterceptors(client: typeof authClient) {
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      const status = error.response?.status;
      const isAuthCall = original?.url?.includes('/refresh') || original?.url?.includes('/login');
      if (status === 401 && !original._retry && !isAuthCall) {
        original._retry = true;
        try {
          if (!localStorage.getItem('refreshToken')) throw new Error('No refresh token');
          refreshPromise ??= refreshAccessToken().finally(() => (refreshPromise = null));
          const token = await refreshPromise;
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          onUnauthorized?.();
        }
      }
      return Promise.reject(error);
    },
  );
}

attachInterceptors(authClient);
attachInterceptors(contentClient);
attachInterceptors(userClient);
