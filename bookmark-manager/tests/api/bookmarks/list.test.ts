import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    bookmark: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/link-preview', () => ({
  fetchMetadata: vi.fn(),
}));

import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { GET } from '@/app/api/bookmarks/route';

const mockSession = {
  user: { id: 'user-1', email: 'test@example.com' },
  expires: '2099-01-01',
};

const mockBookmarks = [
  {
    id: 'bookmark-1',
    url: 'https://example.com',
    title: 'Example',
    description: 'An example',
    thumbnail: null,
    userId: 'user-1',
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: 'bookmark-2',
    url: 'https://test.com',
    title: 'Test',
    description: null,
    thumbnail: null,
    userId: 'user-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

function createRequest(query = ''): NextRequest {
  return new NextRequest(`http://localhost:3000/api/bookmarks${query}`);
}

describe('GET /api/bookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.bookmark.findMany).mockResolvedValue(mockBookmarks);
    vi.mocked(prisma.bookmark.count).mockResolvedValue(2);
  });

  it('lists bookmarks with default pagination (page 1, limit 20)', async () => {
    const response = await GET(createRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.page).toBe(1);
    expect(data.limit).toBe(20);
    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
      })
    );
  });

  it('lists bookmarks with custom pagination parameters', async () => {
    const response = await GET(createRequest('?page=2&limit=10'));

    expect(response.status).toBe(200);
    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it('enforces maximum limit of 100 items', async () => {
    const response = await GET(createRequest('?limit=200'));

    expect(response.status).toBe(200);
    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 100,
      })
    );
  });

  it('returns pagination metadata (page, limit, total, hasMore)', async () => {
    vi.mocked(prisma.bookmark.count).mockResolvedValue(50);
    vi.mocked(prisma.bookmark.findMany).mockResolvedValue(mockBookmarks);

    const response = await GET(createRequest('?page=1&limit=2'));
    const data = await response.json();

    expect(data).toHaveProperty('page', 1);
    expect(data).toHaveProperty('limit', 2);
    expect(data).toHaveProperty('total', 50);
    expect(data).toHaveProperty('hasMore', true);
  });

  it('returns empty array for user with no bookmarks', async () => {
    vi.mocked(prisma.bookmark.findMany).mockResolvedValue([]);
    vi.mocked(prisma.bookmark.count).mockResolvedValue(0);

    const response = await GET(createRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.total).toBe(0);
    expect(data.hasMore).toBe(false);
  });

  it("returns only authenticated user's bookmarks", async () => {
    await GET(createRequest());

    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
      })
    );
    expect(prisma.bookmark.count).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });

  it('returns 401 for unauthenticated requests', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    expect(prisma.bookmark.findMany).not.toHaveBeenCalled();
  });

  it('orders bookmarks by createdAt DESC (newest first)', async () => {
    await GET(createRequest());

    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    );
  });
});
