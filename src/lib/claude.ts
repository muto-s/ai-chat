/**
 * Claude API統合（Mastra使用）
 */

import { Agent } from '@mastra/core/agent';
import type { Role } from '@/types/chat';

/**
 * Claude Agentインスタンスの作成
 */
const createClaudeAgent = () => {
  return new Agent({
    id: 'ai-chat-assistant',
    name: 'AI Chat Assistant',
    instructions: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions.',
    model: 'anthropic/claude-3-5-sonnet-20241022',
  });
};

/**
 * Claudeにメッセージを送信して応答を取得
 * @param messages 会話履歴（ユーザーとアシスタントのメッセージ）
 * @returns Claudeの応答テキスト
 */
export async function sendMessageToClaude(
  messages: Array<{ role: Role; content: string }>
): Promise<string> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const agent = createClaudeAgent();

    // Mastraが期待する形式に変換
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // メッセージ生成（最後のメッセージを使用）
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    // 会話履歴がある場合は、コンテキストとして含める
    // Mastraは会話履歴を自動で管理しないため、プロンプトに含める
    let prompt = lastMessage.content;

    if (formattedMessages.length > 1) {
      // 会話履歴をコンテキストとして追加
      const history = formattedMessages
        .slice(0, -1)
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      prompt = `Previous conversation:\n${history}\n\nCurrent message:\n${lastMessage.content}`;
    }

    const response = await agent.generate(prompt);

    if (!response || typeof response.text !== 'string') {
      throw new Error('Invalid response from Claude API');
    }

    return response.text;
  } catch (error) {
    console.error('Error in sendMessageToClaude:', error);

    if (error instanceof Error) {
      throw new Error(`Claude API Error: ${error.message}`);
    }

    throw new Error('Unknown error occurred while calling Claude API');
  }
}
