# AIチャットボット 開発TODOリスト

## 📋 プロジェクト概要
Next.js App Router + Hono + Prisma + MongoDB + Mastra + Claude API を使用したAIチャットボットの構築

---

## 🎯 フェーズ1: 環境構築とプロジェクト初期化

### 1.1 プロジェクトセットアップ
- [ ] Node.js 20.x以上がインストールされているか確認
- [ ] Next.jsプロジェクトの作成（TypeScript, Tailwind CSS, ESLint有効）
  ```bash
  npx create-next-app@latest . --typescript --tailwind --app --eslint
  ```
- [ ] 必要なパッケージのインストール
  ```bash
  npm install prisma @prisma/client @anthropic-ai/sdk hono @mastra/core @mastra/anthropic react-markdown zod
  ```
- [ ] 開発用パッケージのインストール
  ```bash
  npm install -D @types/node vitest @vitest/ui @playwright/test supertest @types/supertest
  ```

### 1.2 外部サービスの準備
- [ ] MongoDB Atlasアカウント作成
- [ ] MongoDBクラスターの作成と接続文字列の取得
- [ ] Anthropic Consoleでアカウント作成
- [ ] Claude APIキーの取得
- [ ] Google Cloudプロジェクトの作成（デプロイ用）

### 1.3 環境変数設定
- [ ] `.env.local` ファイルの作成
- [ ] `DATABASE_URL` の設定（MongoDB接続文字列）
- [ ] `CLAUDE_API_KEY` の設定
- [ ] `NEXT_PUBLIC_APP_URL` の設定（開発: http://localhost:3000）
- [ ] `.env.example` ファイルの作成（テンプレート用）

### 1.4 Git初期化
- [ ] `.gitignore` の確認・更新（.env.local, node_modules等）
- [ ] Gitリポジトリの初期化
- [ ] 初回コミット

---

## 🗄️ フェーズ2: データベース・Prismaセットアップ

### 2.1 Prismaの初期化
- [ ] Prisma初期化コマンド実行
  ```bash
  npx prisma init
  ```
- [ ] `prisma/schema.prisma` の作成
  - [ ] datasource設定（MongoDB）
  - [ ] generator設定
  - [ ] Conversationモデル定義
  - [ ] Messageモデル定義

### 2.2 Prismaクライアントの設定
- [ ] `src/lib/prisma.ts` の作成
  - [ ] PrismaClientのシングルトンインスタンス作成
  - [ ] 開発環境でのホットリロード対応

### 2.3 データベースマイグレーション
- [ ] Prismaクライアント生成
  ```bash
  npx prisma generate
  ```
- [ ] データベーススキーマのプッシュ
  ```bash
  npx prisma db push
  ```
- [ ] Prisma Studioで動作確認
  ```bash
  npx prisma studio
  ```

---

## 🎨 フェーズ3: UIコンポーネント基礎（shadcn/ui）

### 3.1 shadcn/ui セットアップ
- [ ] shadcn/ui の初期化
  ```bash
  npx shadcn@latest init
  ```
- [ ] `components.json` の設定確認

### 3.2 必要なコンポーネントのインストール
- [ ] Button コンポーネント
  ```bash
  npx shadcn@latest add button
  ```
- [ ] Input コンポーネント
  ```bash
  npx shadcn@latest add input
  ```
- [ ] Textarea コンポーネント
  ```bash
  npx shadcn@latest add textarea
  ```
- [ ] Dialog コンポーネント（削除確認用）
  ```bash
  npx shadcn@latest add dialog
  ```
- [ ] ScrollArea コンポーネント
  ```bash
  npx shadcn@latest add scroll-area
  ```
- [ ] Card コンポーネント
  ```bash
  npx shadcn@latest add card
  ```

---

## 🔧 フェーズ4: バックエンドAPI開発

### 4.1 型定義の作成
- [ ] `src/types/chat.ts` の作成
  - [ ] Role型の定義
  - [ ] Message型の定義
  - [ ] Conversation型の定義
  - [ ] ChatRequest型の定義
  - [ ] ChatResponse型の定義
- [ ] `src/types/api.ts` の作成
  - [ ] APIエラーレスポンス型の定義

### 4.2 Mastra統合
- [ ] `src/lib/claude.ts` の作成
  - [ ] Mastraインスタンスの初期化
  - [ ] AnthropicProvider設定
  - [ ] sendMessageToClaude関数の実装
  - [ ] エラーハンドリング

### 4.3 ユーティリティの作成
- [ ] `src/utils/errors.ts` の作成
  - [ ] カスタムエラークラス定義
  - [ ] エラーハンドリングヘルパー関数
- [ ] `src/utils/logger.ts` の作成
  - [ ] 基本的なロガー実装
- [ ] `src/lib/utils.ts` の更新
  - [ ] 会話タイトル生成関数
  - [ ] 日付フォーマット関数

### 4.4 Hono統合（オプション）
- [ ] `src/lib/hono.ts` の作成
  - [ ] Honoアプリインスタンス作成
  - [ ] ミドルウェア設定
- [ ] Honoルートの定義（Next.js API Routesと統合）

### 4.5 API Route: POST /api/chat
- [ ] `src/app/api/chat/route.ts` の作成
  - [ ] POSTハンドラー実装
  - [ ] リクエストバリデーション（zod使用）
  - [ ] 新規会話の作成処理
  - [ ] ユーザーメッセージの保存
  - [ ] Claude APIへのリクエスト（Mastra経由）
  - [ ] AIメッセージの保存
  - [ ] レスポンス返却
  - [ ] エラーハンドリング

### 4.6 API Route: GET /api/conversations
- [ ] `src/app/api/conversations/route.ts` の作成
  - [ ] GETハンドラー実装
  - [ ] 会話一覧の取得（最新順）
  - [ ] レスポンス返却
  - [ ] エラーハンドリング

### 4.7 API Route: GET /api/conversations/:id
- [ ] `src/app/api/conversations/[id]/route.ts` の作成
  - [ ] GETハンドラー実装
  - [ ] 会話IDのバリデーション
  - [ ] 会話とメッセージの取得
  - [ ] 404エラーハンドリング
  - [ ] レスポンス返却

### 4.8 API Route: DELETE /api/conversations/:id
- [ ] `src/app/api/conversations/[id]/route.ts` にDELETEハンドラー追加
  - [ ] DELETEハンドラー実装
  - [ ] 会話IDのバリデーション
  - [ ] 会話の削除（カスケード削除でメッセージも削除）
  - [ ] 404エラーハンドリング
  - [ ] レスポンス返却

---

## 🎭 フェーズ5: フロントエンド開発

### 5.1 カスタムフックの作成
- [ ] `src/hooks/useConversations.ts` の作成
  - [ ] 会話一覧の取得ロジック
  - [ ] 会話削除ロジック
  - [ ] ローディング・エラー状態管理
- [ ] `src/hooks/useChatMessages.ts` の作成
  - [ ] メッセージ送信ロジック
  - [ ] メッセージ一覧の管理
  - [ ] 楽観的UI更新
  - [ ] ローディング・エラー状態管理

### 5.2 チャットコンポーネントの作成
- [ ] `src/components/chat/MarkdownRenderer.tsx` の作成
  - [ ] react-markdownを使用したレンダリング
  - [ ] コードブロックのシンタックスハイライト
  - [ ] リンクの安全な処理
- [ ] `src/components/chat/ChatMessage.tsx` の作成
  - [ ] ユーザー/AIメッセージの表示
  - [ ] ロールに応じたスタイリング
  - [ ] タイムスタンプ表示
  - [ ] Markdownレンダリング統合
- [ ] `src/components/chat/ChatMessageList.tsx` の作成
  - [ ] メッセージ一覧表示
  - [ ] 自動スクロール（最新メッセージへ）
  - [ ] 空状態の表示
  - [ ] ローディング状態の表示
- [ ] `src/components/chat/ChatInput.tsx` の作成
  - [ ] テキストエリア
  - [ ] 送信ボタン
  - [ ] Enter送信・Shift+Enter改行
  - [ ] 送信中の無効化
  - [ ] 文字数制限（5000文字）
- [ ] `src/components/chat/ChatContainer.tsx` の作成
  - [ ] チャット画面全体の統合
  - [ ] メッセージリストと入力フィールドの配置
  - [ ] 状態管理の統合

### 5.3 サイドバーコンポーネントの作成
- [ ] `src/components/sidebar/NewChatButton.tsx` の作成
  - [ ] 新規会話作成ボタン
  - [ ] クリックハンドラー
- [ ] `src/components/sidebar/ConversationItem.tsx` の作成
  - [ ] 会話タイトル表示
  - [ ] 選択状態のハイライト
  - [ ] ホバー時の削除ボタン表示
  - [ ] 削除確認ダイアログ統合
- [ ] `src/components/sidebar/ConversationList.tsx` の作成
  - [ ] 会話一覧の表示
  - [ ] スクロール対応
  - [ ] 空状態の表示
- [ ] `src/components/sidebar/Sidebar.tsx` の作成
  - [ ] サイドバー全体の統合
  - [ ] 折りたたみ機能（モバイル対応）
  - [ ] レスポンシブデザイン

### 5.4 レイアウトとページの作成
- [ ] `src/app/globals.css` の更新
  - [ ] Tailwindのカスタム設定
  - [ ] カラースキーム定義
  - [ ] ダークモード対応（オプション）
- [ ] `src/app/layout.tsx` の作成
  - [ ] ルートレイアウト
  - [ ] メタデータ設定
  - [ ] フォント設定
- [ ] `src/app/page.tsx` の作成
  - [ ] トップページ（チャット画面）
  - [ ] サイドバーとチャットコンテナの配置
  - [ ] レスポンシブレイアウト

### 5.5 レスポンシブ対応
- [ ] モバイル表示の確認と調整
- [ ] タブレット表示の確認と調整
- [ ] デスクトップ表示の確認と調整
- [ ] サイドバーの折りたたみ動作確認

---

## 🧪 フェーズ6: テストの作成

### 6.1 テスト環境のセットアップ
- [ ] `vitest.config.ts` の作成
- [ ] `playwright.config.ts` の作成
- [ ] テスト用のスクリプト追加（package.json）

### 6.2 単体テスト
- [ ] `tests/unit/lib/utils.test.ts`
  - [ ] 会話タイトル生成のテスト
  - [ ] 日付フォーマットのテスト
- [ ] `tests/unit/components/ChatMessage.test.tsx`
  - [ ] ユーザーメッセージの表示テスト
  - [ ] AIメッセージの表示テスト
  - [ ] Markdownレンダリングのテスト
- [ ] `tests/unit/hooks/useChatMessages.test.ts`
  - [ ] メッセージ送信ロジックのテスト
  - [ ] エラーハンドリングのテスト

### 6.3 APIテスト
- [ ] `tests/integration/api/chat.test.ts`
  - [ ] POST /api/chat 正常系テスト
  - [ ] POST /api/chat 異常系テスト
  - [ ] バリデーションテスト
- [ ] `tests/integration/api/conversations.test.ts`
  - [ ] GET /api/conversations テスト
  - [ ] GET /api/conversations/:id テスト
  - [ ] DELETE /api/conversations/:id テスト
  - [ ] 404エラーテスト

### 6.4 E2Eテスト
- [ ] `tests/e2e/chat.spec.ts`
  - [ ] チャット送信フローのテスト
  - [ ] 会話作成フローのテスト
  - [ ] 会話切り替えフローのテスト
  - [ ] 会話削除フローのテスト
- [ ] `tests/e2e/responsive.spec.ts`
  - [ ] モバイル表示のテスト
  - [ ] タブレット表示のテスト
  - [ ] デスクトップ表示のテスト

### 6.5 テスト実行と修正
- [ ] 全単体テストの実行と合格
- [ ] 全APIテストの実行と合格
- [ ] 全E2Eテストの実行と合格
- [ ] カバレッジレポートの確認（目標80%以上）

---

## 🚀 フェーズ7: デプロイ準備

### 7.1 Dockerファイルの作成
- [ ] `Dockerfile` の作成
  - [ ] マルチステージビルド設定
  - [ ] 依存関係のインストール
  - [ ] Prismaクライアント生成
  - [ ] Next.jsビルド
  - [ ] 本番環境設定
- [ ] `.dockerignore` の作成
  - [ ] 不要なファイルの除外

### 7.2 Google Cloud Run設定
- [ ] Cloud Run用の設定ファイル作成（オプション）
- [ ] 環境変数の準備（本番用）
- [ ] MongoDB Atlas接続設定の確認
- [ ] IPホワイトリストの設定（必要に応じて）

### 7.3 CI/CD設定（オプション）
- [ ] `.github/workflows/deploy.yml` の作成
  - [ ] ビルドステップ
  - [ ] テストステップ
  - [ ] デプロイステップ
- [ ] GitHubシークレットの設定
  - [ ] GCP_SA_KEY
  - [ ] GCP_PROJECT_ID
  - [ ] DATABASE_URL
  - [ ] CLAUDE_API_KEY

### 7.4 デプロイ実行
- [ ] ローカルでDockerビルドテスト
  ```bash
  docker build -t ai-chat .
  docker run -p 8080:8080 --env-file .env.local ai-chat
  ```
- [ ] Cloud Runへのデプロイ
  ```bash
  gcloud run deploy ai-chat --source . --region asia-northeast1
  ```
- [ ] 本番環境での動作確認
- [ ] エラーログの確認

---

## 📝 フェーズ8: ドキュメント整備

### 8.1 README.md作成
- [ ] プロジェクト概要
- [ ] 機能一覧
- [ ] インストール手順
- [ ] 環境変数設定
- [ ] 開発サーバー起動方法
- [ ] テスト実行方法
- [ ] デプロイ方法
- [ ] ライセンス情報

### 8.2 コードコメント追加
- [ ] 複雑なロジックへのコメント追加
- [ ] 型定義へのJSDocコメント追加
- [ ] API Routeへのドキュメントコメント

### 8.3 運用ドキュメント
- [ ] トラブルシューティングガイド
- [ ] よくある質問（FAQ）
- [ ] 保守・メンテナンス手順

---

## ✅ 完成チェックリスト

### 機能確認
- [ ] チャットメッセージの送受信が正常に動作する
- [ ] 会話履歴が正しく保存される
- [ ] 会話の切り替えができる
- [ ] 会話の削除ができる
- [ ] レスポンシブデザインが正しく動作する
- [ ] エラーハンドリングが適切に動作する

### 品質確認
- [ ] すべてのテストが合格している
- [ ] コードカバレッジが80%以上
- [ ] ESLintエラーがない
- [ ] TypeScriptエラーがない
- [ ] ビルドエラーがない

### パフォーマンス確認
- [ ] 初回レンダリング時間が3秒以内
- [ ] APIレスポンス時間が適切
- [ ] 大量のメッセージでもスムーズに動作する

### セキュリティ確認
- [ ] APIキーがフロントエンドに露出していない
- [ ] 環境変数が適切に管理されている
- [ ] XSS対策が施されている
- [ ] 入力バリデーションが実装されている

---

## 🎉 完了後のアクション

- [ ] 本番環境へのデプロイ
- [ ] ユーザーフィードバックの収集
- [ ] パフォーマンスモニタリングの開始
- [ ] 今後の機能拡張の検討
- [ ] CLAUDE.mdへの変更履歴の記録

---

## 📊 進捗管理

| フェーズ | ステータス | 完了日 |
|---------|----------|--------|
| フェーズ1: 環境構築 | ⬜️ 未着手 | - |
| フェーズ2: データベース | ⬜️ 未着手 | - |
| フェーズ3: UIコンポーネント | ⬜️ 未着手 | - |
| フェーズ4: バックエンドAPI | ⬜️ 未着手 | - |
| フェーズ5: フロントエンド | ⬜️ 未着手 | - |
| フェーズ6: テスト | ⬜️ 未着手 | - |
| フェーズ7: デプロイ | ⬜️ 未着手 | - |
| フェーズ8: ドキュメント | ⬜️ 未着手 | - |

**ステータス凡例**:
- ⬜️ 未着手
- 🔄 進行中
- ✅ 完了
- ⚠️ ブロック中

---

## 💡 開発のヒント

### 推奨開発順序
1. まず環境構築とデータベースを完成させる
2. バックエンドAPIを先に実装し、Postman等でテスト
3. フロントエンドは小さいコンポーネントから段階的に構築
4. 各機能完成後、すぐにテストを書く
5. 最後にデプロイ準備

### デバッグのコツ
- Prisma Studioでデータベースの状態を確認
- Next.js Dev Toolsでレンダリングを監視
- Chrome DevToolsのNetworkタブでAPI通信を確認
- Console.logで段階的にデバッグ

### パフォーマンス最適化
- React.memoでコンポーネントの再レンダリングを最適化
- useCallbackでコールバック関数をメモ化
- データベースクエリは必要な項目のみselect
- 画像はNext.js Imageコンポーネントを使用

---

**作成日**: 2026-01-21
**最終更新**: 2026-01-21
