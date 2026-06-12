# Web Storage — リロードしても残るデータはどこにいるのか

## 今日のゴール

- localStorage / sessionStorage / Cookie の 3 つの置き場の違いを知る
- 「サーバーに送られるか」「いつ消えるか」という 2 軸の整理を持つ
- localStorage に置いてはいけないものを知る

## ブラウザの中の「引き出し」

ダークモードの設定、最近見た商品、閉じたお知らせバナー。リロードしても、ブラウザを閉じて開き直しても覚えられているこれらの情報は、**ブラウザの中の保存領域**に入っています。

代表的な引き出しは 3 つあります。AI のコードには `localStorage.setItem(...)` が頻出するので、それぞれの性質を知っておくと「この引き出しでいいのか」を判断できます。

## 3 つの引き出しの性質

| | localStorage | sessionStorage | Cookie |
|---|--------------|----------------|--------|
| 消えるタイミング | **消さない限り残る** | **タブを閉じたら消える** | 期限指定どおり |
| サーバーに送られるか | 送られない | 送られない | **毎リクエストに自動添付** |
| 容量の目安 | 5MB 程度 | 5MB 程度 | 4KB 程度 |
| JS から読めるか | 読める | 読める | 読める（**HttpOnly なら読めない**） |

### localStorage — 永続する置き場

```ts
localStorage.setItem("theme", "dark");   // 保存
const theme = localStorage.getItem("theme"); // 取得（無ければ null）
localStorage.removeItem("theme");        // 削除
```

保存できるのは**文字列だけ**です。オブジェクトを入れたいときは JSON にします。

```ts
localStorage.setItem("recent", JSON.stringify(recentItems));
const recent = JSON.parse(localStorage.getItem("recent") ?? "[]");
```

向いているのは、**消えても実害がない、ユーザーの好み**です。テーマ設定、表示の並び順、チュートリアルを見たかどうか。

### sessionStorage — タブ限りの置き場

API は localStorage と同じで、寿命だけが違います。**そのタブを閉じたら消える**ので、「複数ステップのフォームの途中状態」のような、その場限りの作業データに向いています。タブごとに独立しているのも特徴です（同じサイトを 2 タブで開くと別の引き出し）。

### Cookie — サーバーに届く唯一の置き場

3 つの中で Cookie だけが、**リクエストのたびにサーバーへ自動で送られます**。サーバーが値を知る必要があるもの、つまり**ログインセッション**のための置き場です。容量が小さく、毎回の通信に乗るため、大きなデータには向きません。

## どれを使うかの判断フロー

```mermaid
flowchart TD
  A["保存したいデータがある"] --> B{"サーバーがその値を<br>知る必要があるか？"}
  B -- "はい（ログイン状態など）" --> C["Cookie<br>（HttpOnly を付けて）"]
  B -- "いいえ" --> D{"タブを閉じても<br>残したいか？"}
  D -- "はい" --> E["localStorage"]
  D -- "いいえ" --> F["sessionStorage"]
  style C fill:#fecaca,color:#1e293b,stroke:#ef4444
  style E fill:#dcfce7,color:#1e293b,stroke:#22c55e
  style F fill:#fef3c7,color:#1e293b,stroke:#f59e0b
```

## localStorage に置いてはいけないもの

ここが今日いちばん大事な注意です。**localStorage は JavaScript から誰でも読めます**。ページ内で動くスクリプトなら、どれでも全部読めます。

つまり、XSS（スクリプトの注入）が一発でも成立すると、**localStorage の中身は全部盗まれる**ということです。

| localStorage に置いてよい | 置いてはいけない |
|--------------------------|----------------|
| テーマ・言語などの好み | **認証トークン**（盗まれたらなりすまし） |
| 閲覧履歴・下書き | **個人情報**（メール、住所など） |
| UI の状態 | **秘密の値全般** |

AI は「ログイン状態を保存して」という依頼に対して `localStorage.setItem("token", ...)` を出してくることがあります。動きますが、安全な置き場ではありません。「**トークンは HttpOnly Cookie に**」が正解です。HttpOnly 付きの Cookie は JavaScript から読めないため、同じ XSS が起きても直接は盗めません。

## Next.js で使うときの注意 — サーバーには存在しない

もう 1 つの定番の罠が、**localStorage はブラウザにしか無い**ことです。

```tsx
// ❌ Server Component やレンダリング中に直接触ると壊れる
const theme = localStorage.getItem("theme"); // サーバーでは ReferenceError
```

サーバーで実行されるコードに `localStorage` は存在しません。Client Components でも、サーバーでの 1 回目の描画時にレンダリング中に触ればエラーや表示のズレ（ハイドレーション不一致）の原因になります。

定石は「**描画後に読む**」。つまり useEffect の中で触ることです。

```tsx
"use client";

import { useEffect, useState } from "react";

export function ThemeLabel() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    setTheme(localStorage.getItem("theme")); // 描画後、ブラウザでだけ実行される
  }, []);

  if (theme === null) return null; // 読み込むまでは何も出さない
  return <p>現在のテーマ: {theme}</p>;
}
```

「localStorage is not defined というエラーが出た」は Next.js 初心者の定番のつまずきで、原因はこの「サーバーには無い」に尽きます。

## まとめ

- 引き出しは 3 つ: localStorage（永続）、sessionStorage（タブ限り）、Cookie（サーバーに届く）
- 判断軸は「サーバーが知る必要があるか」と「いつまで残すか」
- localStorage は XSS で全部読まれる。トークンや個人情報は置かない（HttpOnly Cookie へ）
- localStorage はサーバーに存在しない。触るのは useEffect の中で
