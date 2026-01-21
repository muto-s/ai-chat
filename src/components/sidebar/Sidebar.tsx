'use client';

/**
 * サイドバー全体のコンポーネント
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NewChatButton } from './NewChatButton';
import { ConversationList } from './ConversationList';
import { useConversations } from '@/hooks/useConversations';

interface SidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  className?: string;
}

export function Sidebar({
  activeConversationId,
  onSelectConversation,
  onNewChat,
  className,
}: SidebarProps) {
  const { conversations, loading, deleteConversation, refetch } = useConversations();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation(id);

      // 削除した会話がアクティブだった場合、新規会話に遷移
      if (id === activeConversationId) {
        onNewChat();
      }

      // 会話一覧を再取得
      await refetch();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  if (isCollapsed) {
    return (
      <div className={`flex w-16 flex-col border-r bg-white p-2 dark:border-gray-800 dark:bg-gray-900 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          →
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex w-64 flex-col border-r bg-white dark:border-gray-800 dark:bg-gray-900 ${className}`}>
      <div className="flex items-center justify-between border-b p-4 dark:border-gray-800">
        <h2 className="text-lg font-semibold">会話</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="md:hidden"
        >
          ←
        </Button>
      </div>

      <div className="p-4">
        <NewChatButton onClick={onNewChat} />
      </div>

      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={handleDelete}
        loading={loading}
      />
    </div>
  );
}
