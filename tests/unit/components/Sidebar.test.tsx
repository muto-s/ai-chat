/**
 * Sidebarコンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useConversations } from '@/hooks/useConversations';

// useConversationsフックをモック
vi.mock('@/hooks/useConversations');

const mockConversations = [
  {
    id: '1',
    title: 'テスト会話1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    messages: [],
  },
  {
    id: '2',
    title: 'テスト会話2',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    messages: [],
  },
];

describe('Sidebar', () => {
  const mockOnSelectConversation = vi.fn();
  const mockOnNewChat = vi.fn();
  const mockDeleteConversation = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useConversations as ReturnType<typeof vi.fn>).mockReturnValue({
      conversations: mockConversations,
      loading: false,
      error: null,
      deleteConversation: mockDeleteConversation,
      refetch: mockRefetch,
    });
  });

  it('サイドバーが正しく表示される', () => {
    render(
      <Sidebar
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('会話')).toBeInTheDocument();
  });

  it('会話一覧が表示される', () => {
    render(
      <Sidebar
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('テスト会話1')).toBeInTheDocument();
    expect(screen.getByText('テスト会話2')).toBeInTheDocument();
  });

  it('新規会話ボタンが動作する', () => {
    render(
      <Sidebar
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onNewChat={mockOnNewChat}
      />
    );

    const newChatButton = screen.getByText('+ 新規会話');
    fireEvent.click(newChatButton);

    expect(mockOnNewChat).toHaveBeenCalledTimes(1);
  });

  it('会話を削除すると、アクティブな会話の場合は新規会話に遷移する', async () => {
    mockDeleteConversation.mockResolvedValue(undefined);
    mockRefetch.mockResolvedValue(undefined);

    render(
      <Sidebar
        activeConversationId="1"
        onSelectConversation={mockOnSelectConversation}
        onNewChat={mockOnNewChat}
      />
    );

    // 会話アイテムをホバーして削除ボタンを表示
    const conversationItem = screen.getByText('テスト会話1').closest('div');
    if (conversationItem) {
      fireEvent.mouseEnter(conversationItem);
    }

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) => btn.textContent === '🗑️');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // 削除確認ダイアログの削除ボタンをクリック
    await waitFor(() => {
      const confirmDeleteButton = screen.getByText('削除');
      fireEvent.click(confirmDeleteButton);
    });

    await waitFor(() => {
      expect(mockDeleteConversation).toHaveBeenCalledWith('1');
      expect(mockOnNewChat).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('折りたたみボタンをクリックするとサイドバーが折りたたまれる', () => {
    render(
      <Sidebar
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onNewChat={mockOnNewChat}
      />
    );

    const collapseButton = screen.getByText('←');
    fireEvent.click(collapseButton);

    // 折りたたまれた状態では会話一覧が表示されない
    expect(screen.queryByText('テスト会話1')).not.toBeInTheDocument();
  });

  it('折りたたまれた状態から展開できる', () => {
    render(
      <Sidebar
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onNewChat={mockOnNewChat}
      />
    );

    // まず折りたたむ
    const collapseButton = screen.getByText('←');
    fireEvent.click(collapseButton);

    // 展開ボタンをクリック
    const expandButton = screen.getByText('→');
    fireEvent.click(expandButton);

    // 会話一覧が再度表示される
    expect(screen.getByText('テスト会話1')).toBeInTheDocument();
  });

  it('ローディング状態が表示される', () => {
    (useConversations as ReturnType<typeof vi.fn>).mockReturnValue({
      conversations: [],
      loading: true,
      error: null,
      deleteConversation: mockDeleteConversation,
      refetch: mockRefetch,
    });

    render(
      <Sidebar
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('会話がない場合は適切なメッセージが表示される', () => {
    (useConversations as ReturnType<typeof vi.fn>).mockReturnValue({
      conversations: [],
      loading: false,
      error: null,
      deleteConversation: mockDeleteConversation,
      refetch: mockRefetch,
    });

    render(
      <Sidebar
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('会話がありません')).toBeInTheDocument();
  });
});
