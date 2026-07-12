# N+1 とウォーターフォール — ループの中の fetch が画面を遅くする仕組み

## 今日のゴール

- 一覧を 1 回と詳細を N 回に分けて取る構造が N+1 と呼ばれると知る
- 直列の所要時間は件数に比例して増えると知る
- Promise.all でまとめて並列に取得する書き方を知る

## 一覧画面が妙に遅い

書籍の一覧ページを開くと、表示されるまで数秒待たされます。データが 10 件のうちは気にならなかったのに、50 件、100 件と増えるにつれて目に見えて遅くなっていく。一覧画面が遅くなる原因はいろいろありますが、その定番のひとつが今日のテーマです。

複数のリクエストが絡むトラブルというと、レスポンスが返る順序が入れ替わって古い結果が画面に残る競合状態もありますが、今日の話は順序ではありません。リクエストの積み重なり方で所要時間そのものが膨らむ、速さの話です。

## ループの中の await が直列を生む

「書籍の一覧を出して、各書籍の詳細（著者やレビュー件数）も表示する」というページを素直に書くと、こうなります。App Router の Server Component です。

```tsx
// app/books/page.tsx
type Book = { id: string; title: string };
type BookDetail = {
  id: string;
  title: string;
  author: string;
  reviewCount: number;
};

export default async function BooksPage() {
  // 一覧を 1 回取る
  const listRes = await fetch("https://api.example.com/books");
  const books: Book[] = await listRes.json();

  // 各書籍の詳細を 1 件ずつ取る
  const details: BookDetail[] = [];
  for (const book of books) {
    const res = await fetch(`https://api.example.com/books/${book.id}`);
    details.push(await res.json()); // 前の 1 件が終わるまで、次の 1 件が始まらない
  }

  return (
    <main>
      <h1>書籍一覧</h1>
      <ul>
        {details.map((d) => (
          <li key={d.id}>
            {d.title} / {d.author}（レビュー {d.reviewCount} 件）
          </li>
        ))}
      </ul>
    </main>
  );
}
```

このコードは間違いではありません。型も合っているし、動かせば正しい画面が出ます。問題はループの中の `await` です。`await` は「この処理が終わるまで次に進まない」という意味なので、for ループの中に書くと、**1 件目の詳細が返ってくるまで 2 件目のリクエストを投げない**動きになります。

こうしてリクエストが 1 本ずつ順番に、滝が段々と落ちるように積み重なる形を**ウォーターフォール**（waterfall）と呼びます。開発者ツールの Network タブで見ると、リクエストの帯が階段状に並びます。

## 所要時間は件数に比例して増える

直列と並列で、所要時間の増え方はまったく違います。詳細 1 件の取得に 1 秒かかるとして、5 件取る場合を比べます。

<svg viewBox="0 0 520 236" role="img" aria-label="詳細5件の取得にかかる時間の比較。直列は詳細1から5までが1秒ずつ順番に並び、合計5秒かかる。並列は詳細1から5までが同時に始まり、1秒強で全部そろう。" style="width:100%;height:auto;max-width:520px;display:block;margin:16px auto;">
  <rect x="0" y="0" width="520" height="236" rx="10" fill="#f8fafc"/>

  <text x="16" y="26" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">直列（5 秒かかる）</text>
  <rect x="16" y="34" width="60" height="20" fill="#93c5fd" stroke="#3b82f6"/>
  <rect x="76" y="34" width="60" height="20" fill="#93c5fd" stroke="#3b82f6"/>
  <rect x="136" y="34" width="60" height="20" fill="#93c5fd" stroke="#3b82f6"/>
  <rect x="196" y="34" width="60" height="20" fill="#93c5fd" stroke="#3b82f6"/>
  <rect x="256" y="34" width="60" height="20" fill="#93c5fd" stroke="#3b82f6"/>
  <text x="46" y="49" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細1</text>
  <text x="106" y="49" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細2</text>
  <text x="166" y="49" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細3</text>
  <text x="226" y="49" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細4</text>
  <text x="286" y="49" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細5</text>
  <text x="320" y="49" font-family="sans-serif" font-size="11" fill="#475569">← 前の 1 件が終わってから次へ</text>

  <text x="16" y="96" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">並列（1 秒強で終わる）</text>
  <rect x="16" y="104" width="60" height="20" fill="#86efac" stroke="#22c55e"/>
  <rect x="16" y="128" width="60" height="20" fill="#86efac" stroke="#22c55e"/>
  <rect x="16" y="152" width="60" height="20" fill="#86efac" stroke="#22c55e"/>
  <rect x="16" y="176" width="60" height="20" fill="#86efac" stroke="#22c55e"/>
  <rect x="16" y="200" width="60" height="20" fill="#86efac" stroke="#22c55e"/>
  <text x="46" y="119" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細1</text>
  <text x="46" y="143" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細2</text>
  <text x="46" y="167" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細3</text>
  <text x="46" y="191" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細4</text>
  <text x="46" y="215" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1e293b">詳細5</text>
  <text x="90" y="167" font-family="sans-serif" font-size="11" fill="#475569">← 全件を同時に投げて、まとめて待つ</text>
</svg>

- 直列: 前の 1 件を待ってから次を投げるので、所要時間は「**1 件の時間 × 件数**」。5 件なら 5 秒、100 件なら 100 秒
- 並列: 全部を同時に投げてまとめて待つので、所要時間は「**一番遅い 1 件の時間**」。5 件でも 100 件でも 1 秒強

直列の怖さは、**データが増えるほど遅くなる**ところにあります。開発中は 5 件のテストデータで一瞬だったのに、本番でデータが 100 件になったら 20 倍待たされます。「最初は速かったのに、使っているうちに遅くなった」という報告の裏で、よく起きている構造です。

## N+1 という名前の由来

この「一覧を 1 回、詳細を N 回」という構造には、**N+1 問題**という名前が付いています。

もともとはデータベースのクエリ最適化の文脈で使われてきた言葉です。一覧を取る 1 回のクエリのあと、各行の関連データを取るクエリが行数ぶん、つまり N 回発行される。合計 N+1 回のクエリになることから、こう呼ばれます。ORM（データベースをオブジェクトとして扱うライブラリ）が関連データを 1 件ずつ遅れて読み込む設定のときに起きやすい、サーバーサイドの古典的な性能問題です。

フロントエンドの fetch でも、一覧 API を 1 回、詳細 API を N 回叩けば構造はまったく同じです。だから同じ名前で呼ばれます。「一覧画面が遅い」を調査するときにチームの会話で出てくるのはこの言葉なので、クエリでも fetch でも同じ形を指していると知っておくと話が繋がります。

## Promise.all でまとめて並列に取得する

直列を並列に変えるには `Promise.all` を使います。さきほどの for ループを、こう書き換えます。

```tsx
// app/books/page.tsx（詳細取得の部分だけ書き換え）
export default async function BooksPage() {
  const listRes = await fetch("https://api.example.com/books");
  const books: Book[] = await listRes.json();

  // 全件ぶんのリクエストを先に投げてから、まとめて待つ
  const details: BookDetail[] = await Promise.all(
    books.map(async (book) => {
      const res = await fetch(`https://api.example.com/books/${book.id}`);
      return res.json();
    })
  );

  return (
    <main>
      <h1>書籍一覧</h1>
      <ul>
        {details.map((d) => (
          <li key={d.id}>
            {d.title} / {d.author}（レビュー {d.reviewCount} 件）
          </li>
        ))}
      </ul>
    </main>
  );
}
```

ポイントは 2 段階に分かれていることです。

1. `books.map(...)` の時点で、**全件ぶんの fetch が一斉に走り始める**。map は待たずに Promise（あとで結果が入る箱）の配列を返す
2. `Promise.all` が、その全部が終わるのを**まとめて待つ**。全件揃ったら結果の配列が返る

ループの中に `await` を書くと「投げて、待って、次を投げて」の繰り返しになるのに対し、この形は「全部投げてから、全部待つ」になります。書き換え自体は数行ですが、100 件で 100 秒だったものが 1 秒強になります。並列化は、少ない手数で効きが大きい改善です。

ひとつ注意があるとすれば、`Promise.all` は**どれか 1 件でも失敗すると全体がエラーになる**ことです。失敗した項目だけ除いて表示したい場合は、成功と失敗を分けて受け取れる `Promise.allSettled` を使います。

## 全部一斉に投げてよいとは限らない

並列化にも限度があります。サーバー側には同時に処理できるリクエスト数の都合があり、ブラウザにも同時接続数の上限があります。1000 件を一斉に投げると、相手のサーバーに負荷をかけたり、上限に達した接続が順番待ちになって結局遅くなったりします。

件数が多いときは、「まとめて全部」ではなく「一定数ずつ」に分ける工夫があります。たとえば 10 件ずつ `Promise.all` で投げて、終わったら次の 10 件、という進め方です。分割のやり方はいろいろあるので細部には踏み込みませんが、「並列化には**同時に投げる数の上限**という観点がある」と知っておくだけで、レビューや調査のときの引き出しになります。

## まとめて返す API という選択肢

ここまではフロントエンドの書き方で頑張る話でしたが、一歩引くと、そもそも **N 回のリクエストを発生させない**という解決策があります。サーバー側に「一覧と各項目の詳細をまとめて 1 回で返す API」を用意してもらう方法です。

リクエストが 1 回になれば、直列も並列もなく、同時接続数の心配もありません。API を変更できる立場のチームなら、フロントで並列化を工夫するより根本的な解決になります。「この一覧画面、詳細を N 回取っているんですが、まとめて返すエンドポイントを生やせませんか」という相談は、フロントとサーバーの間でよく交わされる会話です。

## AI への指示の語彙

一覧と詳細を表示するページを AI に作らせるとき、この知識はそのまま指示と確認の言葉になります。

作らせる段階なら、最初からこう指示できます。

> 各項目の詳細取得は、ループの中で 1 件ずつ await せず、Promise.all でまとめて並列に取得して

出てきたコードを確かめる観点は、「**ループの中に await がないか**」です。for や forEach の中で `await fetch` している箇所を見つけたら、それはデータが増えるほど遅くなる直列の構造です。動くコードなのでテストでは見つかりにくく、コードを読んで構造で気づくしかありません。この一点だけでも、レビューで性能問題を入口で止められます。

## まとめ

- N+1 は一覧 1 回と詳細 N 回の構造で、ループの中の await が直列の発生源
- 直列の所要時間は「1 件の時間 × 件数」、並列なら「一番遅い 1 件の時間」
- 対策は Promise.all での並列化、件数が多ければ分割、根本はまとめて返す API
