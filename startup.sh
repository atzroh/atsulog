#!/bin/bash
# Set up the server and start the app. Safe to run again.
# Expects deploy.tar.gz to be extracted in APP_DIR already.

set -euo pipefail

APP_DIR=/home/ubuntu/app

cd "$APP_DIR"

# 1. Open HTTP and HTTPS (only rules that are missing)
echo "Configuring the firewall..."
for port in 80 443; do
  if ! sudo iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null; then
    sudo iptables -I INPUT 1 -p tcp --dport "$port" -j ACCEPT
  fi
done
sudo netfilter-persistent save

# 2. Start nginx, also on boot
echo "Restarting nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# 3. Start pm2 on boot
echo "Registering pm2 to start on boot..."
sudo env PATH="$PATH:$(dirname "$(command -v node)")" \
  "$(command -v pm2)" startup systemd -u "$USER" --hp "$HOME"

# 4. Restore databases that only exist as SQL dumps (existing .db files are kept)
for name in articles images; do
  db="data/$name.db"
  dump="data/$name.sql"
  if [ ! -f "$db" ] && [ -f "$dump" ]; then
    if ! command -v sqlite3 >/dev/null; then
      echo "sqlite3 is required to restore $db. Install it and run again." >&2
      exit 1
    fi
    echo "Restoring $db from $dump..."
    rm -f "$db-wal" "$db-shm"
    sqlite3 "$db" <"$dump"
  fi
done

# 5. Start the app
echo "Starting the app..."
pm2 delete atsulog >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs
pm2 save

# 6. Wait until the app responds
echo "Waiting for the app to respond..."
for _ in $(seq 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
    echo "Ready."
    pm2 status
    exit 0
  fi
  sleep 1
done
echo "The app did not respond within 30 seconds. Check: pm2 logs atsulog" >&2
exit 1
