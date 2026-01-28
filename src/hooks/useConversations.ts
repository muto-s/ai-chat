'use client';

/**
 * 会話一覧管理のカスタムフック
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Conversation } from '@/types/chat';

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/conversations');

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error('会話一覧の取得に失敗しました', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/conversations/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete conversation');
        }

        // ローカル状態から削除
        setConversations((prev) => prev.filter((conv) => conv.id !== id));
        toast.success('会話を削除しました');
      } catch (err) {
        console.error('Error deleting conversation:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast.error('会話の削除に失敗しました', {
          description: errorMessage,
        });
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    deleteConversation,
  };
}
