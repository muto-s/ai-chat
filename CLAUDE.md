# AIチャットボット 仕様書

## 1. プロジェクト概要

### 1.1 プロジェクト名
AIチャットボット

### 1.2 目的
Claude APIを使用した汎用的なAIチャットボットアプリケーションの構築

### 1.3 主要機能
- テキストベースのAI会話機能
- 会話履歴の管理（最小限）
- レスポンシブデザイン対応

---

## 2. 技術スタック

### 2.1 フロントエンド
- **フレームワーク**: Next.js 15.x (App Router)
- **言語**: TypeScript 5.x
- **UIライブラリ**: shadcn/ui
- **スタイリング**: Tailwind CSS 3.x
- **状態管理**: React Hooks (useState, useContext)

### 2.2 バックエンド
- **フレームワーク**: Next.js App Router (API Routes) + Hono 4.x
- **ORM**: Prisma 5.x
- **データベース**: MongoDB 7.x
- **AIフレームワーク**: Mastra

### 2.3 AI API
- **プロバイダー**: Anthropic Claude API
- **推奨モデル**: Claude 3.5 Sonnet / Claude 3 Opus

### 2.4 インフラ
- **ホスティング**: Google Cloud Run
- **データベース**: MongoDB Atlas (推奨) または Google Cloud MongoDB
- **環境変数管理**: .env.local (開発) / Cloud Run環境変数 (本番)

### 2.5 開発ツール
- **パッケージマネージャー**: npm / pnpm / yarn
- **Linter**: ESLint
- **Formatter**: Prettier
- **テストフレームワーク**:
  - 単体テスト: Jest / Vitest
  - E2Eテスト: Playwright
  - APIテスト: Supertest / Vitest

---

## 3. システム要件

### 3.1 機能要件
1. **チャット機能**
   - ユーザーがテキストメッセージを入力
   - Claude APIに送信
   - AIの応答を一括表示（ストリーミングなし）
   - 会話履歴をコンテキストとして保持

2. **会話履歴管理（最小限）**
   - 新規会話の作成
   - 現在の会話の表示
   - 会話の削除
   - サイドバーに会話一覧を表示

3. **レスポンシブデザイン**
   - スマートフォン対応
   - タブレット対応
   - デスクトップ対応

### 3.2 非機能要件
1. **パフォーマンス**
   - 初回レンダリング時間: 3秒以内
   - APIレスポンス時間: 10秒以内（Claude API依存）

2. **セキュリティ**
   - APIキーの安全な管理（環境変数）
   - XSS対策（Next.jsのデフォルト保護）
   - CSRF対策（API Routes）

3. **可用性**
   - Cloud Runによる自動スケーリング
   - エラーハンドリングとフォールバック

### 3.3 制約事項
- ユーザー認証なし（誰でもアクセス可能）
- ファイルアップロード機能なし
- ストリーミング応答なし

---

## 4. 機能仕様

### 4.1 チャット画面
- **レイアウト**:
  - 左サイド: 会話履歴サイドバー（折りたたみ可能）
  - 中央: チャットメッセージエリア
  - 下部: テキスト入力フィールドと送信ボタン

- **メッセージ表示**:
  - ユーザーメッセージ: 右寄せ、青系の背景
  - AIメッセージ: 左寄せ、グレー系の背景
  - タイムスタンプ表示
  - Markdown対応（コードブロック、リスト等）

- **入力フィールド**:
  - マルチライン対応（テキストエリア）
  - Enter送信 / Shift+Enterで改行
  - 送信中は入力無効化

### 4.2 会話履歴サイドバー
- **表示項目**:
  - 新規会話ボタン
  - 会話リスト（タイトル、最終更新日時）
  - 選択中の会話をハイライト表示

- **操作**:
  - 会話クリックで切り替え
  - ホバー時に削除ボタン表示
  - 削除確認ダイアログ

### 4.3 会話管理
- **新規会話作成**:
  - 最初のメッセージ送信時に自動作成
  - タイトルは最初のメッセージから自動生成（最大30文字）

- **会話削除**:
  - 削除確認ダイアログ表示
  - 削除後は新規会話に遷移

---

## 5. データモデル

### 5.1 Prismaスキーマ

```prisma
// prisma/schema.prisma

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Conversation {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  messages  Message[]

  @@map("conversations")
}

model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String       @db.ObjectId
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // "user" or "assistant"
  content        String
  createdAt      DateTime     @default(now())

  @@index([conversationId])
  @@map("messages")
}
```

### 5.2 データ型定義

```typescript
// types/chat.ts

export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  message: Message;
}
```

---

## 6. API設計

### 6.1 エンドポイント一覧

#### 6.1.1 POST /api/chat
チャットメッセージの送信

**リクエスト**:
```json
{
  "conversationId": "string | null",
  "message": "string"
}
```

**レスポンス**:
```json
{
  "conversationId": "string",
  "message": {
    "id": "string",
    "conversationId": "string",
    "role": "assistant",
    "content": "string",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

#### 6.1.2 GET /api/conversations
会話一覧の取得

**レスポンス**:
```json
{
  "conversations": [
    {
      "id": "string",
      "title": "string",
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ]
}
```

#### 6.1.3 GET /api/conversations/:id
特定の会話と全メッセージの取得

**レスポンス**:
```json
{
  "conversation": {
    "id": "string",
    "title": "string",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp",
    "messages": [
      {
        "id": "string",
        "conversationId": "string",
        "role": "user | assistant",
        "content": "string",
        "createdAt": "ISO 8601 timestamp"
      }
    ]
  }
}
```

#### 6.1.4 DELETE /api/conversations/:id
会話の削除

**レスポンス**:
```json
{
  "success": true,
  "deletedId": "string"
}
```

### 6.2 エラーレスポンス

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

**エラーコード**:
- `INVALID_REQUEST`: リクエストが不正
- `CONVERSATION_NOT_FOUND`: 会話が見つからない
- `CLAUDE_API_ERROR`: Claude API呼び出しエラー
- `DATABASE_ERROR`: データベースエラー
- `INTERNAL_SERVER_ERROR`: サーバー内部エラー

---

## 7. ディレクトリ構造

```
ai-chat/
├── .env.local                 # 環境変数（開発用、Gitignore）
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── CLAUDE.md                  # 本仕様書
├── README.md
│
├── prisma/
│   ├── schema.prisma          # Prismaスキーマ定義
│   └── seed.ts                # シードデータ（オプション）
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx           # トップページ（チャット画面）
│   │   ├── globals.css        # グローバルCSS
│   │   │
│   │   └── api/               # API Routes（Hono統合）
│   │       ├── chat/
│   │       │   └── route.ts   # POST /api/chat
│   │       └── conversations/
│   │           ├── route.ts   # GET /api/conversations
│   │           └── [id]/
│   │               └── route.ts # GET, DELETE /api/conversations/:id
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui コンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx       # チャット画面全体
│   │   │   ├── ChatMessageList.tsx     # メッセージ一覧
│   │   │   ├── ChatMessage.tsx         # 個別メッセージ
│   │   │   ├── ChatInput.tsx           # 入力フィールド
│   │   │   └── MarkdownRenderer.tsx    # Markdownレンダラー
│   │   │
│   │   └── sidebar/
│   │       ├── Sidebar.tsx             # サイドバー全体
│   │       ├── ConversationList.tsx    # 会話一覧
│   │       ├── ConversationItem.tsx    # 会話アイテム
│   │       └── NewChatButton.tsx       # 新規会話ボタン
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prismaクライアント
│   │   ├── claude.ts          # Claude API統合（Mastra使用）
│   │   ├── utils.ts           # ユーティリティ関数
│   │   └── hono.ts            # Hono設定
│   │
│   ├── hooks/
│   │   ├── useChatMessages.ts # チャットメッセージ管理
│   │   └── useConversations.ts # 会話一覧管理
│   │
│   ├── types/
│   │   ├── chat.ts            # チャット関連型定義
│   │   └── api.ts             # API関連型定義
│   │
│   └── utils/
│       ├── errors.ts          # エラーハンドリング
│       └── logger.ts          # ログ管理
│
└── tests/
    ├── unit/                  # 単体テスト
    │   ├── components/
    │   └── lib/
    ├── integration/           # 統合テスト（APIテスト）
    │   └── api/
    └── e2e/                   # E2Eテスト
        └── chat.spec.ts
```

---

## 8. 開発ガイドライン

### 8.1 コーディング規約
- **言語**: TypeScript（strict mode）
- **命名規則**:
  - コンポーネント: PascalCase
  - 関数・変数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型・インターフェース: PascalCase

- **ファイル命名**:
  - コンポーネント: PascalCase.tsx
  - ユーティリティ: camelCase.ts
  - 型定義: camelCase.ts

- **インポート順序**:
  1. React関連
  2. 外部ライブラリ
  3. 内部モジュール（@/から始まる）
  4. 相対パス
  5. CSS/スタイル

### 8.2 コンポーネント設計
- **Server Components優先**: Next.js App Routerの特性を活かす
- **Client Componentsは必要最小限**: `"use client"`を明示的に使用
- **単一責任の原則**: 1つのコンポーネントは1つの責務
- **Props型定義**: すべてのコンポーネントにProps型を定義
- **条件分岐の簡潔化**: Early returnを活用

### 8.3 状態管理
- **ローカル状態**: useState
- **グローバル状態**: React Context（必要に応じて）
- **サーバー状態**: SWR or React Query（オプション）

### 8.4 エラーハンドリング
- **APIエラー**: try-catchで捕捉し、適切なエラーコードを返す
- **フロントエンドエラー**: Error Boundaryで捕捉
- **ログ出力**: console.error()で記録（本番では外部ログサービス検討）

### 8.5 パフォーマンス最適化
- **画像最適化**: Next.js Image コンポーネント使用
- **コード分割**: dynamic import活用
- **メモ化**: useMemo, useCallback適切に使用
- **データベースクエリ最適化**: 必要な項目のみselect

---

## 9. テスト要件

### 9.1 単体テスト（Jest / Vitest）
- **対象**:
  - ユーティリティ関数
  - Reactコンポーネント（React Testing Library）
  - カスタムフック

- **カバレッジ目標**: 80%以上

- **テスト項目例**:
  - `ChatMessage.tsx`: ユーザー/AIメッセージの表示
  - `useChatMessages.ts`: メッセージ追加・削除ロジック
  - `utils.ts`: 文字列処理、日付フォーマット等

### 9.2 APIテスト（Supertest / Vitest）
- **対象**: すべてのAPIエンドポイント

- **テスト項目**:
  - 正常系: 適切なリクエストで正しいレスポンス
  - 異常系: 不正なリクエストで適切なエラー
  - バリデーション: 入力値の検証
  - データベース連携: 実際のデータ永続化確認

- **テスト例**:
  ```typescript
  describe('POST /api/chat', () => {
    it('should return assistant message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.body.message.role).toBe('assistant');
    });
  });
  ```

### 9.3 E2Eテスト（Playwright）
- **対象**: 主要なユーザーフロー

- **テストシナリオ**:
  1. チャット送信フロー
     - ページアクセス
     - メッセージ入力
     - 送信ボタンクリック
     - AI応答の表示確認

  2. 会話管理フロー
     - 新規会話作成
     - 会話切り替え
     - 会話削除

  3. レスポンシブ確認
     - モバイルビュー
     - タブレットビュー
     - デスクトップビュー

---

## 10. Mastra（AIエージェントフレームワーク）統合

### 10.1 Mastraとは
MastraはAIアプリケーション開発を簡素化するためのフレームワークです。

### 10.2 使用方法
```typescript
// src/lib/claude.ts
import { Mastra } from '@mastra/core';
import { AnthropicProvider } from '@mastra/anthropic';

const mastra = new Mastra({
  provider: new AnthropicProvider({
    apiKey: process.env.CLAUDE_API_KEY!,
  }),
});

export async function sendMessageToClaude(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const response = await mastra.chat({
    model: 'claude-3-5-sonnet-20241022',
    messages,
    maxTokens: 2048,
  });

  return response.content;
}
```

### 10.3 設定項目
- **モデル**: claude-3-5-sonnet-20241022 (推奨)
- **maxTokens**: 2048
- **temperature**: 1.0（デフォルト）

---

## 11. 環境変数

### 11.1 必須環境変数

```bash
# .env.local

# データベース
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/ai-chat?retryWrites=true&w=majority"

# Claude API
CLAUDE_API_KEY="sk-ant-xxxxxxxxxxxxx"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 11.2 環境変数の管理
- **開発環境**: `.env.local`に記載（Gitignore）
- **本番環境**: Google Cloud Runの環境変数設定画面から設定

---

## 12. デプロイメント

### 12.1 Google Cloud Run デプロイ手順

#### 12.1.1 Dockerfileの作成

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

ENV PORT=8080

CMD ["npm", "start"]
```

#### 12.1.2 .dockerignoreの作成

```
# .dockerignore
node_modules
.next
.git
.env.local
README.md
CLAUDE.md
tests
.vscode
```

#### 12.1.3 デプロイコマンド

```bash
# Google Cloud プロジェクト設定
gcloud config set project YOUR_PROJECT_ID

# Cloud Runにデプロイ
gcloud run deploy ai-chat \
  --source . \
  --region asia-northeast1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=YOUR_MONGODB_URL" \
  --set-env-vars "CLAUDE_API_KEY=YOUR_CLAUDE_API_KEY"
```

### 12.2 CI/CDパイプライン（オプション）
GitHub Actionsを使用した自動デプロイ

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ai-chat \
            --source . \
            --region asia-northeast1 \
            --platform managed \
            --allow-unauthenticated \
            --set-env-vars "DATABASE_URL=${{ secrets.DATABASE_URL }}" \
            --set-env-vars "CLAUDE_API_KEY=${{ secrets.CLAUDE_API_KEY }}"
```

---

## 13. セキュリティ考慮事項

### 13.1 APIキーの保護
- 環境変数に保存
- フロントエンドに露出させない
- .envファイルをGitignoreに追加

### 13.2 入力バリデーション
- ユーザー入力の長さ制限（最大5000文字）
- XSS対策（Next.jsのデフォルト保護）
- SQLインジェクション対策（Prismaが自動対応）

### 13.3 レート制限（オプション）
- Cloud Runのレート制限設定
- アプリケーションレベルでのレート制限（将来実装）

### 13.4 CORS設定
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

---

## 14. 今後の拡張案（オプション）

### 14.1 機能拡張
- ストリーミング応答対応
- ファイルアップロード（画像・PDF）
- プロンプトテンプレート機能
- ユーザー認証（OAuth）
- マルチユーザー対応

### 14.2 技術的改善
- Redis導入（セッション管理）
- 全文検索機能（Elasticsearch）
- WebSocket対応（リアルタイム通知）
- Sentry導入（エラートラッキング）

---

## 15. 参考リンク

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Anthropic Claude API**: https://docs.anthropic.com/
- **Mastra**: https://mastra.ai/docs (Mastraの公式ドキュメント)
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Google Cloud Run**: https://cloud.google.com/run/docs
- **Playwright**: https://playwright.dev/
- **Vitest**: https://vitest.dev/

---

## 16. 開発開始前のチェックリスト

- [ ] Node.js 20.x以上をインストール
- [ ] Google Cloudプロジェクトを作成
- [ ] MongoDB Atlasアカウント作成とクラスター作成
- [ ] Claude APIキーの取得（Anthropic Console）
- [ ] `.env.local`ファイルの作成と環境変数設定
- [ ] 必要なパッケージのインストール (`npm install`)
- [ ] Prismaクライアントの生成 (`npx prisma generate`)
- [ ] データベースのマイグレーション (`npx prisma db push`)

---

## 17. 開発フロー

### 17.1 環境構築
```bash
# プロジェクトディレクトリ作成
mkdir ai-chat
cd ai-chat

# Next.jsプロジェクト初期化
npx create-next-app@latest . --typescript --tailwind --app --eslint

# 必要なパッケージインストール
npm install prisma @prisma/client
npm install @anthropic-ai/sdk
npm install hono
npm install @mastra/core @mastra/anthropic
npm install react-markdown

# 開発用パッケージ
npm install -D @types/node
npm install -D vitest @vitest/ui
npm install -D @playwright/test
npm install -D supertest @types/supertest

# Prisma初期化
npx prisma init
```

### 17.2 開発サイクル
1. **機能設計**: 機能要件の確認
2. **テスト作成**: TDDアプローチでテストを先に作成
3. **実装**: 機能の実装
4. **テスト実行**: 単体テスト、APIテスト、E2Eテストの実行
5. **コードレビュー**: Linter、Prettier実行
6. **コミット**: Gitにコミット

### 17.3 テスト実行コマンド
```bash
# 単体テスト
npm run test

# E2Eテスト
npm run test:e2e

# 全テスト実行
npm run test:all
```

---

## 18. トラブルシューティング

### 18.1 よくあるエラー
1. **Prisma Client エラー**
   - 解決: `npx prisma generate` を実行

2. **MongoDB接続エラー**
   - 解決: DATABASE_URLの確認、IPアドレスのホワイトリスト確認

3. **Claude APIエラー**
   - 解決: APIキーの確認、レート制限の確認

4. **ビルドエラー**
   - 解決: `rm -rf .next node_modules && npm install && npm run build`

---

## 変更履歴

| バージョン | 日付 | 変更内容 | 担当者 |
|---------|------|---------|--------|
| 1.0.0   | 2026-01-21 | 初版作成 | AI |

---

**この仕様書は開発開始時のベースラインです。開発中に要件が変更された場合は、本ドキュメントを適宜更新してください。**
