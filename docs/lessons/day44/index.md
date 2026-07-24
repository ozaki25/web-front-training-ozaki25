# Day 44: Lottie — 軽いアニメーションが JSON で届く仕組み

## 今日のゴール

- Lottie のアニメーションが、動画ではなく図形と動きの命令を記録した JSON だと知る
- JSON だからこそ、実行時に色を変えたり操作と連動できると知る
- Next.js で扱うとき、ブラウザでの描画が前提になる理由を知る

## 見たことがあるはずのアニメーション

アプリでハートボタンを押すと弾むように再生されるアイコンや、読み込み中にくるくる回る滑らかなイラスト。ズームしてもぼやけないその動きを、見たことがあるはずです。

こうした、単純な図形の変化を超えた凝ったイラストが動くアニメーションは、**Lottie** という形式で作られていることが多くあります。デザイナーが Adobe After Effects や Figma で作ったアニメーションを、そのまま Web やアプリに持ち込む仕組みです。

このアニメーションは、なぜ動画や GIF ではなく、数十 KB の JSON ファイルで届くのでしょうか。

## 動画・GIF との違い — 何を記録しているか

動画や GIF は、1 フレームごとの色の並び（ピクセル）をそのまま記録します。滑らかな動きを保つには、フレーム数だけこの記録を繰り返す必要があり、ファイルは簡単に数百 KB から数 MB に膨らみます。

Lottie が記録しているのはピクセルではありません。「どんな形の図形が」「どのタイミングで」「どこからどこへ動くか」という、図形と動きの**命令**です。

- 円や多角形などの図形を、座標と色で表す
- 位置・拡大率・回転・不透明度が、時刻ごとにどの値かを記録する（キーフレーム）
- ブラウザは、この命令を読んで**その場で図形を描き、キーフレームの間を補間して**動かす

命令を記録するだけなので、典型的な Lottie アニメーションは数十 KB で収まります。同じ滑らかさの GIF や動画に比べて、大きさが数分の一で済むと言われています。

図形として描くので、拡大してもぼやけません。GIF や動画がピクセルを引き伸ばすのとは対照的です。

## JSON の中身とレンダリングの仕組み

Lottie の JSON は、アニメーションの元データを書き出しプラグインが変換したものです。もともとは After Effects 向けの Bodymovin というプラグインが最初にこの形式を作りました。

Figma には標準の書き出し機能がまだなく、LottieFiles などのプラグインを使って同じ Lottie JSON を書き出します。中身を簡略化すると、こうなります。

```json
{
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "layers": [
    {
      "ty": 4,
      "ks": {
        "o": { "a": 1, "k": [{ "t": 0, "s": [0] }, { "t": 30, "s": [100] }] },
        "s": { "a": 1, "k": [{ "t": 0, "s": [80, 80] }, { "t": 60, "s": [100, 100] }] }
      },
      "shapes": [{ "ty": "el", "s": { "k": [120, 120] } }]
    }
  ]
}
```

`fr` はフレームレート、`ip`・`op` は開始と終了のフレーム位置です。

`layers` の中の `ks` が、そのレイヤーの不透明度（`o`）や拡大率（`s`）を、時刻ごとの値の組として持っています。この時刻と値の組がキーフレームです。

ブラウザ側では、`lottie-web` のようなライブラリがこの JSON を読み込み、`svg` や `canvas` として実際に図形を描き、キーフレームの間を計算して補間します。

```js
lottie.loadAnimation({
  container: element, // 描画先の DOM 要素
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "like.json",
});
```

つまり Lottie の実体は、**再生する側のブラウザに図形の描き方を渡し、描画そのものはブラウザにやらせる**方式です。動画のように「完成した映像を送る」のではなく、「作り方を送る」と言えます。

## 命令だから実行時に変えられる

作り方そのものを送っているので、色や形そのものを実行時に書き換えられます。

- **色を実行時に変えられる**: 図形の色も命令の一部なので、ダークモードに合わせて塗り色を差し替えられる
- **操作と連動して止め・進められる**: スクロール量やボタンのクリックに合わせて、任意のタイミングで再生・停止・巻き戻しができる

読み込み中にくるくる回るアイコンや、いいねボタンを押した瞬間だけ再生されるアニメーションは、この「途中で止めて、また動かせる」性質を使っています。動画や GIF は色や形そのものがピクセルとして焼き付けられているため、ここまでの書き換えはできません。

## Web と Next.js での扱い方

現在 LottieFiles が推奨しているのは、Rust で書かれた描画エンジンを WebAssembly（別言語で書いたコードをブラウザ上で高速に動かす仕組み）でブラウザに持ち込んだ `@lottiefiles/dotlottie-web` と、その React 向けラッパーである `@lottiefiles/dotlottie-react` です。

```tsx
"use client";

import dynamic from "next/dynamic";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

export function LikeButtonAnimation() {
  return <DotLottieReact src="/animations/like.lottie" autoplay loop={false} />;
}
```

`{ ssr: false }` を付けて動的 import にしているのは、思いつきの書き方ではありません。ここまで見てきたとおり、Lottie の再生は「JSON を読み込み、ブラウザの `canvas` に図形を描く」処理です。

Server Components はサーバー側で HTML を組み立てるだけで、そこには `canvas` を描く実行環境がありません。だから Lottie の再生コンポーネントは、必ずブラウザ側（Client Component）で、しかもサーバーでの事前実行をスキップして動かす必要があります。

なお、`.lottie` という拡張子の **dotLottie** 形式も普及しています。中身は Lottie JSON と画像アセットをひとつのファイルにまとめたもので、複数のアニメーションを 1 ファイルに収められるうえ、配布サイズもさらに小さくなります。

## 動きを止める配慮

前庭障害を持つ人にとって、画面上で動き続ける図形は、めまいや体調不良の引き金になることがあります。CSS のアニメーションなら `prefers-reduced-motion` というメディアクエリで止められますが、Lottie は CSS ではなく JavaScript が再生しているので、CSS だけでは止まりません。

ここで効くのが、さきほどの「命令だから実行時に変えられる」性質です。設定を JavaScript 側で読み取り、さきほどのコンポーネントに、再生を直接止める分岐を足します。

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

export function LikeButtonAnimation() {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <DotLottieReact
      src="/animations/like.lottie"
      autoplay={!reduceMotion}
      loop={!reduceMotion}
    />
  );
}
```

装飾のためのループ再生は止め、状態を伝えるために必要な 1 回だけの再生は残す、といった調整もできます。

## まとめ

- Lottie は動画ではなく、図形と動き（キーフレーム）の命令を記録した JSON
- 命令だからこそ小さく、拡大してもぼやけず、色や形を実行時に変えられる
- 再生はブラウザでの描画が前提のため、Next.js では Client Component で動的 import する
- 動きを止める配慮も、再生インスタンスを直接操作して行う
