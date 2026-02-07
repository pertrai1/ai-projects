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
import { DELETE } from '@/app/api/bookmarks/[id]/route';

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
  return new NextRequest(`http://localhost:3000/api/bookmarks/${id}`, {
    method: 'DELETE',
  });
}

function createParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('DELETE /api/bookmarks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(mockBookmark);
    vi.mocked(prisma.bookmark.delete).mockResolvedValue(mockBookmark);
  });

  it('deletes bookmark and returns 204 No Content', async () => {
    const response = await DELETE(
      createRequest('bookmark-1'),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(204);
  });

  it('removes bookmark from database', async () => {
    await DELETE(createRequest('bookmark-1'), createParams('bookmark-1'));

    expect(prisma.bookmark.delete).toHaveBeenCalledWith({
      where: { id: 'bookmark-1' },
    });
  });

  it('returns 404 for non-existent bookmark ID', async () => {
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(null);

    const response = await DELETE(
      createRequest('nonexistent'),
      createParams('nonexistent')
    );

    expect(response.status).toBe(404);
    expect(prisma.bookmark.delete).not.toHaveBeenCalled();
  });

  it('returns 403 for bookmark owned by different user', async () => {
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue({
      ...mockBookmark,
      userId: 'user-2',
    });

    const response = await DELETE(
      createRequest('bookmark-1'),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(403);
    expect(prisma.bookmark.delete).not.toHaveBeenCalled();
  });

  it('returns 401 for unauthenticated requests', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await DELETE(
      createRequest('bookmark-1'),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(401);
    expect(prisma.bookmark.delete).not.toHaveBeenCalled();
  });
});
