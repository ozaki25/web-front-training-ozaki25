# Day 35: Route Handlers

## 今日のゴール

- Route Handlers（`route.ts`）で API エンドポイントを作れるようになる
- リクエストとレスポンスの処理方法を理解する
- Route Handlers をいつ使うべきか判断できるようになる

## Route Handlers とは

Day 31 で、`page.tsx` はページを表示するファイルだと学びました。一方、`route.ts`（`.tsx` ではなく `.ts`）は **API エンドポイント**を作るためのファイルです。

API エンドポイントとは、ブラウザの画面ではなく、JSON などのデータを返す URL のことです。外部サービスとの連携や、Client Component からのデータ送信に使います。

## 基本的な Route Handler

`src/app/api/hello/route.ts` を作成してみましょう。

```ts
// src/app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "こんにちは！" });
}
```

ブラウザで `http://localhost:3000/api/hello` にアクセスすると、JSON が返されます。

```json
{ "message": "こんにちは！" }
```

### HTTP メソッドと関数名

Route Handler では、HTTP メソッドに対応する関数名をエクスポートします。

```ts
// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET /api/posts — データの取得
export async function GET() {
  const posts = [
    { id: 1, title: "最初の投稿" },
    { id: 2, title: "2番目の投稿" },
  ];
  return NextResponse.json(posts);
}

// POST /api/posts — データの作成
export async function POST(request: NextRequest) {
  const body = await request.json();
  // 本来はデータベースに保存する
  const newPost = { id: 3, title: body.title };
  return NextResponse.json(newPost, { status: 201 });
}
```

| 関数名 | HTTP メソッド | 用途 |
|--------|-------------|------|
| `GET` | GET | データの取得 |
| `POST` | POST | データの作成 |
| `PUT` | PUT | データの更新（全体） |
| `PATCH` | PATCH | データの更新（一部） |
| `DELETE` | DELETE | データの削除 |

> **HTTP メソッド**とは、リクエストの「目的」を表すものです。Day 8 で学んだ HTML フォームでは `GET` と `POST` を使いましたが、API ではより細かく使い分けます。

## リクエストの処理

### URL パラメータの取得

URL のクエリパラメータ（`?key=value` の部分）を取得する方法です。

```ts
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET /api/search?q=nextjs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "検索クエリが必要です" },
      { status: 400 }
    );
  }

  // 本来はデータベースを検索する
  const results = [{ id: 1, title: `「${query}」の検索結果` }];
  return NextResponse.json(results);
}
```

### リクエストボディの取得

POST や PUT で送られてくるデータを取得します。

```ts
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // バリデーション（入力チェック）
  if (!body.name || !body.email || !body.message) {
    return NextResponse.json(
      { error: "名前、メール、メッセージは必須です" },
      { status: 400 }
    );
  }

  // 本来はメール送信やデータベース保存を行う
  console.log("お問い合わせ:", body);

  return NextResponse.json(
    { success: true, message: "お問い合わせを受け付けました" },
    { status: 200 }
  );
}
```

### リクエストヘッダーの取得

```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "認証が必要です" },
      { status: 401 }
    );
  }

  return NextResponse.json({ data: "認証済みデータ" });
}
```

## レスポンスの返し方

### JSON レスポンス

最も一般的なパターンです。

```ts
return NextResponse.json(
  { data: "値" },       // レスポンスボディ
  { status: 200 }       // ステータスコード（省略すると 200）
);
```

### リダイレクト

```ts
import { redirect } from "next/navigation";

export async function GET() {
  redirect("/login");
}
```

### ストリーミングレスポンス

大量のデータを少しずつ返したい場合に使います。

```ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("Hello "));
      controller.enqueue(new TextEncoder().encode("World"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}
```

## 動的ルートの Route Handler

Day 37 で詳しく学ぶ動的ルーティングは、Route Handler でも使えます。

```ts
// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 本来はデータベースから取得
  const post = { id, title: `記事 ${id}` };
  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 本来はデータベースから削除
  return NextResponse.json({ message: `記事 ${id} を削除しました` });
}
```

`GET /api/posts/42` にアクセスすると `{ id: "42", title: "記事 42" }` が返されます。

## Route Handlers をいつ使うか

Server Components や Server Actions（Day 36 で学習）がある今、Route Handlers の出番はどこでしょうか。

### Route Handlers が適しているケース

| ケース | 理由 |
|-------|------|
| 外部サービスへの Webhook 受信 | 外部サービスが POST する先として URL が必要 |
| OAuth のコールバック | 認証プロバイダからのリダイレクト先 |
| 外部に公開する API | 他のサービスやモバイルアプリから呼ばれる |
| ストリーミングレスポンス | Server Components では難しい応答パターン |

### Server Components / Server Actions で十分なケース

- ページ表示のためのデータ取得 → Server Components で直接 fetch（Day 34）
- フォーム送信やデータ変更 → Server Actions（Day 36）

**基本方針: まず Server Components と Server Actions で実現できないか考える。外部とのインターフェースが必要な場合に Route Handlers を使う。**

## まとめ

- `route.ts` で API エンドポイントを作成でき、HTTP メソッドに対応する関数をエクスポートする
- `NextRequest` でリクエスト情報を取得し、`NextResponse` でレスポンスを返す
- リクエストボディ、URL パラメータ、ヘッダーなどを処理できる
- 外部サービスとの連携や公開 API には Route Handlers が適している
- ページのデータ取得やフォーム送信は Server Components / Server Actions が基本

**次のレッスン**: [Day 36: Server Actions](/lessons/day36/)
