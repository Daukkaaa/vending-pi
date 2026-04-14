#!/usr/bin/env bash
set -e
export DISPLAY=:0
export XDG_RUNTIME_DIR=/run/user/1000
URL="http://localhost:5173"

for i in $(seq 1 30); do
  if curl -fsS "$URL" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

pkill -f "/usr/lib/chromium/chromium.*localhost:5173" || true
sleep 1
exec /usr/bin/chromium \
  --kiosk \
  --noerrdialogs \
  --disable-session-crashed-bubble \
  --disable-infobars \
  --check-for-update-interval=31536000 \
  "$URL"
