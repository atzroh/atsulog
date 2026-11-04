#!/bin/bash
# Replace the app with deploy.tar.gz and restart it.

set -euo pipefail

APP_DIR=/home/ubuntu/app
ARCHIVE="$APP_DIR/deploy.tar.gz"

cd "$APP_DIR"

# 1. Check the archive before touching the running app
echo "Checking $ARCHIVE..."
tar -tzf "$ARCHIVE" >/dev/null

# 2. Replace the app files (data/ and .env* are kept)
echo "Replacing app files..."
rm -rf .next node_modules package.json public server.js ecosystem.config.cjs
tar -xzf "$ARCHIVE"

# 3. Start the app again
# Not `pm2 restart`, which would keep the old environment variables
echo "Starting the app..."
pm2 delete atsulog >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs
pm2 save

# 4. Wait until the app responds
echo "Waiting for the app to respond..."
for _ in $(seq 30); do
    if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
        echo "Ready."
        exit 0
    fi
    sleep 1
done
echo "The app did not respond within 30 seconds. Check: pm2 logs atsulog" >&2
exit 1
