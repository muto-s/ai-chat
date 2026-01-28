/**
 * ConversationItemコンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversationItem } from '@/components/sidebar/ConversationItem';

const mockConversation = {
  id: '1',
  title: 'テスト会話',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  messages: [],
};

describe('ConversationItem', () => {
  let mockOnClick: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClick = vi.fn();
    mockOnDelete = vi.fn();
  });

  it('会話アイテムが正しく表示される', () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('テスト会話')).toBeInTheDocument();
  });

  it('会話をクリックするとonClickが呼ばれる', () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    const item = screen.getByText('テスト会話');
    fireEvent.click(item);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('アクティブな会話は背景色が変わる', () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={true}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    const item = screen.getByText('テスト会話').closest('.group');
    expect(item).toHaveClass('bg-blue-50');
  });

  it('非アクティブな会話はホバー時に背景色が変わる', () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    const item = screen.getByText('テスト会話').closest('.group');
    expect(item).toHaveClass('hover:bg-gray-100');
  });

  it('ホバー時に削除ボタンが表示される', () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    const item = screen.getByText('テスト会話').closest('div');
    if (item) {
      fireEvent.mouseEnter(item);
    }

    // 削除ボタンが表示されることを確認
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) => btn.textContent === '🗑️');
    expect(deleteButton).toBeInTheDocument();
  });

  it('削除ボタンをクリックすると確認ダイアログが表示される', async () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    const item = screen.getByText('テスト会話').closest('div');
    if (item) {
      fireEvent.mouseEnter(item);
    }

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) => btn.textContent === '🗑️');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // 確認ダイアログが表示される
    await waitFor(() => {
      expect(screen.getByText('会話を削除しますか？')).toBeInTheDocument();
    });
  });

  it('削除確認ダイアログで削除をクリックするとonDeleteが呼ばれる', async () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    const item = screen.getByText('テスト会話').closest('div');
    if (item) {
      fireEvent.mouseEnter(item);
    }

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) => btn.textContent === '🗑️');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // 確認ダイアログの削除ボタンをクリック
    await waitFor(() => {
      const confirmDeleteButton = screen.getByText('削除');
      fireEvent.click(confirmDeleteButton);
    });

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('削除確認ダイアログでキャンセルをクリックするとダイアログが閉じる', async () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    const item = screen.getByText('テスト会話').closest('.group');
    if (item) {
      fireEvent.mouseEnter(item);
    }

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) => btn.textContent === '🗑️');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // 確認ダイアログのキャンセルボタンをクリック
    await waitFor(() => {
      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);
    });

    // ダイアログが閉じてから確認
    await waitFor(() => {
      expect(screen.queryByText('会話を削除しますか？')).not.toBeInTheDocument();
    });

    // onDeleteは呼ばれない
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('削除ボタンのクリックで会話選択イベントが発火しない', () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    const item = screen.getByText('テスト会話').closest('.group');
    if (item) {
      fireEvent.mouseEnter(item);
    }

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) => btn.textContent === '🗑️');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // onClickは呼ばれない（stopPropagationが効いている）
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('相対時間が表示される', () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    // 相対時間の表示要素があることを確認
    const timeElement = screen.getByText('2024/01/01 09:00');
    expect(timeElement).toBeInTheDocument();
  });
});
