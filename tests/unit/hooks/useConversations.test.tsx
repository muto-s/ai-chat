import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConversations } from '@/hooks/useConversations';
import type { Conversation } from '@/types/chat';

describe('useConversations', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  const mockConversations: Conversation[] = [
    {
      id: '1',
      title: 'First conversation',
      createdAt: new Date('2024-01-15T10:00:00'),
      updatedAt: new Date('2024-01-15T10:30:00'),
      messages: [],
    },
    {
      id: '2',
      title: 'Second conversation',
      createdAt: new Date('2024-01-15T11:00:00'),
      updatedAt: new Date('2024-01-15T11:30:00'),
      messages: [],
    },
  ];

  it('should fetch conversations on mount', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: mockConversations }),
    });

    const { result } = renderHook(() => useConversations());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual(mockConversations);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/api/conversations');
  });

  it('should handle empty conversations list', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: [] }),
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle missing conversations field in response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual([]);
  });

  it('should handle fetch error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch conversations');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle network error', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should refetch conversations when refetch is called', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: mockConversations }),
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updatedConversations = [
      ...mockConversations,
      {
        id: '3',
        title: 'Third conversation',
        createdAt: new Date('2024-01-15T12:00:00'),
        updatedAt: new Date('2024-01-15T12:30:00'),
        messages: [],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: updatedConversations }),
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(3);
    });

    expect(result.current.conversations).toEqual(updatedConversations);
  });

  it('should delete conversation successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: mockConversations }),
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toHaveLength(2);

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await result.current.deleteConversation('1');

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(1);
    });

    expect(result.current.conversations[0].id).toBe('2');
    expect(global.fetch).toHaveBeenCalledWith('/api/conversations/1', {
      method: 'DELETE',
    });
  });

  it('should handle delete conversation error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: mockConversations }),
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(result.current.deleteConversation('1')).rejects.toThrow(
      'Failed to delete conversation'
    );

    // 削除が失敗した場合、ローカル状態は変更されない
    expect(result.current.conversations).toHaveLength(2);
  });

  it('should not modify state when deleting non-existent conversation', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: mockConversations }),
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await result.current.deleteConversation('non-existent-id');

    // 存在しないIDを削除しようとしても、配列に変化なし
    expect(result.current.conversations).toHaveLength(2);
  });

  it('should handle multiple consecutive deletes', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: mockConversations }),
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await result.current.deleteConversation('1');

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await result.current.deleteConversation('2');

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(0);
    });
  });

  it('should reset error state when refetching after error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch conversations');
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: mockConversations }),
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    expect(result.current.conversations).toEqual(mockConversations);
  });
});
