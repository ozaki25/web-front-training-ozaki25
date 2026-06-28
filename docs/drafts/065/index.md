# 環境変数 — NEXT_PUBLIC_ は何が違うのか

## 今日のゴール

- 環境変数が「コードの外にある設定値」だと知る
- サーバー用とブラウザ用の区別（NEXT_PUBLIC_）を知る
- `.env` を Git にコミットしてはいけない理由を知る

## コードに書けない値がある

アプリには、コードに直接書けない値があります。

- **API キー**: 外部サービスの認証情報。漏れると不正利用される
- **データベースの接続先**: 開発・ステージング・本番で異なる
- **機能フラグ**: 特定の機能の有効・無効を外から切り替える

これらを「コードの外」に置く仕組みが**環境変数**です。

## .env ファイル — 開発用の設定置き場

Next.js では、プロジェクトルートに `.env.local` というファイルを作って環境変数を書きます。

```
# .env.local
DATABASE_URL=postgresql://localhost:5432/mydb
API_SECRET_KEY=sk-abc123xyz
NEXT_PUBLIC_SITE_NAME=My Shop
```

コードからは `process.env.DATABASE_URL` で読み取れます。**コードには値そのものが書かれていない**ので、同じコードを開発環境でも本番環境でも使え、環境ごとに異なる値を外から注入できます。

## NEXT_PUBLIC_ — サーバーとブラウザの境界線

ここが今日の核心です。環境変数の名前に **`NEXT_PUBLIC_` というプレフィックスが付いているかどうか**で、変数の届く範囲がまったく違います。

| | プレフィックスなし | `NEXT_PUBLIC_` 付き |
|---|---|---|
| サーバー（SC, Server Actions） | **読める** | 読める |
| ブラウザ（CC, クライアント JS） | **読めない（undefined）** | **読める** |

```tsx
// Server Component — 両方読める
console.log(process.env.API_SECRET_KEY);       // "sk-abc123xyz"
console.log(process.env.NEXT_PUBLIC_SITE_NAME); // "My Shop"
```

```tsx
"use client";
// Client Component — NEXT_PUBLIC_ だけ読める
console.log(process.env.API_SECRET_KEY);       // undefined
console.log(process.env.NEXT_PUBLIC_SITE_NAME); // "My Shop"
```

### なぜ区別するのか

`NEXT_PUBLIC_` 付きの変数は、ビルド時に**値がそのまま JavaScript のコードに埋め込まれます**。つまり `NEXT_PUBLIC_SITE_NAME` の値 `"My Shop"` は、ブラウザに届く JavaScript ファイルの中に文字列として存在します。

もし API キーに `NEXT_PUBLIC_` を付けてしまうと、ブラウザに届く JavaScript を誰でも読めるので、**キーが全世界に公開される**ことになります。

```
# ❌ 秘密の値に NEXT_PUBLIC_ を付けてはいけない
NEXT_PUBLIC_API_SECRET_KEY=sk-abc123xyz

# ✅ 秘密の値はプレフィックスなし（サーバーだけで使う）
API_SECRET_KEY=sk-abc123xyz

# ✅ 公開して問題ない値だけ NEXT_PUBLIC_
NEXT_PUBLIC_SITE_NAME=My Shop
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXX
```

判断の基準はシンプルです。「**この値がブラウザの開発者ツールで丸見えになっても問題ないか？**」。問題なければ `NEXT_PUBLIC_`、それ以外はプレフィックスなし。

## .env を Git にコミットしない

`.env.local` には API キーやデータベース接続情報が入っています。これを Git にコミットすると、リポジトリにアクセスできる全員（場合によっては全世界）に秘密が公開されます。

Next.js のテンプレートは最初から `.gitignore` に `.env*.local` を含めていますが、AI が `.env` ファイルを作るとき `.gitignore` への追加を忘れることがあります。

```
# .gitignore に入っていることを確認する
.env*.local
```

チームメンバーには `.env.example`（値を空にしたテンプレート）を共有し、各自が手元で `.env.local` を作る運用が定石です。

```
# .env.example（コミットしてよい。値は空）
DATABASE_URL=
API_SECRET_KEY=
NEXT_PUBLIC_SITE_NAME=
```

## デプロイ先の環境変数

本番環境では `.env.local` は使いません。Vercel なら管理画面で、その他のプラットフォームでも専用の設定画面や CLI で環境変数を登録します。

「手元では動くのに本番で動かない」の犯人トップが、**デプロイ先に環境変数を設定し忘れている**です。特に新しい変数を足したとき、手元の `.env.local` に書いただけでデプロイ先への登録を忘れるパターンが多いです。

## AI のコードを見るポイント

1. **秘密の値に `NEXT_PUBLIC_` が付いていないか**: AI は区別を間違えることがある
2. **`.env` ファイルが `.gitignore` に入っているか**: 特にプロジェクト作成直後
3. **Server Component なのにブラウザ向け変数を使っていないか**: `NEXT_PUBLIC_` なしで済むならそちらが安全

## まとめ

- 環境変数はコードの外にある設定値。環境ごとに値を変えられる
- `NEXT_PUBLIC_` 付きはブラウザの JS に埋め込まれる。秘密の値には付けない
- `.env.local` は Git にコミットしない。チームには `.env.example` を共有
- 「本番で動かない」の犯人トップは、デプロイ先への環境変数の設定忘れ
