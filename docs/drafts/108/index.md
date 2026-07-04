# 経験ベースのテスト技法 — エラー推測と探索的テスト

## 今日のゴール

- 仕様や構造から機械的に作る技法の外に、経験ベースの技法があると知る
- エラー推測（ありがちな失敗の先回り）と探索的テスト（触りながら試す）を知る
- 経験ベースは AI が最も苦手で、人が担う価値が高いと知る

## 仕様どおりのテストだけでは届かない穴

AI に「テストを書いて」と頼むと、仕様から機械的に作れるテストが中心に出てきます。入力の場合分け、条件の組み合わせ、画面の操作。どれも「仕様にこう書いてある」から導けるものです。

でも実際のバグは、仕様書に書かれていない場所から出ることが多いです。「空欄で送ったら落ちた」「同じボタンを連打したら二重登録された」。仕様には「連打するな」とは書いていません。こういう欠陥は、仕様や構造をなぞるだけでは届きません。

<svg viewBox="0 0 480 250" role="img" aria-label="仕様の範囲を四角で示した図。四角の内側にはチェックマークが並び、仕様ベースや構造ベースの技法で作れるテストを表す。四角の外側にはバツ印が散らばり、仕様に書かれていない欠陥を表す。経験ベースの技法はこの外側の欠陥を狙う。" style="width:100%;height:auto;max-width:480px;display:block;margin:16px auto;">
  <rect x="0" y="0" width="480" height="250" rx="10" fill="#f8fafc"/>

  <rect x="28" y="52" width="244" height="150" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="150" y="78" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">仕様で決めた範囲</text>

  <text x="80" y="120" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#1e293b">✓</text>
  <text x="150" y="120" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#1e293b">✓</text>
  <text x="220" y="120" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#1e293b">✓</text>
  <text x="115" y="158" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#1e293b">✓</text>
  <text x="185" y="158" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#1e293b">✓</text>
  <text x="150" y="192" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">仕様ベース・構造ベースでカバー</text>

  <text x="392" y="46" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">仕様に書かれていない欠陥</text>
  <text x="330" y="86" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#1e293b">✕</text>
  <text x="418" y="104" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#1e293b">✕</text>
  <text x="360" y="150" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#1e293b">✕</text>
  <text x="430" y="170" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#1e293b">✕</text>
  <text x="392" y="216" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">経験ベースが狙う</text>
</svg>

この外側の穴を、人の知識と経験で狙うのが経験ベースの技法です。JSTQB では、仕様ベースと構造ベースを補うものと位置づけています。代表的なのがエラー推測と探索的テストです。

## エラー推測

「ここは間違えやすい」という予想をもとに、ありがちな失敗を先回りして試す技法です。過去に見た不具合、開発者がやりがちなミス、似たアプリで起きた故障が予想の材料になります。

狙いどころには、だいたい型があります。

- 入力: 空、0、極端に長い文字列、想定外の記号
- 計算や境界: 上限ぎりぎり、マイナス、割り算のゼロ
- 状態: 二重送信、順番の入れ替え、途中での中断

こうした「壊れやすい入力」のリストをあらかじめ作り、順番に攻めていくやり方をフォールト攻撃と呼びます。思いつきに任せず、リストにしておくと漏れが減ります。

## 探索的テスト

事前にテストを全部設計せず、動かして学びながら、設計・実行・評価を同時に進める技法です。触ってみて気づいたことから次に試すことを決めます。仕様が薄いときや、時間が足りないときに効きます。

行き当たりばったりにしないための工夫があります。

- 時間を区切る（例: 30 分）
- その回で調べる狙いを 1 つ決めておく（テストチャーターと呼ぶ）
- 終わったら、何を試して何が分かったかを振り返る

狙いを決めて時間を区切るから、自由に触っても記録が残り、次につながります。

## AI が最も苦手な領域

経験ベースは、テストする人の知識・好奇心・勘に大きく依存します。仕様という正解が外にある仕様ベースと違い、「何が起きうるか」を人が想像する必要があります。ここは AI が最も苦手で、裏を返せば人が担う価値が高いところです。

とはいえ AI を壁打ちには使えます。

- **壁打ち**: 「このログインフォームでありがちな失敗を挙げて」と聞けば、エラー推測のリスト作りを手伝ってくれる
- **査読**: AI が書いたテストが仕様ベースに偏り、空・境界・異常系といったありがちな失敗が抜けていないかを、経験ベースの目で確かめる

最後に穴を見つけるのは人の経験です。AI は候補出しの相棒として使い、判断は自分が持つ。この役割分担が、経験ベースでは特にはっきりします。

## まとめ

- 仕様や構造から機械的に作る技法の外側に、経験ベースの技法がある
- エラー推測はありがちな失敗を先回りし、フォールト攻撃はそれをリスト化する
- 探索的テストは触りながら試し、時間と狙いを決めて記録に残す
- 経験ベースは AI が最も苦手なので、候補出しに使い判断は人が持つ
