#!/bin/bash

# ========================================
# AI Chat - Google Cloud Run デプロイスクリプト
# ========================================

set -e

PROJECT_ID="ai-chat-485709"
SERVICE_NAME="ai-chat"
REGION="asia-northeast1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 AI Chat アプリケーションをGoogle Cloud Runにデプロイします"
echo "プロジェクトID: ${PROJECT_ID}"
echo "リージョン: ${REGION}"
echo ""

# プロジェクト設定
echo "📋 プロジェクトを設定中..."
gcloud config set project ${PROJECT_ID}

# 認証確認
echo "🔐 認証状態を確認中..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ 認証されていません。以下のコマンドで認証してください:"
    echo "   gcloud auth login"
    exit 1
fi

# 必要なAPIを有効化
echo "🔧 必要なAPIを有効化中..."
gcloud services enable cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    containerregistry.googleapis.com

# Dockerイメージをビルド＆プッシュ
echo "🐳 Dockerイメージをビルド中..."
gcloud builds submit --tag ${IMAGE_NAME}

# 環境変数の確認
echo ""
echo "⚠️  環境変数の設定が必要です"
echo "以下の環境変数をSecret Managerに設定してください:"
echo ""
echo "1. DATABASE_URL (MongoDB接続文字列)"
echo "   gcloud secrets create database-url --data-file=- <<< 'your-mongodb-url'"
echo ""
echo "2. ANTHROPIC_API_KEY"
echo "   gcloud secrets create anthropic-api-key --data-file=- <<< 'your-api-key'"
echo ""

read -p "環境変数は設定済みですか？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "環境変数を設定してから再度実行してください"
    exit 1
fi

# Cloud Runにデプロイ
echo "☁️  Cloud Runにデプロイ中..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
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

echo ""
echo "✅ デプロイが完了しました！"
echo ""
echo "📱 アプリケーションURL:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)'
echo ""
echo "📊 サービス詳細:"
echo "   gcloud run services describe ${SERVICE_NAME} --region ${REGION}"
echo ""
echo "📝 ログ表示:"
echo "   gcloud run services logs read ${SERVICE_NAME} --region ${REGION}"
