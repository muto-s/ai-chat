# 保守・メンテナンスガイド

このドキュメントでは、AIチャットボットアプリケーションの保守・メンテナンス手順について説明します。

## 定期メンテナンス

### 依存関係の更新

#### 月次更新（推奨）

```bash
# パッケージの更新確認
npm outdated

# マイナーバージョン・パッチバージョンの更新
npm update

# Prismaクライアントの再生成
npx prisma generate

# テスト実行
npm test

# ビルド確認
npm run build
```

#### メジャーバージョン更新

メジャーバージョンの更新は慎重に行う必要があります：

```bash
# 特定のパッケージを更新
npm install next@latest

# または複数パッケージを一度に更新
npm install next@latest react@latest react-dom@latest

# 依存関係の整合性を確認
npm install

# Prismaクライアントの再生成
npx prisma generate

# 全テストを実行
npm test
npm run test:e2e

# 動作確認
npm run dev
```

### データベースメンテナンス

#### MongoDB Atlasでの定期作業

1. **バックアップの確認**
   - MongoDB Atlasダッシュボード → Backup
   - 自動バックアップが有効か確認
   - 必要に応じて手動バックアップを作成

2. **インデックスの最適化**
   ```bash
   # Prisma Studioで確認
   npx prisma studio
   ```

3. **古いデータのアーカイブ（必要に応じて）**
   - 90日以上前の会話を別コレクションに移動するスクリプトを作成

#### Prismaスキーマの更新

```bash
# スキーマ変更後
npx prisma generate
npx prisma db push

# または、マイグレーションを使用する場合
npx prisma migrate dev --name description-of-change
```

## モニタリング

### Cloud Runのモニタリング

#### ログの確認

```bash
# エラーログのみ表示
gcloud run services logs read ai-chat \
  --region asia-northeast1 \
  --log-filter='severity>=ERROR' \
  --limit 100

# 特定期間のログ
gcloud run services logs read ai-chat \
  --region asia-northeast1 \
  --log-filter='timestamp>="2024-01-15T00:00:00Z"'

# リアルタイムでログを監視
gcloud run services logs tail ai-chat \
  --region asia-northeast1
```

#### メトリクスの確認

[Cloud Console](https://console.cloud.google.com/run) でサービスを選択：

- **リクエスト数**: トラフィックの傾向を確認
- **レイテンシ**: 応答時間が遅くなっていないか
- **エラー率**: 4xx/5xxエラーの増加を監視
- **CPU使用率**: コンテナのパフォーマンスを確認
- **メモリ使用率**: メモリリークの兆候を確認

### アラート設定

Google Cloudでアラートを設定：

```bash
# エラー率のアラート（例：5%以上）
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05

# レスポンス時間のアラート（例：3秒以上）
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Latency" \
  --condition-display-name="Latency > 3s" \
  --condition-threshold-value=3000
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. アプリケーションが起動しない

**症状**: コンテナが起動に失敗する

**確認事項**:
```bash
# ログを確認
gcloud run services logs read ai-chat --region asia-northeast1 --limit 50

# 環境変数を確認
gcloud run services describe ai-chat --region asia-northeast1 --format=yaml
```

**解決方法**:
- DATABASE_URLが正しいか確認
- ANTHROPIC_API_KEYが有効か確認
- Prismaクライアントが生成されているか確認

#### 2. データベース接続エラー

**症状**: "Error: Can't reach database server"

**確認事項**:
- MongoDB Atlasのネットワークアクセス設定
- IPホワイトリスト（0.0.0.0/0が設定されているか）
- 接続文字列の形式が正しいか

**解決方法**:
```bash
# 接続文字列の確認
echo $DATABASE_URL

# MongoDB Atlasダッシュボードで確認
# - Network Access → IP Access List
# - Database Access → Database Users
```

#### 3. Claude APIエラー

**症状**: "API request failed"

**確認事項**:
- APIキーが有効か
- レート制限に達していないか
- Anthropicのステータスページを確認

**解決方法**:
```bash
# APIキーをテスト
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'

# シークレットを更新
echo -n "new-api-key" | gcloud secrets versions add anthropic-api-key --data-file=-
```

#### 4. メモリ不足

**症状**: コンテナがOOM（Out of Memory）でクラッシュ

**確認事項**:
```bash
# メモリ使用率を確認
gcloud run services describe ai-chat --region asia-northeast1 --format='value(spec.template.spec.containers[0].resources.limits.memory)'
```

**解決方法**:
```bash
# メモリを増やす
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --memory 1Gi
```

#### 5. レスポンスが遅い

**症状**: リクエストのタイムアウトや遅延

**確認事項**:
- Cloud Runのコンカレンシー設定
- データベースクエリの最適化
- Claude APIの応答時間

**解決方法**:
```bash
# コンカレンシーを調整
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --concurrency 100

# 最小インスタンス数を設定（コールドスタート回避）
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --min-instances 1

# タイムアウトを延長
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --timeout 600
```

## バックアップとリストア

### データベースバックアップ

#### 自動バックアップ（MongoDB Atlas）

MongoDB Atlasでは自動的にバックアップが作成されます：
- ダッシュボード → Backup
- バックアップスケジュールと保持期間を設定

#### 手動バックアップ

```bash
# mongodumpを使用（要: MongoDB Database Tools）
mongodump --uri="$DATABASE_URL" --out=./backup

# 特定のコレクションのみ
mongodump --uri="$DATABASE_URL" \
  --db=ai-chat \
  --collection=conversations \
  --out=./backup
```

### リストア

```bash
# データベース全体をリストア
mongorestore --uri="$DATABASE_URL" ./backup

# 特定のコレクションをリストア
mongorestore --uri="$DATABASE_URL" \
  --db=ai-chat \
  --collection=conversations \
  ./backup/ai-chat/conversations.bson
```

## セキュリティ更新

### 脆弱性スキャン

```bash
# npmの脆弱性チェック
npm audit

# 自動修正可能な問題を修正
npm audit fix

# 重大な問題を確認
npm audit --audit-level=high
```

### Dockerイメージのスキャン

```bash
# Trivyを使用したスキャン（要: Trivy インストール）
trivy image ai-chat:latest

# 重大度highとcriticalのみ表示
trivy image --severity HIGH,CRITICAL ai-chat:latest
```

### シークレットのローテーション

#### APIキーの更新

```bash
# 新しいAPIキーを生成（Anthropic Console）
# Secret Managerを更新
echo -n "new-api-key" | gcloud secrets versions add anthropic-api-key --data-file=-

# サービスを再起動（新しいシークレットを読み込む）
gcloud run services update ai-chat --region asia-northeast1
```

#### データベースパスワードの変更

```bash
# MongoDB Atlasでパスワード変更
# 新しい接続文字列でSecret Managerを更新
echo -n "new-connection-string" | gcloud secrets versions add database-url --data-file=-

# サービスを再起動
gcloud run services update ai-chat --region asia-northeast1
```

## パフォーマンス最適化

### データベースインデックス

```prisma
// schema.prisma
model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String       @db.ObjectId
  // ...

  @@index([conversationId])  // 既存のインデックス
  @@index([createdAt])       // 日付でのソート用
}
```

### キャッシング戦略

Next.jsのキャッシュを活用：

```typescript
// app/api/conversations/route.ts
export const revalidate = 60; // 60秒ごとに再検証
```

### CDN設定（オプション）

Cloud CDNを有効化：

```bash
# Cloud Load Balancerを作成してCloud CDNを有効化
# （詳細は Google Cloud ドキュメント参照）
```

## ロールバック手順

### デプロイのロールバック

```bash
# 以前のリビジョンを確認
gcloud run revisions list --service ai-chat --region asia-northeast1

# 特定のリビジョンにロールバック
gcloud run services update-traffic ai-chat \
  --region asia-northeast1 \
  --to-revisions REVISION_NAME=100
```

### データベースのロールバック

```bash
# MongoDB Atlasからバックアップをリストア
# または手動バックアップからリストア
mongorestore --uri="$DATABASE_URL" ./backup
```

## コスト管理

### コスト削減のヒント

1. **最小インスタンス数を0に設定**
   ```bash
   gcloud run services update ai-chat \
     --region asia-northeast1 \
     --min-instances 0
   ```

2. **不要な古いリビジョンを削除**
   ```bash
   # 古いリビジョンを削除
   gcloud run revisions delete REVISION_NAME --region asia-northeast1
   ```

3. **ログの保持期間を調整**
   ```bash
   # ログの保持期間を30日に設定
   gcloud logging sinks update _Default --log-filter='timestamp>"2024-01-01T00:00:00Z"'
   ```

4. **MongoDB Atlasのクラスターサイズを最適化**
   - 使用量に応じてクラスターをスケールダウン
   - 開発環境は M0（無料）を使用

### コスト監視

```bash
# Cloud Billingレポートを確認
# https://console.cloud.google.com/billing

# 予算アラートを設定
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="AI Chat Budget" \
  --budget-amount=100USD
```

## 緊急時の対応

### サービスの一時停止

```bash
# トラフィックを0%に設定（サービス停止）
gcloud run services update-traffic ai-chat \
  --region asia-northeast1 \
  --to-revisions REVISION_NAME=0

# または全てのインスタンスを0に
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --max-instances 0
```

### サービスの再開

```bash
# トラフィックを100%に戻す
gcloud run services update-traffic ai-chat \
  --region asia-northeast1 \
  --to-latest

# インスタンス数を戻す
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --max-instances 10
```

## チェックリスト

### 週次チェック
- [ ] エラーログの確認
- [ ] レスポンス時間の確認
- [ ] エラー率の確認

### 月次チェック
- [ ] 依存関係の更新確認
- [ ] セキュリティ脆弱性スキャン
- [ ] データベースバックアップの確認
- [ ] コスト使用量の確認

### 四半期チェック
- [ ] メジャーバージョン更新の計画
- [ ] パフォーマンス最適化の検討
- [ ] セキュリティ監査
- [ ] ドキュメントの更新

## 参考資料

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [MongoDB Atlas Operations](https://docs.atlas.mongodb.com/operations/)
- [Next.js Production Checklist](https://nextjs.org/docs/deployment)
