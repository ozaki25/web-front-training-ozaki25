# Tiptap — 見た目は自分で作るリッチテキストエディタ

## 今日のゴール

- 書きながら装飾できる入力欄は、既製のエディタライブラリで作ると知る
- Tiptap はヘッドレスで、動きだけを提供して見た目を持たないと知る
- 中身が HTML 文字列ではなく、スキーマで定義された木として持たれていると知る
- 定義外が落ちるのはエディタを通したときだけで、防御にはならないと知る

## 書きながら装飾できる入力欄

Notion でも、Google ドキュメントでも、note の投稿画面でもかまいません。文字を打ちながら、その場で一部を太字にしたり、見出しにしたり、箇条書きにしたりできる入力欄を使ったことがあると思います。

![ツールバーの付いた入力欄。見出し、太字を含む段落、箇条書きが表示されている](/tiptap-editor.png)

この画像は、これから説明する Tiptap で実際に作って動かしたものです。B を押せば選んだ文字が太字になり、リストを押せば箇条書きになります。

こういう入力欄は、**リッチテキストエディタ**と呼ばれます。「書式付きの文章を書ける入力欄」という意味です。

`<textarea>` では作れません。`<textarea>` が持てるのはただの文字だからです。改行はできますが、一部だけ太字にすることはできません。

## エディタライブラリという選択肢

リッチテキストエディタは、自分で一から作るものではありません。文字の装飾、選択範囲の扱い、取り消しとやり直し、外部からの貼り付け、日本語の変換中の挙動。考えることが多く、どれも細かい調整が要ります。

そこで既製のライブラリを使います。この分野にはいくつも選択肢があり、そのうちのひとつが **Tiptap** です。

Tiptap は ProseMirror というエディタ基盤の上に作られています。ProseMirror は書式付き文書を扱うための土台で、長く使われてきた実績があります。ただし細かい部品を自分で組み上げる作りで、そのままだと扱いづらい。Tiptap はその上に、React などから使いやすい形の API をかぶせたものです。

## ヘッドレス

Tiptap は自分たちを headless（ヘッドレス）だと説明しています。**動きは全部持っているが、見た目は一切持っていない**という意味です。

インストールして表示しても、ツールバーは出てきません。太字ボタンも、見出しのプルダウンもありません。出てくるのは、編集できる領域だけです。

<div class="d177-box">
  <div class="d177-cols">
    <div>
      <div class="d177-cap">置いただけの状態</div>
      <img class="d177-shot" src="/tiptap-bare.png" alt="ツールバーのない入力欄。文章だけが表示されている">
      <div class="d177-sub">編集はできる。ボタンは付いてこない</div>
    </div>
    <div>
      <div class="d177-cap">ボタンを自分で作ると</div>
      <img class="d177-shot" src="/tiptap-editor.png" alt="上にボタンが並んだ入力欄">
      <div class="d177-sub">見た目も並びも自分で決められる</div>
    </div>
  </div>
  <div class="d177-sub">どちらも同じ Tiptap です。違うのは、上のボタンを自分で置いたかどうかだけ</div>
</div>

ボタンは自分で作り、押されたら Tiptap に命令を送ります。

```jsx
<button onClick={() => editor.chain().focus().toggleBold().run()}>
  太字
</button>
```

面倒に見えますが、これが選ぶ理由でもあります。ボタンの見た目も並びも、既存のデザインに合わせて作れます。付いてきた UI を CSS で上書きして戦う作業が発生しません。

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

書いた内容は `editor.getJSON()` で取り出せます。中身は HTML の文字列ではありません。

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

<div class="d177-box" id="d177-map">
  <div class="d177-cols">
    <div>
      <div class="d177-cap">画面の見た目</div>
      <div class="d177-render">
        <div class="d177-h2"><span class="d177-p " data-k="h" onclick="var k=this.dataset.k;document.querySelectorAll('#d177-map [data-k]').forEach(function(e){e.classList.toggle('d177-on', e.dataset.k===k)})">買い物メモ</span></div>
        <div class="d177-para"><span class="d177-p " data-k="t1" onclick="var k=this.dataset.k;document.querySelectorAll('#d177-map [data-k]').forEach(function(e){e.classList.toggle('d177-on', e.dataset.k===k)})">週末に</span><span class="d177-p d177-b" data-k="b" onclick="var k=this.dataset.k;document.querySelectorAll('#d177-map [data-k]').forEach(function(e){e.classList.toggle('d177-on', e.dataset.k===k)})">牛乳</span><span class="d177-p " data-k="t2" onclick="var k=this.dataset.k;document.querySelectorAll('#d177-map [data-k]').forEach(function(e){e.classList.toggle('d177-on', e.dataset.k===k)})">を買う。</span></div>
      </div>
    </div>
    <div>
      <div class="d177-cap">Tiptap が持っている中身</div>
<pre class="d177-json">{
  "type": "doc",
  "content": [
    <span class="d177-p " data-k="h" onclick="var k=this.dataset.k;document.querySelectorAll('#d177-map [data-k]').forEach(function(e){e.classList.toggle('d177-on', e.dataset.k===k)})">{ "type": "heading", "attrs": { "level": 2 },<br>      "content": [{ "type": "text", "text": "買い物メモ" }] }</span>,
    { "type": "paragraph", "content": [
      <span class="d177-p " data-k="t1" onclick="var k=this.dataset.k;document.querySelectorAll('#d177-map [data-k]').forEach(function(e){e.classList.toggle('d177-on', e.dataset.k===k)})">{ "type": "text", "text": "週末に" }</span>,
      <span class="d177-p " data-k="b" onclick="var k=this.dataset.k;document.querySelectorAll('#d177-map [data-k]').forEach(function(e){e.classList.toggle('d177-on', e.dataset.k===k)})">{ "type": "text", "marks": [{ "type": "bold" }], "text": "牛乳" }</span>,
      <span class="d177-p " data-k="t2" onclick="var k=this.dataset.k;document.querySelectorAll('#d177-map [data-k]').forEach(function(e){e.classList.toggle('d177-on', e.dataset.k===k)})">{ "type": "text", "text": "を買う。" }</span>
    ] }
  ]
}</pre>
    </div>
  </div>
  <div class="d177-sub">どちらかをクリックすると、対応する相手が光ります</div>
</div>

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

よそのページからコピーした文章を貼り付けても、通るのは定義のあるものだけです。色の指定も知らないタグも、木に入れないので残りません。

## 保存は JSON でも HTML でもよい

取り出し方は2つあります。

```js
editor.getJSON();  // 上のような木
editor.getHTML();  // <h2>買い物メモ</h2><p>…</p>
```

公式はどちらで保存してもよいとしたうえで、選ぶ理由を挙げています。

- **JSON**: 走査しやすい。本文中のメンションを探すような処理が書きやすい。エディタが内部で使っている形に近い
- **HTML**: ほかの場所でそのまま描画しやすい。メールに載せるなど。広く使われている形なので、あとでエディタを乗り換えるときに移しやすい

HTML で取り出す場合も、出てくるのは木から組み立て直した HTML です。入れた HTML の写しではありません。

## 通したときだけの話

ここまでを読むと、Tiptap を使えば危ないタグは勝手に消えるように見えます。**これは危険な読み方です。**

消えたのは、エディタの変換を通したからです。通っていないものには何も起きません。

保存 API はリクエストを受け取るだけで、送り主が画面のエディタを使ったかどうかを知りません。攻撃する側はエディタを開く義務がなく、好きな中身を API へ直接送れます。

公式ドキュメントもこの点をはっきり書いています。セキュリティを理由に JSON と HTML のどちらかを選ぶ理由はない、悪意ある内容を送りたい人にとってはどちらでも同じで、そもそも Tiptap を使っているかどうかも関係ない、入力は常に検証すべきだ、と。

スキーマは、**書く人が意図せず壊れた構造を作らないための仕組み**です。送られてきた内容を信用してよいという保証ではありません。受け取る側で確かめる処理が別に要ります。

## まとめ

- リッチテキストエディタは既製のライブラリで作り、Tiptap はその選択肢のひとつ
- 中身はスキーマで定義された部品の木で、出力の HTML はそこから組み立て直したもの
- 定義外が落ちるのはエディタを通したときだけで、サーバー側の検証は別に要る

<style>
.d177-box { border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 16px; margin: 1.5rem 0; }
.d177-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .d177-cols { grid-template-columns: 1fr; } }
.d177-cap { font-size: 12px; opacity: 0.7; margin-bottom: 6px; }
.d177-sub { font-size: 12px; opacity: 0.7; margin-top: 10px; }
.d177-shot { width: 100%; height: auto; display: block; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
.d177-render { background: #ffffff; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; }
.d177-h2 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.d177-para { font-size: 14px; line-height: 1.9; }
.d177-json { background: #ffffff; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; font-size: 11px; line-height: 1.8; overflow-x: auto; margin: 0; }
#d177-map .d177-cols { grid-template-columns: 1fr; }
.d177-p { cursor: pointer; border-radius: 3px; padding: 0 2px; }
.d177-b { font-weight: 700; }
.d177-on { background: #fde68a; color: #1e293b; outline: 1px solid #f59e0b; }
</style>
