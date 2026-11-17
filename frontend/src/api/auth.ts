import { authClient } from './client';
import type { AuthResponse, Tokens, User } from '../types';

export const authApi = {
  login: async (login: string, password: string): Promise<AuthResponse> => {
    const { data } = await authClient.post('/login', { login, password });
    return data;
  },

  register: async (login: string, password: string, username: string): Promise<AuthResponse> => {
    const { data } = await authClient.post('/register', { login, password, username });
    return data;
  },

  logout: async (): Promise<void> => {
    await authClient.get('/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await authClient.get('/');
    return data;
  },

  saveTokens: (t: Tokens) => {
    localStorage.setItem('accessToken', t.accessToken);
    localStorage.setItem('refreshToken', t.refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
