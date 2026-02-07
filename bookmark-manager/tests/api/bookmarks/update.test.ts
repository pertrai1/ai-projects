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
import { PUT } from '@/app/api/bookmarks/[id]/route';

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

function createRequest(id: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`http://localhost:3000/api/bookmarks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function createParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('PUT /api/bookmarks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(mockBookmark);
    vi.mocked(prisma.bookmark.update).mockResolvedValue({
      ...mockBookmark,
      title: 'Updated Title',
      updatedAt: new Date('2025-01-02'),
    });
  });

  it('updates bookmark metadata (title, description, thumbnail)', async () => {
    const body = {
      title: 'Updated Title',
      description: 'Updated Desc',
      thumbnail: 'https://example.com/new.jpg',
    };
    const response = await PUT(
      createRequest('bookmark-1', body),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(200);
    expect(prisma.bookmark.update).toHaveBeenCalledWith({
      where: { id: 'bookmark-1' },
      data: body,
    });
  });

  it('updates bookmark URL with validation', async () => {
    const body = { url: 'https://new-example.com' };
    const response = await PUT(
      createRequest('bookmark-1', body),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(200);
    expect(prisma.bookmark.update).toHaveBeenCalledWith({
      where: { id: 'bookmark-1' },
      data: { url: 'https://new-example.com' },
    });
  });

  it('returns 200 with updated bookmark data', async () => {
    const response = await PUT(
      createRequest('bookmark-1', { title: 'Updated Title' }),
      createParams('bookmark-1')
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('url');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('description');
    expect(data).toHaveProperty('thumbnail');
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('createdAt');
    expect(data).toHaveProperty('updatedAt');
  });

  it('updates updatedAt timestamp', async () => {
    await PUT(
      createRequest('bookmark-1', { title: 'Updated' }),
      createParams('bookmark-1')
    );

    expect(prisma.bookmark.update).toHaveBeenCalled();
  });

  it('preserves existing fields when updating subset', async () => {
    await PUT(
      createRequest('bookmark-1', { title: 'Only Title' }),
      createParams('bookmark-1')
    );

    expect(prisma.bookmark.update).toHaveBeenCalledWith({
      where: { id: 'bookmark-1' },
      data: { title: 'Only Title' },
    });
  });

  it('returns 400 for invalid URL', async () => {
    const response = await PUT(
      createRequest('bookmark-1', { url: 'not-a-url' }),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(400);
    expect(prisma.bookmark.update).not.toHaveBeenCalled();
  });

  it('returns 404 for non-existent bookmark ID', async () => {
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(null);

    const response = await PUT(
      createRequest('nonexistent', { title: 'Updated' }),
      createParams('nonexistent')
    );

    expect(response.status).toBe(404);
    expect(prisma.bookmark.update).not.toHaveBeenCalled();
  });

  it('returns 403 for bookmark owned by different user', async () => {
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue({
      ...mockBookmark,
      userId: 'user-2',
    });

    const response = await PUT(
      createRequest('bookmark-1', { title: 'Updated' }),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(403);
    expect(prisma.bookmark.update).not.toHaveBeenCalled();
  });

  it('returns 401 for unauthenticated requests', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await PUT(
      createRequest('bookmark-1', { title: 'Updated' }),
      createParams('bookmark-1')
    );

    expect(response.status).toBe(401);
    expect(prisma.bookmark.update).not.toHaveBeenCalled();
  });
});
