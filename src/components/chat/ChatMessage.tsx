'use client';

/**
 * 個別メッセージコンポーネント
 */

import { memo } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { formatRelativeTime } from '@/lib/utils';
import type { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-blue-100 text-gray-900 dark:bg-blue-800 dark:text-gray-100'
        }`}
      >
        <div className="text-sm">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
        <div
          className={`mt-2 text-xs ${
            isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {formatRelativeTime(new Date(message.createdAt))}
        </div>
      </div>
    </div>
  );
});
