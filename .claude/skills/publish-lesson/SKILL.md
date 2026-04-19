---
name: publish-lesson
description: 指定した Day のレッスンを公開する。draft ブランチから該当 Day のコンテンツを取り出し、main への PR を作成する。
argument-hint: <day番号>
---

# レッスン公開スキル

`draft` ブランチに書き溜めたレッスンの中から、指定した Day を `main` に公開するための PR を作成します。

## 引数

- `$ARGUMENTS` に公開する Day 番号が渡されます
- 例: `/publish-lesson 2`

## 作業手順

以下のステップを**すべて**実行してください。

### 1. 公開用ブランチの作成

`main` から公開用ブランチを作成します。

```bash
git fetch origin
git checkout -b publish/dayXX origin/main
```

### 2. draft から該当 Day のファイルを取り出す

`draft` ブランチから該当 Day のレッスンファイルをコピーします。

```bash
git checkout origin/draft -- docs/lessons/dayXX/index.md
```

### 3. サイドバーの更新

`docs/.vitepress/config.mts` のサイドバーに該当 Day のレッスンを追加します。

`draft` ブランチのサイドバー設定を参考に、該当 Day の項目だけを追記してください。

```bash
git show origin/draft:docs/.vitepress/config.mts
```

### 4. トップページの更新

`docs/index.md` のレッスン一覧に該当 Day のリンクを追加してください。

### 5. ビルド確認

```bash
npx vitepress build docs
```

ビルドが通ることを確認してください。エラーがあれば修正します。

### 6. コミット & プッシュ

変更対象のファイルのみを明示的にステージングしてください。

```bash
git add docs/lessons/dayXX/index.md
git add docs/.vitepress/config.mts
git add docs/index.md
git commit -m "Day XX「テーマ名」を公開"
git push -u origin publish/dayXX
```

コミット後、`git diff --stat main..HEAD` で意図したファイルのみが含まれていることを確認してください。

### 7. プルリクエストの作成

GitHub にプルリクエストを作成します。

- **ベースブランチ**: `main`
- **タイトル**: `Day XX: テーマ名`
- **本文**: レッスンの概要（今日のゴールの内容を含める）
- PR にコミットを追加した場合は、本文も最新の内容に更新すること
- 本文にはレビューに必要な情報だけを書く。作業メモや内部的な注意事項は含めない

### 8. マージ後の同期

PR がマージされたら、以下を手動で行う。

```bash
# main の変更を draft に同期
git fetch origin
git checkout draft
git pull origin draft
git merge origin/main
git push origin draft
```

open 中の `publish/*` PR があれば、チェーンの根元から順に `gh pr update-branch` で更新する。

```bash
gh pr list --state open --search "head:publish/"
gh pr update-branch <PR 番号>
```

コンフリクトが発生した場合は手動で解決してコミット・push する。
