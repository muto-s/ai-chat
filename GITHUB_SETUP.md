# GitHub リポジトリセットアップ手順

## 1. GitHubでリポジトリを作成

1. https://github.com/new にアクセス
2. Repository name: `ai-chat`
3. Public または Private を選択
4. **「Initialize this repository with」の項目は全てチェックを外す**
5. 「Create repository」をクリック

## 2. ローカルとGitHubを接続

GitHubリポジトリ作成後、以下のコマンドを実行してください：

```bash
# 変更をステージング
git add .

# コミット
git commit -m "feat: 完全なAIチャットボットアプリケーション

- Next.js 15 + TypeScript
- Prisma + MongoDB
- Claude API統合（モックモード）
- ダークモード対応
- GitHub Actions CI/CD
- Cloud Run対応"

# GitHubリポジトリと接続（YOUR_USERNAMEを自分のユーザー名に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/ai-chat.git

# プッシュ
git push -u origin master
```

## 3. GitHub Actionsの設定

プッシュ後、GitHub Actionsを設定するには `GITHUB_ACTIONS_SETUP.md` を参照してください。

## トラブルシューティング

### エラー: remote origin already exists

```bash
# 既存のremoteを削除
git remote remove origin

# 再度追加
git remote add origin https://github.com/YOUR_USERNAME/ai-chat.git
```

### エラー: failed to push some refs

```bash
# 強制プッシュ（初回のみ）
git push -u origin master --force
```
