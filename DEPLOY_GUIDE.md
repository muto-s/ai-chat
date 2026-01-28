# AI Chat - Google Cloud Run デプロイガイド

このガイドでは、AI ChatアプリケーションをGoogle Cloud Runにデプロイする手順を説明します。

## 前提条件

- Google Cloudプロジェクト（プロジェクトID: `ai-chat-485709`）
- Google Cloud SDK（gcloud CLI）がインストールされていること
- MongoDB AtlasまたはMongoDB Cloudのアカウントとデータベース
- Anthropic Claude APIキー

## デプロイ手順

### 1. 認証

ローカルマシンでGoogle Cloudに認証します。

```bash
gcloud auth login
```

ブラウザが開き、Googleアカウントでログインします。

### 2. プロジェクトの確認

```bash
gcloud config set project ai-chat-485709
gcloud config list
```

### 3. 必要なAPIを有効化

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    containerregistry.googleapis.com
```

### 4. 環境変数をSecret Managerに設定

自動セットアップスクリプトを使用:

```bash
cd /home/svf/ai-chat
./setup-secrets.sh
```

または、手動で設定:

```bash
# DATABASE_URLを設定
echo -n "your-mongodb-connection-string" | \
    gcloud secrets create database-url --data-file=-

# ANTHROPIC_API_KEYを設定
echo -n "sk-ant-xxxxxxxxxxxxx" | \
    gcloud secrets create anthropic-api-key --data-file=-

# Cloud Runサービスアカウントに権限を付与
PROJECT_NUMBER=$(gcloud projects describe ai-chat-485709 --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding database-url \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding anthropic-api-key \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
```

### 5. デプロイ

自動デプロイスクリプトを使用:

```bash
./deploy.sh
```

または、手動でデプロイ:

```bash
# Dockerイメージをビルド＆プッシュ
gcloud builds submit --tag gcr.io/ai-chat-485709/ai-chat

# Cloud Runにデプロイ
gcloud run deploy ai-chat \
    --image gcr.io/ai-chat-485709/ai-chat \
    --platform managed \
    --region asia-northeast1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --min-instances 0 \
    --max-instances 10 \
    --set-secrets="DATABASE_URL=database-url:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest" \
    --set-env-vars="NODE_ENV=production"
```

### 6. デプロイ確認

```bash
# サービスURLを取得
gcloud run services describe ai-chat \
    --region asia-northeast1 \
    --format='value(status.url)'

# サービス詳細を表示
gcloud run services describe ai-chat --region asia-northeast1

# ログを表示
gcloud run services logs read ai-chat --region asia-northeast1 --limit=50
```

## デプロイ設定

### リソース制限

- **CPU**: 1コア
- **メモリ**: 512Mi
- **タイムアウト**: 300秒（5分）
- **同時実行数**: 80リクエスト/コンテナ

### スケーリング設定

- **最小インスタンス数**: 0（コールドスタート有効）
- **最大インスタンス数**: 10

### 環境変数

- `NODE_ENV`: production
- `DATABASE_URL`: Secret Managerから取得
- `ANTHROPIC_API_KEY`: Secret Managerから取得

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでDockerビルドをテスト
docker build -t ai-chat .
docker run -p 8080:8080 --env-file .env.local ai-chat
```

### デプロイエラー

```bash
# ログを確認
gcloud run services logs read ai-chat --region asia-northeast1 --limit=100

# サービスの状態を確認
gcloud run services describe ai-chat --region asia-northeast1
```

### Secret Managerエラー

```bash
# Secretsが存在するか確認
gcloud secrets list

# Secretの内容を確認（注意: 本番環境では実行しないこと）
gcloud secrets versions access latest --secret="database-url"

# IAM権限を確認
gcloud secrets get-iam-policy database-url
gcloud secrets get-iam-policy anthropic-api-key
```

### データベース接続エラー

- MongoDB Atlasのネットワークアクセス設定を確認
  - `0.0.0.0/0`（すべてのIPアドレス）を許可する必要があります
- DATABASE_URLの形式を確認
  - `mongodb+srv://`で始まっているか
  - ユーザー名、パスワード、クラスター名が正しいか

## 更新・再デプロイ

コードを更新した後、再度デプロイします。

```bash
./deploy.sh
```

または:

```bash
gcloud builds submit --tag gcr.io/ai-chat-485709/ai-chat
gcloud run deploy ai-chat --image gcr.io/ai-chat-485709/ai-chat --region asia-northeast1
```

## コスト最適化

- **最小インスタンス数を0に設定済み**: 使用していない時は課金されません
- **メモリを512Miに制限**: コストを抑えます
- **自動スケーリング**: トラフィックに応じて自動調整されます

## セキュリティ

- **Secret Manager使用**: 環境変数を安全に管理
- **非rootユーザーで実行**: Dockerコンテナ内でセキュアに実行
- **HTTPS強制**: Cloud RunはデフォルトでHTTPSを使用

## モニタリング

Google Cloud Consoleでモニタリングできます:

1. [Cloud Run コンソール](https://console.cloud.google.com/run?project=ai-chat-485709)
2. サービス「ai-chat」を選択
3. 「メトリクス」タブでパフォーマンスを確認
4. 「ログ」タブでログを確認

## サポート

問題が発生した場合:

1. ログを確認: `gcloud run services logs read ai-chat --region asia-northeast1`
2. サービスの状態を確認: `gcloud run services describe ai-chat --region asia-northeast1`
3. [Google Cloud サポート](https://cloud.google.com/support)に問い合わせ

---

**作成日**: 2026-01-28
**プロジェクトID**: ai-chat-485709
**リージョン**: asia-northeast1
