'use client';

/**
 * チャット画面全体のコンテナ
 */

import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { useChatMessages } from '@/hooks/useChatMessages';

interface ChatContainerProps {
  conversationId: string | null;
  onNewConversation?: (conversationId: string) => void;
}

export function ChatContainer({
  conversationId,
  onNewConversation,
}: ChatContainerProps) {
  const { messages, loading, sending, sendMessage } = useChatMessages(conversationId);

  const handleSend = async (message: string) => {
    try {
      await sendMessage(message);

      // 新規会話の場合、会話IDを親に通知
      if (!conversationId && onNewConversation) {
        // メッセージ送信後、APIから返されたconversationIdを取得するため
        // ここでは実装をシンプルにするため、親コンポーネントでリフレッシュする
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ChatMessageList messages={messages} loading={loading} />
      </div>
      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
}
