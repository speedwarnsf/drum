#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/macster/dyorkmusic/drum"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node and try again."
  exit 1
fi

if [ ! -x "./node_modules/.bin/vercel" ]; then
  echo "Vercel CLI not found locally. Run: npm install"
  exit 1
fi

read -r -p "Stripe Secret Key (sk_live_...): " STRIPE_SECRET_KEY
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Missing STRIPE_SECRET_KEY"
  exit 1
fi

read -r -p "Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK_SECRET
if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
  echo "Missing STRIPE_WEBHOOK_SECRET"
  exit 1
fi

echo "Creating Stripe product/prices..."
PRICE_OUTPUT=$(STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" node scripts/createStripePrices.mjs)

echo "$PRICE_OUTPUT"

PRICE_TESTER=$(echo "$PRICE_OUTPUT" | awk -F"=" '/NEXT_PUBLIC_STRIPE_PRICE_TESTER_10/ {print $2}' | xargs)
PRICE_50=$(echo "$PRICE_OUTPUT" | awk -F"=" '/NEXT_PUBLIC_STRIPE_PRICE_50/ {print $2}' | xargs)
PRICE_100=$(echo "$PRICE_OUTPUT" | awk -F"=" '/NEXT_PUBLIC_STRIPE_PRICE_100/ {print $2}' | xargs)
PRICE_100_REPEAT=$(echo "$PRICE_OUTPUT" | awk -F"=" '/NEXT_PUBLIC_STRIPE_PRICE_100_REPEAT/ {print $2}' | xargs)

if [ -z "$PRICE_TESTER" ] || [ -z "$PRICE_50" ] || [ -z "$PRICE_100" ] || [ -z "$PRICE_100_REPEAT" ]; then
  echo "Failed to parse price IDs."
  exit 1
fi

echo "Setting Vercel env vars (production)..."
./node_modules/.bin/vercel env add NEXT_PUBLIC_STRIPE_PRICE_TESTER_10 production <<< "$PRICE_TESTER"
./node_modules/.bin/vercel env add NEXT_PUBLIC_STRIPE_PRICE_50 production <<< "$PRICE_50"
./node_modules/.bin/vercel env add NEXT_PUBLIC_STRIPE_PRICE_100 production <<< "$PRICE_100"
./node_modules/.bin/vercel env add NEXT_PUBLIC_STRIPE_PRICE_100_REPEAT production <<< "$PRICE_100_REPEAT"
./node_modules/.bin/vercel env add STRIPE_SECRET_KEY production <<< "$STRIPE_SECRET_KEY"
./node_modules/.bin/vercel env add STRIPE_WEBHOOK_SECRET production <<< "$STRIPE_WEBHOOK_SECRET"

echo "Stripe setup complete."
