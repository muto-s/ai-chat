# GitHub Actions デプロイ設定ガイド

このガイドでは、GitHub Actionsを使用してCloud Runに自動デプロイする設定方法を説明します。

## 概要

- **トリガー**: `main`または`master`ブランチへのpush時に自動実行
- **認証方式**: Workload Identity Federation（推奨）
- **ビルド**: Google Cloud Build
- **デプロイ先**: Cloud Run

---

## 事前準備

### 1. GitHubリポジトリの作成

```bash
# ローカルリポジトリをGitHubにプッシュ
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-chat.git
git push -u origin main
```

---

## Workload Identity Federationの設定

### 2. 必要なAPIを有効化

```bash
gcloud services enable iamcredentials.googleapis.com \
  --project=ai-chat-485709
```

### 3. Workload Identity Poolを作成

```bash
# Workload Identity Poolの作成
gcloud iam workload-identity-pools create "github-pool" \
  --project="ai-chat-485709" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Poolの完全な名前を取得（後で使用）
gcloud iam workload-identity-pools describe "github-pool" \
  --project="ai-chat-485709" \
  --location="global" \
  --format="value(name)"
```

**出力例**:
```
projects/855479565439/locations/global/workloadIdentityPools/github-pool
```

### 4. Workload Identity Providerを作成

```bash
# GitHubリポジトリのオーナー名とリポジトリ名を設定
export GITHUB_OWNER="YOUR_GITHUB_USERNAME"
export GITHUB_REPO="ai-chat"

# Providerの作成
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="ai-chat-485709" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == '${GITHUB_OWNER}'" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### 5. サービスアカウントの作成

```bash
# デプロイ用サービスアカウントの作成（既に存在する場合はスキップ）
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer" \
  --project=ai-chat-485709

# サービスアカウントのメールアドレスを確認
export SA_EMAIL="github-actions-deployer@ai-chat-485709.iam.gserviceaccount.com"
```

### 6. サービスアカウントに権限を付与

```bash
# Cloud Run管理者
gcloud projects add-iam-policy-binding ai-chat-485709 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

# サービスアカウントユーザー
gcloud projects add-iam-policy-binding ai-chat-485709 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# Cloud Build編集者
gcloud projects add-iam-policy-binding ai-chat-485709 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudbuild.builds.editor"

# ストレージ管理者
gcloud projects add-iam-policy-binding ai-chat-485709 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

# Container Registry管理者
gcloud projects add-iam-policy-binding ai-chat-485709 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/containerregistry.ServiceAgent"
```

### 7. Workload Identity連携を設定

```bash
# GitHubリポジトリからサービスアカウントへのアクセスを許可
gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --project="ai-chat-485709" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/855479565439/locations/global/workloadIdentityPools/github-pool/attribute.repository/${GITHUB_OWNER}/${GITHUB_REPO}"
```

### 8. Workload Identity Provider IDを取得

```bash
gcloud iam workload-identity-pools providers describe "github-provider" \
  --project="ai-chat-485709" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"
```

**出力例**:
```
projects/855479565439/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

---

## GitHub Secretsの設定

GitHubリポジトリの **Settings > Secrets and variables > Actions** で以下のSecretを追加します。

### 必要なSecrets

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `WIF_PROVIDER` | `projects/855479565439/locations/global/workloadIdentityPools/github-pool/providers/github-provider` | Workload Identity Provider ID |
| `WIF_SERVICE_ACCOUNT` | `github-actions-deployer@ai-chat-485709.iam.gserviceaccount.com` | サービスアカウントのメールアドレス |

### GitHub Secretsの追加方法

1. GitHubリポジトリにアクセス
2. **Settings** > **Secrets and variables** > **Actions**
3. **New repository secret**をクリック
4. 上記のSecretを追加

---

## ワークフローの動作確認

### 手動実行

1. GitHubリポジトリの **Actions** タブにアクセス
2. **Deploy to Cloud Run** ワークフローを選択
3. **Run workflow** ボタンをクリック
4. ブランチを選択して実行

### 自動実行

`main`または`master`ブランチにプッシュすると自動的にデプロイが実行されます。

```bash
git add .
git commit -m "Update application"
git push origin main
```

---

## トラブルシューティング

### エラー: "failed to generate login config"

**原因**: Workload Identity Federationの設定が不完全

**解決方法**:
1. Workload Identity PoolとProviderが正しく作成されているか確認
2. サービスアカウントに`roles/iam.workloadIdentityUser`ロールが付与されているか確認
3. GitHubのSecretが正しく設定されているか確認

### エラー: "Permission denied"

**原因**: サービスアカウントの権限不足

**解決方法**:
```bash
# 必要な権限を再度付与
gcloud projects add-iam-policy-binding ai-chat-485709 \
  --member="serviceAccount:github-actions-deployer@ai-chat-485709.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

### ビルドが遅い

**対策**:
- `.gcloudignore`ファイルで不要なファイルを除外
- Dockerのマルチステージビルドを活用（既に実装済み）
- Cloud Buildのタイムアウトを調整

---

## セキュリティのベストプラクティス

1. **Workload Identity Federationを使用**: サービスアカウントキーをGitHubに保存しない
2. **最小権限の原則**: サービスアカウントに必要最小限の権限のみを付与
3. **ブランチ保護**: `main`ブランチへの直接プッシュを制限
4. **環境ごとの分離**: 本番環境と開発環境でプロジェクトを分ける

---

## 参考リンク

- [GitHub Actions - Google Cloud Platform](https://github.com/google-github-actions)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run - Continuous Deployment](https://cloud.google.com/run/docs/continuous-deployment)

---

## 代替方法: サービスアカウントキーを使用（簡単だがセキュリティ上は非推奨）

Workload Identity Federationの設定が難しい場合、サービスアカウントキーを使用する方法もあります。

### 手順

#### 1. サービスアカウントキーを作成

```bash
# 既存のサービスアカウントを使用（ai-chat-deployer）
gcloud iam service-accounts keys create ~/ai-chat-github-key.json \
  --iam-account=ai-chat-deployer@ai-chat-485709.iam.gserviceaccount.com
```

#### 2. GitHubにSecretを追加

1. 作成したJSONファイルの内容をコピー
   ```bash
   cat ~/ai-chat-github-key.json
   ```

2. GitHubリポジトリの **Settings > Secrets and variables > Actions**
3. **New repository secret**をクリック
4. Secret名: `GCP_SA_KEY`
5. 値: JSONファイルの内容をそのまま貼り付け

#### 3. ワークフローファイルを変更

`.github/workflows/deploy-with-key.yml`を使用するか、`deploy.yml`の認証部分を以下に変更:

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}
```

#### 4. キーファイルの削除（セキュリティのため）

```bash
rm ~/ai-chat-github-key.json
```

### ⚠️ 注意事項

- サービスアカウントキーは漏洩するとプロジェクトへの不正アクセスのリスクがあります
- 本番環境ではWorkload Identity Federationの使用を強く推奨します
- キーは定期的にローテーションしてください

---

## どちらの方法を選ぶべきか？

| 方法 | メリット | デメリット | 推奨度 |
|-----|---------|----------|--------|
| **Workload Identity Federation** | ・キーファイル不要<br>・より安全<br>・Google推奨 | ・設定が複雑<br>・初回設定に時間がかかる | ⭐⭐⭐⭐⭐ |
| **サービスアカウントキー** | ・設定が簡単<br>・すぐに使える | ・キー漏洩リスク<br>・管理が必要 | ⭐⭐ |

**結論**: 本番環境では**Workload Identity Federation**を使用してください。
