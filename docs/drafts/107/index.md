# Router Cache — ブラウザが画面遷移を速くする仕組み

## 今日のゴール

- Router Cache が「ブラウザがメモリに持っておく画面遷移用のキャッシュ」だと知る
- 何が保持され、何が毎回取り直されるかを知る
- 古くなった保持データを捨てる方法（再検証・`router.refresh`）を知る

::: info このレッスンの前提（Next.js 16）
Router Cache はブラウザ側の仕組みで、`cacheComponents` の従来モデル・新モデルどちらでも共通です（Next.js 16）。なお「ページ本体は既定で保持しない」は Next.js 15 以降の挙動です。それ以前はページ本体も一定時間保持していたため、古いコードや解説が「遷移しても少しの間ページが古いまま」を前提にしていることがあります。
:::

## ブラウザ側にあるキャッシュ

Next.js にはサーバー側にもキャッシュがありますが、**Router Cache** はブラウザ側にあります。画面遷移を速くするため、ブラウザが表示済みの画面の一部をメモリに持っておく仕組みです。

リンクをホバーすると遷移先が先読みされたり、「戻る」が一瞬で表示されたりするのは、この仕組みのおかげです。サーバーへの往復を省けるので、遷移が速くなります。

## 何が保持されるか

ここは誤解しやすい部分です。Router Cache は**何でも保持するわけではありません**。

保持されるものと、毎回取り直すものが分かれています。

| 対象 | 既定の動き |
|------|----------|
| ページ本体 | **保持しない**（遷移のたびに最新を取り直す） |
| 共有レイアウト（ヘッダー等） | 保持する（遷移しても取り直さない） |
| 先読み（プリフェッチ）した内容 | 保持する |
| 「戻る」「進む」で戻ったときの表示 | 保持データから復元する |

ポイントは、**ページ本体は既定で毎回新しくなる**ことです。一覧から詳細へ進むような通常の遷移では、ページの中身は古い保持データではなく最新が表示されます。

一方、**全ページで共通のレイアウトは保持される**ので、取り直しが省かれて遷移が速くなります。

## 保持データが古くなるのはレイアウト

保持の恩恵がある分、**保持された部分は古くなりえます**。とくに問題になりやすいのが、レイアウトに置いた共有データです。

たとえばヘッダーのカート件数バッヂを考えます。バッヂはレイアウト（全ページ共通）にあるので、ブラウザはこれを保持します。

```tsx
// app/layout.tsx
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await fetch("https://api.example.com/cart/count");
  const { count } = await res.json();
  return (
    <html lang="ja">
      <body>
        <header>
          <a href="/cart" aria-label={`カート（${count}件）`}>
            <span aria-hidden="true">🛒</span>
            <span>{count}</span>
          </a>
        </header>
        {children}
      </body>
    </html>
  );
}
```

商品ページで「カートに追加」しても、別のページに移ったときヘッダーのバッヂが古い件数のまま、ということが起きます。レイアウトの保持データがブラウザに残っているからです。

## 再検証はブラウザの保持データにも効く

キャッシュを捨てて取り直させることを**再検証**（revalidation）と呼びます。サーバー側のキャッシュを捨てる `revalidatePath` は、**ブラウザの Router Cache にも「その保持データは古い」と伝えます**。

Server Action（サーバー側で動く関数）でデータを更新し、`revalidatePath` を呼ぶと、サーバーのキャッシュとブラウザの保持データがまとめて最新化されます。

```ts
// app/products/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function addToCart(productId: string) {
  await fetch("https://api.example.com/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });

  revalidatePath("/", "layout"); // レイアウトの保持データも最新化する
}
```

`revalidatePath("/", "layout")` で、ルートレイアウトの保持データが捨てられ、次の表示でバッヂが正しい件数になります。

第 2 引数の `"layout"` は「レイアウトと配下の全ページ」を対象にする指定です。バッヂはどのページでも出るので、レイアウト単位で捨てる必要があります。

## 手動で取り直す router.refresh

データ更新を伴わず、ただ「今の画面を最新の状態で取り直したい」場合は、クライアントコンポーネントから `router.refresh()` を呼びます。

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

`router.refresh()` は、今いるルートの保持データを捨ててサーバーから取り直します。入力中のフォームの状態などは保ったまま、表示するデータだけを新しくできます。

## 速さと鮮度のバランス

Router Cache は設定で付け外しするものではなく、ブラウザがいつも持っている仕組みです。何が保持されるかは前掲の表のとおりで、ページ本体は毎回最新、レイアウトや先読みは保持されます。

保持されたレイアウトは古くなりえます。データを変えたときは `revalidatePath` や `router.refresh()` で保持データを捨て、最新に戻します。遷移は保持で速いまま、変えたところだけ最新にするのが基本の組み立てです。

なお、ここで扱ったのはブラウザ側の保持です。サーバー側の「取得したデータ」や「組み立てた HTML」の保存は、段階の違う別のキャッシュです。

このレッスンではブラウザの保持に絞っています。

## まとめ

- Router Cache は画面遷移を速くするためのブラウザ側のキャッシュ
- ページ本体は既定で毎回最新、共有レイアウトや先読みは保持される
- 保持されたレイアウトは古くなりうる（カートのバッヂなど）
- `revalidatePath` はブラウザの保持データにも効く。単に取り直すなら `router.refresh()`
