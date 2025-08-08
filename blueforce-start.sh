#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-4000}"
OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"
MODEL="${OLLAMA_DEFAULT_MODEL:-}" # e.g. llama3 or mistral:7b

LOG_DIR="$ROOT_DIR/logs"
PID_DIR="$ROOT_DIR/.pids"
NEXT_PID_FILE="$PID_DIR/next.pid"

compose_up() {
  echo "[compose] starting containers..."
  docker compose -f "$ROOT_DIR/docker-compose.yml" up -d
}

compose_down() {
  echo "[compose] stopping containers..."
  docker compose -f "$ROOT_DIR/docker-compose.yml" down
}

pull_model_if_requested() {
  if [[ -n "$MODEL" ]]; then
    echo "[ollama] pulling model: $MODEL (in background)"
    docker exec -d blueforce-ollama ollama pull "$MODEL" || true
  fi
}

ensure_env() {
  # Ensure UI can reach Ollama
  if ! grep -qs "^OLLAMA_URL=" "$ROOT_DIR/.env.local" 2>/dev/null; then
    echo "OLLAMA_URL=$OLLAMA_URL" >> "$ROOT_DIR/.env.local" || true
  fi
}

find_pids_for_port() {
  local port="$1"
  # Try lsof first
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti ":$port" || true
    return 0
  fi
  # Fallback to ss
  if command -v ss >/dev/null 2>&1; then
    ss -ltnp 2>/dev/null | awk -v p=":$port" '$4 ~ p { match($0, /pid=([0-9]+)/, m); if (m[1] != "") print m[1]; }' || true
    return 0
  fi
  # Fallback to netstat
  if command -v netstat >/dev/null 2>&1; then
    netstat -ltnp 2>/dev/null | awk -v p=":$port" '$4 ~ p { split($7, a, "/"); if (a[1] != "-") print a[1]; }' || true
    return 0
  fi
  return 0
}

free_port_if_stuck() {
  # If port is in use but not by our recorded Next PID, free it
  local pids
  pids=$(find_pids_for_port "$PORT" | tr '\n' ' ')
  if [[ -z "$pids" ]]; then
    # As a fallback, try fuser to kill any holders silently
    if command -v fuser >/dev/null 2>&1; then
      echo "[next] attempting to free port $PORT via fuser"
      fuser -k "${PORT}/tcp" 2>/dev/null || true
    fi
    return 0
  fi
  local keep_pid=""
  if [[ -f "$NEXT_PID_FILE" ]]; then
    keep_pid="$(cat "$NEXT_PID_FILE")"
  fi
  for p in $pids; do
    if [[ -n "$keep_pid" && "$p" == "$keep_pid" ]]; then
      continue
    fi
    echo "[next] freeing port $PORT (killing pid $p)"
    kill "$p" 2>/dev/null || true
    sleep 1
    kill -0 "$p" 2>/dev/null && kill -9 "$p" || true
  done
}

wait_ready() {
  local timeout=${1:-20}
  local start_ts
  start_ts=$(date +%s)
  while true; do
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/" || echo 000)
    if [[ "$code" == "200" ]]; then
      echo "[next] ready on :$PORT"
      return 0
    fi
    local now
    now=$(date +%s)
    if (( now - start_ts > timeout )); then
      echo "[next] not ready after ${timeout}s (last code $code)"
      return 1
    fi
    sleep 1
  done
}

start_ui() {
  mkdir -p "$LOG_DIR" "$PID_DIR"
  if [[ -f "$NEXT_PID_FILE" ]] && kill -0 "$(cat "$NEXT_PID_FILE")" 2>/dev/null; then
    echo "[next] already running (pid $(cat "$NEXT_PID_FILE"))"
    return 0
  fi
  # Ensure the port is not held by a stale process
  free_port_if_stuck
  # Clean Next cache/artifacts to avoid stale chunk/runtime issues
  if [[ -d "$ROOT_DIR/.next" ]]; then
    echo "[next] cleaning .next/ cache"
    rm -rf "$ROOT_DIR/.next"
  fi
  echo "[next] starting dev server on :$PORT..."
  # Run in background with logs
  (cd "$ROOT_DIR" && nohup npm run dev -- --port="$PORT" > "$LOG_DIR/next.log" 2>&1 & echo $! > "$NEXT_PID_FILE")
  # Give it a moment and wait until it replies 200
  sleep 1
  wait_ready 25 || true
}

stop_ui() {
  if [[ -f "$NEXT_PID_FILE" ]]; then
    local pid
    pid="$(cat "$NEXT_PID_FILE")"
    if kill -0 "$pid" 2>/dev/null; then
      echo "[next] stopping pid $pid"
      kill "$pid" || true
      # give it a moment, then force if needed
      sleep 1
      kill -0 "$pid" 2>/dev/null && kill -9 "$pid" || true
    fi
    rm -f "$NEXT_PID_FILE"
  fi
  # Also free the port if an orphaned process is holding it
  free_port_if_stuck
}

status() {
  echo "[status] UI: http://localhost:$PORT -> $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/" || echo "down")"
  echo "[status] Ollama: $OLLAMA_URL -> $(curl -s -o /dev/null -w "%{http_code}" "$OLLAMA_URL" || echo "down")"
  echo "[status] Next logs: $LOG_DIR/next.log"
}

logs() {
  echo "[logs] tailing Next logs (ctrl-c to stop)"
  tail -n 200 -f "$LOG_DIR/next.log"
}

case "${1:-}" in
  start)
    ensure_env
    compose_up
    pull_model_if_requested
    start_ui
    status
    ;;
  stop)
    stop_ui
    compose_down
    status
    ;;
  restart)
    stop_ui || true
    compose_down || true
    ensure_env
    compose_up
    pull_model_if_requested
    start_ui
    status
    ;;
  status)
    status
    ;;
  logs)
    logs
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs}" >&2
    exit 1
    ;;
esac



