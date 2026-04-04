# Day 37: 動的ルーティングとミドルウェア

## 今日のゴール

- 動的セグメント（`[slug]`）と catch-all セグメントの使い方を知る
- `proxy.ts` による認証チェックやリダイレクトの方法を理解する
- 動的ルーティングの実際の使いどころを把握する

## 動的ルーティング

Day 31 でファイルベースルーティングを学びました。`about/page.tsx` が `/about` に対応するという静的なルーティングでした。しかし実際のアプリでは、ブログ記事の URL（`/blog/my-first-post`）やユーザーページ（`/users/123`）のように、URL の一部が動的に変わるケースが大半です。

### 動的セグメント `[param]`

フォルダ名を角括弧 `[]` で囲むと、その部分が動的なパラメータになります。

```
src/app/
└── blog/
    └── [slug]/
        └── page.tsx    → /blog/hello-world, /blog/nextjs-intro, ...
```

```tsx
// src/app/blog/[slug]/page.tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <article>
      <h1>ブログ記事: {slug}</h1>
      <p>このページの URL は /blog/{slug} です</p>
    </article>
  );
}
```

`/blog/hello-world` にアクセスすると `slug` に `"hello-world"` が入ります。`/blog/nextjs-intro` なら `"nextjs-intro"` です。

> **注意**: 最新の Next.js では `params` は `Promise` です。使用する前に `await` で解決する必要があります。

### 実際のデータ取得と組み合わせる

```tsx
// src/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(`https://api.example.com/posts/${slug}`);

  if (!res.ok) {
    notFound(); // 記事が見つからなければ 404 ページを表示
  }

  const post = await res.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <time dateTime={post.publishedAt}>{post.publishedAt}</time>
      <div>{post.body}</div>
    </article>
  );
}
```

`notFound()` を呼ぶと、最も近い `not-found.tsx`（Day 33 で学習）が表示されます。

### 複数の動的セグメント

動的セグメントは複数持てます。

```
src/app/
└── shop/
    └── [category]/
        └── [productId]/
            └── page.tsx    → /shop/electronics/42
```

```tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; productId: string }>;
}) {
  const { category, productId } = await params;

  return (
    <main>
      <p>カテゴリ: {category}</p>
      <p>商品ID: {productId}</p>
    </main>
  );
}
```

## Catch-all セグメント `[...param]`

`[...param]` と書くと、そのセグメント以降のすべてのパスをまとめて受け取れます。

```
src/app/
└── docs/
    └── [...slug]/
        └── page.tsx
```

| URL | `slug` の値 |
|-----|------------|
| `/docs/getting-started` | `["getting-started"]` |
| `/docs/guides/routing` | `["guides", "routing"]` |
| `/docs/api/auth/login` | `["api", "auth", "login"]` |

```tsx
// src/app/docs/[...slug]/page.tsx
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  return (
    <main>
      <h1>ドキュメント</h1>
      <p>パス: {slug.join(" / ")}</p>
    </main>
  );
}
```

ドキュメントサイトや CMS のように、階層構造が不定のコンテンツを扱うときに便利です。

### Optional Catch-all `[[...param]]`

二重角括弧 `[[...param]]` にすると、パラメータなしの URL（`/docs`）にもマッチします。

```
src/app/
└── docs/
    └── [[...slug]]/
        └── page.tsx    → /docs, /docs/intro, /docs/guides/routing
```

`/docs` にアクセスした場合、`slug` は `undefined` になります。

## proxy.ts — リクエストの中継と制御

Next.js の最新バージョンでは、`proxy.ts` がリクエストの中継・制御を担当します（以前は `middleware.ts` がこの役割でした）。`proxy.ts` はプロジェクトのルート（`src/` 配下の場合は `src/proxy.ts`）に配置します。

`proxy.ts` は、**すべてのリクエストがページや API に到達する前に実行されます**。これを利用して、認証チェックやリダイレクトを行えます。

### 基本構造

```ts
// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // すべてのリクエストに対して実行される
  console.log("リクエスト:", request.nextUrl.pathname);

  // 次の処理に進む
  return NextResponse.next();
}

// どのパスで実行するか指定
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

`config.matcher` で、proxy が実行されるパスを指定します。上の例では `/dashboard` と `/settings` 配下のリクエストだけが対象です。

### 認証チェックの例

ログインしていないユーザーをログインページにリダイレクトする典型的なパターンです。

```ts
// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");

  // 認証トークンがなければログインページにリダイレクト
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // ログイン後に元のページに戻れるように、リダイレクト先を保存
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

### リダイレクトの例

URL の変更やリニューアル時に、古い URL から新しい URL へリダイレクトするケースです。

```ts
// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 古い URL から新しい URL へリダイレクト
  if (pathname === "/old-blog") {
    return NextResponse.redirect(new URL("/blog", request.url));
  }

  // レスポンスヘッダーの追加
  const response = NextResponse.next();
  response.headers.set("x-custom-header", "my-value");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### proxy.ts の注意点

- **Edge Runtime で実行される** — Node.js のすべての API が使えるわけではない
- **軽い処理だけ行う** — すべてのリクエストで実行されるため、重い処理を入れるとパフォーマンスに影響する
- **データベースアクセスは避ける** — 認証チェックは Cookie やトークンの検証だけにし、データベースへの問い合わせはページ側で行う

## generateStaticParams — 静的生成

動的ルーティングのページを事前にビルドしておきたい場合、`generateStaticParams` を使います。

```tsx
// src/app/blog/[slug]/page.tsx

export async function generateStaticParams() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ...
}
```

ビルド時に `generateStaticParams` が返したすべての `slug` に対して HTML が生成されます。これにより、リクエスト時にサーバーで処理する必要がなく、非常に高速にページが表示されます。

## まとめ

- `[param]` で動的セグメント、`[...param]` で catch-all、`[[...param]]` で optional catch-all を実現する
- `params` は `Promise` なので `await` で解決してから使う
- `proxy.ts` はリクエストがページに到達する前に実行され、認証チェックやリダイレクトに使う
- `proxy.ts` は軽い処理だけ行い、重い処理はページ側で行う
- `generateStaticParams` で動的ルートを事前にビルドできる

**次のレッスン**: [Day 38: メタデータと SEO](/lessons/day38/)
