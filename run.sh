#!/usr/bin/env bash
# Launcher for macOS / Linux. Forwards any args to app/server.py.
# Examples:
#   ./run.sh
#   ./run.sh --port 9000
#   PORT=9000 ./run.sh

set -e
cd "$(dirname "$0")"

PY=""
for candidate in python3 python py; do
  if command -v "$candidate" >/dev/null 2>&1; then
    PY="$candidate"
    break
  fi
done

if [ -z "$PY" ]; then
  echo "Python 3.7+ is required but was not found on PATH."
  echo "Install it from https://www.python.org/downloads/  (or use your OS package manager)"
  exit 1
fi

exec "$PY" app/server.py "$@"
