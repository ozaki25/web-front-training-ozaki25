#!/bin/bash
set -e

HOOK_INPUT=$(cat)
COMMAND=$(echo "$HOOK_INPUT" | jq -r '.tool_input.command // ""')

# git commit コマンドのみ検証
if [[ ! "$COMMAND" =~ git\ commit ]]; then
  exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
STAGED=$(git diff --cached --name-only)

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

# main にコンテンツファイルをコミットしようとしている
if [ "$BRANCH" = "main" ]; then
  bad=$(echo "$STAGED" | grep -E '^docs/lessons/|^curriculum\.md$|^tech-versions\.md$' || true)
  if [ -n "$bad" ]; then
    block "ブランチ運用違反: コンテンツファイルは draft にコミットしてください。対象: $bad"
  fi
fi

# draft に方針・スキルファイルをコミットしようとしている
if [ "$BRANCH" = "draft" ]; then
  bad=$(echo "$STAGED" | grep -E '^CLAUDE\.md$|^\.claude/skills/' || true)
  if [ -n "$bad" ]; then
    block "ブランチ運用違反: 方針・スキルファイルは main にコミットしてください。対象: $bad"
  fi
fi

exit 0
