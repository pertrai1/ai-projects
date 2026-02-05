/**
 * Bookmark type definitions
 */

export interface Bookmark {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookmarkRequest {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

export interface UpdateBookmarkRequest {
  url?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

export interface BookmarkResponse {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBookmarksResponse {
  data: BookmarkResponse[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface LinkMetadata {
  title: string | null;
  description: string | null;
  thumbnail: string | null;
}
