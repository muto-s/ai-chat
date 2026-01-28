# サービスアカウント設定ガイド

## サービスアカウントを使用したデプロイ方法

ブラウザなしでデプロイするには、サービスアカウントキーを使用します。

## 手順

### 1. Google Cloud Consoleでサービスアカウントを作成

1. [IAMサービスアカウント画面](https://console.cloud.google.com/iam-admin/serviceaccounts?project=ai-chat-485709)を開く

2. **「サービスアカウントを作成」** をクリック

3. サービスアカウントの詳細を入力:
   - **名前**: `ai-chat-deployer`
   - **ID**: `ai-chat-deployer`（自動生成）
   - **説明**: `AI Chat deployment service account`

4. **「作成して続行」** をクリック

### 2. 必要なロールを付与

以下のロールを追加:

- ✅ **Cloud Run 管理者** (`roles/run.admin`)
- ✅ **Cloud Build 編集者** (`roles/cloudbuild.builds.editor`)
- ✅ **Secret Manager 管理者** (`roles/secretmanager.admin`)
- ✅ **サービス アカウント ユーザー** (`roles/iam.serviceAccountUser`)
- ✅ **ストレージ管理者** (`roles/storage.admin`)

### 3. JSONキーをダウンロード

1. 作成されたサービスアカウントをクリック
2. **「キー」** タブに移動
3. **「鍵を追加」** → **「新しい鍵を作成」**
4. **「JSON」** を選択
5. **「作成」** をクリック
6. JSONファイルがダウンロードされます（例: `ai-chat-485709-xxxxx.json`）

### 4. JSONキーを使用して認証

ダウンロードしたJSONキーファイルを以下の場所に配置:

```bash
# ファイルをプロジェクトディレクトリにコピー
cp /path/to/downloaded-key.json /home/svf/ai-chat/service-account-key.json

# または、直接認証
gcloud auth activate-service-account --key-file=/path/to/service-account-key.json
```

### 5. デプロイ実行

```bash
cd /home/svf/ai-chat

# 環境変数を設定
./setup-secrets.sh

# デプロイ
./deploy.sh
```

## セキュリティ注意事項

⚠️ **重要**: サービスアカウントキーは機密情報です

- ✅ ファイルを安全に保管
- ✅ Gitにコミットしない（.gitignoreに追加済み）
- ✅ 使用後は削除を検討
- ❌ 公開リポジトリにアップロードしない

## トラブルシューティング

### 権限エラーが発生する場合

```bash
# プロジェクトのIAM設定を確認
gcloud projects get-iam-policy ai-chat-485709

# サービスアカウントに追加のロールを付与（Cloud Consoleから）
```

### キーファイルが見つからない場合

```bash
# キーファイルのパスを確認
ls -la /home/svf/ai-chat/*.json

# 環境変数で指定
export GOOGLE_APPLICATION_CREDENTIALS="/home/svf/ai-chat/service-account-key.json"
```

---

**次のステップ**: JSONキーファイルをダウンロードしたら、Claude Code に共有してください。
