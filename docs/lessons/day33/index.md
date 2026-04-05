# Day 33: レイアウトとページ

## 今日のゴール

- `layout.tsx`、`page.tsx`、`loading.tsx`、`error.tsx` の役割を理解する
- ネストレイアウトの仕組みを理解する
- テンプレート（`template.tsx`）とレイアウトの違いを知る

## 特別なファイル群

Day 31 で「App Router にはファイル名に特別な意味がある」と紹介しました。今日はその中でも特に重要な 4 つのファイルを詳しく見ていきます。

## layout.tsx — 共通の枠

`layout.tsx` は、複数のページで共有される**共通の UI**を定義します。ナビゲーションバーやフッターなど、どのページでも表示したい要素を置く場所です。

### ルートレイアウト

`src/app/layout.tsx` はアプリ全体のルートレイアウトです。これは**必須**ファイルで、`<html>` タグと `<body>` タグを含める必要があります。

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "Next.js で作ったアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header>
          <nav aria-label="メインナビゲーション">
            <Link href="/">ホーム</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; 2026 My App</p>
        </footer>
      </body>
    </html>
  );
}
```

`{children}` の部分に、各ページの内容が入ります。ページを切り替えても、ヘッダーやフッターは再レンダリングされません。これがレイアウトの大きな特徴です。

> **アクセシビリティ**: `<nav>` に `aria-label` を付けると、スクリーンリーダーが「メインナビゲーション」とそのナビゲーションの目的を読み上げます。ページに複数のナビゲーションがある場合に特に重要です。

### ネストレイアウト

フォルダごとに `layout.tsx` を置くと、レイアウトがネスト（入れ子）になります。

```
src/app/
├── layout.tsx          ← ルートレイアウト（全ページ共通）
├── page.tsx            ← /
└── blog/
    ├── layout.tsx      ← ブログ用レイアウト（/blog 以下で共通）
    ├── page.tsx        ← /blog
    └── [slug]/
        └── page.tsx    ← /blog/hello-world など
```

```tsx
// src/app/blog/layout.tsx
import Link from "next/link";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <aside>
        <nav aria-label="ブログカテゴリ">
          <h2>カテゴリ</h2>
          <ul>
            <li><Link href="/blog?category=tech">Tech</Link></li>
            <li><Link href="/blog?category=life">Life</Link></li>
          </ul>
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
```

`/blog/hello-world` にアクセスすると、以下のようにレイアウトが組み合わされます。

```
RootLayout（ヘッダー、フッター）
  └── BlogLayout（サイドバー）
       └── BlogPost ページ
```

レイアウトが入れ子になるだけで、ブログセクションにサイドバーを追加できました。他のページ（`/about` など）にはサイドバーは表示されません。

### レイアウトの重要な性質

レイアウトは**ページ遷移をまたいで状態が保持されます**。つまり、`/blog/post-1` から `/blog/post-2` に移動しても、`BlogLayout` は再レンダリングされず、state があればそれも維持されます。

## page.tsx — ページの本体

`page.tsx` はルートの UI を定義するファイルです。Day 31 で見たように、`page.tsx` がないフォルダは URL としてアクセスできません。

```tsx
// src/app/about/page.tsx
export default function AboutPage() {
  return (
    <article>
      <h1>About</h1>
      <p>このアプリについての説明です。</p>
    </article>
  );
}
```

`page.tsx` は必ず**デフォルトエクスポート**でコンポーネントを返す必要があります。

## loading.tsx — ローディング UI

`loading.tsx` を置くと、ページの読み込み中に自動でローディング UI が表示されます。

```tsx
// src/app/blog/loading.tsx
export default function Loading() {
  return (
    <div role="status" aria-label="読み込み中">
      <p>読み込み中...</p>
    </div>
  );
}
```

これは React の **Suspense**（サスペンス）という仕組みを利用しています。Next.js は `page.tsx` を自動的に `<Suspense>` で包み、`loading.tsx` をフォールバック（代替 UI）として使います。

内部的にはこうなっています。

```tsx
// Next.js が内部でやっていること（イメージ）
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

> **アクセシビリティ**: ローディング UI には `role="status"` を付けましょう。スクリーンリーダーが状態の変化を自動的に読み上げてくれます。

## error.tsx — エラー UI

`error.tsx` は、そのルートセグメントでエラーが発生したときに表示される UI です。

```tsx
// src/app/blog/error.tsx
"use client"; // error.tsx は必ず Client Component

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()} type="button">
        もう一度試す
      </button>
    </div>
  );
}
```

注目ポイントがあります。

- **`"use client"` が必須** — エラーバウンダリはクライアントで動作する必要がある
- **`reset` 関数** — 呼び出すとエラーからの回復を試みる（コンポーネントを再レンダリング）
- **`role="alert"`** — スクリーンリーダーにエラーを即座に通知する

`error.tsx` は React の **Error Boundary**（エラーバウンダリ）を利用しています。エラーが発生してもアプリ全体がクラッシュせず、エラーが起きたセクションだけを置き換えてくれます。

## not-found.tsx — 404 ページ

存在しないページにアクセスされたときの UI です。

```tsx
// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>404 - ページが見つかりません</h1>
      <p>お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/">ホームに戻る</Link>
    </main>
  );
}
```

## template.tsx — レイアウトとの違い

`template.tsx` は `layout.tsx` と似ていますが、重要な違いがあります。

- **`layout.tsx`**: ページ遷移をまたいで**状態が保持される**（再レンダリングされない）
- **`template.tsx`**: ページ遷移のたびに**新しいインスタンスが作られる**（状態がリセットされる）

```tsx
// src/app/blog/template.tsx
export default function BlogTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <p>このテンプレートはページ遷移のたびに再マウントされます</p>
      {children}
    </div>
  );
}
```

`template.tsx` が有効な場面としては次のようなケースがあります。

- ページ遷移時にアニメーションを再実行したい
- ページ遷移時に `useEffect` を再実行したい
- ページごとにフォームの state をリセットしたい

ほとんどの場合は `layout.tsx` で十分です。「遷移のたびにリセットしたい」という明確な理由があるときだけ `template.tsx` を使いましょう。

## ファイルの組み合わせ方

これらのファイルがどう組み合わされるか、全体像を見てみましょう。

```
src/app/blog/
├── layout.tsx     ← 共通レイアウト
├── template.tsx   ← テンプレート（任意）
├── loading.tsx    ← ローディング UI
├── error.tsx      ← エラー UI
├── not-found.tsx  ← 404 UI
└── page.tsx       ← ページ本体
```

Next.js はこれらを以下のように組み立てます（概念的なイメージ）。

```tsx
<Layout>
  <Template>
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <Page />
      </Suspense>
    </ErrorBoundary>
  </Template>
</Layout>
```

外側から順にレイアウト → テンプレート → エラーバウンダリ → サスペンス → ページという構造です。この順序を覚えておくと、どのファイルがどの範囲をカバーするかがわかります。

## まとめ

- `layout.tsx` は共通 UI を定義し、ページ遷移をまたいで状態が保持される
- ネストレイアウトにより、セクションごとに異なるレイアウトを適用できる
- `loading.tsx` は Suspense、`error.tsx` は Error Boundary を利用して自動的に表示される
- `template.tsx` はレイアウトと似ているが、遷移のたびに再マウントされる
- これらのファイルを組み合わせることで、ローディングやエラー処理を宣言的に実現できる

**次のレッスン**: [Day 34: データ取得（Server Components）](/lessons/day34/)
