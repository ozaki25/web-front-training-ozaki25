# Day 31: Next.js の概要とプロジェクト構成

## 今日のゴール

- Next.js が何を解決するフレームワークか説明できる
- App Router のディレクトリ構成を理解する
- ファイルベースルーティングの仕組みを知る

## React だけでは足りないもの

Day 21〜30 で React の基礎を学びました。React は UI を宣言的に構築する優れたライブラリですが、実際のプロダクトを作ろうとすると、React 単体では解決できない課題が出てきます。

| 課題 | React 単体 | Next.js |
|------|-----------|---------|
| ルーティング（ページ遷移） | 別ライブラリが必要 | ファイルベースで自動 |
| サーバーサイドレンダリング | 自分で構築 | 組み込み |
| データ取得とキャッシュ | 自分で設計 | フレームワークが提供 |
| 画像・フォント最適化 | 自分で対応 | 組み込みコンポーネント |
| バンドル・ビルド設定 | Vite 等を自分で設定 | ゼロコンフィグ |

Next.js は React をベースにした**フルスタックフレームワーク**です。「フルスタック」とは、ブラウザ側（フロントエンド）だけでなく、サーバー側の処理も 1 つのプロジェクト内で扱えるという意味です。

## Next.js プロジェクトを作る

実際にプロジェクトを作って、中身を見てみましょう。ターミナルで以下を実行します。

```bash
npx create-next-app@latest my-app
```

対話形式でいくつか質問されます。以下のように答えてください。

```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a `src/` directory? … Yes
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to use Turbopack for next dev? … Yes
✔ Would you like to customize the import alias? … No
```

作成されたプロジェクトに移動して、開発サーバーを起動します。

```bash
cd my-app
npm run dev
```

ブラウザで `http://localhost:3000` を開くと、Next.js のウェルカムページが表示されます。

## ディレクトリ構成を理解する

生成されたプロジェクトの構成を見てみましょう。

```
my-app/
├── src/
│   └── app/            ← App Router のルートディレクトリ
│       ├── layout.tsx   ← ルートレイアウト（全ページ共通の枠）
│       ├── page.tsx     ← トップページ（"/"）
│       ├── globals.css  ← グローバルスタイル
│       └── favicon.ico
├── public/              ← 静的ファイル（画像など）
├── next.config.ts       ← Next.js の設定ファイル
├── tsconfig.json        ← TypeScript 設定
├── package.json
└── tailwind.config.ts
```

重要なのは `src/app/` ディレクトリです。App Router では、このディレクトリの**フォルダ構造がそのまま URL になります**。これがファイルベースルーティングです。

## ファイルベースルーティング

従来の Web 開発では、URL とページの対応付けをコードで書く必要がありました（「`/about` にアクセスされたら About コンポーネントを表示する」といった設定）。Next.js ではフォルダを作るだけで URL が決まります。

### フォルダ = URL パス

```
src/app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── blog/
│   ├── page.tsx          → /blog
│   └── first-post/
│       └── page.tsx      → /blog/first-post
└── contact/
    └── page.tsx          → /contact
```

ルールはシンプルです。

- **フォルダ名**が URL のパス（path）になる
- **`page.tsx`** がそのパスで表示されるページになる
- `page.tsx` がないフォルダは URL としてアクセスできない

実際に試してみましょう。`src/app/about/page.tsx` を作成します。

```tsx
export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <p>このサイトについてのページです。</p>
    </main>
  );
}
```

ブラウザで `http://localhost:3000/about` にアクセスすると、作成したページが表示されます。ルーティングの設定コードは一切書いていません。

### 特別な意味を持つファイル名

App Router では、いくつかのファイル名が特別な役割を持っています。

| ファイル名 | 役割 |
|-----------|------|
| `page.tsx` | そのルートの UI（ページ本体） |
| `layout.tsx` | 共通レイアウト（ナビゲーションなど） |
| `loading.tsx` | ローディング UI |
| `error.tsx` | エラー UI |
| `not-found.tsx` | 404 ページ |
| `route.ts` | API エンドポイント（Day 35 で学習） |

これらは Next.js が自動的に認識して、適切なタイミングで使用します。たとえば `loading.tsx` を置くだけで、ページの読み込み中にローディング表示が自動で出ます。詳しくは Day 33 で学びます。

## page.tsx の中身を見る

`src/app/page.tsx` を開いてみましょう。これがトップページのコンポーネントです。

```tsx
export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js</h1>
    </main>
  );
}
```

注目してほしい点があります。

- **`"use client"` と書かれていない** — これは Server Component です（Day 32 で詳しく学びます）
- **`export default`** が必要 — Next.js はデフォルトエクスポートされたコンポーネントをページとして使う
- **普通の React コンポーネント** — Day 21〜30 で学んだ JSX がそのまま使える

## ページ間のリンク

HTML では `<a>` タグでリンクを作りますが、Next.js では `<Link>` コンポーネントを使います。

```tsx
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>ホーム</h1>
      <nav>
        <ul>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/blog">Blog</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
```

`<Link>` は HTML の `<a>` タグをレンダリングしますが、裏側でクライアントサイドナビゲーション（JavaScript によるページ遷移）を行います。通常の `<a>` タグではページ全体が再読み込みされますが、`<Link>` ではページの差分だけが更新されるため、高速でスムーズなページ遷移が実現します。

> **ポイント**: 外部サイトへのリンク（`https://example.com` など）には通常の `<a>` タグを使います。`<Link>` はアプリ内のページ遷移に使うものです。

## なぜファイルベースルーティングなのか

ファイルベースルーティングの利点を整理しておきましょう。

1. **URL 構造が一目でわかる** — フォルダ構造を見ればサイトマップがわかる
2. **設定コードが不要** — ルーティング設定ファイルを書かなくていい
3. **コロケーション** — ページに関連するファイル（テスト、スタイルなど）を同じフォルダにまとめられる

「コロケーション（colocation）」とは、関連するものを近くに置くという考え方です。`about/` フォルダの中にページ、テスト、スタイルをまとめると、何がどこにあるか迷わなくなります。

## まとめ

- Next.js は React ベースのフルスタックフレームワークで、ルーティング・SSR・最適化などを組み込みで提供する
- App Router では `src/app/` 配下のフォルダ構造がそのまま URL になる（ファイルベースルーティング）
- `page.tsx` がページの本体、`layout.tsx` が共通レイアウトなど、ファイル名に特別な意味がある
- ページ間のリンクには `next/link` の `<Link>` コンポーネントを使う
