#!/bin/bash

# Read .env file and push to Vercel
# This script safely adds environment variables to Vercel

set -e

echo "🚀 Pushing environment variables to Vercel..."
echo ""

# Read each line from .env
while IFS='=' read -r key value || [ -n "$key" ]; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue

  # Remove quotes from value
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

  # Skip if value is empty or placeholder
  if [[ -z "$value" ]] || [[ "$value" == *"your_"* ]] || [[ "$value" == *"xxxxxx"* ]]; then
    echo "⏭️  Skipping: $key (empty or placeholder)"
    continue
  fi

  echo "✅ Adding: $key"

  # Add to all environments
  printf "%s" "$value" | vercel env add "$key" production --yes >/dev/null 2>&1 || echo "  ⚠️  Already exists or failed"
  printf "%s" "$value" | vercel env add "$key" preview --yes >/dev/null 2>&1 || true
  printf "%s" "$value" | vercel env add "$key" development --yes >/dev/null 2>&1 || true

done < .env

echo ""
echo "🎉 Environment variables pushed to Vercel!"
echo ""
echo "Next: Run 'vercel --prod' to redeploy with new environment variables"
