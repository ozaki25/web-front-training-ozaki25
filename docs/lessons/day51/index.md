# Day 51: Web セキュリティ

## 今日のゴール

- XSS、CSRF、CORS の仕組みと対策を知る
- Content Security Policy の概念を知る
- Next.js が提供するセキュリティ機能を知る

## なぜ Web セキュリティを学ぶのか

Web アプリケーションはインターネットに公開されるため、常に攻撃のリスクがあります。セキュリティを知らずにコードを書くと、ユーザーの個人情報が漏洩したり、アカウントが乗っ取られたりする可能性があります。

フロントエンドエンジニアも、最低限の攻撃手法と対策を知っておく必要があります。

## XSS（Cross-Site Scripting）

**XSS** は、悪意のある JavaScript をページに埋め込む攻撃です。

### 攻撃の仕組み

たとえば、ユーザーのコメントをそのまま HTML として表示するサイトがあるとします。

```html
<!-- ❌ ユーザー入力をそのまま HTML として表示 -->
<div>ユーザーのコメント: <script>document.cookie を外部サーバーに送信</script></div>
```

攻撃者がコメント欄に `<script>` タグを含むテキストを投稿すると、他のユーザーがそのページを見たときに、攻撃者の JavaScript が実行されてしまいます。これにより Cookie の窃取やページの改ざんが可能になります。

### React/Next.js の XSS 対策

React は JSX でテキストを表示する際、自動的に**エスケープ**（特殊文字を無害化）します。

```tsx
// ✅ React は自動でエスケープする
const userInput = '<script>alert("XSS")</script>';

export default function Comment() {
  // <script> タグはテキストとして表示され、実行されない
  return <p>{userInput}</p>;
}
// 表示結果: <script>alert("XSS")</script>（文字列として）
```

ただし、`dangerouslySetInnerHTML` を使うとエスケープが無効になります。

```tsx
// ❌ 危険: ユーザー入力を dangerouslySetInnerHTML に渡してはいけない
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

`dangerouslySetInnerHTML` は、Day 41 の構造化データのように**信頼できる HTML だけ**に使うべきです。名前に「dangerously（危険に）」と付いているのは、この理由からです。

### XSS の対策まとめ

1. ユーザー入力はそのまま HTML として出力しない（React は自動対応）
2. `dangerouslySetInnerHTML` は信頼できるデータだけに使う
3. Cookie に `HttpOnly` 属性を付ける（JavaScript からアクセスできなくする）
4. Content Security Policy を設定する（後述）

## CSRF（Cross-Site Request Forgery）

**CSRF** は、ログイン済みのユーザーに意図しない操作をさせる攻撃です。

### 攻撃の仕組み

```
1. ユーザーが銀行サイトにログイン中
2. 攻撃者が用意した別のサイトにアクセス
3. そのサイトに仕込まれたフォームが、銀行サイトに送金リクエストを自動送信
4. ブラウザが銀行サイトの Cookie を自動的に付けるため、リクエストが成功してしまう
```

ユーザーは悪意のあるサイトを開いただけで、銀行サイトへの送金が実行されてしまいます。

### CSRF の対策

```tsx
// ✅ Next.js の Server Actions は CSRF トークンが自動で付与される
async function transferMoney(formData: FormData) {
  "use server";
  // Server Actions は同一オリジンからのリクエストのみ受け付ける
}
```

Next.js の Server Actions は、自動的に CSRF 対策が組み込まれています。

追加の対策としては以下があります。

- Cookie に `SameSite=Strict` または `SameSite=Lax` を設定する（Day 50 で学習）
- 重要な操作では CSRF トークンを使用する
- `Origin` / `Referer` ヘッダーを検証する

## CORS（Cross-Origin Resource Sharing）

**CORS** は攻撃ではなく、ブラウザの**セキュリティ機構**です。

### 同一オリジンポリシー

ブラウザは、あるオリジン（`プロトコル + ドメイン + ポート`）のページから、別のオリジンへのリクエストを制限します。これを**同一オリジンポリシー**と呼びます。

```
https://myapp.com から https://api.example.com へのリクエスト
→ オリジンが異なるので、デフォルトではブロックされる

https://myapp.com から https://myapp.com/api へのリクエスト
→ 同じオリジンなので OK
```

### CORS ヘッダー

API サーバー側が「このオリジンからのリクエストを許可する」とレスポンスヘッダーで宣言することで、クロスオリジンのリクエストが許可されます。

```ts
// src/app/api/data/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ data: "値" });

  // 特定のオリジンからのアクセスを許可
  response.headers.set("Access-Control-Allow-Origin", "https://frontend.example.com");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
}
```

> **`Access-Control-Allow-Origin: *`（すべてのオリジンを許可）は慎重に扱う必要があります**。公開 API 以外では、許可するオリジンを明示的に指定するべきです。

### Next.js での CORS

Next.js の Server Components から外部 API を呼ぶ場合、CORS は関係ありません。CORS はブラウザのセキュリティ機構なので、サーバーからのリクエストには適用されません。これは Server Components の利点の 1 つです。

```tsx
// Server Component からの fetch — CORS の制限を受けない
export default async function Page() {
  const res = await fetch("https://external-api.example.com/data");
  const data = await res.json();
  return <div>{data.value}</div>;
}
```

## Content Security Policy（CSP）

**CSP** は、ページ内でどのリソース（スクリプト、スタイル、画像など）の読み込みを許可するかを制御するセキュリティ機構です。XSS 攻撃の被害を大幅に軽減できます。

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",           // デフォルトは同一オリジンのみ
            "script-src 'self'",             // スクリプトは同一オリジンのみ
            "style-src 'self' 'unsafe-inline'", // スタイルは同一オリジンとインライン
            "img-src 'self' https:",         // 画像は同一オリジンとHTTPS
            "font-src 'self'",               // フォントは同一オリジンのみ
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
```

CSP が設定されていると、たとえ XSS でスクリプトが注入されても、許可されていないオリジンからのスクリプトは実行されません。

## Next.js が提供するセキュリティ機能

Next.js はフレームワークレベルでいくつかのセキュリティ対策を提供しています。

| 機能 | 対策 |
|------|------|
| React の自動エスケープ | XSS 防止 |
| Server Actions の CSRF トークン | CSRF 防止 |
| Server Components | 機密データがブラウザに漏れない |
| `next.config.ts` の `headers` | CSP や各種セキュリティヘッダー |
| 環境変数（`NEXT_PUBLIC_` なし） | サーバー側のみで使える秘密の値 |

### 環境変数のルール

```
# .env.local

# サーバーでのみ使える（ブラウザに送られない）
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key

# ブラウザでも使える（NEXT_PUBLIC_ プレフィックス）
NEXT_PUBLIC_SITE_URL=https://myapp.example.com
```

`NEXT_PUBLIC_` プレフィックスがない環境変数は、Server Components、Server Actions、Route Handlers でしかアクセスできません。データベースの接続情報や API キーなどの機密情報には `NEXT_PUBLIC_` を付けてはいけません。

## セキュリティチェックリスト

Web アプリケーションを作る際に確認すべき最低限の項目です。

- [ ] ユーザー入力を `dangerouslySetInnerHTML` に渡していないか
- [ ] 機密情報（API キー、DB 接続情報）がブラウザに漏れていないか
- [ ] Cookie に `HttpOnly`、`Secure`、`SameSite` を設定しているか
- [ ] Server Actions やフォームで CSRF 対策がされているか
- [ ] 認証チェックをサーバー側で行っているか（クライアントだけで判断しない）
- [ ] セキュリティヘッダー（CSP など）を設定しているか

## まとめ

- XSS はページにスクリプトを注入する攻撃。React の自動エスケープが基本対策
- CSRF はログイン済みユーザーに意図しない操作をさせる攻撃。Server Actions は自動で対策済み
- CORS はブラウザのセキュリティ機構。Server Components からの fetch には影響しない
- CSP で読み込み可能なリソースを制限し、XSS の被害を軽減する
- 環境変数は `NEXT_PUBLIC_` プレフィックスの有無でサーバー専用かブラウザ共有かが決まる
