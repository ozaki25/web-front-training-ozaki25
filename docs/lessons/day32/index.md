# Day 32: Router Cache — ブラウザが画面遷移を速くする仕組み

## 今日のゴール

- Router Cache が「ブラウザがメモリに持っておく画面遷移用のキャッシュ」だと知る
- 何が保持され、何が取り直されるかを知る
- 古くなった保持データを消す方法（再検証・`router.refresh`）を知る

::: info このレッスンの前提
Router Cache はブラウザ側の仕組みです。ここで扱う基本の挙動（レイアウトは保持・ページは取り直し・戻る/進むは復元）は、`cacheComponents` の新旧モデルどちらでも共通です。
:::

## ブラウザ側にあるキャッシュ

Next.js にはサーバー側にもキャッシュがありますが、**Router Cache** はブラウザ側にあります。画面遷移を速くするため、ブラウザが表示済みの画面の一部をメモリに持っておく仕組みです。

リンクをホバーすると遷移先が先読みされたり、「戻る」が一瞬で表示されたりするのは、この仕組みのおかげです。サーバーへの往復を省けるので、遷移が速くなります。

サーバー側のキャッシュと違い、設定で付け外しするものではなく、ブラウザが常に持っています。ただしメモリ上の一時的なものなので、ページをリロード（F5）すると丸ごと消えます。

## 何が保持されるか

Router Cache は**何でも保持するわけではありません**。ここは誤解しやすいところです。

保持されるものと、取り直すものが分かれています。

App Router では、ページ固有の中身は `page.tsx` に、ヘッダーやナビのように複数ページで共通する枠は `layout.tsx` に書きます。Router Cache はこの 2 つを別々に扱い、さらに遷移の種類によっても動きが変わります。

| 遷移の種類 | ページ本体（`page.tsx`） | 共有レイアウト（`layout.tsx`） |
|-----------|------------------------|------------------------------|
| リンクで前に進む | 取り直す | キャッシュを使う |
| 「戻る」「進む」 | キャッシュを使う | キャッシュを使う |

リンクで前に進むときは、ページ本体**だけ**取り直し、共有レイアウトはキャッシュを使います。レイアウトのぶん取り直しが省けるので、遷移が速くなります。「戻る」「進む」では、ページ本体も含めてキャッシュを使うので、前に見た画面が一瞬で戻ります。

::: info
この表は、内容がアクセスごとに変わる動的なページのデフォルトです。静的に生成されたページは、リンク遷移でもページ本体がしばらくキャッシュから使われます。
:::

なお、リンクをホバーしたときなどに遷移先を先に取っておく**先読み**（プリフェッチ）も、前進遷移を速くするために内容を保持しておく仕組みです。

別のページへ遷移したとき、どの部分がキャッシュを使い、どの部分が取り直されるかを図にすると次のようになります。

<svg viewBox="0 0 560 250" role="img" aria-label="商品一覧から商品詳細へ遷移する図。共有レイアウトのヘッダー（無地・チェック印）は両方の画面でキャッシュを使って表示され、斜線で示したページ本体（矢印印）だけが商品一覧から商品詳細へ取り直される" style="width:100%;height:auto;max-width:560px;display:block;margin:16px auto;">
  <defs>
    <clipPath id="day32-rc-c1"><rect x="40" y="36" width="190" height="150" rx="8"/></clipPath>
    <clipPath id="day32-rc-c2"><rect x="330" y="36" width="190" height="150" rx="8"/></clipPath>
    <marker id="day32-rc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>
    <pattern id="day32-rc-hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#dc2626" stroke-width="1" opacity="0.5"/></pattern>
  </defs>

  <rect x="0" y="0" width="560" height="250" rx="10" fill="#f8fafc"/>

  <text x="135" y="26" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#475569">遷移前：商品一覧</text>
  <g clip-path="url(#day32-rc-c1)">
    <rect x="40" y="36" width="190" height="150" fill="#ffffff"/>
    <rect x="40" y="36" width="190" height="54" fill="#dcfce7"/>
    <rect x="40" y="90" width="190" height="96" fill="#fee2e2"/>
    <rect x="40" y="90" width="190" height="96" fill="url(#day32-rc-hatch)"/>
    <rect x="40" y="89" width="190" height="2" fill="#94a3b8"/>
  </g>
  <rect x="40" y="36" width="190" height="150" rx="8" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="135" y="63" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#1e293b">🛒 カート 3</text>
  <text x="135" y="80" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">✓ 共有レイアウト</text>
  <text x="135" y="135" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#1e293b">商品一覧</text>
  <text x="135" y="159" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">↻ ページ本体</text>

  <line x1="238" y1="111" x2="320" y2="111" stroke="#64748b" stroke-width="2" marker-end="url(#day32-rc-arrow)"/>
  <text x="279" y="103" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">遷移</text>

  <text x="425" y="26" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#475569">遷移後：商品詳細</text>
  <g clip-path="url(#day32-rc-c2)">
    <rect x="330" y="36" width="190" height="150" fill="#ffffff"/>
    <rect x="330" y="36" width="190" height="54" fill="#dcfce7"/>
    <rect x="330" y="90" width="190" height="96" fill="#fee2e2"/>
    <rect x="330" y="90" width="190" height="96" fill="url(#day32-rc-hatch)"/>
    <rect x="330" y="89" width="190" height="2" fill="#94a3b8"/>
  </g>
  <rect x="330" y="36" width="190" height="150" rx="8" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="425" y="63" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#1e293b">🛒 カート 3</text>
  <text x="425" y="80" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">✓ 共有レイアウト</text>
  <text x="425" y="135" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#1e293b">商品詳細</text>
  <text x="425" y="159" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">↻ ページ本体</text>

  <rect x="66" y="216" width="18" height="18" rx="3" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="92" y="229" font-family="sans-serif" font-size="12" fill="#1e293b">✓ 無地はキャッシュを使う</text>
  <rect x="336" y="216" width="18" height="18" rx="3" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
  <rect x="336" y="216" width="18" height="18" rx="3" fill="url(#day32-rc-hatch)"/>
  <text x="362" y="229" font-family="sans-serif" font-size="12" fill="#1e293b">↻ 斜線は取り直す</text>
</svg>

無地のレイアウトは遷移してもキャッシュを使い、斜線のページ本体は取り直します。だから遷移は速い一方、レイアウトに置いたデータは古いまま残ることがあります。

## 古くなるのはレイアウトの保持データ

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

キャッシュを消して取り直させることを**再検証**（revalidation）と呼びます。サーバー側のキャッシュを消す `revalidatePath` は、**ブラウザの Router Cache にも「その保持データは古い」と伝えます**。

Server Action（サーバー側で動く関数）でデータを更新し、`revalidatePath` を呼ぶと、サーバーのキャッシュとブラウザの保持データがまとめて新しくなります。

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

  revalidatePath("/", "layout"); // レイアウトの保持データも新しくする
}
```

`revalidatePath("/", "layout")` で、ルートレイアウトの保持データが消され、次の表示でバッヂが正しい件数になります。ヘッダーのバッヂで見ると、こう変わります。

<svg viewBox="0 0 480 128" role="img" aria-label="ヘッダーのカート件数バッヂが、revalidatePath を呼ぶ前は古い 3 件のまま、呼んだ後は最新の 4 件に作り直される様子" style="width:100%;height:auto;max-width:480px;display:block;margin:16px auto;">
  <defs>
    <marker id="day32-rc2-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>
  </defs>
  <rect x="0" y="0" width="480" height="128" rx="10" fill="#f8fafc"/>

  <text x="105" y="24" text-anchor="middle" font-family="sans-serif" font-size="12.5" fill="#475569">再検証の前</text>
  <rect x="20" y="34" width="170" height="66" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="105" y="65" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#1e293b">🛒 カート 3</text>
  <text x="105" y="85" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">保持データ｜古いまま</text>

  <line x1="200" y1="67" x2="290" y2="67" stroke="#64748b" stroke-width="2" marker-end="url(#day32-rc2-arrow)"/>
  <text x="245" y="58" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">revalidatePath</text>

  <text x="375" y="24" text-anchor="middle" font-family="sans-serif" font-size="12.5" fill="#475569">再検証の後</text>
  <rect x="290" y="34" width="170" height="66" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="375" y="65" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#1e293b">🛒 カート 4</text>
  <text x="375" y="85" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">作り直して最新</text>
</svg>

第 2 引数の `"layout"` は「レイアウトと配下の全ページ」を対象にする指定です。バッヂはどのページでも出るので、レイアウト単位で消す必要があります。

## 手動で取り直す router.refresh

`router.refresh()` は、ブラウザが持っている今の画面を捨てて、サーバーにページを要求し直す**ブラウザ側だけの操作**です。サーバー側のキャッシュは消しません。

ブラウザの再読み込み（F5）に似ていますが、F5 と違って入力中のフォームの状態などは保たれ、表示だけが新しくなります。

使うのは、自分が更新したわけではないのに画面が古いときです。たとえば別の管理画面で在庫が変わった、他の人が情報を更新した、といった場合に、クライアントコンポーネントから呼びます。

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

## まとめ

- Router Cache は画面遷移を速くするためのブラウザ側のキャッシュ
- ページ本体はリンク遷移では最新、共有レイアウトや先読みは保持される
- 保持されたレイアウトは古くなりうる（カートのバッヂなど）
- `revalidatePath` はブラウザの保持データにも効く。単に取り直すなら `router.refresh()`
