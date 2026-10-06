#!/bin/sh
# Production-ish local check: builds the app and serves the dist/ folder,
# then verifies the server responds. Used before deploying to catch
# build-time env mistakes.
set -e
cd "$(dirname "$0")"
npm run typecheck
npm run build
echo "── Build OK ──"
ls -la dist/
echo "Serve dist/ with any static host that SPA-falls-back to index.html"
echo "(see deploy/nginx.conf or run: npx vite preview)"
