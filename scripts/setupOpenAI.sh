#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/Users/macster/dyorkmusic/drum"
cd "$REPO_DIR"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found. Please install Node.js first."
  exit 1
fi

echo "OpenAI API key (starts with sk-):"
read -r OPENAI_API_KEY
if [[ -z "$OPENAI_API_KEY" ]]; then
  echo "Missing OPENAI_API_KEY"
  exit 1
fi

echo "Model (default gpt-5.2, press Enter to accept):"
read -r OPENAI_MODEL
OPENAI_MODEL=${OPENAI_MODEL:-gpt-5.2}

echo "Max output tokens (default 2000, press Enter to accept):"
read -r OPENAI_MAX_OUTPUT_TOKENS
OPENAI_MAX_OUTPUT_TOKENS=${OPENAI_MAX_OUTPUT_TOKENS:-2000}

npx vercel env add OPENAI_API_KEY production <<< "$OPENAI_API_KEY"
npx vercel env add OPENAI_MODEL production <<< "$OPENAI_MODEL"
npx vercel env add OPENAI_MAX_OUTPUT_TOKENS production <<< "$OPENAI_MAX_OUTPUT_TOKENS"

echo "OpenAI env setup complete."
