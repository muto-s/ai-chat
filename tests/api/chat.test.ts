import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/chat/route';

// モックの設定
vi.mock('@/lib/prisma', () => ({
  prisma: {
    conversation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/claude', () => ({
  sendMessageToClaude: vi.fn(),
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { prisma } from '@/lib/prisma';
import { sendMessageToClaude } from '@/lib/claude';

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockRequest = (body: any) => {
    return new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('should create a new conversation and return assistant response', async () => {
    const requestBody = {
      message: 'Hello, how are you?',
    };

    const mockConversation = {
      id: 'conv-1',
      title: 'Hello, how are you?',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    const mockUserMessage = {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'Hello, how are you?',
      createdAt: new Date(),
    };

    const mockAssistantMessage = {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'I am doing well, thank you!',
      createdAt: new Date(),
    };

    (prisma.conversation.create as any).mockResolvedValueOnce(mockConversation);
    (prisma.message.create as any)
      .mockResolvedValueOnce(mockUserMessage)
      .mockResolvedValueOnce(mockAssistantMessage);
    (sendMessageToClaude as any).mockResolvedValueOnce('I am doing well, thank you!');
    (prisma.conversation.update as any).mockResolvedValueOnce(mockConversation);

    const request = mockRequest(requestBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversationId).toBe('conv-1');
    expect(data.message.content).toBe('I am doing well, thank you!');
    expect(data.message.role).toBe('assistant');
    expect(prisma.conversation.create).toHaveBeenCalledWith({
      data: {
        title: 'Hello, how are you?',
      },
      include: { messages: true },
    });
    expect(sendMessageToClaude).toHaveBeenCalled();
  });

  it('should use existing conversation when conversationId is provided', async () => {
    const requestBody = {
      conversationId: 'conv-1',
      message: 'What is the weather?',
    };

    const mockConversation = {
      id: 'conv-1',
      title: 'Previous conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: 'msg-0',
          conversationId: 'conv-1',
          role: 'user',
          content: 'Hello',
          createdAt: new Date(),
        },
      ],
    };

    const mockUserMessage = {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'What is the weather?',
      createdAt: new Date(),
    };

    const mockAssistantMessage = {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'The weather is sunny.',
      createdAt: new Date(),
    };

    (prisma.conversation.findUnique as any).mockResolvedValueOnce(mockConversation);
    (prisma.message.create as any)
      .mockResolvedValueOnce(mockUserMessage)
      .mockResolvedValueOnce(mockAssistantMessage);
    (sendMessageToClaude as any).mockResolvedValueOnce('The weather is sunny.');
    (prisma.conversation.update as any).mockResolvedValueOnce(mockConversation);

    const request = mockRequest(requestBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversationId).toBe('conv-1');
    expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  });

  it('should return 400 for empty message', async () => {
    const requestBody = {
      message: '',
    };

    const request = mockRequest(requestBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 for message exceeding 5000 characters', async () => {
    const requestBody = {
      message: 'a'.repeat(5001),
    };

    const request = mockRequest(requestBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 for missing message field', async () => {
    const requestBody = {};

    const request = mockRequest(requestBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 404 when conversation is not found', async () => {
    const requestBody = {
      conversationId: 'non-existent-id',
      message: 'Hello',
    };

    (prisma.conversation.findUnique as any).mockResolvedValueOnce(null);

    const request = mockRequest(requestBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('CONVERSATION_NOT_FOUND');
  });

  it('should handle Claude API errors', async () => {
    const requestBody = {
      message: 'Hello',
    };

    const mockConversation = {
      id: 'conv-1',
      title: 'Hello',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    const mockUserMessage = {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'Hello',
      createdAt: new Date(),
    };

    (prisma.conversation.create as any).mockResolvedValueOnce(mockConversation);
    (prisma.message.create as any).mockResolvedValueOnce(mockUserMessage);
    (sendMessageToClaude as any).mockRejectedValueOnce(new Error('API rate limit exceeded'));

    const request = mockRequest(requestBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('CLAUDE_API_ERROR');
    expect(data.error.message).toBe('API rate limit exceeded');
  });

  it('should truncate long message for conversation title', async () => {
    const longMessage = 'a'.repeat(100);
    const requestBody = {
      message: longMessage,
    };

    const mockConversation = {
      id: 'conv-1',
      title: 'a'.repeat(30) + '...',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    const mockUserMessage = {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: longMessage,
      createdAt: new Date(),
    };

    const mockAssistantMessage = {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'Response',
      createdAt: new Date(),
    };

    (prisma.conversation.create as any).mockResolvedValueOnce(mockConversation);
    (prisma.message.create as any)
      .mockResolvedValueOnce(mockUserMessage)
      .mockResolvedValueOnce(mockAssistantMessage);
    (sendMessageToClaude as any).mockResolvedValueOnce('Response');
    (prisma.conversation.update as any).mockResolvedValueOnce(mockConversation);

    const request = mockRequest(requestBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.conversation.create).toHaveBeenCalledWith({
      data: {
        title: 'a'.repeat(30) + '...',
      },
      include: { messages: true },
    });
  });

  it('should include conversation history in Claude API call', async () => {
    const requestBody = {
      conversationId: 'conv-1',
      message: 'Follow-up question',
    };

    const mockConversation = {
      id: 'conv-1',
      title: 'Conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'user',
          content: 'First message',
          createdAt: new Date(),
        },
        {
          id: 'msg-2',
          conversationId: 'conv-1',
          role: 'assistant',
          content: 'First response',
          createdAt: new Date(),
        },
      ],
    };

    (prisma.conversation.findUnique as any).mockResolvedValueOnce(mockConversation);
    (prisma.message.create as any)
      .mockResolvedValueOnce({
        id: 'msg-3',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Follow-up question',
        createdAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: 'msg-4',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'Follow-up response',
        createdAt: new Date(),
      });
    (sendMessageToClaude as any).mockResolvedValueOnce('Follow-up response');
    (prisma.conversation.update as any).mockResolvedValueOnce(mockConversation);

    const request = mockRequest(requestBody);
    await POST(request);

    expect(sendMessageToClaude).toHaveBeenCalledWith([
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'First response' },
      { role: 'user', content: 'Follow-up question' },
    ]);
  });

  it('should handle database errors gracefully', async () => {
    const requestBody = {
      message: 'Hello',
    };

    (prisma.conversation.create as any).mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const request = mockRequest(requestBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
