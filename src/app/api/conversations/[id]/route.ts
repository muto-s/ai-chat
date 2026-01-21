/**
 * GET /api/conversations/:id - 特定の会話と全メッセージの取得
 * DELETE /api/conversations/:id - 会話の削除
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { APIError, handleError } from '@/utils/errors';
import { logger } from '@/utils/logger';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/conversations/:id
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 会話IDのバリデーション
    if (!id || typeof id !== 'string') {
      throw new APIError('INVALID_REQUEST', 'Invalid conversation ID', 400);
    }

    // 会話とメッセージを取得
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new APIError('CONVERSATION_NOT_FOUND', 'Conversation not found', 404);
    }

    logger.debug('Fetched conversation', {
      conversationId: id,
      messageCount: conversation.messages.length,
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    logger.error('Failed to fetch conversation', error);
    const { response, statusCode } = handleError(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

/**
 * DELETE /api/conversations/:id
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 会話IDのバリデーション
    if (!id || typeof id !== 'string') {
      throw new APIError('INVALID_REQUEST', 'Invalid conversation ID', 400);
    }

    // 会話が存在するか確認
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new APIError('CONVERSATION_NOT_FOUND', 'Conversation not found', 404);
    }

    // 会話を削除（カスケード削除でメッセージも削除される）
    await prisma.conversation.delete({
      where: { id },
    });

    logger.info('Deleted conversation', { conversationId: id });

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    logger.error('Failed to delete conversation', error);
    const { response, statusCode } = handleError(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
