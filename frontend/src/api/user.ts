import { userClient } from './client';
import type { PagedUsers, UserProfile } from '../types';

export interface PageParams {
  page: number;
  limit: number;
}

export const userApi = {
  /** Список пользователей */
  list: async ({ page, limit }: PageParams): Promise<PagedUsers> => {
    const { data } = await userClient.get('/user', { params: { page, limit } });
    return data;
  },

  /** Данные определённого пользователя */
  getById: async (userId: string): Promise<UserProfile> => {
    const { data } = await userClient.get(`/id/${userId}`);
    return data.data;
  },

  /** Список подписчиков пользователя */
  followers: async (userId: string, { page, limit }: PageParams): Promise<PagedUsers> => {
    const { data } = await userClient.get(`/followers/${userId}`, { params: { page, limit } });
    return data;
  },

  /** Список подписок пользователя */
  followings: async (userId: string, { page, limit }: PageParams): Promise<PagedUsers> => {
    const { data } = await userClient.get(`/followings/${userId}`, { params: { page, limit } });
    return data;
  },

  /** Подписаться на пользователя */
  follow: async (userId: string): Promise<void> => {
    await userClient.get(`/follow/${userId}`);
  },

  /** Отписаться от пользователя */
  unfollow: async (userId: string): Promise<void> => {
    await userClient.get(`/unfollow/${userId}`);
  },
};
