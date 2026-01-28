#!/bin/bash

# ========================================
# AI Chat - Secret Manager 設定スクリプト
# ========================================

set -e

PROJECT_ID="ai-chat-485709"

echo "🔐 Secret Managerに環境変数を設定します"
echo "プロジェクトID: ${PROJECT_ID}"
echo ""

# プロジェクト設定
gcloud config set project ${PROJECT_ID}

# Secret Manager APIを有効化
echo "🔧 Secret Manager APIを有効化中..."
gcloud services enable secretmanager.googleapis.com

echo ""
echo "📝 環境変数を入力してください:"
echo ""

# DATABASE_URLの設定
echo "1. DATABASE_URL (MongoDB接続文字列)"
echo "   例: mongodb+srv://username:password@cluster.mongodb.net/ai-chat?retryWrites=true&w=majority"
read -p "DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URLが入力されていません"
    exit 1
fi

# ANTHROPIC_API_KEYの設定
echo ""
echo "2. ANTHROPIC_API_KEY"
echo "   例: sk-ant-xxxxxxxxxxxxx"
read -p "ANTHROPIC_API_KEY: " ANTHROPIC_API_KEY

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEYが入力されていません"
    exit 1
fi

echo ""
echo "🔒 Secretsを作成中..."

# DATABASE_URLを作成
if gcloud secrets describe database-url >/dev/null 2>&1; then
    echo "database-url は既に存在します。新しいバージョンを追加します..."
    echo -n "$DATABASE_URL" | gcloud secrets versions add database-url --data-file=-
else
    echo -n "$DATABASE_URL" | gcloud secrets create database-url --data-file=-
fi

# ANTHROPIC_API_KEYを作成
if gcloud secrets describe anthropic-api-key >/dev/null 2>&1; then
    echo "anthropic-api-key は既に存在します。新しいバージョンを追加します..."
    echo -n "$ANTHROPIC_API_KEY" | gcloud secrets versions add anthropic-api-key --data-file=-
else
    echo -n "$ANTHROPIC_API_KEY" | gcloud secrets create anthropic-api-key --data-file=-
fi

# Cloud Runサービスアカウントに権限を付与
echo ""
echo "🔑 Cloud Runサービスアカウントに権限を付与中..."

# デフォルトのCompute Engine サービスアカウントを取得
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding database-url \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding anthropic-api-key \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

echo ""
echo "✅ Secretsの設定が完了しました！"
echo ""
echo "📋 作成されたSecrets:"
gcloud secrets list
echo ""
echo "次のコマンドでデプロイを実行してください:"
echo "  ./deploy.sh"
