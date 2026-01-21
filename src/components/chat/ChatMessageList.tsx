'use client';

/**
 * メッセージ一覧コンポーネント
 */

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@/types/chat';

interface ChatMessageListProps {
  messages: Message[];
  loading?: boolean;
}

export function ChatMessageList({ messages, loading }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-500">
            メッセージを送信して会話を始めましょう
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
