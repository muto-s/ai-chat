'use client';

/**
 * 会話一覧コンポーネント
 */

import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@/types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  loading,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-sm text-gray-500">
          会話がありません
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-2">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            onClick={() => onSelectConversation(conversation.id)}
            onDelete={onDeleteConversation}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
