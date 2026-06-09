#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push-force

# Mirror to GitHub using ephemeral credentials (never stored in .git/config)
if [ -n "$GITHUB_TOKEN" ]; then
  ENCODED=$(printf '%s' "x-access-token:${GITHUB_TOKEN}" | base64 | tr -d '\n')
  git \
    -c "http.https://github.com/.extraheader=AUTHORIZATION: basic ${ENCODED}" \
    push https://github.com/msetrades/MSE-Journal.git HEAD:main
  echo "Pushed to GitHub: msetrades/MSE-Journal"
else
  echo "Warning: GITHUB_TOKEN not set — skipping GitHub mirror push"
  exit 1
fi
