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
import { fetchMetadata } from '@/lib/link-preview';
import { POST } from '@/app/api/bookmarks/route';

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

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/bookmarks', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/bookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.bookmark.create).mockResolvedValue(mockBookmark);
    vi.mocked(fetchMetadata).mockResolvedValue({
      title: 'Fetched Title',
      description: 'Fetched Description',
      thumbnail: 'https://example.com/og.jpg',
    });
  });

  it('creates bookmark with URL only and auto-fetches metadata', async () => {
    const response = await POST(createRequest({ url: 'https://example.com' }));

    expect(response.status).toBe(201);
    expect(fetchMetadata).toHaveBeenCalledWith('https://example.com');
    expect(prisma.bookmark.create).toHaveBeenCalledWith({
      data: {
        url: 'https://example.com',
        title: 'Fetched Title',
        description: 'Fetched Description',
        thumbnail: 'https://example.com/og.jpg',
        userId: 'user-1',
      },
    });
  });

  it('creates bookmark with custom metadata and skips auto-fetch', async () => {
    const body = {
      url: 'https://example.com',
      title: 'Custom Title',
      description: 'Custom Desc',
      thumbnail: 'https://example.com/custom.jpg',
    };
    const response = await POST(createRequest(body));

    expect(response.status).toBe(201);
    expect(fetchMetadata).not.toHaveBeenCalled();
    expect(prisma.bookmark.create).toHaveBeenCalledWith({
      data: {
        url: 'https://example.com',
        title: 'Custom Title',
        description: 'Custom Desc',
        thumbnail: 'https://example.com/custom.jpg',
        userId: 'user-1',
      },
    });
  });

  it('returns 201 with bookmark data including ID', async () => {
    const response = await POST(createRequest({ url: 'https://example.com' }));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('url');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('description');
    expect(data).toHaveProperty('thumbnail');
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('createdAt');
    expect(data).toHaveProperty('updatedAt');
  });

  it('returns 401 for unauthenticated requests', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await POST(createRequest({ url: 'https://example.com' }));

    expect(response.status).toBe(401);
    expect(prisma.bookmark.create).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid URL format', async () => {
    const response = await POST(createRequest({ url: 'not-a-url' }));

    expect(response.status).toBe(400);
    expect(prisma.bookmark.create).not.toHaveBeenCalled();
  });

  it('returns 400 for non-HTTP(S) protocols', async () => {
    const response = await POST(createRequest({ url: 'ftp://example.com' }));

    expect(response.status).toBe(400);
    expect(prisma.bookmark.create).not.toHaveBeenCalled();
  });

  it('returns 400 for private IP addresses (SSRF prevention)', async () => {
    const response = await POST(createRequest({ url: 'http://192.168.1.1' }));

    expect(response.status).toBe(400);
    expect(prisma.bookmark.create).not.toHaveBeenCalled();
  });

  it('returns 400 for URLs exceeding 2048 characters', async () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2100);
    const response = await POST(createRequest({ url: longUrl }));

    expect(response.status).toBe(400);
    expect(prisma.bookmark.create).not.toHaveBeenCalled();
  });

  it('returns 400 for dangerous thumbnail URL protocol', async () => {
    const body = {
      url: 'https://example.com',
      thumbnail: 'javascript:alert(1)',
    };
    const response = await POST(createRequest(body));

    expect(response.status).toBe(400);
    expect(prisma.bookmark.create).not.toHaveBeenCalled();
  });

  it('creates bookmark even if metadata fetch fails', async () => {
    vi.mocked(fetchMetadata).mockResolvedValue({
      title: null,
      description: null,
      thumbnail: null,
    });

    const response = await POST(createRequest({ url: 'https://example.com' }));

    expect(response.status).toBe(201);
    expect(prisma.bookmark.create).toHaveBeenCalledWith({
      data: {
        url: 'https://example.com',
        title: null,
        description: null,
        thumbnail: null,
        userId: 'user-1',
      },
    });
  });
});
