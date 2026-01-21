# AI Chat - AIチャットボットアプリケーション

Claude APIを使用したモダンなAIチャットボットアプリケーションです。Next.js App Router、Prisma、MongoDB、Mastraを使用して構築されています。

## 特徴

- 🤖 **Claude 3.5 Sonnet** - Anthropicの最新AIモデルを使用
- 💬 **リアルタイムチャット** - スムーズな会話体験
- 📝 **会話履歴管理** - 複数の会話を保存・管理
- 🎨 **モダンUI** - shadcn/ui + Tailwind CSSによる洗練されたデザイン
- 📱 **レスポンシブデザイン** - モバイル、タブレット、デスクトップに対応
- 🔒 **型安全** - TypeScriptによる完全な型安全性
- ✅ **テストカバレッジ** - 70以上の単体テスト、APIテスト、E2Eテスト
- 🐳 **Docker対応** - コンテナ化されたデプロイ
- ☁️ **Cloud Run対応** - Google Cloud Runへの簡単なデプロイ

## 技術スタック

### フロントエンド
- **Next.js 15** - React フレームワーク（App Router）
- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **shadcn/ui** - 再利用可能なコンポーネント
- **react-markdown** - Markdownレンダリング

### バックエンド
- **Next.js API Routes** - サーバーレスAPI
- **Prisma 7** - ORMとデータベースクライアント
- **MongoDB** - NoSQLデータベース
- **Mastra** - AI統合フレームワーク
- **Anthropic Claude API** - AI言語モデル
- **Zod** - スキーマバリデーション

### 開発・テスト
- **Vitest** - 単体テスト
- **Playwright** - E2Eテスト
- **ESLint** - コード品質
- **Docker** - コンテナ化

### デプロイ
- **Google Cloud Run** - サーバーレスコンテナプラットフォーム
- **GitHub Actions** - CI/CD

## 必要な環境

- **Node.js** 20.x以上
- **npm** または **yarn**
- **MongoDB** データベース（MongoDB Atlas推奨）
- **Anthropic API** キー

## インストール

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd ai-chat
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定します：

```bash
# データベース
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/ai-chat?retryWrites=true&w=majority"

# Claude API
ANTHROPIC_API_KEY="sk-ant-api03-xxx"

# アプリケーションURL（開発環境）
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`.env.example`ファイルをコピーして使用できます：

```bash
cp .env.example .env.local
```

### 4. Prismaのセットアップ

```bash
# Prismaクライアントの生成
npx prisma generate

# データベーススキーマのプッシュ
npx prisma db push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lint実行
npm run lint

# 単体テスト実行
npm test

# テストUI起動
npm run test:ui

# カバレッジレポート生成
npm run test:coverage

# E2Eテスト実行
npm run test:e2e

# E2Eテストui起動
npm run test:e2e:ui
```

## プロジェクト構造

```
ai-chat/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── chat/          # チャットAPI
│   │   │   └── conversations/ # 会話管理API
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx           # メインページ
│   │   └── globals.css        # グローバルスタイル
│   ├── components/            # Reactコンポーネント
│   │   ├── chat/             # チャット関連
│   │   ├── sidebar/          # サイドバー関連
│   │   └── ui/               # 汎用UIコンポーネント（shadcn/ui）
│   ├── hooks/                # カスタムフック
│   ├── lib/                  # ライブラリ設定
│   │   ├── prisma.ts        # Prismaクライアント
│   │   ├── claude.ts        # Claude API統合
│   │   └── utils.ts         # ユーティリティ関数
│   ├── types/               # 型定義
│   └── utils/               # ユーティリティ
│       ├── errors.ts        # エラーハンドリング
│       └── logger.ts        # ロギング
├── prisma/
│   └── schema.prisma        # Prismaスキーマ
├── tests/                   # テスト
│   ├── unit/               # 単体テスト
│   ├── api/                # APIテスト
│   └── e2e/                # E2Eテスト
├── .github/
│   └── workflows/          # GitHub Actions
├── Dockerfile              # Dockerイメージ定義
└── next.config.ts         # Next.js設定
```

## 主な機能

### 1. チャット機能
- AIとのリアルタイム会話
- Markdown形式での応答レンダリング
- メッセージ履歴の表示
- 自動スクロール

### 2. 会話管理
- 複数の会話の作成・管理
- 会話の切り替え
- 会話の削除（確認ダイアログ付き）
- 会話タイトルの自動生成

### 3. UI/UX
- レスポンシブデザイン
- ダークモード対応
- Enterキーで送信、Shift+Enterで改行
- 送信中のローディング表示
- エラーハンドリング

## API エンドポイント

### POST /api/chat
チャットメッセージを送信し、AIの応答を取得します。

**リクエスト:**
```json
{
  "conversationId": "optional-conversation-id",
  "message": "ユーザーのメッセージ"
}
```

**レスポンス:**
```json
{
  "conversationId": "conversation-id",
  "message": {
    "id": "message-id",
    "role": "assistant",
    "content": "AIの応答",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/conversations
すべての会話一覧を取得します。

**レスポンス:**
```json
{
  "conversations": [
    {
      "id": "conversation-id",
      "title": "会話タイトル",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### GET /api/conversations/:id
特定の会話とそのメッセージを取得します。

**レスポンス:**
```json
{
  "conversation": {
    "id": "conversation-id",
    "title": "会話タイトル",
    "messages": [
      {
        "id": "message-id",
        "role": "user",
        "content": "メッセージ内容",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

### DELETE /api/conversations/:id
会話を削除します。

**レスポンス:**
```json
{
  "success": true
}
```

## テスト

### 単体テスト

```bash
npm test
```

70以上のテストケースをカバー：
- ユーティリティ関数のテスト
- エラーハンドリングのテスト
- Reactコンポーネントのテスト
- カスタムフックのテスト

### APIテスト

```bash
npm test tests/api
```

すべてのAPIエンドポイントをテスト：
- 正常系のテスト
- 異常系のテスト
- バリデーションのテスト

### E2Eテスト

```bash
npm run test:e2e
```

主要なユーザーフローをテスト：
- メッセージ送信フロー
- 会話作成・切り替え
- エラーハンドリング

### カバレッジレポート

```bash
npm run test:coverage
```

## デプロイ

### Docker

```bash
# イメージのビルド
docker build -t ai-chat .

# コンテナの実行
docker run -p 8080:8080 --env-file .env.local ai-chat
```

### Google Cloud Run

詳細なデプロイ手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

クイックデプロイ：

```bash
# 前提: gcloud CLIがインストール済み、認証済み

# デプロイ
gcloud run deploy ai-chat \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `DATABASE_URL` | MongoDB接続文字列 | ✅ |
| `ANTHROPIC_API_KEY` | Anthropic APIキー | ✅ |
| `NEXT_PUBLIC_APP_URL` | アプリケーションURL | ✅ |
| `NODE_ENV` | 実行環境（development/production） | ❌ |

## トラブルシューティング

### Prismaクライアントが見つからない

```bash
npx prisma generate
```

### データベース接続エラー

- MongoDB接続文字列が正しいか確認
- MongoDB Atlasのネットワークアクセス設定を確認
- IPアドレスがホワイトリストに登録されているか確認

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### テストエラー

```bash
# テストキャッシュをクリア
npm test -- --clearCache
```

## コントリビューション

コントリビューションを歓迎します！以下の手順でお願いします：

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## サポート

問題が発生した場合やご質問がある場合は、GitHubのIssueを作成してください。

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Cloud Run](https://cloud.google.com/run/docs)

## 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Anthropic Claude](https://www.anthropic.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ using Claude Sonnet 4.5
