import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import type { Message } from '@/types/chat';

describe('ChatMessage', () => {
  const mockUserMessage: Message = {
    id: '1',
    conversationId: 'conv-1',
    role: 'user',
    content: 'Hello, how are you?',
    createdAt: new Date('2024-01-15T10:30:00'),
  };

  const mockAssistantMessage: Message = {
    id: '2',
    conversationId: 'conv-1',
    role: 'assistant',
    content: 'I am doing well, thank you!',
    createdAt: new Date('2024-01-15T10:31:00'),
  };

  it('should render user message with correct content', () => {
    render(<ChatMessage message={mockUserMessage} />);

    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
  });

  it('should render assistant message with correct content', () => {
    render(<ChatMessage message={mockAssistantMessage} />);

    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
  });

  it('should apply correct styles for user message', () => {
    const { container } = render(<ChatMessage message={mockUserMessage} />);
    const messageDiv = container.querySelector('.bg-blue-600');

    expect(messageDiv).toBeInTheDocument();
    expect(messageDiv).toHaveClass('text-white');
  });

  it('should apply correct styles for assistant message', () => {
    const { container } = render(<ChatMessage message={mockAssistantMessage} />);
    const messageDiv = container.querySelector('.bg-gray-100');

    expect(messageDiv).toBeInTheDocument();
  });

  it('should align user messages to the right', () => {
    const { container } = render(<ChatMessage message={mockUserMessage} />);
    const wrapper = container.querySelector('.justify-end');

    expect(wrapper).toBeInTheDocument();
  });

  it('should align assistant messages to the left', () => {
    const { container } = render(<ChatMessage message={mockAssistantMessage} />);
    const wrapper = container.querySelector('.justify-start');

    expect(wrapper).toBeInTheDocument();
  });

  it('should preserve whitespace and line breaks in user message', () => {
    const messageWithLineBreaks: Message = {
      ...mockUserMessage,
      content: 'Line 1\nLine 2\nLine 3',
    };

    const { container } = render(<ChatMessage message={messageWithLineBreaks} />);
    const contentElement = container.querySelector('.whitespace-pre-wrap');

    expect(contentElement).toBeInTheDocument();
    expect(contentElement?.textContent).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should handle long user messages with word break', () => {
    const longMessage: Message = {
      ...mockUserMessage,
      content: 'a'.repeat(200), // Very long message
    };

    const { container } = render(<ChatMessage message={longMessage} />);
    const contentElement = container.querySelector('.break-words');

    expect(contentElement).toBeInTheDocument();
  });

  it('should handle empty message content', () => {
    const emptyMessage: Message = {
      ...mockUserMessage,
      content: '',
    };

    const { container } = render(<ChatMessage message={emptyMessage} />);

    expect(container).toBeInTheDocument();
  });

  it('should render markdown for assistant messages', () => {
    const markdownMessage: Message = {
      ...mockAssistantMessage,
      content: '**Bold** and *italic*',
    };

    const { container } = render(<ChatMessage message={markdownMessage} />);

    // MarkdownRendererコンポーネントが使われているか確認
    expect(container.querySelector('.text-sm')).toBeInTheDocument();
  });

  it('should limit message width to 80%', () => {
    const { container } = render(<ChatMessage message={mockUserMessage} />);
    const messageBox = container.querySelector('.max-w-\\[80\\%\\]');

    expect(messageBox).toBeInTheDocument();
  });

  it('should render timestamp', () => {
    const { container } = render(<ChatMessage message={mockUserMessage} />);
    const timestamp = container.querySelector('.text-xs');

    expect(timestamp).toBeInTheDocument();
  });

  it('should handle different date formats', () => {
    const recentMessage: Message = {
      ...mockUserMessage,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    };

    render(<ChatMessage message={recentMessage} />);
    expect(screen.getByText('5分前')).toBeInTheDocument();
  });

  it('should handle "just now" timestamp', () => {
    const justNowMessage: Message = {
      ...mockUserMessage,
      createdAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
    };

    render(<ChatMessage message={justNowMessage} />);
    expect(screen.getByText('たった今')).toBeInTheDocument();
  });
});
