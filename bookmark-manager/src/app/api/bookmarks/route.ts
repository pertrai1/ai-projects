import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { createBookmarkSchema } from '@/lib/validation/bookmark';
import { fetchMetadata } from '@/lib/link-preview';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createBookmarkSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { url, title, description, thumbnail } = result.data;

    let metadata = {
      title: title ?? null,
      description: description ?? null,
      thumbnail: thumbnail ?? null,
    };
    if (!title && !description && !thumbnail) {
      const fetched = await fetchMetadata(url);
      metadata = {
        title: fetched.title,
        description: fetched.description,
        thumbnail: fetched.thumbnail,
      };
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title: metadata.title,
        description: metadata.description,
        thumbnail: metadata.thumbnail,
        userId: session.user.id,
      },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error('Create bookmark error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(
      1,
      parseInt(searchParams.get('page') || '1', 10) || 1
    );
    const rawLimit = Math.max(
      1,
      parseInt(searchParams.get('limit') || '20', 10) || 20
    );
    const limit = Math.min(rawLimit, 100);

    const skip = (page - 1) * limit;
    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bookmark.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      data: bookmarks,
      page,
      limit,
      total,
      hasMore: skip + bookmarks.length < total,
    });
  } catch (error) {
    console.error('List bookmarks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
