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

<strong>DOM</strong>（Document Object Model）は、ブラウザが HTML を読み込んでメモリ上に作る「画面の構造を表すデータ」です。`<button>` や `<p>` といった要素が、親子関係を持つツリー（木構造）として表現されています。JavaScript で `document.querySelector(...)` と書くと、この DOM を操作しています。

問題は、DOM の操作が<strong>重い</strong>ことです。要素を 1 つ書き換えると、ブラウザはレイアウト（要素の位置やサイズの再計算）や描画をやり直すことがあります。1 回なら一瞬ですが、画面が複雑で、状態が変わるたびに何十か所も DOM を直接書き換えると、その都度ブラウザの再計算が走り、動作が重くなります。

だからこそ「画面を丸ごと作り直す」を素直にやると遅くなります。本物の DOM をできるだけ触らないことが、速さの鍵になります。

## 仮想 DOM — 本物を触る前に、軽いコピーで考える

React は、本物の DOM を直接いじる前に、<strong>画面の構造を JavaScript のオブジェクトとして持っておきます</strong>。これが仮想 DOM です。ただの軽いデータなので、作ったり比べたりするのは高速です。

状態が変わると、React は次の手順で動きます。

```mermaid
flowchart LR
  State["状態が変わる"] --> New["新しい仮想 DOM を作る"]
  New --> Diff["前の仮想 DOM と比較<br>（差分を計算）"]
  Diff --> Patch["変わった部分だけ<br>本物の DOM を書き換える"]
```

1. 新しい状態をもとに、新しい仮想 DOM（あるべき画面の構造）を作る
2. 前の仮想 DOM と比べて、どこが変わったかを計算する
3. 変わった部分<strong>だけ</strong>を本物の DOM に反映する

この「前後を比べて差分を見つける」処理を<strong>差分検出（reconciliation）</strong>と呼びます。書く側は画面全体を宣言し直しているつもりでも、本物の DOM に対しては最小限の書き換えしか起きません。「全部宣言し直す書きやすさ」と「本物の DOM を最小限しか触らない速さ」を両立させているのが、仮想 DOM の役割です。

| | 本物の DOM を直接操作 | 仮想 DOM 経由 |
|---|---|---|
| 書き換えの単位 | 自分で指定した箇所 | 差分から自動で算出 |
| 操作の重さ | 触るたびに再計算が走る | 軽いデータ上で比較してから最小限だけ反映 |
| 書く側の負担 | どこを変えるか自分で管理 | 状態を変えるだけ |

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
      <p class="c09-col-title">key に ID を使う</p>
      <ul class="c09-list" id="c09-list-id"></ul>
    </div>
    <div class="c09-col">
      <p class="c09-col-title">key に番号（index）を使う</p>
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
  gap: 16px;
}
.c09-col-title {
  font-weight: bold;
  font-size: 14px;
  margin: 0 0 8px;
  color: #1e293b;
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
  padding: 8px 12px;
  margin: 4px 0;
  font-size: 14px;
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
  }

  addBtn.addEventListener('click', () => {
    items = [{ id: 'grape-' + Date.now(), text: 'ぶどう' }, ...items]
    renderById(true)
    renderByIndex(true)
  })
  resetBtn.addEventListener('click', reset)

  reset()
})
</script>
