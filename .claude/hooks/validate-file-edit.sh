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

# draft で方針・設定ファイルを編集しようとしている
if [ "$BRANCH" = "draft" ]; then
  if [[ "$FILE_PATH" =~ CLAUDE\.md ]] || [[ "$FILE_PATH" =~ \.claude/skills/ ]] || [[ "$FILE_PATH" =~ \.claude/hooks/ ]] || [[ "$FILE_PATH" =~ \.claude/settings\.json ]]; then
    block "ブランチ運用違反: 方針・設定ファイルは main で編集してください。対象: $FILE_PATH"
  fi
fi

exit 0
