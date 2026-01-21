'use client';

/**
 * チャットメッセージ管理のカスタムフック
 */

import { useState, useEffect, useCallback } from 'react';
import type { Message, ChatResponse } from '@/types/chat';

interface UseChatMessagesReturn {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChatMessages(
  conversationId: string | null
): UseChatMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 会話のメッセージを読み込む
  const loadConversation = useCallback(async (convId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/conversations/${convId}`);

      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }

      const data = await response.json();
      setMessages(data.conversation.messages || []);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // メッセージを送信
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) {
        return;
      }

      try {
        setSending(true);
        setError(null);

        // 楽観的UI更新: ユーザーメッセージを即座に表示
        const tempUserMessage: Message = {
          id: `temp-${Date.now()}`,
          conversationId: conversationId || '',
          role: 'user',
          content: message,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, tempUserMessage]);

        // APIリクエスト
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            message,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data: ChatResponse = await response.json();

        // 一時メッセージを削除し、実際のメッセージを追加
        setMessages((prev) => {
          const withoutTemp = prev.filter((msg) => msg.id !== tempUserMessage.id);

          // サーバーから返されたユーザーメッセージとAIメッセージを追加
          // （サーバー側でユーザーメッセージも保存されているため、会話を再読み込みする方が確実）
          return [
            ...withoutTemp,
            {
              id: tempUserMessage.id,
              conversationId: data.conversationId,
              role: 'user',
              content: message,
              createdAt: new Date(),
            },
            data.message,
          ];
        });

        // 新規会話の場合、会話IDを更新
        if (!conversationId && data.conversationId) {
          // 親コンポーネントで処理するため、ここでは何もしない
          // URLの更新は親コンポーネントで行う
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // エラー時は楽観的更新をロールバック
        setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
        throw err;
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  // メッセージをクリア
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // conversationIdが変更されたら、会話を読み込む
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      clearMessages();
    }
  }, [conversationId, loadConversation, clearMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    loadConversation,
    clearMessages,
  };
}
