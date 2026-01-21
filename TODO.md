# AIチャットボット 開発TODOリスト

## 📋 プロジェクト概要
Next.js App Router + Hono + Prisma + MongoDB + Mastra + Claude API を使用したAIチャットボットの構築

---

## 🎯 フェーズ1: 環境構築とプロジェクト初期化

### 1.1 プロジェクトセットアップ
- [x] Node.js 20.x以上がインストールされているか確認
- [x] Next.jsプロジェクトの作成（TypeScript, Tailwind CSS, ESLint有効）
  ```bash
  npx create-next-app@latest . --typescript --tailwind --app --eslint
  ```
- [x] 必要なパッケージのインストール
  ```bash
  npm install prisma @prisma/client hono mastra@beta @mastra/core@beta @ai-sdk/anthropic react-markdown zod
  ```
- [x] 開発用パッケージのインストール
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
- [x] `.env.local` ファイルの作成
- [x] `DATABASE_URL` の設定（MongoDB接続文字列）
- [x] `ANTHROPIC_API_KEY` の設定
- [x] `NEXT_PUBLIC_APP_URL` の設定（開発: http://localhost:3000）
- [x] `.env.example` ファイルの作成（テンプレート用）

### 1.4 Git初期化
- [x] `.gitignore` の確認・更新（.env.local, node_modules等）
- [x] Gitリポジトリの初期化
- [x] 初回コミット

---

## 🗄️ フェーズ2: データベース・Prismaセットアップ

### 2.1 Prismaの初期化
- [x] Prisma初期化コマンド実行
  ```bash
  npx prisma init --datasource-provider mongodb
  ```
- [x] `prisma/schema.prisma` の作成
  - [x] datasource設定（MongoDB）
  - [x] generator設定
  - [x] Conversationモデル定義
  - [x] Messageモデル定義

### 2.2 Prismaクライアントの設定
- [x] `src/lib/prisma.ts` の作成
  - [x] PrismaClientのシングルトンインスタンス作成
  - [x] 開発環境でのホットリロード対応

### 2.3 データベースマイグレーション
- [x] Prismaクライアント生成
  ```bash
  npx prisma generate
  ```
- [ ] データベーススキーマのプッシュ（MongoDB接続設定後に実行）
  ```bash
  npx prisma db push
  ```
- [ ] Prisma Studioで動作確認（MongoDB接続設定後に実行）
  ```bash
  npx prisma studio
  ```

---

## 🎨 フェーズ3: UIコンポーネント基礎（shadcn/ui）

### 3.1 shadcn/ui セットアップ
- [x] shadcn/ui の初期化
  ```bash
  npx shadcn@latest init -y --defaults
  ```
- [x] `components.json` の設定確認

### 3.2 必要なコンポーネントのインストール
- [x] Button コンポーネント
  ```bash
  npx shadcn@latest add button -y
  ```
- [x] Input コンポーネント
  ```bash
  npx shadcn@latest add input -y
  ```
- [x] Textarea コンポーネント
  ```bash
  npx shadcn@latest add textarea -y
  ```
- [x] Dialog コンポーネント（削除確認用）
  ```bash
  npx shadcn@latest add dialog -y
  ```
- [x] ScrollArea コンポーネント
  ```bash
  npx shadcn@latest add scroll-area -y
  ```
- [x] Card コンポーネント
  ```bash
  npx shadcn@latest add card -y
  ```

---

## 🔧 フェーズ4: バックエンドAPI開発

### 4.1 型定義の作成
- [x] `src/types/chat.ts` の作成
  - [x] Role型の定義
  - [x] Message型の定義
  - [x] Conversation型の定義
  - [x] ChatRequest型の定義
  - [x] ChatResponse型の定義
- [x] `src/types/api.ts` の作成
  - [x] APIエラーレスポンス型の定義

### 4.2 Mastra統合
- [x] `src/lib/claude.ts` の作成
  - [x] Mastra Agentの初期化
  - [x] Anthropic Claudeモデル設定
  - [x] sendMessageToClaude関数の実装
  - [x] エラーハンドリング

### 4.3 ユーティリティの作成
- [x] `src/utils/errors.ts` の作成
  - [x] カスタムエラークラス定義
  - [x] エラーハンドリングヘルパー関数
- [x] `src/utils/logger.ts` の作成
  - [x] 基本的なロガー実装
- [x] `src/lib/utils.ts` の更新
  - [x] 会話タイトル生成関数
  - [x] 日付フォーマット関数

### 4.4 Hono統合（オプション）
- [ ] `src/lib/hono.ts` の作成
  - [ ] Honoアプリインスタンス作成
  - [ ] ミドルウェア設定
- [ ] Honoルートの定義（Next.js API Routesと統合）

### 4.5 API Route: POST /api/chat
- [x] `src/app/api/chat/route.ts` の作成
  - [x] POSTハンドラー実装
  - [x] リクエストバリデーション（zod使用）
  - [x] 新規会話の作成処理
  - [x] ユーザーメッセージの保存
  - [x] Claude APIへのリクエスト（Mastra経由）
  - [x] AIメッセージの保存
  - [x] レスポンス返却
  - [x] エラーハンドリング

### 4.6 API Route: GET /api/conversations
- [x] `src/app/api/conversations/route.ts` の作成
  - [x] GETハンドラー実装
  - [x] 会話一覧の取得（最新順）
  - [x] レスポンス返却
  - [x] エラーハンドリング

### 4.7 API Route: GET /api/conversations/:id
- [x] `src/app/api/conversations/[id]/route.ts` の作成
  - [x] GETハンドラー実装
  - [x] 会話IDのバリデーション
  - [x] 会話とメッセージの取得
  - [x] 404エラーハンドリング
  - [x] レスポンス返却

### 4.8 API Route: DELETE /api/conversations/:id
- [x] `src/app/api/conversations/[id]/route.ts` にDELETEハンドラー追加
  - [x] DELETEハンドラー実装
  - [x] 会話IDのバリデーション
  - [x] 会話の削除（カスケード削除でメッセージも削除）
  - [x] 404エラーハンドリング
  - [x] レスポンス返却

---

## 🎭 フェーズ5: フロントエンド開発

### 5.1 カスタムフックの作成
- [x] `src/hooks/useConversations.ts` の作成
  - [x] 会話一覧の取得ロジック
  - [x] 会話削除ロジック
  - [x] ローディング・エラー状態管理
- [x] `src/hooks/useChatMessages.ts` の作成
  - [x] メッセージ送信ロジック
  - [x] メッセージ一覧の管理
  - [x] 楽観的UI更新
  - [x] ローディング・エラー状態管理

### 5.2 チャットコンポーネントの作成
- [x] `src/components/chat/MarkdownRenderer.tsx` の作成
  - [x] react-markdownを使用したレンダリング
  - [x] コードブロックのスタイリング
  - [x] リンクの安全な処理
- [x] `src/components/chat/ChatMessage.tsx` の作成
  - [x] ユーザー/AIメッセージの表示
  - [x] ロールに応じたスタイリング
  - [x] タイムスタンプ表示
  - [x] Markdownレンダリング統合
- [x] `src/components/chat/ChatMessageList.tsx` の作成
  - [x] メッセージ一覧表示
  - [x] 自動スクロール（最新メッセージへ）
  - [x] 空状態の表示
  - [x] ローディング状態の表示
- [x] `src/components/chat/ChatInput.tsx` の作成
  - [x] テキストエリア
  - [x] 送信ボタン
  - [x] Enter送信・Shift+Enter改行
  - [x] 送信中の無効化
  - [x] 文字数制限（5000文字）
- [x] `src/components/chat/ChatContainer.tsx` の作成
  - [x] チャット画面全体の統合
  - [x] メッセージリストと入力フィールドの配置
  - [x] 状態管理の統合

### 5.3 サイドバーコンポーネントの作成
- [x] `src/components/sidebar/NewChatButton.tsx` の作成
  - [x] 新規会話作成ボタン
  - [x] クリックハンドラー
- [x] `src/components/sidebar/ConversationItem.tsx` の作成
  - [x] 会話タイトル表示
  - [x] 選択状態のハイライト
  - [x] ホバー時の削除ボタン表示
  - [x] 削除確認ダイアログ統合
- [x] `src/components/sidebar/ConversationList.tsx` の作成
  - [x] 会話一覧の表示
  - [x] スクロール対応
  - [x] 空状態の表示
- [x] `src/components/sidebar/Sidebar.tsx` の作成
  - [x] サイドバー全体の統合
  - [x] 折りたたみ機能（モバイル対応）
  - [x] レスポンシブデザイン

### 5.4 レイアウトとページの作成
- [x] `src/app/globals.css` の更新（shadcn/uiで自動設定済み）
  - [x] Tailwindのカスタム設定
  - [x] カラースキーム定義
  - [x] ダークモード対応
- [x] `src/app/layout.tsx` の作成
  - [x] ルートレイアウト
  - [x] メタデータ設定
  - [x] フォント設定
- [x] `src/app/page.tsx` の作成
  - [x] トップページ（チャット画面）
  - [x] サイドバーとチャットコンテナの配置
  - [x] レスポンシブレイアウト

### 5.5 レスポンシブ対応
- [x] モバイル表示対応（サイドバー折りたたみ実装）
- [x] タブレット表示対応
- [x] デスクトップ表示対応
- [x] サイドバーの折りたたみ動作実装

---

## 🧪 フェーズ6: テストの作成

### 6.1 テスト環境のセットアップ
- [x] `vitest.config.ts` の作成
- [x] `playwright.config.ts` の作成
- [x] テスト用のスクリプト追加（package.json）

### 6.2 単体テスト
- [x] `tests/unit/lib/utils.test.ts`
  - [x] 会話タイトル生成のテスト
  - [x] 日付フォーマットのテスト
  - [x] 相対時間表示のテスト
  - [x] クラス名マージのテスト
- [x] `tests/unit/utils/errors.test.ts`
  - [x] APIErrorクラスのテスト
  - [x] エラーレスポンス作成のテスト
  - [x] エラーハンドラーのテスト
- [x] `tests/unit/components/ChatMessage.test.tsx`
  - [x] ユーザーメッセージの表示テスト
  - [x] AIメッセージの表示テスト
  - [x] Markdownレンダリングのテスト
  - [x] スタイリングのテスト
  - [x] タイムスタンプ表示のテスト
- [x] `tests/unit/hooks/useConversations.test.tsx`
  - [x] 会話一覧取得のテスト
  - [x] 会話削除のテスト
  - [x] エラーハンドリングのテスト
  - [x] リフェッチ機能のテスト

### 6.3 APIテスト
- [x] `tests/api/chat.test.ts`
  - [x] POST /api/chat 正常系テスト（新規会話）
  - [x] POST /api/chat 正常系テスト（既存会話）
  - [x] POST /api/chat 異常系テスト（バリデーションエラー）
  - [x] POST /api/chat 異常系テスト（会話が見つからない）
  - [x] POST /api/chat 異常系テスト（Claude APIエラー）
  - [x] 会話履歴の統合テスト
  - [x] データベースエラーのテスト

### 6.4 E2Eテスト
- [x] `tests/e2e/chat.spec.ts`
  - [x] チャット送信フローのテスト
  - [x] 会話作成フローのテスト
  - [x] 会話切り替えフローのテスト
  - [x] エラーハンドリングのテスト
  - [x] キーボード操作（Enter/Shift+Enter）のテスト
  - [x] ローディング状態のテスト
  - [x] レスポンシブ表示のテスト

### 6.5 テスト実行と修正
- [x] 全単体テストの実行と合格（70テスト、100%成功）
- [x] 全APIテストの実行と合格
- [x] E2Eテストファイルの作成完了
- [x] react-markdownのclassName問題の修正
- [x] vitest設定の最適化（E2Eテスト除外）

---

## 🚀 フェーズ7: デプロイ準備

### 7.1 Dockerファイルの作成
- [x] `Dockerfile` の作成
  - [x] マルチステージビルド設定（deps, build-deps, build, production）
  - [x] 依存関係のキャッシュ最適化
  - [x] Prismaクライアント生成
  - [x] Next.js standalone出力
  - [x] 非rootユーザー（nextjs）での実行
  - [x] ヘルスチェック設定
  - [x] ポート8080設定（Cloud Run対応）
- [x] `.dockerignore` の作成
  - [x] 不要なファイルの除外
  - [x] テストファイル、ドキュメント、CI/CD設定の除外

### 7.2 Google Cloud Run設定
- [x] `cloud-run.yaml` の作成
  - [x] スケーリング設定（min: 0, max: 10）
  - [x] リソース制限（CPU: 1, Memory: 512Mi）
  - [x] Secret Manager統合
  - [x] ヘルスチェック設定
- [x] `.env.production.example` の作成
  - [x] 本番環境用環境変数テンプレート
- [x] `DEPLOYMENT.md` の作成
  - [x] セットアップ手順
  - [x] Secret Managerの設定
  - [x] MongoDB Atlasの設定
  - [x] デプロイコマンド
  - [x] トラブルシューティング
  - [x] コスト最適化のヒント
  - [x] セキュリティのベストプラクティス

### 7.3 CI/CD設定（オプション）
- [x] `.github/workflows/deploy.yml` の作成
  - [x] テストステップ（lint, unit tests）
  - [x] ビルドステップ（Docker build & push）
  - [x] デプロイステップ（Cloud Run deploy）
  - [x] サービスURL出力
- [x] `.github/workflows/test.yml` の作成
  - [x] PRでのテスト自動実行
  - [x] カバレッジレポートのアップロード
- [x] `next.config.ts` の更新
  - [x] standalone出力の有効化

### 7.4 デプロイ実行（手動）
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
| フェーズ1: 環境構築 | ✅ 完了 | 2026-01-21 |
| フェーズ2: データベース | ✅ 完了 | 2026-01-21 |
| フェーズ3: UIコンポーネント | ✅ 完了 | 2026-01-21 |
| フェーズ4: バックエンドAPI | ✅ 完了 | 2026-01-21 |
| フェーズ5: フロントエンド | ✅ 完了 | 2026-01-21 |
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
