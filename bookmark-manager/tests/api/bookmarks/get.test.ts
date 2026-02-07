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

import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { GET } from '@/app/api/bookmarks/[id]/route';

const mockSession = {
  user: { id: 'user-1', email: 'test@example.com' },
  expires: '2099-01-01',
};

const mockBookmark = {
  id: 'bookmark-1',
  url: 'https://example.com',
  title: 'Example',
  description: 'An example site',
  thumbnail: 'https://example.com/image.jpg',
  userId: 'user-1',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

function createRequest(id: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/bookmarks/${id}`);
}

function createParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/bookmarks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(mockBookmark);
  });

  it('gets bookmark by ID for owner', async () => {
    const response = await GET(
      createRequest('bookmark-1'),
      createParams('bookmark-1')
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('bookmark-1');
    expect(data.url).toBe('https://example.com');
  });

  it('returns 404 for non-existent bookmark ID', async () => {
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(null);

    const response = await GET(
      createRequest('nonexistent'),
      createParams('nonexistent')
    );

    expect(response.status).toBe(404);
  });

  it('returns 403 for bookmark owned by different user', async () => {
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue({
      ...mockBookmark,
      userId: 'user-2',
    });

    const response = await GET(
      createRequest('bookmark-1'),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(403);
  });

  it('returns 401 for unauthenticated requests', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET(
      createRequest('bookmark-1'),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(401);
    expect(prisma.bookmark.findUnique).not.toHaveBeenCalled();
  });

  it('returns complete bookmark data (all fields)', async () => {
    const response = await GET(
      createRequest('bookmark-1'),
      createParams('bookmark-1')
    );
    const data = await response.json();

    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('url');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('description');
    expect(data).toHaveProperty('thumbnail');
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('createdAt');
    expect(data).toHaveProperty('updatedAt');
  });
});
