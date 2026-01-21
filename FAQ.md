# よくある質問（FAQ）

## 一般的な質問

### Q1: このアプリケーションは無料で使用できますか？

A: アプリケーション自体はオープンソースですが、以下の外部サービスの費用が発生します：

- **MongoDB Atlas**: 無料枠（M0クラスター）あり。小規模な利用なら無料で使用可能
- **Anthropic Claude API**: 使用量に応じた従量課金。APIキーの取得が必要
- **Google Cloud Run**: 無料枠あり（月間200万リクエストまで無料）

### Q2: どのようなAIモデルを使用していますか？

A: Anthropic Claude 3.5 Sonnetモデルを使用しています。高度な推論能力と自然な会話ができるモデルです。

### Q3: 会話データはどこに保存されますか？

A: MongoDB Atlasデータベースに保存されます。データは暗号化されて保存され、自分専用のデータベースにのみアクセスします。

### Q4: モバイルアプリはありますか？

A: 専用のモバイルアプリはありませんが、レスポンシブデザインによりモバイルブラウザから快適に利用できます。

## セットアップに関する質問

### Q5: MongoDB Atlasのセットアップ方法は？

A: 以下の手順で簡単にセットアップできます：

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)でアカウント作成
2. 無料のM0クラスターを作成
3. Database Access でユーザーを作成
4. Network Access で「0.0.0.0/0」を許可
5. Connect → Connect your application で接続文字列を取得

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

### Q6: Anthropic APIキーの取得方法は？

A: 以下の手順でAPIキーを取得できます：

1. [Anthropic Console](https://console.anthropic.com/)でアカウント作成
2. Billing情報を登録（クレジットカード必要）
3. API Keys セクションで新しいキーを生成
4. 生成されたキーを`.env.local`に設定

### Q7: ローカル開発環境のセットアップで問題が発生します

A: よくある問題と解決方法：

**Prismaクライアントが見つからない**
```bash
npx prisma generate
```

**ポート3000が使用中**
```bash
# 別のポートで起動
PORT=3001 npm run dev
```

**依存関係のインストールエラー**
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## 機能に関する質問

### Q8: 会話の履歴はどれくらい保存されますか？

A: デフォルトでは無期限に保存されます。必要に応じて手動で削除できます。データベースの容量やコストを考慮して、古い会話を定期的に削除することをお勧めします。

### Q9: 複数のユーザーで使用できますか？

A: 現在のバージョンには認証機能がないため、デプロイしたインスタンスにアクセスできる全員が同じ会話を共有します。マルチユーザー対応が必要な場合は、認証機能の追加が必要です。

### Q10: ファイルのアップロードはできますか？

A: 現在のバージョンではテキストベースのチャットのみサポートしています。ファイルアップロード機能は実装されていません。

### Q11: Claude以外のAIモデルに変更できますか？

A: はい、`src/lib/claude.ts` を修正することで他のLLMに変更可能です。Mastraは複数のAIプロバイダーをサポートしています：

- OpenAI GPT-4
- Google Gemini
- その他のMastra対応モデル

## デプロイに関する質問

### Q12: Google Cloud以外のプラットフォームにデプロイできますか？

A: はい、Dockerコンテナとして動作するため、以下のプラットフォームでもデプロイ可能です：

- AWS ECS / Fargate
- Azure Container Instances
- Vercel（ただし、サーバーレス関数の制限に注意）
- Render
- Fly.io

### Q13: Cloud Runへのデプロイに失敗します

A: よくある原因：

1. **gcloud CLIが認証されていない**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **必要なAPIが有効化されていない**
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com
   ```

3. **Dockerビルドが失敗**
   - ローカルで `docker build -t ai-chat .` を実行して確認

4. **環境変数が設定されていない**
   - Secret Managerに正しく設定されているか確認

### Q14: デプロイ後にアプリケーションが起動しません

A: 以下を確認してください：

```bash
# ログを確認
gcloud run services logs read ai-chat --region asia-northeast1 --limit 50

# サービスの状態を確認
gcloud run services describe ai-chat --region asia-northeast1
```

よくある原因：
- DATABASE_URLが正しく設定されていない
- ANTHROPIC_API_KEYが無効
- Prismaクライアントが生成されていない

### Q15: カスタムドメインを設定したい

A: Cloud Runでカスタムドメインを設定できます：

```bash
gcloud run domain-mappings create \
  --service ai-chat \
  --domain your-domain.com \
  --region asia-northeast1
```

表示されるDNSレコードをドメインプロバイダーに追加してください。

## パフォーマンスに関する質問

### Q16: レスポンスが遅い場合の対処法は？

A: 以下を試してください：

1. **最小インスタンス数を設定（コールドスタート回避）**
   ```bash
   gcloud run services update ai-chat --region asia-northeast1 --min-instances 1
   ```

2. **メモリを増やす**
   ```bash
   gcloud run services update ai-chat --region asia-northeast1 --memory 1Gi
   ```

3. **リージョンを確認**
   - MongoDBとCloud Runを近いリージョンに配置

4. **データベースインデックスを最適化**
   - Prisma Studioでクエリパフォーマンスを確認

### Q17: コストを削減する方法は？

A: 以下の方法でコストを削減できます：

1. **Cloud Run**
   - 最小インスタンス数を0に設定
   - 不要な古いリビジョンを削除
   - メモリ・CPU設定を最適化

2. **MongoDB Atlas**
   - 開発環境はM0（無料）を使用
   - 本番環境も小規模ならM2/M5で十分
   - 古いデータを定期的に削除

3. **Claude API**
   - 不要な長いプロンプトを避ける
   - エラー時のリトライ回数を制限

### Q18: 同時アクセス数の上限は？

A: 以下の設定で制御できます：

```bash
# 最大インスタンス数を設定
gcloud run services update ai-chat --region asia-northeast1 --max-instances 20

# コンカレンシー（1コンテナあたりの同時リクエスト数）
gcloud run services update ai-chat --region asia-northeast1 --concurrency 100
```

最大同時アクセス数 = 最大インスタンス数 × コンカレンシー

## セキュリティに関する質問

### Q19: セキュリティ対策は十分ですか？

A: 以下のセキュリティ対策が実装されています：

- ✅ TypeScriptによる型安全性
- ✅ Zodによる入力バリデーション
- ✅ Secret Managerによるシークレット管理
- ✅ 非rootユーザーでのコンテナ実行
- ✅ MongoDBの接続暗号化
- ✅ HTTPS通信（Cloud Run自動提供）

ただし、以下は実装されていません：
- ❌ ユーザー認証・認可
- ❌ レート制限
- ❌ XSS/CSRF対策（基本的な対策のみ）

本番環境では追加のセキュリティ対策を検討してください。

### Q20: 認証機能を追加したい

A: 以下の方法で認証を追加できます：

1. **Next.js Auth.js（旧NextAuth.js）を使用**
   ```bash
   npm install next-auth
   ```

2. **Cloud Identity-Aware Proxyを使用**
   - Google Cloud側で認証を管理

3. **ClerkやAuth0などのSaaSを使用**
   - 簡単に統合可能

## トラブルシューティング

### Q21: データベース接続エラーが発生します

A: 以下を確認してください：

1. **接続文字列の形式**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

2. **MongoDB Atlasの設定**
   - Network Access: 0.0.0.0/0が許可されているか
   - Database Access: ユーザーが作成されているか

3. **接続文字列の特殊文字**
   - パスワードに`@`や`/`などが含まれる場合はURLエンコードが必要

### Q22: Claude APIエラーが頻発します

A: 以下を確認してください：

1. **APIキーが有効か**
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
   ```

2. **レート制限**
   - Anthropic Consoleでレート制限を確認
   - 必要に応じてプランをアップグレード

3. **Anthropicのステータス**
   - [Anthropic Status Page](https://status.anthropic.com/)を確認

### Q23: ビルドエラーが発生します

A: エラーメッセージに応じて対処してください：

**TypeScriptエラー**
```bash
npm run lint
# エラーを修正
```

**Prismaエラー**
```bash
npx prisma generate
npx prisma validate
```

**依存関係エラー**
```bash
rm -rf node_modules package-lock.json
npm install
```

## その他

### Q24: コントリビューションは歓迎ですか？

A: はい、プルリクエストを歓迎します！以下のガイドラインに従ってください：

1. Issueを作成して機能や修正を提案
2. フィーチャーブランチを作成
3. テストを追加・実行
4. プルリクエストを作成

詳細は [README.md](./README.md) のコントリビューションセクションを参照してください。

### Q25: 商用利用は可能ですか？

A: はい、MITライセンスのため商用利用可能です。ただし、以下の点に注意してください：

- Claude APIの利用規約を確認
- Anthropicの商用利用条件を確認
- 必要に応じて独自の利用規約を追加

### Q26: サポートはどこで受けられますか？

A: 以下の方法でサポートを受けられます：

- GitHub Issuesで質問・バグ報告
- GitHubのDiscussionsでコミュニティと議論
- ドキュメント（README.md、DEPLOYMENT.md、MAINTENANCE.md）を参照

### Q27: 今後の機能追加予定は？

A: 以下の機能を検討中です（コントリビューション歓迎）：

- [ ] ユーザー認証・認可
- [ ] ファイルアップロード機能
- [ ] 会話の検索機能
- [ ] タグ・カテゴリ機能
- [ ] マークダウンエクスポート
- [ ] 多言語対応
- [ ] テーマカスタマイズ
- [ ] レート制限
- [ ] 管理者ダッシュボード

## さらなるヘルプ

この FAQ で解決しない問題がある場合は、以下を参照してください：

- [README.md](./README.md) - 基本的なセットアップと使用方法
- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイに関する詳細
- [MAINTENANCE.md](./MAINTENANCE.md) - 保守・メンテナンス情報
- [GitHub Issues](https://github.com/your-repo/issues) - バグ報告・機能リクエスト
