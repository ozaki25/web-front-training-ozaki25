# Day 33: revalidate の使い分け — 3 つの起点と波及範囲

## 今日のゴール

- `revalidateTag` はデータ起点、`revalidatePath` はパス起点、`router.refresh` はブラウザ起点だと整理する
- サーバー側の無効化は「次のアクセスで作り直す」遅延式だと知る
- 1 つの操作が複数のキャッシュを芋づる式に作り直すことを知る

::: info このレッスンは従来モデル
取得側は従来モデル（`cacheComponents` 無効、`fetch` の `next.tags` でタグ付け）で書いています。新モデルでは取得側が `"use cache"` と `cacheTag` に変わりますが、無効化の API（`revalidateTag` / `updateTag` / `revalidatePath` / `router.refresh`）はどちらのモデルでも共通です。
:::

## revalidate が関わる 3 つのキャッシュ

revalidate で作り直す対象は、次の 3 つのキャッシュです。

| キャッシュ | 置き場所 | 何を保存するか |
|----------|---------|--------------|
| Data Cache | サーバー | `fetch` などで取ったデータ |
| Full Route Cache | サーバー | 組み立てたルートの HTML |
| Router Cache | ブラウザ | 画面遷移用に保持した表示 |

データを取り、その結果でルートの HTML を組み立て、ブラウザがそれを保持する。この 3 つは上から順に積み重なっています。

更新したのに画面が古いのは、このどこかに古い保存が残っているからです。`revalidateTag` / `revalidatePath` / `router.refresh` は、それぞれ違う場所を起点に、この保存を作り直します。

## revalidateTag — データ起点

`revalidateTag` は、データに付けたタグを目印にして無効化します。

まず、`fetch` でデータを取るときにタグを付けておきます。

```ts
// lib/products.ts
export async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: { tags: ["products"] }, // 「products」タグを付ける
  });
  return res.json();
}
```

データを更新する Server Action の中で、このタグを指定して `revalidateTag` を呼びます。Server Action は、サーバー側で動く関数です。

```ts
// app/products/actions.ts
"use server";

import { revalidateTag } from "next/cache";

export async function addProduct(formData: FormData) {
  await fetch("https://api.example.com/products", {
    method: "POST",
    body: formData,
  });

  revalidateTag("products", "max"); // products タグのデータを無効化（v16 で 1 引数だけの呼び出しは非推奨）
}
```

`revalidateTag("products", "max")` を呼ぶと、起点は Data Cache です。`products` タグの付いた Data Cache が無効になります。

ここから芋づる式に広がります。そのデータを使って組み立てた HTML は古くなるので、`products` を使っている全ルートの Full Route Cache も無効になります。

トップページと一覧ページの両方で同じデータを出していれば、両方が対象です。こうして 1 つのタグで複数ページをまとめて無効にできます。

<svg viewBox="0 0 560 320" role="img" aria-label="revalidateTag('products') を起点にした芋づる式の無効化。データ起点で Data Cache の products タグが無効になり、products を使うルート A とルート B の Full Route Cache が無効になり、次の遷移で Router Cache も更新される。1 つのタグが複数のルートに波及する。" style="width:100%;height:auto;max-width:560px;display:block;margin:16px auto;">
  <defs>
    <marker id="d108-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>
  </defs>
  <rect x="0" y="0" width="560" height="320" rx="10" fill="#f8fafc"/>

  <rect x="175" y="20" width="210" height="46" rx="8" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="280" y="41" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">revalidateTag('products')</text>
  <text x="280" y="57" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">データ起点</text>

  <line x1="280" y1="66" x2="280" y2="88" stroke="#64748b" stroke-width="2" marker-end="url(#d108-arrow)"/>

  <rect x="175" y="90" width="210" height="46" rx="8" fill="#fecaca" stroke="#ef4444"/>
  <text x="280" y="111" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">Data Cache</text>
  <text x="280" y="127" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">products タグを無効化</text>

  <line x1="240" y1="136" x2="152" y2="176" stroke="#64748b" stroke-width="2" marker-end="url(#d108-arrow)"/>
  <line x1="320" y1="136" x2="408" y2="176" stroke="#64748b" stroke-width="2" marker-end="url(#d108-arrow)"/>
  <text x="280" y="160" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">products を使う全ルート</text>

  <rect x="40" y="178" width="210" height="50" rx="8" fill="#fed7aa" stroke="#f97316"/>
  <text x="145" y="200" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">ルート A</text>
  <text x="145" y="217" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">Full Route Cache</text>

  <rect x="310" y="178" width="210" height="50" rx="8" fill="#fed7aa" stroke="#f97316"/>
  <text x="415" y="200" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">ルート B</text>
  <text x="415" y="217" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">Full Route Cache</text>

  <line x1="145" y1="228" x2="245" y2="262" stroke="#64748b" stroke-width="2" marker-end="url(#d108-arrow)"/>
  <line x1="415" y1="228" x2="315" y2="262" stroke="#64748b" stroke-width="2" marker-end="url(#d108-arrow)"/>

  <rect x="175" y="264" width="210" height="46" rx="8" fill="#dcfce7" stroke="#22c55e"/>
  <text x="280" y="285" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">Router Cache</text>
  <text x="280" y="301" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">次の遷移で更新</text>
</svg>

無効化しても、その場で作り直すわけではありません。古い保存に「もう古い」と印を付けるだけで、実際に作り直すのは次に誰かがそのページを開いたときです。

サーバー側の無効化はこの遅延式だと覚えておくと、挙動を読み違えずに済みます。

v16 では `revalidateTag` に第 2 引数（`"max"` などの鮮度プロファイル）を渡すのが基本になり、1 引数だけの呼び出しは非推奨になりました。`"max"` は「古い内容を返しつつ、裏で作り直す」動きです。

自分が加えた変更を、古い内容を挟まずにその場で反映したいときは、Server Action 専用の `updateTag("products")` を使います。`revalidateTag` が古いものを一度返すのに対し、`updateTag` は古い内容を見せずに最新へ切り替えます（read-your-writes）。

## revalidatePath — パス起点

`revalidatePath` は、ルートのパスを目印にして無効化します。

```ts
// app/admin/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function updateCompany(formData: FormData) {
  await fetch("https://api.example.com/company", {
    method: "POST",
    body: formData,
  });

  revalidatePath("/about"); // /about を無効化
}
```

起点は指定したパスです。`/about` の Full Route Cache と、そのページで使っていた Data Cache がまとめて無効になります。

次に `/about` を開いたとき、データを取り直してレンダリングし直し、新しい HTML が保存されます。ブラウザ側の Router Cache にも「`/about` の保持は古い」と伝わるので、遷移で表示し直したときも新しくなります。

`revalidateTag` がデータを目印にして複数ページを横断するのに対し、`revalidatePath` は「このパスを丸ごと作り直す」という指定です。どのデータが絡んでいるかを気にせず、ページ単位で更新したいときに向きます。

第 2 引数で範囲を選べます。`revalidatePath("/about")` はそのページだけ、`revalidatePath("/", "layout")` はそのレイアウトを共有する配下の全ページをまとめて無効化します。

動的セグメント（`/blog/[slug]`）を渡すときは第 2 引数が必須です。

## router.refresh — ブラウザ起点

`router.refresh()` は、ブラウザが持っている今の画面を捨てて、サーバーにページを要求し直す**ブラウザ側だけの操作**です。クライアントコンポーネントから呼びます。

```tsx
"use client";

import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.refresh()}>
      最新の状態に更新
    </button>
  );
}
```

起点はブラウザの Router Cache です。今のルートの保持を捨ててサーバーに取り直しに行きますが、**サーバー側の Data Cache と Full Route Cache には触れません**。

なので、サーバーに古い保存が残っていれば、取り直しても結局その古い保存が返ってきます。

`router.refresh` が向くのは、自分が更新したわけではないのに画面が古いときです。別の管理画面で在庫が変わった、他の人が情報を更新した、といった場合に、ブラウザ側で取り直しをかけます。

サーバー側のデータを自分で書き換えたなら、`revalidateTag` か `revalidatePath` の出番です。

## 3 つの起点

同じ「作り直す」でも、どこを起点に、どこまで届くかが違います。3 つのキャッシュを、ブラウザ（手前）からサーバーの奥へ横に並べ、各操作の届く範囲を重ねると次のようになります。

<svg viewBox="0 0 600 268" role="img" aria-label="3 つの操作がどこまで届くかを、ブラウザ（手前）からサーバーの奥へ並べた図。左がブラウザの Router Cache、中央がサーバー末端の Full Route Cache、右がサーバー奥の Data Cache。router.refresh はブラウザだけに届きサーバーには届かない。revalidatePath はサーバー末端を起点に 3 層すべてに届く。revalidateTag はサーバー奥のデータを起点に 3 層すべてに届く。" style="width:100%;height:auto;max-width:600px;display:block;margin:16px auto;">
  <rect x="0" y="0" width="600" height="268" rx="10" fill="#f8fafc"/>

  <text x="198" y="34" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#64748b">あなたの端末</text>
  <text x="436" y="34" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#64748b">Next サーバー</text>

  <line x1="278" y1="40" x2="278" y2="224" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="436" y1="44" x2="436" y2="224" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4"/>

  <rect x="124" y="44" width="148" height="46" rx="6" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="198" y="65" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">ブラウザ</text>
  <text x="198" y="81" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">Router Cache</text>

  <rect x="284" y="44" width="148" height="46" rx="6" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="358" y="65" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">サーバーの末端</text>
  <text x="358" y="81" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">Full Route Cache</text>

  <rect x="440" y="44" width="148" height="46" rx="6" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="514" y="65" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">サーバーの奥</text>
  <text x="514" y="81" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">Data Cache</text>

  <text x="12" y="123" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#1e293b">router.refresh</text>
  <rect x="124" y="108" width="148" height="24" rx="6" fill="#bfdbfe" stroke="#3b82f6"/>
  <circle cx="198" cy="120" r="5" fill="#1e293b" stroke="#ffffff" stroke-width="1.5"/>

  <text x="12" y="163" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#1e293b">revalidatePath</text>
  <rect x="124" y="148" width="464" height="24" rx="6" fill="#bfdbfe" stroke="#3b82f6"/>
  <circle cx="358" cy="160" r="5" fill="#1e293b" stroke="#ffffff" stroke-width="1.5"/>

  <text x="12" y="203" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#1e293b">revalidateTag</text>
  <rect x="124" y="188" width="464" height="24" rx="6" fill="#bfdbfe" stroke="#3b82f6"/>
  <circle cx="514" cy="200" r="5" fill="#1e293b" stroke="#ffffff" stroke-width="1.5"/>

  <circle cx="132" cy="246" r="5" fill="#1e293b" stroke="#ffffff" stroke-width="1.5"/>
  <text x="144" y="250" font-family="sans-serif" font-size="11" fill="#1e293b">起点</text>
  <rect x="196" y="240" width="30" height="12" rx="3" fill="#bfdbfe" stroke="#3b82f6"/>
  <text x="232" y="250" font-family="sans-serif" font-size="11" fill="#1e293b">届く範囲（帯がなければ触れない）</text>
</svg>

一番の違いは、`router.refresh` だけがサーバー側（Data Cache と Full Route Cache）に届かないことです。ブラウザの表示を取り直すだけなので、サーバーの保存が古ければ古いまま返ってきます。

| 操作 | 起点 | 無効化する範囲 | タイミング |
|------|------|--------------|----------|
| `revalidateTag` | データ | タグの付いた Data Cache から、それを使う全ルートの Full Route Cache | 次のアクセスで作り直し |
| `revalidatePath` | パス | そのパスの Full Route Cache と紐づく Data Cache | 次のアクセスで作り直し |
| `router.refresh` | ブラウザ | 今のルートの Router Cache だけ | その場で取り直し |

迷ったときは、こう選びます。

- 複数ページに出ている同じデータを更新した → `revalidateTag`
- 特定のページを丸ごと新しくしたい → `revalidatePath`
- サーバーのデータはそのままで、画面だけ取り直したい → `router.refresh`

サーバー側の 2 つは遅延式なので、呼んだ直後にサーバーで何かが起きるわけではありません。実際に作り直されるのは次のアクセスのとき、という点を押さえておくと、「revalidate したのに変わらない」で慌てずに済みます。

## まとめ

- `revalidateTag` はデータ起点、`revalidatePath` はパス起点、`router.refresh` はブラウザ起点
- サーバー側の無効化は遅延式で、次のアクセスで作り直す
- `revalidateTag` は Data Cache から Full Route Cache へ芋づる式、複数ページ横断
- `router.refresh` はブラウザだけ、サーバーのキャッシュには触れない
