#!/usr/bin/env bash
# =============================================================================
# AI Crypto Advisor — Monorepo Setup (macOS / Linux / Git Bash)
# Run from repository root:  bash scripts/setup.sh
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=== AI Crypto Advisor — Workspace Setup ==="
echo ""

# -----------------------------------------------------------------------------
# 1. Verify prerequisites
# -----------------------------------------------------------------------------
echo "[1/6] Checking Node.js and npm..."
node --version
npm --version

# -----------------------------------------------------------------------------
# 2. Create directory layout (idempotent)
# -----------------------------------------------------------------------------
echo "[2/6] Creating workspace directories..."

mkdir -p \
  server/src/config \
  server/src/models \
  server/src/routes \
  server/src/controllers \
  server/src/middlewares \
  server/src/services \
  server/src/types \
  client \
  scripts

# -----------------------------------------------------------------------------
# 3. Scaffold Vite + React + TypeScript + Tailwind client (if not present)
# -----------------------------------------------------------------------------
echo "[3/6] Scaffolding client (Vite + React + TS + Tailwind)..."

if [ ! -f "client/package.json" ]; then
  npm create vite@latest client -- --template react-ts
  cd client
  npm install
  npm install -D tailwindcss @tailwindcss/vite
  cd "$ROOT"
else
  echo "  client/package.json already exists — skipping Vite scaffold."
fi

# -----------------------------------------------------------------------------
# 4. Install root + server dependencies (npm workspaces)
# -----------------------------------------------------------------------------
echo "[4/6] Installing monorepo dependencies..."
npm install

# -----------------------------------------------------------------------------
# 5. Copy environment template
# -----------------------------------------------------------------------------
echo "[5/6] Preparing server environment file..."

if [ ! -f "server/.env" ]; then
  cp server/.env.example server/.env
  echo "  Created server/.env from .env.example — update secrets before running."
else
  echo "  server/.env already exists — skipped."
fi

# -----------------------------------------------------------------------------
# 6. Verify TypeScript build
# -----------------------------------------------------------------------------
echo "[6/6] Verifying server TypeScript compilation..."
npm run build:server

echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit server/.env with your MongoDB URI, JWT secret, and OpenRouter API key"
echo "  2. Start MongoDB locally (or use Atlas connection string)"
echo "  3. Run:  npm run dev          # server + client concurrently"
echo "  4. Or:   npm run dev:server    # backend only on http://localhost:5000"
echo ""
