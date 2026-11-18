import { contentClient } from './client';
import type { Content, PagedContent } from '../types';

export interface PageParams {
  page: number;
  limit: number;
}

export const contentApi = {
  feed: async ({ page, limit }: PageParams): Promise<PagedContent> => {
    const { data } = await contentClient.get('/', { params: { page, limit } });
    return data;
  },

  byUser: async (userId: string, { page, limit }: PageParams): Promise<PagedContent> => {
    const { data } = await contentClient.get(`/byUser/${userId}`, { params: { page, limit } });
    return data;
  },

  replies: async (parentId: string, { page, limit }: PageParams): Promise<PagedContent> => {
    const { data } = await contentClient.get(`/replies/${parentId}`, { params: { page, limit } });
    return data;
  },

  /** Ответ на определённый пост: Response: {data:{...}} */
  getById: async (contentId: string): Promise<Content> => {
    const { data } = await contentClient.get(`/id/${contentId}`);
    return data.data;
  },

  create: async (text: string): Promise<Content> => {
    const { data } = await contentClient.post('/create', { text });
    return data;
  },

  reply: async (text: string, parentId: string): Promise<Content> => {
    const { data } = await contentClient.post('/replie', { text, parentId });
    return data;
  },

  like: async (contentId: string): Promise<void> => {
    await contentClient.get(`/like/${contentId}`);
  },

  unlike: async (contentId: string): Promise<void> => {
    await contentClient.get(`/unlike/${contentId}`);
  },

  isLiked: async (contentId: string): Promise<boolean> => {
    const { data } = await contentClient.get(`/liked/${contentId}`);
    return data.response;
  },
};
