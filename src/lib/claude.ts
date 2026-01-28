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

    // モック: APIキーがダミー値の場合はモックレスポンスを返す
    const isDummyKey = process.env.ANTHROPIC_API_KEY === 'dummy' ||
                       process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-dummy') ||
                       process.env.ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE';

    if (isDummyKey) {
      // モックレスポンスを生成
      const lastMessage = messages[messages.length - 1];
      const userMessage = lastMessage?.content || 'こんにちは';

      // 簡単な応答を生成
      await new Promise(resolve => setTimeout(resolve, 500)); // 500msの遅延でAPIっぽく見せる

      return `こんにちは！メッセージを受け取りました。あなたは「${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}」とおっしゃいましたね。\n\n現在、このアプリケーションはモックモードで動作しています。実際のClaude APIを使用するには、有効なAnthropic APIキーを設定してください。\n\n詳しくは https://console.anthropic.com/ をご覧ください。`;
    }

    const agent = createClaudeAgent();

    // 最後のメッセージがユーザーからのものであることを確認
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    // 会話履歴をコンテキストとして構築
    const conversationContext = messages.length > 1
      ? messages
          .slice(0, -1)
          .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n')
      : '';

    const prompt = conversationContext
      ? `Previous conversation:\n${conversationContext}\n\nCurrent message:\n${lastMessage.content}`
      : lastMessage.content;

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
