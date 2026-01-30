#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/Users/macster/dyorkmusic/drum"
cd "$REPO_DIR"

REPO_URL=$(git config --get remote.origin.url || true)
if [[ -z "$REPO_URL" ]]; then
  echo "Could not detect repo URL. Open GitHub and add the secret manually."
  exit 1
fi

# Normalize SSH to HTTPS
if [[ "$REPO_URL" == git@github.com:* ]]; then
  REPO_URL="https://github.com/${REPO_URL#git@github.com:}"
  REPO_URL="${REPO_URL%.git}"
fi

if [[ "$REPO_URL" == https://github.com/* ]]; then
  SECRETS_URL="$REPO_URL/settings/secrets/actions"
else
  SECRETS_URL="https://github.com"
fi

TOKEN_URL="https://vercel.com/account/tokens"

echo "Opening Vercel token page and GitHub secrets page..."
open "$TOKEN_URL"
open "$SECRETS_URL"

echo "\nDo this:"
echo "1) Create a Vercel token on the Vercel page."
echo "2) In GitHub → New repository secret:"
echo "   Name: VERCEL_TOKEN"
echo "   Value: (paste token)"

echo "\nOnce saved, auto‑deploy is active." 
