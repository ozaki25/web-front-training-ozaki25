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

### 3. 前日のレッスンに「次のレッスン」リンクを追加

前日のレッスンが `main` に存在する場合、前日の `index.md` の末尾に「次のレッスン」リンクを追加してください。

`draft` ブランチの前日レッスンを参考に、リンクの内容を確認すること。

※ 前日のレッスンがまだ `main` にない場合はスキップ。

### 4. サイドバーの更新

`docs/.vitepress/config.mts` のサイドバーに該当 Day のレッスンを追加します。

`draft` ブランチのサイドバー設定を参考に、該当 Day の項目だけを追記してください。

```bash
git show origin/draft:docs/.vitepress/config.mts
```

### 5. トップページの更新

`docs/index.md` のレッスン一覧に該当 Day のリンクを追加してください。

### 6. ビルド確認

```bash
npx vitepress build docs
```

ビルドが通ることを確認してください。エラーがあれば修正します。

### 7. コミット & プッシュ

```bash
git add -A
git commit -m "Day XX「テーマ名」を公開"
git push -u origin publish/dayXX
```

### 8. プルリクエストの作成

GitHub にプルリクエストを作成します。

- **ベースブランチ**: `main`
- **タイトル**: `Day XX: テーマ名`
- **本文**: レッスンの概要（今日のゴールの内容を含める）
