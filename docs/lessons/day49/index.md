# Day 49: Web パフォーマンス応用

## 今日のゴール

- コード分割と dynamic import の仕組みを知る
- バンドルサイズの分析ツールがあることを知る
- tree shaking の仕組みを知る
- SSR/SSG のパフォーマンス特性の違いを知る

## コード分割（Code Splitting）

ブラウザが Web ページを表示するとき、JavaScript ファイルをダウンロードして実行します。アプリが大きくなると JavaScript のファイルサイズも大きくなり、ダウンロードと実行に時間がかかります。

**コード分割**は、JavaScript を複数のファイル（チャンク）に分け、必要なものだけをダウンロードする仕組みです。

Next.js は自動的にページ単位でコード分割を行います。`/about` にアクセスしたとき、`/blog` のコードはダウンロードされません。しかし、1 つのページ内でも分割が必要な場合があります。

## next/dynamic による遅延読み込み

`next/dynamic` を使うと、コンポーネントを必要なタイミングで読み込めます。

```tsx
// src/app/dashboard/page.tsx
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

`dynamic` は内部的に React の `lazy`（コンポーネントの遅延読み込み機能）と `Suspense`（読み込み中の表示を制御する機能）を使っています。コンポーネントが必要になるまで JavaScript のダウンロードが遅延されます。

ブラウザの API（`window`、`document` など）に依存するライブラリは、サーバーでは動きません。`ssr: false` を指定すると、クライアントでのみレンダリングされます。

```tsx
// src/components/map.tsx を使う側
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

Day 42 で学んだ `next/image` はデフォルトで lazy loading が有効です。

```tsx
// src/components/photo-gallery.tsx
import Image from "next/image";

// デフォルトで lazy loading（画面内に入るまで読み込まない）
<Image src="/photo.jpg" alt="写真" width={600} height={400} />

// ファーストビューの画像は priority で即座に読み込む
<Image src="/hero.jpg" alt="ヒーロー" fill priority />
```

### Intersection Observer

画像以外のコンテンツ（コンポーネントやセクション全体）を画面内に入ったタイミングで読み込みたい場合は、ブラウザの **Intersection Observer API** が使えます。これは「ある要素が画面の表示領域（ビューポート）に入ったかどうか」を監視する API です。

React では `useRef` と `useEffect` を使ったカスタムフックとして実装し、要素が画面内に入ったら `isVisible` を `true` に切り替えてコンテンツを表示する、というパターンが一般的です。`next/image` が内部で行っている lazy loading も、この Intersection Observer の仕組みを利用しています。

## バンドルサイズの分析

JavaScript のバンドルサイズが大きいと、ダウンロードと解析に時間がかかります。「何がサイズを大きくしているか」を可視化するツールとして **`@next/bundle-analyzer`** があります。

構成イメージとしては、`next.config.ts` に `withBundleAnalyzer` をラップし、環境変数 `ANALYZE=true` を付けてビルドすると、ブラウザにバンドルの内訳がビジュアルで表示されます。各ライブラリがどれだけのサイズを占めているか一目でわかるため、「どのライブラリが重いのか」「不要なコードが含まれていないか」を判断する根拠になります。

## tree shaking

**Tree shaking** とは、使われていないコードをビルド時に自動で除去する仕組みです。木を揺さぶって枯れ葉（不要なコード）を落とすイメージです。

```tsx
// ❌ ライブラリ全体をインポート
import _ from "lodash";
const result = _.groupBy(data, "category");

// ✅ 必要な関数だけインポート（tree shaking が効く）
import groupBy from "lodash/groupBy";
const result = groupBy(data, "category");
```

ライブラリの書き方によっては tree shaking が効かないことがあります。個別インポートを使うのが確実です。

### 大きなライブラリに注意

よく知られた大きなライブラリには、より軽量な代替手段があります。

| ライブラリ | 問題点 | 代替手段 |
|-----------|-------|---------|
| moment.js | サイズが大きい | day.js（サイズ約 1/20） |
| lodash | デフォルトでは tree shaking が効かない | lodash-es（tree shaking 対応版）または自前実装 |
| chart.js | 全機能をインポートしがち | 必要な要素だけ個別インポート |

## SSR / SSG のパフォーマンス特性

Next.js のレンダリング戦略によって、パフォーマンス特性が異なります。

### SSG（Static Site Generation）

ビルド時に HTML を生成します。リクエストのたびに生成する必要がないため、最も高速です。

```tsx
// src/app/about/page.tsx
// 特に設定しなければ、データ取得のないページは自動で SSG になる
export default function AboutPage() {
  return <h1>About</h1>;
}
```

`generateStaticParams` を定義すると、動的ルートでもビルド時に HTML を生成できます。

**特性**:
- TTFB（Time to First Byte）が最も速い（CDN（世界中のサーバーからコンテンツを配信する仕組み）から配信可能）
- データの更新にはビルドし直す必要がある
- ブログや企業サイトなど、頻繁に変わらないコンテンツに最適

### SSR（Server-Side Rendering）

リクエストのたびにサーバーで HTML を生成します。

```tsx
// src/app/dashboard/page.tsx
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

## まとめ

- `next/dynamic` でコンポーネントを必要なタイミングに遅延読み込みできる
- `@next/bundle-analyzer` でバンドルの内訳を可視化し、何がページを重くしているか特定できる
- tree shaking を活かすために、ライブラリは個別インポートを使う
- SSG は最も高速だが静的コンテンツ向き、SSR は動的コンテンツに使う
- パフォーマンス改善は推測ではなく、測定に基づいて行う（Day 48 参照）

**次のレッスン**: [Day 50: 認証の基礎](/lessons/day50/)
