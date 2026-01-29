#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/macster/dyorkmusic/drum"
SCHEMA="$ROOT_DIR/supabase/schema.sql"

if ! command -v pbcopy >/dev/null 2>&1; then
  echo "pbcopy not found (macOS required)."
  exit 1
fi

if [ ! -f "$SCHEMA" ]; then
  echo "Schema file not found: $SCHEMA"
  exit 1
fi

cat "$SCHEMA" | pbcopy

echo "Schema copied to clipboard. Paste into Supabase SQL Editor and run."
