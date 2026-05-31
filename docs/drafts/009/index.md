# 仮想 DOM — React が画面を速く書き換える仕組み

## 今日のゴール

- 本物の DOM 操作がなぜ重いのかを知る
- 仮想 DOM が「前後の差分を計算して最小限だけ更新する」仕組みだと知る
- リスト表示の `key` がなぜ必要なのかを、仮想 DOM の観点から理解する

## React は画面を丸ごと描き直していない

React では、状態（画面が覚えている値）を変えると、それに応じて画面が更新されます。書く側は「この状態のとき画面はこう」という対応を宣言するだけで、「画面のこの文字を書き換えろ」という手順は書きません。

ここで素朴な疑問が生まれます。状態が変わるたびに画面を「こうあるべき」と宣言し直すなら、毎回画面全体を作り直して遅いのではないか、ということです。

実際にはそうなりません。React は画面を丸ごと描き直すのではなく、<strong>変わった部分だけ</strong>を書き換えています。それを実現しているのが<strong>仮想 DOM</strong>という仕組みです。

## そもそも DOM とは、なぜ操作が重いのか

<strong>DOM</strong>（Document Object Model）は、ブラウザが HTML から作る「画面の構造を表すデータ」です。`<button>` や `<p>` が親子関係を持つツリーとして表現されています。`document.querySelector(...)` で操作しているのがこれです。

問題は、DOM の操作が<strong>重い</strong>ことです。要素を書き換えるたびにブラウザがレイアウトや描画をやり直すため、状態が変わるたびに何十か所も直接書き換えると動作が重くなります。だから本物の DOM をできるだけ触らないことが速さの鍵になります。

## 仮想 DOM — 本物を触る前に、軽いコピーで考える

React は、本物の DOM を直接いじる前に、<strong>画面の構造を JavaScript のオブジェクトとして持っておきます</strong>。これが仮想 DOM です。ただの軽いデータなので、作ったり比べたりするのは高速です。

状態が変わると、React は「新しい仮想 DOM を作る → 前の仮想 DOM と比べる → 変わった部分だけ本物の DOM に反映する」という順で動きます。次の図は、ボタンを押して要素が 1 つ増えたときの様子です。

<figure class="c09-fig">
<svg class="c09-svg" viewBox="0 0 460 250" role="img" aria-label="前の仮想DOM(before)と新しい仮想DOM(after)を比べ、増えた1ノードだけが差分として検出される図">
  <!-- before tree -->
  <text x="110" y="28" class="c09-t">前（before）</text>
  <line x1="110" y1="65" x2="75" y2="135" class="c09-edge"/>
  <line x1="110" y1="65" x2="145" y2="135" class="c09-edge"/>
  <circle cx="110" cy="65" r="22" class="c09-v"/>
  <text x="110" y="70" class="c09-lbl">div</text>
  <circle cx="75" cy="145" r="22" class="c09-v"/>
  <text x="75" y="150" class="c09-lbl">btn</text>
  <circle cx="145" cy="145" r="22" class="c09-v"/>
  <text x="145" y="150" class="c09-lbl">p</text>

  <!-- compare arrow -->
  <text x="230" y="100" class="c09-cmp">比べる</text>
  <text x="230" y="125" class="c09-cmp-arrow">⇄</text>

  <!-- after tree -->
  <text x="350" y="28" class="c09-t">新しい（after）</text>
  <line x1="350" y1="65" x2="312" y2="135" class="c09-edge"/>
  <line x1="350" y1="65" x2="350" y2="135" class="c09-edge"/>
  <line x1="350" y1="65" x2="388" y2="135" class="c09-edge-new"/>
  <circle cx="350" cy="65" r="22" class="c09-v"/>
  <text x="350" y="70" class="c09-lbl">div</text>
  <circle cx="312" cy="145" r="22" class="c09-v"/>
  <text x="312" y="150" class="c09-lbl">btn</text>
  <circle cx="350" cy="145" r="22" class="c09-v"/>
  <text x="350" y="150" class="c09-lbl">p</text>
  <circle cx="388" cy="145" r="22" class="c09-v-new"/>
  <text x="388" y="150" class="c09-lbl">p</text>

  <!-- diff callout -->
  <text x="388" y="195" class="c09-diff">↑</text>
  <text x="360" y="218" class="c09-diff">増えた 1 ノードだけが差分</text>
</svg>
<figcaption class="c09-cap">前のツリーと新しいツリーを比べると、違うのは増えた 1 ノードだけ。本物の DOM には、このノードの追加だけを反映する。</figcaption>
</figure>

この「前後を比べて差分を見つける」処理を<strong>差分検出（reconciliation）</strong>と呼びます。書く側は画面全体を宣言し直しているつもりでも、本物の DOM には最小限の書き換えしか起きません。「宣言し直す書きやすさ」と「本物の DOM を最小限しか触らない速さ」が両立します。

> 参考: [図解 仮想DOM](https://speakerdeck.com/ozaki25/20190122-vdom) — 仮想 DOM の差分検出を図で解説したスライド

## リストの `key` は、差分計算のヒント

仮想 DOM の差分計算がもっとも難しくなるのが、リスト（同じ形の要素が並ぶ表示）です。React のコードでリストを表示すると、必ず `key` という属性が出てきます。

```tsx
function TodoList({ todos }: { todos: { id: string; text: string }[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

なぜ `key` が必要なのでしょうか。リストの項目が増減・並び替えされたとき、React は「前のリストのどの項目が、新しいリストのどれと同じものか」を判断する必要があります。`key` は、その項目を識別する目印です。

`key` があれば、React は「`key` が `"a"` の項目は前と同じ、`key` が `"c"` の項目が新しく増えた」と正確に対応づけられ、増えた 1 件だけを DOM に追加できます。

`key` がないと、React は項目を上から順番（位置）でしか対応づけられません。先頭に 1 件挿入されただけで「全項目が 1 つずつズレた」と判断し、本来不要なはずの全項目の書き換えが起きます。差分検出の精度が落ち、仮想 DOM の利点が活かせなくなります。

下のデモで、リストの先頭に項目を追加したとき、どの行が実際に書き換わるかを比べてください。書き換わった行が一瞬光ります。

<div class="c09-demo">
  <div class="c09-cols">
    <div class="c09-col">
      <p class="c09-col-title">key に ID</p>
      <pre class="c09-code">&lt;li key={fruit.id}&gt;</pre>
      <ul class="c09-list" id="c09-list-id"></ul>
    </div>
    <div class="c09-col">
      <p class="c09-col-title">key に index</p>
      <pre class="c09-code">&lt;li key={index}&gt;</pre>
      <ul class="c09-list" id="c09-list-index"></ul>
    </div>
  </div>
  <div class="c09-controls">
    <button type="button" class="c09-btn" id="c09-add">先頭に「ぶどう」を追加</button>
    <button type="button" class="c09-btn c09-btn-sub" id="c09-reset">リセット</button>
  </div>
  <p class="c09-note">光った行 = React が本物の DOM を書き換えた行。ID なら新しい 1 行だけ、番号なら全行が書き換わる。</p>
</div>

::: warning key にインデックスを使う落とし穴
AI が生成したコードで `key={index}`（配列の番号を key にする）を見かけることがあります。

```tsx
{todos.map((todo, index) => (
  <li key={index}>{todo.text}</li>  // 並び替えや挿入で問題が起きる
))}
```

項目の順序が変わらないなら問題ありませんが、並び替えや途中への挿入があると、同じ項目に違う番号が振られ、React が別物と誤認します。`key` には、その項目固有の ID（`todo.id` など）を使うのが原則です。AI のコードで `key={index}` を見たら、「このリストは並び替えや挿入が起きないか？」と確認する習慣が役立ちます。
:::

## まとめ

- 本物の<strong>DOM</strong>（ブラウザが持つ画面の構造）の操作は重く、状態が変わるたびに何十か所も直接書き換えると動作が重くなる
- <strong>仮想 DOM</strong>は画面の構造を JavaScript のオブジェクトとして持つ仕組み。状態が変わると、新旧の仮想 DOM を比べて差分を計算し、本物の DOM は変わった部分だけ書き換える
- この差分計算のおかげで、「画面を宣言し直すだけ」という書きやすさと、「本物の DOM を最小限しか触らない」速さが両立する
- リストの<strong>`key`</strong>は差分計算で項目を識別する目印。固有の ID を使うのが原則で、`key={index}` は並び替えや挿入があると誤判定の原因になる

<style>
.c09-fig {
  margin: 16px 0;
  text-align: center;
}
.c09-svg {
  width: 100%;
  max-width: 640px;
  height: auto;
}
.c09-t { font-size: 14px; font-weight: bold; fill: #1e293b; text-anchor: middle; }
.c09-lbl { font-size: 12px; fill: #ffffff; text-anchor: middle; }
.c09-v { fill: #22a06b; }
.c09-v-new { fill: #14532d; stroke: #ef4444; stroke-width: 2.5; }
.c09-edge { stroke: #94a3b8; stroke-width: 1.5; }
.c09-edge-new { stroke: #ef4444; stroke-width: 2.5; }
.c09-cmp { font-size: 13px; fill: #475569; text-anchor: middle; }
.c09-cmp-arrow { font-size: 22px; fill: #475569; text-anchor: middle; }
.c09-diff { font-size: 13px; font-weight: bold; fill: #ef4444; text-anchor: middle; }
.c09-cap {
  font-size: 13px;
  color: #475569;
  margin-top: 8px;
  text-align: left;
}
.c09-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background: #f8fafc;
  color: #1e293b;
}
.c09-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
}
.c09-col-title {
  font-weight: bold;
  font-size: 13px;
  margin: 0 0 6px;
  color: #1e293b;
  white-space: nowrap;
}
.c09-code {
  background: #1e293b;
  color: #e2e8f0;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  margin: 0 0 8px;
  overflow-x: auto;
  white-space: nowrap;
}
.c09-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.c09-list li {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 10px;
  margin: 4px 0;
  font-size: 13px;
  white-space: nowrap;
}
.c09-flash {
  animation: c09-flash-anim 0.9s ease-out;
}
@keyframes c09-flash-anim {
  0% { background: #fca5a5; border-color: #ef4444; }
  100% { background: white; border-color: #e2e8f0; }
}
.c09-controls {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.c09-btn {
  background: #064e3b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
}
.c09-btn-sub {
  background: #64748b;
}
.c09-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.c09-note {
  font-size: 13px;
  color: #475569;
  margin: 10px 0 0;
}
</style>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const initial = [
    { id: 'apple', text: 'りんご' },
    { id: 'banana', text: 'ばなな' },
    { id: 'orange', text: 'みかん' },
  ]
  let items = []

  const listId = document.getElementById('c09-list-id')
  const listIndex = document.getElementById('c09-list-index')
  const addBtn = document.getElementById('c09-add')
  const resetBtn = document.getElementById('c09-reset')
  if (!listId || !listIndex || !addBtn || !resetBtn) return

  // key=ID: 既存の li を id で再利用し、新規 id の行だけ作り直す（=光る）
  function renderById(flash) {
    const existing = {}
    listId.querySelectorAll('li').forEach((li) => {
      existing[li.dataset.id] = li
    })
    listId.innerHTML = ''
    items.forEach((item) => {
      let li = existing[item.id]
      if (!li) {
        li = document.createElement('li')
        li.dataset.id = item.id
        li.textContent = item.text
        if (flash) li.classList.add('c09-flash')
      }
      listId.appendChild(li)
    })
  }

  // key=index: 位置（行）で再利用。位置の中身が変わった行はテキストを書き換える（=光る）
  function renderByIndex(flash) {
    const rows = listIndex.querySelectorAll('li')
    items.forEach((item, i) => {
      let li = rows[i]
      if (!li) {
        li = document.createElement('li')
        listIndex.appendChild(li)
        li.textContent = item.text
        if (flash) {
          li.classList.remove('c09-flash')
          void li.offsetWidth
          li.classList.add('c09-flash')
        }
      } else if (li.textContent !== item.text) {
        li.textContent = item.text
        if (flash) {
          li.classList.remove('c09-flash')
          void li.offsetWidth
          li.classList.add('c09-flash')
        }
      }
    })
    // 余った行を削除
    const extra = listIndex.querySelectorAll('li')
    for (let i = items.length; i < extra.length; i++) extra[i].remove()
  }

  function reset() {
    items = initial.map((x) => ({ ...x }))
    listId.innerHTML = ''
    listIndex.innerHTML = ''
    renderById(false)
    renderByIndex(false)
    addBtn.disabled = false
  }

  addBtn.addEventListener('click', () => {
    items = [{ id: 'grape', text: 'ぶどう' }, ...items]
    renderById(true)
    renderByIndex(true)
    addBtn.disabled = true // 追加は1回だけ。リセットで戻す
  })
  resetBtn.addEventListener('click', reset)

  reset()
})
</script>
