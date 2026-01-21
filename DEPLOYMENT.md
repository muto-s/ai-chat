# デプロイメントガイド

このドキュメントでは、AIチャットボットアプリケーションをGoogle Cloud Runにデプロイする手順を説明します。

## 前提条件

1. **Google Cloudアカウント**
   - [Google Cloud Console](https://console.cloud.google.com/)にアクセス
   - プロジェクトを作成またはを選択

2. **MongoDB Atlas**
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)にアカウント作成
   - クラスターを作成
   - 接続文字列を取得

3. **Anthropic API**
   - [Anthropic Console](https://console.anthropic.com/)でアカウント作成
   - APIキーを取得

4. **ローカル環境**
   - Google Cloud SDK (gcloud CLI) インストール
   - Docker インストール（ローカルテスト用）

## セットアップ手順

### 1. Google Cloud SDKの初期化

```bash
# gcloud CLIの初期化
gcloud init

# プロジェクトIDを設定
gcloud config set project YOUR_PROJECT_ID

# リージョンを設定（東京リージョン）
gcloud config set run/region asia-northeast1

# 必要なAPIを有効化
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

### 2. Secret Managerでシークレットを作成

```bash
# DATABASE_URLを作成
echo -n "mongodb+srv://username:password@cluster.mongodb.net/ai-chat?retryWrites=true&w=majority" | \
  gcloud secrets create database-url --data-file=-

# ANTHROPIC_API_KEYを作成
echo -n "sk-ant-api03-xxx" | \
  gcloud secrets create anthropic-api-key --data-file=-

# シークレットへのアクセス権限を付与
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding anthropic-api-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

注: `PROJECT_NUMBER`はGoogle Cloudプロジェクトの番号です。以下のコマンドで取得できます：
```bash
gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"
```

### 3. MongoDB Atlasの設定

1. **ネットワークアクセス設定**
   - MongoDB Atlasダッシュボードにログイン
   - Network Access → Add IP Address
   - 「Allow Access from Anywhere」を選択（`0.0.0.0/0`）
   - または、Cloud RunのIPレンジを追加

2. **データベースユーザー作成**
   - Database Access → Add New Database User
   - ユーザー名とパスワードを設定
   - 権限を「Read and write to any database」に設定

### 4. ローカルでDockerビルドをテスト（オプション）

```bash
# Dockerイメージをビルド
docker build -t ai-chat .

# 環境変数ファイルを作成
cat > .env.docker <<EOF
DATABASE_URL=your-mongodb-connection-string
ANTHROPIC_API_KEY=your-api-key
NEXT_PUBLIC_APP_URL=http://localhost:8080
EOF

# コンテナを実行
docker run -p 8080:8080 --env-file .env.docker ai-chat

# ブラウザで http://localhost:8080 にアクセスして動作確認
```

### 5. Cloud Runにデプロイ

#### 方法1: gcloud CLIでソースからデプロイ（推奨）

```bash
# プロジェクトルートで実行
gcloud run deploy ai-chat \
  --source . \
  --region asia-northeast1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets=DATABASE_URL=database-url:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0
```

#### 方法2: YAMLファイルを使用してデプロイ

```bash
# cloud-run.yamlを編集してPROJECT_IDを置き換え
sed -i 's/PROJECT_ID/YOUR_PROJECT_ID/g' cloud-run.yaml

# デプロイ
gcloud run services replace cloud-run.yaml
```

### 6. デプロイ後の確認

```bash
# サービスのURLを取得
gcloud run services describe ai-chat \
  --region asia-northeast1 \
  --format="value(status.url)"

# ログを確認
gcloud run services logs read ai-chat \
  --region asia-northeast1 \
  --limit 50
```

ブラウザで取得したURLにアクセスして、アプリケーションが正常に動作することを確認します。

## 環境変数の更新

デプロイ後に環境変数を更新する場合：

```bash
# シークレットを更新
echo -n "new-value" | gcloud secrets versions add database-url --data-file=-

# サービスを再デプロイ（最新のシークレットを使用）
gcloud run services update ai-chat --region asia-northeast1
```

## スケーリング設定の調整

```bash
# 最小インスタンス数を設定（コールドスタートを回避）
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --min-instances 1

# 最大インスタンス数を設定
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --max-instances 20

# 同時実行数を調整
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --concurrency 100
```

## カスタムドメインの設定（オプション）

```bash
# ドメインマッピングを作成
gcloud run domain-mappings create \
  --service ai-chat \
  --domain your-domain.com \
  --region asia-northeast1

# DNSレコードを追加（表示される指示に従う）
```

## モニタリング

### ログの確認

```bash
# リアルタイムでログを監視
gcloud run services logs tail ai-chat --region asia-northeast1

# エラーログのみ表示
gcloud run services logs read ai-chat \
  --region asia-northeast1 \
  --log-filter='severity>=ERROR'
```

### メトリクスの確認

[Cloud Console](https://console.cloud.google.com/run) でサービスを選択し、以下を確認できます：
- リクエスト数
- レイテンシ
- エラー率
- コンテナインスタンス数
- CPU/メモリ使用率

## トラブルシューティング

### デプロイが失敗する場合

1. **ビルドエラー**
   ```bash
   # Cloud Buildのログを確認
   gcloud builds list --limit 5
   gcloud builds log BUILD_ID
   ```

2. **シークレットアクセスエラー**
   ```bash
   # IAM権限を確認
   gcloud secrets get-iam-policy database-url
   ```

3. **コンテナ起動エラー**
   ```bash
   # サービスのログを確認
   gcloud run services logs read ai-chat --region asia-northeast1 --limit 100
   ```

### アプリケーションが起動しない場合

1. **環境変数を確認**
   ```bash
   gcloud run services describe ai-chat --region asia-northeast1 --format=yaml
   ```

2. **データベース接続を確認**
   - MongoDB Atlasのネットワークアクセス設定を確認
   - 接続文字列が正しいか確認

3. **ヘルスチェックを確認**
   - アプリケーションがポート8080でリッスンしているか確認

## コスト最適化

- **最小インスタンス数を0に設定**: トラフィックがない時間帯のコストを削減
- **CPU割り当て**: リクエスト処理時のみCPUを使用（デフォルト）
- **メモリ設定**: 512MiBで十分な場合が多い
- **タイムアウト**: 長時間実行が不要な場合は短く設定

## セキュリティのベストプラクティス

1. **Secret Managerを使用**: 環境変数に直接シークレットを記述しない
2. **IAMロールを最小限に**: 必要な権限のみ付与
3. **VPCコネクタ**: プライベートネットワークでMongoDBに接続する場合
4. **認証**: 必要に応じてCloud IAMやIdentity-Aware Proxyを設定

## CI/CDパイプライン（オプション）

GitHub Actionsを使用した自動デプロイの設定については、`.github/workflows/deploy.yml`を参照してください。

## 参考リンク

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
