# Day 38: メタデータと SEO

## 今日のゴール

- Next.js の Metadata API を使ってページのメタデータを設定できる
- OGP（Open Graph Protocol）の役割と設定方法を理解する
- `generateMetadata` で動的なメタデータを生成できる

## メタデータとは

メタデータとは、ページの「情報についての情報」です。Day 1 で学んだ HTML の `<head>` 内に書く `<title>` や `<meta>` タグが該当します。

```html
<head>
  <title>ページのタイトル</title>
  <meta name="description" content="ページの説明文" />
</head>
```

メタデータはブラウザの画面には直接表示されませんが、以下の場面で重要です。

- **検索エンジン** — Google などがページの内容を理解するために使う
- **SNS シェア** — Twitter や LINE でリンクを共有したときに表示されるカード画像やタイトル
- **ブラウザ** — タブに表示されるタイトル、ブックマークの名前

## Metadata API — 静的なメタデータ

Next.js では、`metadata` オブジェクトをエクスポートすることでメタデータを設定します。直接 `<head>` タグを書く必要はありません。

```tsx
// src/app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App - ホーム",
  description: "Next.js で作った Web アプリケーション",
};

export default function HomePage() {
  return (
    <main>
      <h1>ホームページ</h1>
    </main>
  );
}
```

Next.js がこの `metadata` オブジェクトを読み取り、自動的に `<head>` 内に適切なタグを生成します。

### ルートレイアウトでの共通メタデータ

`layout.tsx` に書いた `metadata` は、配下のすべてのページに適用されます。

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | My App",  // %s がページごとのタイトルに置換される
    default: "My App",         // タイトルが設定されていないページのデフォルト
  },
  description: "Next.js で作った Web アプリケーション",
  metadataBase: new URL("https://myapp.example.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

`title.template` を使うと、各ページのタイトルにサイト名を自動で付加できます。

```tsx
// src/app/about/page.tsx
export const metadata: Metadata = {
  title: "About",  // → "About | My App" とレンダリングされる
};
```

## OGP — SNS シェア時の表示

OGP（Open Graph Protocol）は、SNS でリンクが共有されたときに表示される情報を制御するための仕様です。

```tsx
// src/app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "Next.js で作った Web アプリケーション",
  openGraph: {
    title: "My App",
    description: "Next.js で作った Web アプリケーション",
    url: "https://myapp.example.com",
    siteName: "My App",
    images: [
      {
        url: "/og-image.png",  // public フォルダ内の画像
        width: 1200,
        height: 630,
        alt: "My App のトップページ",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My App",
    description: "Next.js で作った Web アプリケーション",
    images: ["/og-image.png"],
  },
};
```

OGP 画像のサイズは `1200 x 630` ピクセルが推奨されています。

> **アクセシビリティ**: OGP 画像にも `alt` テキストを設定しましょう。スクリーンリーダーを使っている人が SNS で共有されたリンクにアクセスしたときに役立ちます。

## generateMetadata — 動的なメタデータ

ブログ記事のようにページごとにタイトルや説明が異なる場合、`generateMetadata` 関数を使います。

```tsx
// src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetch(`https://api.example.com/posts/${slug}`);

  if (!res.ok) {
    return { title: "記事が見つかりません" };
  }

  const post = await res.json();

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, alt: post.title }],
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const res = await fetch(`https://api.example.com/posts/${slug}`);

  if (!res.ok) {
    notFound();
  }

  const post = await res.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

`generateMetadata` と `page` コンポーネントで同じ `fetch` を呼んでいますが、Next.js は同じ URL への `fetch` を自動的に重複排除（deduplication）するため、実際のリクエストは 1 回だけです。

## 構造化データ

構造化データ（Structured Data）は、検索エンジンにページの内容を機械的に伝えるための仕組みです。Google の検索結果にリッチスニペット（レビューの星、レシピの調理時間など）が表示されるのは、構造化データのおかげです。

JSON-LD 形式で `<script>` タグとして埋め込みます。

```tsx
// src/app/blog/[slug]/page.tsx
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  const post = await res.json();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    description: post.excerpt,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>{post.title}</h1>
        <p>{post.body}</p>
      </article>
    </>
  );
}
```

## robots と sitemap

### robots.txt

検索エンジンのクローラー（Web ページを自動的に巡回するプログラム）に対して、どのページをクロールしてよいか指示するファイルです。

```tsx
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/dashboard/",
    },
    sitemap: "https://myapp.example.com/sitemap.xml",
  };
}
```

### sitemap.xml

サイト内のすべてのページを一覧にしたファイルです。検索エンジンがページを見つけやすくなります。

```tsx
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();

  const blogEntries = posts.map((post: { slug: string; updatedAt: string }) => ({
    url: `https://myapp.example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://myapp.example.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...blogEntries,
  ];
}
```

## まとめ

- `metadata` オブジェクトのエクスポートで静的なメタデータを設定する
- `title.template` でサイト名の自動付加ができる
- `generateMetadata` で動的ルートのメタデータを生成する
- OGP を設定すると SNS シェア時の表示をコントロールできる
- 構造化データ（JSON-LD）で検索エンジンにリッチな情報を伝える
- `robots.ts` と `sitemap.ts` で検索エンジンのクロールを最適化する
