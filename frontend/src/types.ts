export interface User {
  id: string;
  login: string;
  username: string;
  role: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens: Tokens;
  user: User;
}

export interface Content {
  id: string;
  author: User;
  text: string;
  likeCount: number;
  repliesCount: number;
}

export interface PageMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PagedContent {
  data: Content[];
  meta: PageMeta;
}

/** Пользователь из user-сервиса (с счётчиками подписок) */
export interface UserProfile extends User {
  followingCount: number;
  followersCount: number;
}

export interface PagedUsers {
  data: UserProfile[];
  meta: PageMeta;
}
