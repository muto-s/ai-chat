/**
 * ConversationListコンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList } from '@/components/sidebar/ConversationList';

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

describe('ConversationList', () => {
  const mockOnSelectConversation = vi.fn();
  const mockOnDeleteConversation = vi.fn();

  it('会話一覧が正しく表示される', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onDeleteConversation={mockOnDeleteConversation}
      />
    );

    expect(screen.getByText('テスト会話1')).toBeInTheDocument();
    expect(screen.getByText('テスト会話2')).toBeInTheDocument();
  });

  it('会話をクリックすると選択される', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onDeleteConversation={mockOnDeleteConversation}
      />
    );

    const conversation1 = screen.getByText('テスト会話1');
    fireEvent.click(conversation1);

    expect(mockOnSelectConversation).toHaveBeenCalledWith('1');
  });

  it('アクティブな会話がハイライト表示される', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversationId="1"
        onSelectConversation={mockOnSelectConversation}
        onDeleteConversation={mockOnDeleteConversation}
      />
    );

    const conversation1 = screen.getByText('テスト会話1').closest('.group');
    expect(conversation1).toHaveClass('bg-blue-50');
  });

  it('ローディング状態が表示される', () => {
    render(
      <ConversationList
        conversations={[]}
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onDeleteConversation={mockOnDeleteConversation}
        loading={true}
      />
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('会話がない場合は適切なメッセージが表示される', () => {
    render(
      <ConversationList
        conversations={[]}
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onDeleteConversation={mockOnDeleteConversation}
        loading={false}
      />
    );

    expect(screen.getByText('会話がありません')).toBeInTheDocument();
  });

  it('複数の会話が順番に表示される', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversationId={null}
        onSelectConversation={mockOnSelectConversation}
        onDeleteConversation={mockOnDeleteConversation}
      />
    );

    const conversations = screen.getAllByText(/テスト会話/);
    expect(conversations).toHaveLength(2);
  });
});
