import { test, expect } from '@playwright/test';

test.describe('AI Chat Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/AI Chat/);
    await expect(page.locator('h1')).toContainText('新規会話');
  });

  test('should display sidebar with "新規会話" button', async ({ page }) => {
    const newChatButton = page.getByRole('button', { name: /新規会話/i });
    await expect(newChatButton).toBeVisible();
  });

  test('should display chat input field', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/メッセージを入力/i);
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toBeEnabled();
  });

  test('should not allow sending empty message', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/メッセージを入力/i);
    const sendButton = page.getByRole('button', { name: /送信/i });

    await expect(sendButton).toBeDisabled();

    await chatInput.fill('   ');
    await expect(sendButton).toBeDisabled();
  });

  test('should enable send button when message is typed', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/メッセージを入力/i);
    const sendButton = page.getByRole('button', { name: /送信/i });

    await chatInput.fill('Hello, AI!');
    await expect(sendButton).toBeEnabled();
  });

  test('should send message and receive response (mocked)', async ({ page }) => {
    // API レスポンスをモック
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversationId: 'test-conv-1',
          message: {
            id: 'msg-1',
            conversationId: 'test-conv-1',
            role: 'assistant',
            content: 'Hello! How can I help you today?',
            createdAt: new Date().toISOString(),
          },
        }),
      });
    });

    const chatInput = page.getByPlaceholder(/メッセージを入力/i);
    const sendButton = page.getByRole('button', { name: /送信/i });

    await chatInput.fill('Hello, AI!');
    await sendButton.click();

    // ユーザーメッセージが表示されることを確認
    await expect(page.getByText('Hello, AI!')).toBeVisible();

    // AIレスポンスが表示されることを確認
    await expect(page.getByText('Hello! How can I help you today?')).toBeVisible();

    // 入力フィールドがクリアされることを確認
    await expect(chatInput).toHaveValue('');
  });

  test('should display loading state while waiting for response', async ({ page }) => {
    // API レスポンスを遅延させる
    await page.route('**/api/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversationId: 'test-conv-1',
          message: {
            id: 'msg-1',
            conversationId: 'test-conv-1',
            role: 'assistant',
            content: 'Response',
            createdAt: new Date().toISOString(),
          },
        }),
      });
    });

    const chatInput = page.getByPlaceholder(/メッセージを入力/i);
    const sendButton = page.getByRole('button', { name: /送信/i });

    await chatInput.fill('Test message');
    await sendButton.click();

    // 送信ボタンが無効化されることを確認
    await expect(sendButton).toBeDisabled();
  });

  test('should handle API error gracefully', async ({ page }) => {
    // API エラーをモック
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          },
        }),
      });
    });

    const chatInput = page.getByPlaceholder(/メッセージを入力/i);
    const sendButton = page.getByRole('button', { name: /送信/i });

    await chatInput.fill('Test message');
    await sendButton.click();

    // エラーメッセージが表示されることを確認
    await expect(page.getByText(/エラーが発生しました|送信に失敗しました/i)).toBeVisible();
  });

  test('should create new conversation from sidebar', async ({ page }) => {
    // 最初のメッセージを送信
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversationId: 'conv-1',
          message: {
            id: 'msg-1',
            conversationId: 'conv-1',
            role: 'assistant',
            content: 'First response',
            createdAt: new Date().toISOString(),
          },
        }),
      });
    });

    const chatInput = page.getByPlaceholder(/メッセージを入力/i);
    await chatInput.fill('First message');
    await page.getByRole('button', { name: /送信/i }).click();

    // 会話が作成されるのを待つ
    await expect(page.getByText('First response')).toBeVisible();

    // 新規会話ボタンをクリック
    const newChatButton = page.getByRole('button', { name: /新規会話/i });
    await newChatButton.click();

    // ヘッダーが「新規会話」に戻ることを確認
    await expect(page.locator('h1')).toContainText('新規会話');

    // チャットエリアがクリアされることを確認
    await expect(page.getByText('First message')).not.toBeVisible();
  });

  test('should display conversation list after creating conversation', async ({ page }) => {
    // 会話一覧のAPIをモック
    await page.route('**/api/conversations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversations: [
            {
              id: 'conv-1',
              title: 'Test conversation',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              messages: [],
            },
          ],
        }),
      });
    });

    await page.reload();

    // サイドバーに会話が表示されることを確認（デスクトップビュー）
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 768) {
      await expect(page.getByText('Test conversation')).toBeVisible();
    }
  });

  test('should handle Enter key to send message', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversationId: 'conv-1',
          message: {
            id: 'msg-1',
            conversationId: 'conv-1',
            role: 'assistant',
            content: 'Response',
            createdAt: new Date().toISOString(),
          },
        }),
      });
    });

    const chatInput = page.getByPlaceholder(/メッセージを入力/i);

    await chatInput.fill('Test message');
    await chatInput.press('Enter');

    // メッセージが送信されることを確認
    await expect(page.getByText('Test message')).toBeVisible();
  });

  test('should allow Shift+Enter for multi-line input', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/メッセージを入力/i);

    await chatInput.fill('Line 1');
    await chatInput.press('Shift+Enter');
    await chatInput.press('a'); // Type another character to ensure it's on a new line

    // テキストエリアの値に改行が含まれることを確認
    const value = await chatInput.inputValue();
    expect(value).toContain('\n');
  });

  test('should scroll to latest message automatically', async ({ page }) => {
    // 複数のメッセージを送信
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversationId: 'conv-1',
          message: {
            id: `msg-${Date.now()}`,
            conversationId: 'conv-1',
            role: 'assistant',
            content: 'Response message',
            createdAt: new Date().toISOString(),
          },
        }),
      });
    });

    const chatInput = page.getByPlaceholder(/メッセージを入力/i);

    // 複数のメッセージを送信
    for (let i = 1; i <= 3; i++) {
      await chatInput.fill(`Message ${i}`);
      await chatInput.press('Enter');
      await page.waitForTimeout(500); // Wait for response
    }

    // 最新のメッセージが表示されていることを確認
    await expect(page.getByText('Message 3')).toBeVisible();
  });

  test('should show empty state when no messages', async ({ page }) => {
    // 空の会話一覧をモック
    await page.route('**/api/conversations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversations: [],
        }),
      });
    });

    await page.reload();

    // デスクトップビューで「会話がありません」が表示されることを確認
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 768) {
      await expect(page.getByText(/会話がありません/i)).toBeVisible();
    }
  });
});
