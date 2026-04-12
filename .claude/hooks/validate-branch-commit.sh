#!/bin/bash
set -e

HOOK_INPUT=$(cat)
COMMAND=$(echo "$HOOK_INPUT" | jq -r '.tool_input.command // ""')

block() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# --- ブランチ作成の検証 ---
if [[ "$COMMAND" =~ git\ checkout\ -b\ ([^ ]+) ]] || [[ "$COMMAND" =~ git\ switch\ -c\ ([^ ]+) ]]; then
  NEWBRANCH="${BASH_REMATCH[1]}"
  if [[ ! "$NEWBRANCH" =~ ^(main|draft|publish/day[0-9]{2})$ ]]; then
    block "ブランチ運用違反: 許可されたブランチは main, draft, publish/dayXX のみです。'$NEWBRANCH' は作成できません"
  fi
fi

# --- 許可外ブランチへの push 禁止 ---
if [[ "$COMMAND" =~ git\ push ]] && [[ "$COMMAND" =~ origin\ ([^ ]+) ]]; then
  PUSHBRANCH="${BASH_REMATCH[1]}"
  if [[ ! "$PUSHBRANCH" =~ ^(main|draft|publish/day[0-9]{2})$ ]]; then
    block "ブランチ運用違反: 許可されたブランチは main, draft, publish/dayXX のみです。'$PUSHBRANCH' にはプッシュできません"
  fi

  # publish ブランチへの push 時にリマインダー
  if [[ "$PUSHBRANCH" =~ ^publish/day[0-9]{2}$ ]]; then
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        outputMessage: "リマインダー: publish ブランチにプッシュしました。PR の本文が最新の内容を反映しているか確認してください。"
      }
    }'
    exit 0
  fi
fi

# --- git commit の検証 ---
if [[ "$COMMAND" =~ git\ commit ]]; then
  STAGED=$(git diff --cached --name-only)

  # マージ中の場合はスキップ（main → draft の同期でCLAUDE.md等が含まれるため）
  if [ -f .git/MERGE_HEAD ]; then
    exit 0
  fi

  # main にコンテンツファイルをコミットしようとしている
  if [ "$BRANCH" = "main" ]; then
    bad=$(echo "$STAGED" | grep -E '^docs/lessons/|^curriculum\.md$|^tech-versions\.md$' || true)
    if [ -n "$bad" ]; then
      block "ブランチ運用違反: コンテンツファイルは draft にコミットしてください。対象: $bad"
    fi

    # main の docs/index.md にレッスンリンクを追加しようとしている
    if echo "$STAGED" | grep -q '^docs/index.md$'; then
      lesson_links=$(git diff --cached -- docs/index.md | grep '^\+.*\/lessons\/day' || true)
      if [ -n "$lesson_links" ]; then
        block "ブランチ運用違反: main の docs/index.md に直接レッスンリンクを追加しないでください。publish-lesson スキルを使ってください"
      fi
    fi
  fi

  # draft に方針・設定・main 専用ファイルをコミットしようとしている
  if [ "$BRANCH" = "draft" ]; then
    bad=$(echo "$STAGED" | grep -E '^CLAUDE\.md$|^\.claude/|^docs/introduction/|^package\.json$' || true)
    if [ -n "$bad" ]; then
      block "ブランチ運用違反: このファイルは main にコミットしてください。対象: $bad"
    fi
  fi

  # publish ブランチで許可外のファイルをコミットしようとしている
  if [[ "$BRANCH" =~ ^publish/day[0-9]{2}$ ]]; then
    bad=$(echo "$STAGED" | grep -vE '^docs/lessons/day[0-9]+/|^docs/\.vitepress/config\.mts$|^docs/index\.md$' | grep -v '^$' || true)
    if [ -n "$bad" ]; then
      block "ブランチ運用違反: publish ブランチでは該当 Day のレッスン、サイドバー、index.md のみコミットできます。対象: $bad"
    fi
  fi

  # .claude/ ファイルの削除を禁止
  deleted=$(git diff --cached --diff-filter=D --name-only | grep '^\.claude/' || true)
  if [ -n "$deleted" ]; then
    block "安全違反: .claude/ 内のファイルを削除しないでください。対象: $deleted"
  fi
fi

exit 0
