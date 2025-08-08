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

start_ui() {
  mkdir -p "$LOG_DIR" "$PID_DIR"
  if [[ -f "$NEXT_PID_FILE" ]] && kill -0 "$(cat "$NEXT_PID_FILE")" 2>/dev/null; then
    echo "[next] already running (pid $(cat "$NEXT_PID_FILE"))"
    return 0
  fi
  echo "[next] starting dev server on :$PORT..."
  # Run in background with logs
  (cd "$ROOT_DIR" && nohup npm run dev -- --port="$PORT" > "$LOG_DIR/next.log" 2>&1 & echo $! > "$NEXT_PID_FILE")
  sleep 1
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


