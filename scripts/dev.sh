#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID"
  fi

  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID"
  fi
}

trap cleanup EXIT INT TERM

if [ ! -x "$BACKEND_DIR/.venv/bin/python" ]; then
  echo "Ambiente virtual do backend nao encontrado em backend/.venv."
  echo "Crie com: cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

echo "Subindo PostgreSQL local..."
cd "$BACKEND_DIR"
docker compose up -d

echo "Criando ou atualizando tabelas..."
.venv/bin/python create_tables.py

echo "Iniciando backend em http://127.0.0.1:8000 ..."
.venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "Iniciando frontend em http://127.0.0.1:5173 ..."
cd "$ROOT_DIR"
npm run dev -- --host 127.0.0.1 &
FRONTEND_PID=$!

echo ""
echo "Servidores em execucao:"
echo "- Frontend: http://127.0.0.1:5173/"
echo "- Backend:  http://127.0.0.1:8000"
echo "- API docs: http://127.0.0.1:8000/docs"
echo ""
echo "Pressione Ctrl+C para encerrar frontend e backend."

while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    wait "$BACKEND_PID"
    exit $?
  fi

  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    wait "$FRONTEND_PID"
    exit $?
  fi

  sleep 1
done
