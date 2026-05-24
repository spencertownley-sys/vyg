#!/bin/sh
# Start the Next.js web server and the background worker in the same container.
# Both need access to the SQLite database on the shared volume.
set -e

echo "[start] Starting web server..."
npm start &
WEB_PID=$!

echo "[start] Starting worker..."
npm run worker &
WORKER_PID=$!

# If either process dies, kill the other and exit (Railway will restart the container)
wait_for_exit() {
  wait -n 2>/dev/null || wait
  echo "[start] A process exited — shutting down"
  kill $WEB_PID $WORKER_PID 2>/dev/null || true
  exit 1
}

wait_for_exit
