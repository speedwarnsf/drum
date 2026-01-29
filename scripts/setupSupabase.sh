#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/macster/dyorkmusic/drum"
cd "$ROOT_DIR"

if [ ! -x "./node_modules/.bin/vercel" ]; then
  echo "Vercel CLI not found locally. Run: npm install"
  exit 1
fi

read -r -p "Supabase URL (https://...supabase.co): " SUPA_URL
if [ -z "$SUPA_URL" ]; then
  echo "Missing SUPABASE URL"
  exit 1
fi

read -r -p "Supabase anon key (eyJ...): " SUPA_ANON
if [ -z "$SUPA_ANON" ]; then
  echo "Missing SUPABASE anon key"
  exit 1
fi

read -r -p "Supabase service role key (eyJ...): " SUPA_SERVICE
if [ -z "$SUPA_SERVICE" ]; then
  echo "Missing SUPABASE service role key"
  exit 1
fi

./node_modules/.bin/vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPA_URL"
./node_modules/.bin/vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$SUPA_ANON"
./node_modules/.bin/vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPA_SERVICE"

echo "Supabase env vars set."
