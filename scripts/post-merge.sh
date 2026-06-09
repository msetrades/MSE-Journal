#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Mirror to GitHub
if [ -n "$GITHUB_TOKEN" ]; then
  REMOTE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/msetrades/MSE-Journal.git"
  git remote set-url github "$REMOTE_URL" 2>/dev/null || git remote add github "$REMOTE_URL"
  git push github HEAD:main --force
  echo "Pushed to GitHub: msetrades/MSE-Journal"
else
  echo "Warning: GITHUB_TOKEN not set — skipping GitHub mirror push"
fi
