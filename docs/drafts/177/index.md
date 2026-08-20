# Tiptap — 見た目は自分で作るリッチテキストエディタ

## 今日のゴール

- ヘッドレスなエディタが、動きだけを提供して見た目を持たないと知る
- 中身が HTML 文字列ではなく、スキーマで定義された木として持たれていると知る
- 定義外が落ちるのはエディタを通したときだけで、防御にはならないと知る

## 入力欄に太字を入れたくなったら

問い合わせフォームやコメント欄なら `<textarea>` で足ります。ところが「見出しを付けたい」「一部を太字にしたい」「箇条書きにしたい」と言われた瞬間、`<textarea>` では届かなくなります。

こういう入力欄を作るためのライブラリのひとつが **Tiptap** です。ProseMirror という定評のあるエディタ基盤を包んで、扱いやすい API にしたものです。

## ヘッドレスとは何か

Tiptap を説明するとき、公式は自分たちを headless（ヘッドレス）だと書いています。**動きは全部持っているが、見た目は一切持っていない**という意味です。

インストールして表示しても、ツールバーは出てきません。太字ボタンも、見出しのプルダウンもありません。出てくるのは、文字を打てて、太字や見出しを表現できる領域だけです。

ボタンは自分で作り、押されたら Tiptap に命令を送ります。

```jsx
<button onClick={() => editor.chain().focus().toggleBold().run()}>
  太字
</button>
```

面倒に見えますが、これが選ぶ理由でもあります。ボタンの見た目も並びも、既存のデザインに合わせて自由に作れます。付いてきた UI を CSS で上書きして戦う、という作業が発生しません。

## Next.js で動かす

インストールするのはこれです。

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

公式が案内している最小の形はこうです。

```jsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
    // サーバー側では描画しない
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;
```

`"use client"` が要ります。エディタはブラウザの操作を扱うので、サーバー側では動かせません。

`immediatelyRender: false` も公式が付けています。これがないと、サーバーが作った HTML とブラウザが作った結果がずれて、ハイドレーションのエラーになります。ブラウザ側の準備が終わってから描画させる指定です。

`extensions` に渡している StarterKit は、よく使う機能をまとめた詰め合わせです。段落、見出し、太字、斜体、箇条書き、引用、コードブロックなどが入っています。足りなければ拡張を足し、要らなければ外します。

## 中身は木として持たれている

書いた内容は `editor.getJSON()` で取り出せます。中身を見ると、HTML の文字列ではありません。

「買い物メモ」という見出しと、「週末に**牛乳**を買う。」という段落を書くと、こうなります。

```json
{
  "type": "doc",
  "content": [
    { "type": "heading", "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "買い物メモ" }] },
    { "type": "paragraph", "content": [
      { "type": "text", "text": "週末に" },
      { "type": "text", "marks": [{ "type": "bold" }], "text": "牛乳" },
      { "type": "text", "text": "を買う。" }
    ] }
  ]
}
```

タグの並びではなく、入れ子になった部品の木です。太字は `<strong>` というタグではなく、その文字に付いた `bold` という**マーク**として表されています。

この形は**スキーマ**という定義に沿っています。どんな部品が存在してよいか、どれがどれの中に入れるか、どんな属性を持てるかが、あらかじめ決まっています。StarterKit で定義されているのは次の範囲です。

| 種類 | 定義されているもの |
|---|---|
| ノード（部品） | doc, paragraph, heading, text, bulletList, orderedList, listItem, blockquote, codeBlock, horizontalRule, hardBreak |
| マーク（文字に付く装飾） | bold, italic, strike, underline, code, link |

## 定義にないものは入れない

スキーマの効き目は、汚れた HTML を入れてみると分かります。

```js
import { generateJSON, generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

const dirty =
  '<p>ふつうの文</p>' +
  '<script>alert(1)</script>' +
  '<marquee>流れる</marquee>' +
  '<p onclick="steal()">クリック</p>';

console.log(generateHTML(generateJSON(dirty, [StarterKit]), [StarterKit]));
// <p>ふつうの文</p><p>流れる</p><p>クリック</p>
```

`<script>` は中身ごと消え、`<marquee>` は `<p>` になり、`onclick` も落ちました。`img` も StarterKit の一覧にないので残りません。

入れた文字列をそのまま抱えているなら、こうはなりません。**一度スキーマに沿った木へ変換され、出すときにその木から組み立て直されています。** 出てくる HTML は、入れた HTML の写しではありません。

## 保存は JSON でも HTML でもよい

取り出し方は2つあります。

```js
editor.getJSON();  // 上のような木
editor.getHTML();  // <h2>買い物メモ</h2><p>…</p>
```

公式はどちらで保存してもよいとしたうえで、選ぶ理由を挙げています。

- **JSON**: 走査しやすい。本文中のメンションを探すような処理が書きやすい。エディタが内部で使っている形に近い
- **HTML**: ほかの場所でそのまま描画しやすい。メールに載せるなど。広く使われている形なので、あとでエディタを乗り換えるときに移しやすい

どちらで保存しても、エディタを通った時点でスキーマによる整理は済んでいます。

## 通したときだけの話

ここまでを読むと、Tiptap を使えば危ないタグは勝手に消えるように見えます。**これは危険な読み方です。**

消えたのは、エディタの変換を通したからです。通っていないものには何も起きません。

保存 API はリクエストを受け取るだけで、送り主が画面のエディタを使ったかどうかを知りません。攻撃する側はエディタを開く義務がなく、好きな中身を API へ直接送れます。

公式ドキュメントもこの点をはっきり書いています。セキュリティを理由に JSON と HTML のどちらかを選ぶ理由はない、悪意ある内容を送りたい人にとってはどちらでも同じで、そもそも Tiptap を使っているかどうかも関係ない、入力は常に検証すべきだ、と。

スキーマは、**書く人が意図せず壊れた構造を作らないための仕組み**です。送られてきた内容を信用してよいという保証ではありません。受け取る側で確かめる処理が別に要ります。

## まとめ

- Tiptap はヘッドレスなので、ツールバーの見た目は自分で作る
- 中身はスキーマで定義された部品の木で、出力の HTML はそこから組み立て直したもの
- 定義外が落ちるのはエディタを通したときだけで、サーバー側の検証は別に要る
