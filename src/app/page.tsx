'use client';

/**
 * メインページ - AIチャットアプリケーション
 */

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatContainer } from '@/components/chat/ChatContainer';

export default function Home() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* サイドバー */}
      <Sidebar
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        className="hidden md:flex"
      />

      {/* メインチャットエリア */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="border-b bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-semibold">
            {activeConversationId ? 'AI Chat' : '新規会話'}
          </h1>
        </header>

        {/* チャットコンテナ */}
        <div className="flex-1 overflow-hidden">
          <ChatContainer
            conversationId={activeConversationId}
            onNewConversation={handleSelectConversation}
          />
        </div>
      </main>

      {/* モバイル用サイドバー（オプション） */}
      <div className="fixed inset-y-0 left-0 z-50 md:hidden">
        <Sidebar
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      </div>
    </div>
  );
}
