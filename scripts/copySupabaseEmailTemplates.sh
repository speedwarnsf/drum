#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/macster/dyorkmusic/drum"
CONFIRM="$ROOT_DIR/email/confirm.html"
RESET="$ROOT_DIR/email/reset.html"

if ! command -v pbcopy >/dev/null 2>&1; then
  echo "pbcopy not found (macOS required)."
  exit 1
fi

if [ ! -f "$CONFIRM" ] || [ ! -f "$RESET" ]; then
  echo "Email templates not found."
  exit 1
fi

echo "Copying CONFIRM SIGNUP template to clipboard..."
cat "$CONFIRM" | pbcopy

echo "Now paste into Supabase → Auth → Email Templates → Confirm signup."
echo "Press Enter to copy RESET PASSWORD template..."
read -r _

cat "$RESET" | pbcopy

echo "Now paste into Supabase → Auth → Email Templates → Reset password."
