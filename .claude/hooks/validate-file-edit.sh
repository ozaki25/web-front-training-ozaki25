#!/bin/bash
set -e

HOOK_INPUT=$(cat)
FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

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

# 許可外ブランチでの編集をすべてブロック
if [[ "$BRANCH" != "main" && "$BRANCH" != "draft" && ! "$BRANCH" =~ ^publish/day[0-9]{2}$ ]]; then
  block "ブランチ運用違反: 現在のブランチ '$BRANCH' は許可されていません。main または draft に切り替えてください"
fi

# main でコンテンツファイルを編集しようとしている
if [ "$BRANCH" = "main" ]; then
  if [[ "$FILE_PATH" =~ docs/lessons/ ]] || [[ "$FILE_PATH" =~ curriculum\.md ]] || [[ "$FILE_PATH" =~ tech-versions\.md ]]; then
    block "ブランチ運用違反: コンテンツファイルは draft で編集してください。対象: $FILE_PATH"
  fi
fi

# draft で方針・設定・main 専用ファイルを編集しようとしている
if [ "$BRANCH" = "draft" ]; then
  if [[ "$FILE_PATH" =~ CLAUDE\.md ]] || [[ "$FILE_PATH" =~ \.claude/ ]] || [[ "$FILE_PATH" =~ docs/introduction/ ]] || [[ "$FILE_PATH" =~ ^package\.json$ ]] || [[ "$FILE_PATH" == *"/package.json" ]]; then
    block "ブランチ運用違反: このファイルは main で編集してください。対象: $FILE_PATH"
  fi
fi

# publish ブランチで許可されたファイル以外を編集しようとしている
if [[ "$BRANCH" =~ ^publish/day[0-9]{2}$ ]]; then
  if [[ "$FILE_PATH" =~ docs/lessons/day[0-9]+/ ]] || [[ "$FILE_PATH" =~ docs/\.vitepress/config\.mts ]] || [[ "$FILE_PATH" =~ docs/index\.md ]] || [[ "$FILE_PATH" =~ docs/introduction/ ]]; then
    : # 許可
  else
    block "ブランチ運用違反: publish ブランチでは該当 Day のレッスン、サイドバー、index.md のみ変更できます。対象: $FILE_PATH"
  fi
fi

exit 0
