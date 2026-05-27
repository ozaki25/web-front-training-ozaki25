#!/bin/bash
# PostToolUse hook: main に push したら draft への同期を強制する

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# git push to main を検出
if echo "$COMMAND" | grep -qE 'git push.*\bmain\b'; then
  TOOL_RESULT=$(echo "$INPUT" | jq -r '.tool_result // empty')
  # push が成功した場合のみ
  if echo "$TOOL_RESULT" | grep -qv "rejected\|error\|failed"; then
    echo "⚠️ main に push しました。draft ブランチへの同期を忘れずに実行してください: git checkout draft && git merge origin/main && git push origin draft"
    exit 2
  fi
fi
