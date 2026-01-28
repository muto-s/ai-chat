/**
 * POST /api/chat
 * チャットメッセージの送信
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendMessageToClaude } from '@/lib/claude';
import { generateConversationTitle } from '@/lib/utils';
import { APIError, handleError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import type { ChatResponse } from '@/types/chat';

// リクエストバリデーションスキーマ
const chatRequestSchema = z.object({
  conversationId: z.string().nullish(), // null と undefined の両方を許可
  message: z.string().min(1).max(5000),
});

export async function POST(request: Request) {
  try {
    // リクエストボディの解析
    const body = await request.json();

    logger.debug('Received request body', { body });

    // バリデーション
    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      logger.error('Validation failed', {
        errors: validationResult.error.errors,
        body,
      });
      throw new APIError(
        'INVALID_REQUEST',
        validationResult.error.errors[0]?.message || 'Invalid request',
        400
      );
    }

    const { conversationId, message } = validationResult.data;

    logger.debug('Received chat request', {
      conversationId,
      messageLength: message.length,
    });

    // 会話の取得または作成
    let conversation;
    if (conversationId) {
      // 既存の会話を取得
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });

      if (!conversation) {
        throw new APIError('CONVERSATION_NOT_FOUND', 'Conversation not found', 404);
      }
    } else {
      // 新規会話を作成
      const title = generateConversationTitle(message);
      conversation = await prisma.conversation.create({
        data: {
          title,
        },
        include: { messages: true },
      });

      logger.info('Created new conversation', { conversationId: conversation.id });
    }

    // ユーザーメッセージを保存
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // 会話履歴を構築（Claude APIに送信）
    const conversationHistory = [
      ...conversation.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Claude APIにリクエスト
    let assistantResponse: string;
    try {
      assistantResponse = await sendMessageToClaude(conversationHistory);
    } catch (error) {
      logger.error('Claude API error', error);
      throw new APIError(
        'CLAUDE_API_ERROR',
        error instanceof Error ? error.message : 'Failed to get response from Claude',
        500
      );
    }

    // アシスタントメッセージを保存
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantResponse,
      },
    });

    // 会話の更新日時を更新
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    logger.info('Chat response generated', {
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      assistantMessageId: assistantMessage.id,
    });

    // レスポンス
    const response: ChatResponse = {
      conversationId: conversation.id,
      message: {
        id: assistantMessage.id,
        conversationId: assistantMessage.conversationId,
        role: 'assistant',
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error in POST /api/chat', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    const { response, statusCode } = handleError(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
