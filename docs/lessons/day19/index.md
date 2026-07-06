# Day 19: 仮想 DOM — React が画面を速く書き換える仕組み

## 今日のゴール

- 本物の DOM 操作がなぜ重いのかを知る
- 仮想 DOM が「前後の差分を計算して最小限だけ更新する」仕組みだと知る
- リスト表示の `key` がなぜ必要なのかを、仮想 DOM の観点から理解する

## 毎回作り直して遅くない理由

React は状態を変えるだけで画面が更新されます。毎回画面を作り直しているなら遅そうですが、そこで鍵になるのが <strong>DOM</strong>（ブラウザが HTML から作る画面の構造データ）です。DOM の操作は重く、書き換えるたびにレイアウトや描画のやり直しが走ります。React はこの重い DOM をできるだけ触らないために、<strong>仮想 DOM</strong>を使います。

## 仮想 DOM — 軽いコピーで差分を見つける

仮想 DOM は画面の構造を JavaScript のオブジェクトとして持ったもので、作るのも比べるのも高速です。状態が変わると「新しい仮想 DOM を作る → 前と比べる → 変わった部分だけ本物の DOM に反映する」と動きます。

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

この処理を<strong>差分検出（reconciliation）</strong>と呼びます。

> 参考: [仮想 DOM について図解したスライド](https://speakerdeck.com/ozaki25/20190122-vdom)

## リストの `key` は差分計算のヒント

差分計算が難しくなるのがリストです。React でリストを表示すると、必ず `key` が出てきます。

```tsx
import { useState } from "react";

export default function TodoList() {
  const [todos] = useState([
    { id: "a", text: "りんご" },
    { id: "b", text: "ばなな" },
    { id: "c", text: "みかん" },
  ]);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

`key` は、リストの各項目を識別する目印です。React は差分計算のとき「前のどの項目が、新しいどれと同じか」を `key` で見分けます。

- **固有の ID を `key` にする** → 「これは前と同じ、これが新しく増えた」と正確に対応づき、増えた 1 件だけ DOM に追加
- **`key` がない** → 位置（上から何番目か）でしか対応づけられず、先頭に 1 件挿入しただけで全項目がズレたと判断され、全行が書き換わる

下のデモで、先頭に項目を追加したとき書き換わる行（一瞬光る）を比べてください。

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
  <p class="c09-note">各行の key に注目。ID は項目に固定なので増えた行の key だけが新しく、その 1 行だけ光る。番号は位置に振られるので全行の key がズレ、全行が光る（= 本物の DOM を書き換えた行）。</p>
</div>

::: warning key にインデックスを使う問題
AI は `key={index}`（配列の番号を key にする）というコードを書いてくることがあります。

```tsx
{todos.map((todo, index) => (
  <li key={index}>{todo.text}</li>  // 並び替えや挿入で問題が起きる
))}
```

順序が変わらないリストなら問題ありません。しかし並び替えや途中への挿入があると、同じ項目に違う番号が振られ、React が別物と誤認します。

- `key` には項目固有の ID（`todo.id` など）を使うのが原則
- AI のコードで `key={index}` を見たら「このリストは並び替えや挿入が起きないか？」と確認する
:::

## まとめ

- 本物の <strong>DOM</strong> の操作は重い
- <strong>仮想 DOM</strong> は新旧を比べ、変わった部分だけ本物の DOM に反映する
- リストの <strong>`key`</strong> は差分計算の目印で、固有の ID を使う

<style>
.c09-fig {
  margin: 16px 0;
  text-align: center;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
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
  padding: 6px 8px;
  margin: 4px 0;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.c09-name { color: #1e293b; }
.c09-key {
  font-size: 11px;
  color: #64748b;
  font-family: var(--vp-font-family-mono, monospace);
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

  function fillRow(li, item, keyLabel) {
    li.innerHTML =
      '<span class="c09-name">' + item.text + '</span>' +
      '<span class="c09-key">key: ' + keyLabel + '</span>'
  }

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
        fillRow(li, item, item.id) // key は項目固有の id
        if (flash) li.classList.add('c09-flash')
      }
      listId.appendChild(li)
    })
  }

  // key=index: 位置（行）で再利用。位置の中身が変わった行を書き換える（=光る）
  function renderByIndex(flash) {
    const rows = listIndex.querySelectorAll('li')
    items.forEach((item, i) => {
      let li = rows[i]
      const needsUpdate = !li || li.dataset.text !== item.text
      if (!li) {
        li = document.createElement('li')
        listIndex.appendChild(li)
      }
      if (needsUpdate) {
        li.dataset.text = item.text
        fillRow(li, item, String(i)) // key は位置（番号）
        if (flash) {
          li.classList.remove('c09-flash')
          void li.offsetWidth
          li.classList.add('c09-flash')
        }
      }
    })
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
