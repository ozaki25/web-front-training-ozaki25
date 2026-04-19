---
name: reorganize-lessons
description: レッスンの Day を組み替える。insert（挿入）、delete（削除）、swap（入替）の 3 操作をサポート。ディレクトリ・相互参照・設定ファイルを一括で安全に更新する。
argument-hint: <insert|delete|swap> <引数...>
---

# レッスン組み替えスキル

レッスンの Day 番号を変更する操作をまとめて安全に行います。
作業は **`draft` ブランチ**上で行います。

## 引数

`$ARGUMENTS` に操作と引数が渡されます。

- **insert**: `/reorganize-lessons insert <位置> [タイトル]`
  - 例: `/reorganize-lessons insert 31 SPA・CSR・SSR`
  - Day 31 に新しいレッスンを挿入し、旧 Day 31 以降を +1 シフト
  - タイトルが省略された場合、空の Day ファイルを作成する
- **delete**: `/reorganize-lessons delete <Day番号>`
  - 例: `/reorganize-lessons delete 31`
  - Day 31 を削除し、Day 32 以降を -1 シフト
- **swap**: `/reorganize-lessons swap <Day A> <Day B>`
  - 例: `/reorganize-lessons swap 31 35`
  - Day 31 と Day 35 の内容を入れ替える（番号はそのまま、中身が入れ替わる）

## 重要な注意事項

### カスケード問題を避ける

Day 番号の置換で最も危険なのは**カスケード（連鎖置換）**です。

```
NG: 順番に sed で置換すると...
Day 32 → Day 33 → Day 34 → Day 35（連鎖して壊れる）
```

**必ず Python の `re.sub` + 関数置換**を使い、1 パスで全置換してください。

```python
import re

def replace_day_ref(match):
    num = int(match.group(1))
    if num >= SHIFT_FROM:
        return f"Day {num + SHIFT}"
    return match.group(0)

def replace_day_link(match):
    num = int(match.group(1))
    if num >= SHIFT_FROM:
        return f"/lessons/day{num + SHIFT:02d}/"
    return match.group(0)

content = re.sub(r'Day (\d+)', replace_day_ref, content)
content = re.sub(r'/lessons/day(\d+)/', replace_day_link, content)
```

この方式なら各マッチを **1 回だけ**変換するのでカスケードが起きません。

---

## 操作別の手順

### INSERT（挿入）

Day N の位置に新しいレッスンを挿入し、旧 Day N 以降を +1 シフトする。

#### Step 1: draft ブランチに切り替え

```bash
git fetch origin
git checkout draft
git pull origin draft
```

#### Step 2: 全レッスンの Day 数を把握

```bash
ls docs/lessons/ | sort
```

最大 Day 番号（MAX）を確認する。

#### Step 3: ディレクトリを逆順でリネーム

**MAX → MAX+1, MAX-1 → MAX, ..., N → N+1** の順で行う（逆順にしないとファイルが衝突する）。

```bash
for i in $(seq MAX -1 N); do
  next=$((i + 1))
  old=$(printf "docs/lessons/day%02d" $i)
  new=$(printf "docs/lessons/day%02d" $next)
  mv "$old" "$new"
done
```

#### Step 4: 新しい Day N のディレクトリとファイルを作成

```bash
mkdir -p docs/lessons/dayNN
```

タイトルが指定されている場合は `index.md` を作成する。
タイトルが省略された場合は、空テンプレートを作成する。

```markdown
# Day N: タイトル

## 今日のゴール

- （ゴールをここに書く）

## まとめ

- （まとめをここに書く）
```

#### Step 5: 全レッスンファイルの相互参照を更新

**git show で旧コンテンツを取得**し、Python で 1 パス置換して書き出す。

```python
import re, subprocess

for old_num in range(N, MAX + 1):  # 旧 Day N 〜 旧 Day MAX
    new_num = old_num + 1
    old_path = f"docs/lessons/day{old_num:02d}/index.md"
    new_path = f"docs/lessons/day{new_num:02d}/index.md"

    result = subprocess.run(
        ['git', 'show', f'HEAD:{old_path}'],
        capture_output=True, text=True, check=True
    )

    def replace_day_ref(match):
        num = int(match.group(1))
        if num >= N:
            return f"Day {num + 1}"
        return match.group(0)

    def replace_day_link(match):
        num = int(match.group(1))
        if num >= N:
            return f"/lessons/day{num + 1:02d}/"
        return match.group(0)

    content = re.sub(r'Day (\d+)', replace_day_ref, result.stdout)
    content = re.sub(r'/lessons/day(\d+)/', replace_day_link, content)

    with open(new_path, 'w') as f:
        f.write(content)
```

#### Step 6: Day 1〜N-1 のファイルで Day N+ への参照を更新

```bash
grep -rl "Day [0-9]" docs/lessons/day{01..NN-1}/
```

ヒットしたファイルに対して同じ Python 1 パス置換を適用する（`SHIFT_FROM = N, SHIFT = +1`）。

#### Step 7: 設定ファイルを更新

以下のファイルを更新する:

1. **`docs/.vitepress/config.mts`** — サイドバーに新 Day を追加、以降の Day 番号を +1
2. **`docs/index.md`** — トップページのレッスン一覧を更新
3. **`curriculum.md`** — カリキュラムの Day 番号とテーマを更新

#### Step 8: ビルド確認

```bash
npm run docs:build
```

#### Step 9: 検証

```bash
# タイトルが正しいか
for d in $(seq 1 NEW_MAX); do
  title=$(head -1 "docs/lessons/day$(printf '%02d' $d)/index.md")
  echo "day$d: $title"
done
```

#### Step 10: コミット & プッシュ

```
Day N「タイトル」を挿入し、Day N-MAX を Day N+1-MAX+1 にリナンバリング
```

---

### DELETE（削除）

Day N を削除し、Day N+1 以降を -1 シフトする。

#### Step 1〜2: INSERT と同じ（draft ブランチ、Day 数把握）

#### Step 3: 削除対象の Day N のディレクトリを削除

```bash
rm -rf docs/lessons/dayNN
```

#### Step 4: ディレクトリを順方向でリネーム

**N+1 → N, N+2 → N+1, ..., MAX → MAX-1** の順で行う。

```bash
for i in $(seq $((N + 1)) MAX); do
  prev=$((i - 1))
  old=$(printf "docs/lessons/day%02d" $i)
  new=$(printf "docs/lessons/day%02d" $prev)
  mv "$old" "$new"
done
```

#### Step 5: 全レッスンファイルの相互参照を更新

git show で旧コンテンツを取得し、Python 1 パス置換で Day N+1 以降を -1 する。

```python
import re, subprocess

for old_num in range(N + 1, MAX + 1):  # 旧 Day N+1 〜 旧 Day MAX
    new_num = old_num - 1
    old_path = f"docs/lessons/day{old_num:02d}/index.md"
    new_path = f"docs/lessons/day{new_num:02d}/index.md"

    result = subprocess.run(
        ['git', 'show', f'HEAD:{old_path}'],
        capture_output=True, text=True, check=True
    )

    def replace_day_ref(match):
        num = int(match.group(1))
        if num > N:
            return f"Day {num - 1}"
        return match.group(0)

    def replace_day_link(match):
        num = int(match.group(1))
        if num > N:
            return f"/lessons/day{num - 1:02d}/"
        return match.group(0)

    content = re.sub(r'Day (\d+)', replace_day_ref, result.stdout)
    content = re.sub(r'/lessons/day(\d+)/', replace_day_link, content)

    with open(new_path, 'w') as f:
        f.write(content)
```

#### Step 6: Day 1〜N-1 のファイルで削除した Day N+ への参照を更新

- Day N への参照は **削除または修正**が必要（要確認）
- Day N+1 以降への参照は -1 にシフト

#### Step 7〜10: INSERT と同じ（設定ファイル更新、ビルド、検証、コミット）

---

### SWAP（入替）

Day A と Day B の内容を入れ替える。ディレクトリ番号はそのまま、中身だけ交換する。

#### Step 1〜2: INSERT と同じ（draft ブランチ、Day 数把握）

#### Step 3: ディレクトリの中身を一時退避して交換

```bash
mv docs/lessons/dayAA docs/lessons/day_tmp_a
mv docs/lessons/dayBB docs/lessons/day_tmp_b
mv docs/lessons/day_tmp_a docs/lessons/dayBB
mv docs/lessons/day_tmp_b docs/lessons/dayAA
```

#### Step 4: タイトルの Day 番号を入れ替え

dayAA/index.md のタイトルを `# Day A:` に、dayBB/index.md のタイトルを `# Day B:` に変更する。

#### Step 5: 相互参照の更新

swap は全ファイルに影響する。全レッスンファイルで:

- `Day A` → `Day B`、`Day B` → `Day A` を**同時に**入れ替える
- `/lessons/dayAA/` → `/lessons/dayBB/`、`/lessons/dayBB/` → `/lessons/dayAA/` を**同時に**入れ替える

```python
import re

def replace_day_ref(match):
    num = int(match.group(1))
    if num == A:
        return f"Day {B}"
    if num == B:
        return f"Day {A}"
    return match.group(0)

def replace_day_link(match):
    num = int(match.group(1))
    if num == A:
        return f"/lessons/day{B:02d}/"
    if num == B:
        return f"/lessons/day{A:02d}/"
    return match.group(0)
```

これを**全レッスンファイル**（Day 1 〜 MAX）に適用する。

#### Step 6〜9: INSERT と同じ（設定ファイル更新、ビルド、検証、コミット）

---

## 設定ファイルの更新対象一覧

どの操作でも以下のファイルを更新すること:

| ファイル | 更新内容 |
|---------|---------|
| `docs/.vitepress/config.mts` | サイドバーの Day 番号・タイトル・リンク |
| `docs/index.md` | トップページのレッスン一覧 |
| `curriculum.md` | カリキュラムの Day 番号・テーマ |

## 検証チェックリスト

コミット前に必ず以下を確認:

- [ ] 全 Day のタイトルがディレクトリ番号と一致している
- [ ] サイドバーの Day 番号・リンクが正しい
- [ ] トップページの Day 番号・リンクが正しい
- [ ] `npm run docs:build` が成功する
