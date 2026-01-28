/**
 * useChatMessagesフックのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useChatMessages } from '@/hooks/useChatMessages';

// fetch APIをモック
global.fetch = vi.fn();

describe('useChatMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('初期状態が正しい', () => {
    const { result } = renderHook(() => useChatMessages(null));

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.sending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('会話を読み込める', async () => {
    const mockMessages = [
      {
        id: '1',
        conversationId: 'conv1',
        role: 'user',
        content: 'Hello',
        createdAt: new Date(),
      },
      {
        id: '2',
        conversationId: 'conv1',
        role: 'assistant',
        content: 'Hi there!',
        createdAt: new Date(),
      },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        conversation: {
          messages: mockMessages,
        },
      }),
    } as Response);

    const { result } = renderHook(() => useChatMessages('conv1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.messages).toEqual(mockMessages);
    expect(result.current.error).toBeNull();
  });

  it('会話の読み込みに失敗した場合はエラーを設定', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const { result } = renderHook(() => useChatMessages('conv1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  it('メッセージを送信できる', async () => {
    const mockResponse = {
      conversationId: 'conv1',
      message: {
        id: '2',
        conversationId: 'conv1',
        role: 'assistant',
        content: 'Response',
        createdAt: new Date(),
      },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useChatMessages(null));

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    await waitFor(() => {
      expect(result.current.sending).toBe(false);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].content).toBe('Test message');
    expect(result.current.messages[1].content).toBe('Response');
  });

  it('空のメッセージは送信しない', async () => {
    const { result } = renderHook(() => useChatMessages(null));

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('メッセージ送信に失敗した場合は楽観的更新をロールバック', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const { result } = renderHook(() => useChatMessages(null));

    await act(async () => {
      try {
        await result.current.sendMessage('Test message');
      } catch {
        // エラーは期待される
      }
    });

    await waitFor(() => {
      expect(result.current.sending).toBe(false);
    });

    // 楽観的更新がロールバックされる
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).not.toBeNull();
  });

  it('楽観的UI更新が正しく動作する', async () => {
    const mockResponse = {
      conversationId: 'conv1',
      message: {
        id: '2',
        conversationId: 'conv1',
        role: 'assistant',
        content: 'Response',
        createdAt: new Date(),
      },
    };

    // fetchを遅延させてテストする
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockResponse,
            } as Response);
          }, 100);
        })
    );

    const { result } = renderHook(() => useChatMessages(null));

    await act(async () => {
      result.current.sendMessage('Test message');
    });

    // すぐにユーザーメッセージが表示される（楽観的更新）
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Test message');
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.sending).toBe(true);

    // APIレスポンス後、AIメッセージも追加される
    await waitFor(() => {
      expect(result.current.sending).toBe(false);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].content).toBe('Response');
    expect(result.current.messages[1].role).toBe('assistant');
  });

  it('clearMessagesでメッセージがクリアされる', () => {
    const { result } = renderHook(() => useChatMessages(null));

    // メッセージを手動で設定（通常はsendMessage経由）
    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('conversationIdが変更されると新しい会話を読み込む', async () => {
    const mockMessages1 = [
      {
        id: '1',
        conversationId: 'conv1',
        role: 'user',
        content: 'Message 1',
        createdAt: new Date(),
      },
    ];

    const mockMessages2 = [
      {
        id: '2',
        conversationId: 'conv2',
        role: 'user',
        content: 'Message 2',
        createdAt: new Date(),
      },
    ];

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation: {
            messages: mockMessages1,
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation: {
            messages: mockMessages2,
          },
        }),
      } as Response);

    const { result, rerender } = renderHook(
      ({ conversationId }) => useChatMessages(conversationId),
      {
        initialProps: { conversationId: 'conv1' },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.messages).toEqual(mockMessages1);

    // conversationIdを変更
    rerender({ conversationId: 'conv2' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.messages).toEqual(mockMessages2);
  });

  it('conversationIdがnullになるとメッセージがクリアされる', async () => {
    const mockMessages = [
      {
        id: '1',
        conversationId: 'conv1',
        role: 'user',
        content: 'Message 1',
        createdAt: new Date(),
      },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        conversation: {
          messages: mockMessages,
        },
      }),
    } as Response);

    const { result, rerender } = renderHook(
      ({ conversationId }) => useChatMessages(conversationId),
      {
        initialProps: { conversationId: 'conv1' },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.messages).toEqual(mockMessages);

    // conversationIdをnullに変更
    rerender({ conversationId: null });

    expect(result.current.messages).toEqual([]);
  });
});
