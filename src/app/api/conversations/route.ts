/**
 * GET /api/conversations
 * 会話一覧の取得
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export async function GET() {
  try {
    // 会話一覧を取得（最新順）
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.debug('Fetched conversations', { count: conversations.length });

    return NextResponse.json({ conversations });
  } catch (error) {
    logger.error('Failed to fetch conversations', error);
    const { response, statusCode } = handleError(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
