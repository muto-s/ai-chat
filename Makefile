.PHONY: help install setup dev build start test test-ui test-coverage test-e2e test-e2e-ui lint clean prisma-generate prisma-push prisma-studio docker-build docker-run deploy deploy-gcloud git-commit

# デフォルトターゲット
.DEFAULT_GOAL := help

# カラー出力用
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

# 変数
PROJECT_NAME := ai-chat
GCP_REGION := asia-northeast1

## help: このヘルプメッセージを表示
help:
	@echo "$(CYAN)AI Chat - 利用可能なコマンド$(NC)"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  $(GREEN)/' | sed 's/:/ $(NC)-/'
	@echo ""

## install: 依存関係をインストール
install:
	@echo "$(CYAN)依存関係をインストール中...$(NC)"
	npm install
	@echo "$(GREEN)✓ 完了$(NC)"

## setup: 初期セットアップ（依存関係インストール + Prisma生成）
setup: install
	@echo "$(CYAN)Prismaクライアントを生成中...$(NC)"
	npx prisma generate
	@echo "$(GREEN)✓ セットアップ完了$(NC)"
	@echo "$(YELLOW)次のステップ:$(NC)"
	@echo "  1. .env.local ファイルを作成してください"
	@echo "  2. DATABASE_URL と ANTHROPIC_API_KEY を設定してください"
	@echo "  3. make prisma-push を実行してデータベーススキーマをプッシュしてください"
	@echo "  4. make dev を実行して開発サーバーを起動してください"

## dev: 開発サーバーを起動
dev:
	@echo "$(CYAN)開発サーバーを起動中...$(NC)"
	npm run dev

## build: 本番用にビルド
build:
	@echo "$(CYAN)本番ビルドを実行中...$(NC)"
	npx prisma generate
	npm run build
	@echo "$(GREEN)✓ ビルド完了$(NC)"

## start: 本番サーバーを起動
start:
	@echo "$(CYAN)本番サーバーを起動中...$(NC)"
	npm start

## test: 単体テストを実行
test:
	@echo "$(CYAN)単体テストを実行中...$(NC)"
	npm test

## test-ui: テストUIを起動
test-ui:
	@echo "$(CYAN)テストUIを起動中...$(NC)"
	npm run test:ui

## test-coverage: カバレッジレポートを生成
test-coverage:
	@echo "$(CYAN)カバレッジレポートを生成中...$(NC)"
	npm run test:coverage

## test-e2e: E2Eテストを実行
test-e2e:
	@echo "$(CYAN)E2Eテストを実行中...$(NC)"
	npm run test:e2e

## test-e2e-ui: E2EテストUIを起動
test-e2e-ui:
	@echo "$(CYAN)E2EテストUIを起動中...$(NC)"
	npm run test:e2e:ui

## lint: リンターを実行
lint:
	@echo "$(CYAN)リンターを実行中...$(NC)"
	npm run lint

## clean: ビルド成果物と依存関係を削除
clean:
	@echo "$(CYAN)クリーンアップ中...$(NC)"
	rm -rf node_modules .next out dist coverage playwright-report test-results
	@echo "$(GREEN)✓ クリーンアップ完了$(NC)"

## prisma-generate: Prismaクライアントを生成
prisma-generate:
	@echo "$(CYAN)Prismaクライアントを生成中...$(NC)"
	npx prisma generate
	@echo "$(GREEN)✓ 生成完了$(NC)"

## prisma-push: データベーススキーマをプッシュ
prisma-push:
	@echo "$(CYAN)データベーススキーマをプッシュ中...$(NC)"
	npx prisma db push
	@echo "$(GREEN)✓ プッシュ完了$(NC)"

## prisma-studio: Prisma Studioを起動
prisma-studio:
	@echo "$(CYAN)Prisma Studioを起動中...$(NC)"
	npx prisma studio

## docker-build: Dockerイメージをビルド
docker-build:
	@echo "$(CYAN)Dockerイメージをビルド中...$(NC)"
	docker build -t $(PROJECT_NAME) .
	@echo "$(GREEN)✓ ビルド完了$(NC)"

## docker-run: Dockerコンテナを実行
docker-run:
	@echo "$(CYAN)Dockerコンテナを起動中...$(NC)"
	docker run -p 8080:8080 --env-file .env.local $(PROJECT_NAME)

## docker-test: Dockerイメージをビルドして起動
docker-test: docker-build
	@echo "$(CYAN)Dockerコンテナをテスト起動中...$(NC)"
	docker run -p 8080:8080 --env-file .env.local $(PROJECT_NAME)

## deploy-gcloud: Google Cloud Runにデプロイ
deploy-gcloud:
	@echo "$(CYAN)Google Cloud Runにデプロイ中...$(NC)"
	@echo "$(YELLOW)注意: gcloud CLIが認証済みであることを確認してください$(NC)"
	gcloud run deploy $(PROJECT_NAME) \
		--source . \
		--region $(GCP_REGION) \
		--platform managed \
		--allow-unauthenticated
	@echo "$(GREEN)✓ デプロイ完了$(NC)"

## deploy-gcloud-secrets: Secret Managerを使用してデプロイ
deploy-gcloud-secrets:
	@echo "$(CYAN)Secret Manager統合でGoogle Cloud Runにデプロイ中...$(NC)"
	gcloud run deploy $(PROJECT_NAME) \
		--source . \
		--region $(GCP_REGION) \
		--platform managed \
		--allow-unauthenticated \
		--set-secrets=DATABASE_URL=database-url:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest \
		--memory 512Mi \
		--cpu 1 \
		--timeout 300 \
		--max-instances 10 \
		--min-instances 0
	@echo "$(GREEN)✓ デプロイ完了$(NC)"

## deploy-url: デプロイされたサービスのURLを取得
deploy-url:
	@echo "$(CYAN)サービスURL:$(NC)"
	@gcloud run services describe $(PROJECT_NAME) \
		--region $(GCP_REGION) \
		--format 'value(status.url)'

## logs: Cloud Runのログを表示
logs:
	@echo "$(CYAN)Cloud Runのログを表示中...$(NC)"
	gcloud run services logs read $(PROJECT_NAME) \
		--region $(GCP_REGION) \
		--limit 50

## logs-tail: Cloud Runのログをリアルタイム表示
logs-tail:
	@echo "$(CYAN)Cloud Runのログをリアルタイム表示中...$(NC)"
	gcloud run services logs tail $(PROJECT_NAME) \
		--region $(GCP_REGION)

## git-commit: 変更をコミット
git-commit:
	@echo "$(CYAN)Git コミット実行中...$(NC)"
	git add -A
	@read -p "コミットメッセージを入力: " message; \
	git commit -m "$$message"
	@echo "$(GREEN)✓ コミット完了$(NC)"

## git-push: リモートリポジトリにプッシュ
git-push:
	@echo "$(CYAN)リモートリポジトリにプッシュ中...$(NC)"
	git push
	@echo "$(GREEN)✓ プッシュ完了$(NC)"

## update-deps: 依存関係を更新
update-deps:
	@echo "$(CYAN)依存関係を更新中...$(NC)"
	npm update
	npx prisma generate
	@echo "$(GREEN)✓ 更新完了$(NC)"

## check-env: 環境変数をチェック
check-env:
	@echo "$(CYAN)環境変数をチェック中...$(NC)"
	@if [ ! -f .env.local ]; then \
		echo "$(YELLOW)⚠ .env.local が見つかりません$(NC)"; \
		exit 1; \
	fi
	@if grep -q "xxxxxxxxxxxxx" .env.local; then \
		echo "$(YELLOW)⚠ .env.local にダミー値が含まれています$(NC)"; \
		echo "  DATABASE_URL と ANTHROPIC_API_KEY を実際の値に置き換えてください"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ 環境変数は設定済みです$(NC)"

## all-tests: すべてのテストを実行
all-tests: test test-e2e
	@echo "$(GREEN)✓ すべてのテスト完了$(NC)"

## ci: CI環境でのテスト実行
ci: lint test
	@echo "$(GREEN)✓ CI テスト完了$(NC)"
