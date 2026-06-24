# Full Route Cache — 組み立てた HTML を使い回す

## 今日のゴール

- Full Route Cache が「ページの HTML をサーバーに保存する仕組み」だと知る
- 静的（事前生成）と動的（毎回生成）の違いを知る
- `no-store` と動的化の関係を知り、再検証で作り直せることを知る

## ページの HTML はどう作られるか

サーバーは、リクエストを受けるとデータを取り、コンポーネントを実行して、最終的な HTML を組み立てて返します。この「組み立て」を**レンダリング**と呼びます。

```tsx
// app/about/page.tsx
export default async function AboutPage() {
  const res = await fetch("https://api.example.com/company");
  const company = await res.json();
  return (
    <main>
      <h1>{company.name}</h1>
      <p>{company.description}</p>
    </main>
  );
}
```

問題は、この組み立てを**いつやるか**です。アクセスのたびに毎回やるのか、一度だけやって結果を使い回すのか。ここを決めるのが Full Route Cache です。

## 動的 — 毎回組み立てる

リクエストごとに毎回レンダリングして HTML を作るのが**動的レンダリング**です。

- 毎回最新のデータで作られる
- リクエストのたびにサーバーが計算する（コストがかかる）

ログイン中のユーザー名を出すページのように、「人によって・その瞬間によって中身が変わる」ものは動的でなければなりません。

## 静的 — 一度組み立てて保存する

中身が誰に対しても同じなら、毎回組み立てる必要はありません。**ビルド時に一度だけレンダリングして、できた HTML を保存し、全員に使い回す**のが**静的レンダリング**です。この保存先が **Full Route Cache** です。

```mermaid
flowchart LR
  B["ビルド時に 1 回だけ<br>レンダリング"] --> C["Full Route Cache<br>完成した HTML を保存"]
  C --> U1["アクセス A → 保存済み HTML"]
  C --> U2["アクセス B → 保存済み HTML"]
  C --> U3["アクセス C → 保存済み HTML"]
  style C fill:#fef9c3,color:#1e293b,stroke:#eab308
```

会社概要やブログ記事のように「誰が見ても同じ」ページは、静的にして保存した HTML を返すだけにできます。サーバーは毎回組み立てないので、非常に速く、負荷も小さくなります。

Next.js は、`fetch` にキャッシュ指定（`revalidate` / `force-cache`）があり、ユーザーごとに変わる要素（`cookies()` など）を使っていないページを**自動で静的化**しようとします。ただし Next.js 15 以降では `fetch` がデフォルトでキャッシュされないため、キャッシュ指定なしの `fetch` があるだけで動的になります。

## `no-store` と動的化

Next.js 15 以降、`fetch` はデフォルトでキャッシュされません。つまり**特に何もしなくてもページは動的**です。

ただ、`cache: "no-store"` を明示で付けるコードを見かけることがあります。Next.js 14 では `fetch` がデフォルトでキャッシュされていたため、それを止める目的で使われていました。

15 以降ではデフォルトが変わったため**明示する必要はほぼなくなりました**が、付いたまま残っているコードは多くあります。

`no-store` を付けると、そのページは**必ず動的レンダリングになります**。

```tsx
// このページは毎回サーバーで組み立て直される（静的化されない）
export default async function AboutPage() {
  const res = await fetch("https://api.example.com/company", {
    cache: "no-store",
  });
  const company = await res.json();
  return (
    <main>
      <h1>{company.name}</h1>
      <p>{company.description}</p>
    </main>
  );
}
```

`no-store` は「このデータは毎回新しく取れ」という指示です。毎回取りに行く以上、ビルド時に固めることはできないので、ページごと動的に倒れます。

AI に「常に最新にして」と頼むと、`no-store` をあちこちに付けたコードを書いてくることがあります。本来は静的にできたページまで全部動的になり、**静的化による速さを丸ごと失います**。

鮮度は得られますが、その代償は大きい。「本当に毎回最新でないと困るのか」を一度立ち止まって考える価値があります。

| 指定 | レンダリング | 速さ | 鮮度 |
|------|------------|------|------|
| 指定なし（15 以降の既定） | 動的 | 遅い | 常に最新 |
| `next: { revalidate }` / `force-cache` | 静的化される | 速い | 指定に従う |
| `cache: "no-store"` | 必ず動的 | 遅い | 常に最新 |

## 再検証 — 保存した HTML を作り直す

静的化すると速いですが、保存した HTML はビルド時点のスナップショットなので、後でデータが変わっても古いままです。これを作り直すのが**再検証**です。

データを更新する処理（Server Action、サーバー側で動く関数）の中で `revalidatePath` を呼びます。

```ts
// app/admin/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function updateCompany(formData: FormData) {
  await fetch("https://api.example.com/company", {
    method: "POST",
    body: formData,
  });

  revalidatePath("/about"); // /about の保存済み HTML を捨てる
}
```

`revalidatePath("/about")` で、保存していた `/about` の HTML が捨てられます。次に誰かが `/about` を開いたとき、レンダリングし直され、新しい HTML が保存し直されます。

## page と layout — どこまで作り直すか

`revalidatePath` には第 2 引数があります。

```ts
revalidatePath(path: string, type?: "page" | "layout"): void
```

| 指定 | 作り直す範囲 |
|------|------------|
| `"page"`（既定） | そのページの HTML だけ |
| `"layout"` | そのレイアウト + **配下の全ページ**の HTML |

ヘッダーやナビゲーションのように、**レイアウトに置かれていて全ページで共通の表示**を更新したいときは `"layout"` を使います。たとえばヘッダーのカート件数バッヂを更新したいなら、こうします。

```ts
revalidatePath("/", "layout"); // ルートレイアウト配下すべてを作り直す
```

`"page"` で 1 ページだけ作り直しても、レイアウト共有の表示は別ページに移ると古いままです。共有部分はレイアウト単位で作り直す必要があります。

> パスに動的な部分（`/blog/[slug]` など）を含む場合、第 2 引数は必須です。実際の値ではなく `/blog/[slug]` という**ルートの形**を渡すため、ページ単位かレイアウト単位かを Next.js が判断できないからです。

## なし・あり・再検証

| 状態 | 動き | 速さ | 鮮度 |
|------|------|------|------|
| 保存なし（動的） | 毎回 HTML を組み立てる | 遅い | 常に最新 |
| 保存あり（静的） | 保存した HTML を使い回す | 速い | ビルド時点で固定 |
| 再検証 | 捨てて次回作り直す | 速さは維持 | 変えた後に最新へ |

「誰が見ても同じページ」は静的にして速くし、データを変えたときだけ再検証で作り直す。これが基本の組み立てです。

なお、ここで保存しているのは「組み立てた HTML」です。その手前の「取得したデータ」の保存や、ブラウザ側の保存は、段階の違う別のキャッシュです。このレッスンでは HTML の箱に絞っています。

## まとめ

- Full Route Cache はレンダリング済みの HTML をサーバーに保存する仕組み
- 中身が共通なら静的化して使い回せる。動的は毎回組み立てる
- 15 以降は既定で動的。静的にするには `fetch` にキャッシュ指定が要る
- `revalidatePath` で保存した HTML を作り直す。共有部分は `"layout"` で
