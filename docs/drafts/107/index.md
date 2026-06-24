# Router Cache — ブラウザが画面遷移を速くする仕組み

## 今日のゴール

- Router Cache が「ブラウザ側に保持される画面遷移用の控え」だと知る
- 何が控えられ、何が毎回取り直されるかを知る
- 古い控えを捨てる方法（再検証・`router.refresh`）を知る

## ブラウザ側にある控え

Next.js にはサーバー側にもキャッシュがありますが、**Router Cache** はブラウザ側にあります。画面遷移を速くするため、ブラウザが画面の一部をメモリに控えておく仕組みです。

リンクをホバーすると遷移先が先読みされたり、「戻る」が一瞬で表示されたりするのは、この控えのおかげです。サーバーへの往復を省けるので、遷移が速くなります。

## 何が控えられるか

ここは誤解しやすい部分です。Router Cache は**何でも控えるわけではありません**。今の Next.js では、控えられるものと毎回取り直すものが分かれています。

| 対象 | 既定の動き |
|------|----------|
| ページ本体 | **控えない**（遷移のたびに最新を取り直す） |
| 共有レイアウト（ヘッダー等） | 控える（遷移しても取り直さない） |
| 先読み（プリフェッチ）した内容 | 控える |
| 「戻る」「進む」で戻ったときの表示 | 控えから復元する |

ポイントは、**ページ本体は既定で毎回新しくなる**ことです。一覧から詳細へ進むような通常の遷移では、ページの中身は古い控えではなく最新が表示されます。

一方、**全ページで共通のレイアウトは控えられる**ので、取り直しが省かれて遷移が速くなります。

## 控えが古くなるのはレイアウト

控えの恩恵がある分、**控えられる部分は古くなりえます**。とくに問題になりやすいのが、レイアウトに置いた共有データです。

たとえばヘッダーのカート件数バッヂを考えます。バッヂはレイアウト（全ページ共通）にあるので、ブラウザはこれを控えます。

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

商品ページで「カートに追加」しても、別のページに移ったときヘッダーのバッヂが古い件数のまま、ということが起きます。レイアウトの控えがブラウザに残っているからです。

## 再検証はブラウザの控えにも効く

キャッシュを捨てて取り直させることを**再検証**（revalidation）と呼びます。サーバー側のキャッシュを捨てる `revalidatePath` は、**ブラウザの Router Cache にも「その控えは古い」と伝えます**。Server Action（サーバー側で動く関数）でデータを更新し、`revalidatePath` を呼ぶと、サーバーの保存とブラウザの控えがまとめて最新化されます。

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

  revalidatePath("/", "layout"); // レイアウトの控えも最新化する
}
```

`revalidatePath("/", "layout")` で、ルートレイアウトの控えが捨てられ、次の表示でバッヂが正しい件数になります。

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

`router.refresh()` は、今いるルートの控えを捨ててサーバーから取り直します。入力中のフォームの状態などは保ったまま、表示するデータだけを新しくできます。

## なし・あり・再検証

| 状態 | 動き | 速さ | 鮮度 |
|------|------|------|------|
| 控えなし | 遷移やレイアウト表示でサーバーに取りに行く | 遅い | 常に最新 |
| 控えあり | レイアウト・先読み・戻る/進むを控える | 速い | 控えた部分は古びうる |
| 再検証 / refresh | 控えを捨てて取り直す | 速さは維持 | 操作後に最新へ |

ブラウザの控えで遷移を速くしておき、データを変えたときは `revalidatePath` や `router.refresh()` で控えを捨てて最新に戻す。これが基本の組み立てです。

なお、ここで扱ったのはブラウザ側の控えです。サーバー側の「取得したデータ」や「組み立てた HTML」の保存は、段階の違う別のキャッシュです。このレッスンではブラウザの控えに絞っています。

## まとめ

- Router Cache は画面遷移を速くするためのブラウザ側の控え
- ページ本体は既定で毎回最新、共有レイアウトや先読みは控えられる
- 控えられるレイアウトは古くなりうる（カートのバッヂなど）
- `revalidatePath` はブラウザの控えにも効く。単に取り直すなら `router.refresh()`
