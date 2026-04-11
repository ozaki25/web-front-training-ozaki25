# Day 47: Web パフォーマンス応用

## 今日のゴール

- コード分割と dynamic import の仕組みを知る
- lazy loading の使い方を知る
- バンドルサイズの分析方法を知る
- SSR/SSG のパフォーマンス特性を知る

## コード分割（Code Splitting）

ブラウザが Web ページを表示するとき、JavaScript ファイルをダウンロードして実行します。アプリが大きくなると JavaScript のファイルサイズも大きくなり、ダウンロードと実行に時間がかかります。

**コード分割**は、JavaScript を複数のファイル（チャンク）に分け、必要なものだけをダウンロードする仕組みです。

Next.js は自動的にページ単位でコード分割を行います。`/about` にアクセスしたとき、`/blog` のコードはダウンロードされません。しかし、1 つのページ内でも分割が必要な場合があります。

## dynamic import

`next/dynamic` を使うと、コンポーネントを必要なタイミングで読み込めます。

### 基本的な使い方

```tsx
import dynamic from "next/dynamic";

// 通常のインポート（ページ読み込み時にダウンロードされる）
// import HeavyChart from "./heavy-chart";

// dynamic import（必要になったときにダウンロードされる）
const HeavyChart = dynamic(() => import("./heavy-chart"), {
  loading: () => <p role="status">グラフを読み込み中...</p>,
});

export default function DashboardPage() {
  return (
    <main>
      <h1>ダッシュボード</h1>
      <p>概要テキスト</p>
      {/* この部分は後からダウンロードされる */}
      <HeavyChart />
    </main>
  );
}
```

`dynamic` は内部的に React の `lazy` と `Suspense` を使っています。コンポーネントが必要になるまで JavaScript のダウンロードが遅延されます。

### SSR を無効にする

ブラウザの API（`window`、`document` など）に依存するライブラリは、サーバーでは動きません。`ssr: false` を指定すると、クライアントでのみレンダリングされます。

```tsx
const MapComponent = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => <p role="status">地図を読み込み中...</p>,
});
```

### dynamic import が効果的なケース

| ケース | 理由 |
|-------|------|
| 重いライブラリ（グラフ、エディタ、地図） | 初期表示に不要なコードを遅延読み込み |
| モーダルやダイアログ | ユーザーが開くまで不要 |
| 条件付きで表示するコンポーネント | 管理者だけが見るUIなど |
| 画面下部のコンポーネント | ファーストビューに影響しない |

## lazy loading

**lazy loading**（遅延読み込み）は、コンテンツを必要になるまで読み込まないテクニックです。

### 画像の lazy loading

Day 40 で学んだ `next/image` はデフォルトで lazy loading が有効です。

```tsx
import Image from "next/image";

// デフォルトで lazy loading（画面内に入るまで読み込まない）
<Image src="/photo.jpg" alt="写真" width={600} height={400} />

// ファーストビューの画像は priority で即座に読み込む
<Image src="/hero.jpg" alt="ヒーロー" fill priority />
```

### Intersection Observer

コンポーネントが画面内に入ったことを検知する仕組みです。React ではカスタムフックとして実装できます。

```tsx
"use client";

import { useRef, useEffect, useState } from "react";

function useIntersectionObserver() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // 一度表示されたら監視を止める
        }
      },
      { threshold: 0.1 } // 10% 見えたら発火
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export default function LazySection() {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <div ref={ref}>
      {isVisible ? (
        <HeavyContent />
      ) : (
        <div style={{ height: "400px" }} /> // プレースホルダー
      )}
    </div>
  );
}
```

## バンドルサイズ分析

JavaScript のバンドルサイズが大きいと、ダウンロードと解析に時間がかかります。何がサイズを大きくしているかを分析する方法を紹介します。

### @next/bundle-analyzer

```bash
npm install -D @next/bundle-analyzer
```

```ts
// next.config.ts
import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // ...
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
```

```bash
ANALYZE=true npm run build
```

ビルドが完了すると、ブラウザにバンドルの内訳がビジュアルで表示されます。各ライブラリがどれだけのサイズを占めているか一目でわかります。

### バンドルサイズ削減のコツ

```tsx
// ❌ ライブラリ全体をインポート
import _ from "lodash";
const result = _.groupBy(data, "category");

// ✅ 必要な関数だけインポート（tree shaking が効く）
import groupBy from "lodash/groupBy";
const result = groupBy(data, "category");
```

**Tree shaking** とは、使われていないコードをビルド時に自動で除去する仕組みです。ただし、ライブラリの書き方によっては tree shaking が効かないことがあります。個別インポートを使うのが確実です。

### 大きなライブラリに注意

```
よくある大きなライブラリ:
- moment.js → day.js に置き換え（サイズ 1/20）
- lodash → lodash-es（tree shaking 対応版）または自前実装
- chart.js → 必要な要素だけインポート
```

## SSR / SSG のパフォーマンス特性

Next.js のレンダリング戦略によって、パフォーマンス特性が異なります。

### SSG（Static Site Generation）

ビルド時に HTML を生成します。リクエストのたびに生成する必要がないため、最も高速です。

```tsx
// 特に設定しなければ、データ取得のないページは自動で SSG になる
export default function AboutPage() {
  return <h1>About</h1>;
}

// generateStaticParams があるページもビルド時に生成される
export async function generateStaticParams() {
  return [{ slug: "post-1" }, { slug: "post-2" }];
}
```

**特性**:
- TTFB（Time to First Byte）が最も速い（CDN から配信可能）
- データの更新にはビルドし直す必要がある
- ブログや企業サイトなど、頻繁に変わらないコンテンツに最適

### SSR（Server-Side Rendering）

リクエストのたびにサーバーで HTML を生成します。

```tsx
// Server Component でデータを取得すると SSR になる
export default async function DashboardPage() {
  const data = await fetch("https://api.example.com/stats");
  const stats = await data.json();

  return <div>{stats.visitors} visitors</div>;
}
```

**特性**:
- 常に最新のデータを表示できる
- TTFB は SSG より遅い（サーバー処理の時間がかかる）
- ユーザーごとに異なるコンテンツ（ダッシュボードなど）に適している

### 使い分け

| コンテンツの性質 | 推奨戦略 |
|---------------|---------|
| 変更頻度が低い（ブログ、ドキュメント） | SSG |
| 定期的に更新（商品一覧など） | SSR + キャッシュ（`"use cache"`） |
| リアルタイムデータ（ダッシュボード） | SSR |
| ユーザー固有のデータ（マイページ） | SSR |

## パフォーマンスチェックリスト

Next.js プロジェクトで確認すべき項目をまとめます。

- [ ] `next/image` で画像を最適化しているか
- [ ] ファーストビューの画像に `priority` を付けているか
- [ ] `next/font` でフォントを最適化しているか
- [ ] 重いライブラリを `dynamic` で遅延読み込みしているか
- [ ] 不要なライブラリがバンドルに含まれていないか
- [ ] Server Components を活用してクライアント JavaScript を減らしているか
- [ ] 適切なレンダリング戦略（SSG/SSR）を選択しているか

## まとめ

- `next/dynamic` でコンポーネントを必要なタイミングに遅延読み込みできる
- バンドルサイズ分析で、何がページを重くしているか特定する
- tree shaking を活かすために、ライブラリは個別インポートを使う
- SSG は最も高速だが静的コンテンツ向き、SSR は動的コンテンツに使う
- パフォーマンス改善は推測ではなく、測定に基づいて行う

**次のレッスン**: [Day 48: 認証の基礎](/lessons/day48/)
