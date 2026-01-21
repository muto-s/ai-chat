'use client';

/**
 * チャット入力コンポーネント
 */

import { useState, KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter送信、Shift+Enterで改行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Shift+Enterで改行)"
          disabled={disabled}
          className="min-h-[60px] resize-none"
          maxLength={5000}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="self-end"
        >
          送信
        </Button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {message.length} / 5000文字
      </p>
    </div>
  );
}
