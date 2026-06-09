# =============================================================================
# AI Crypto Advisor — Monorepo Setup (Windows PowerShell)
# Run from repository root:  .\scripts\setup.ps1
# =============================================================================

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "`n=== AI Crypto Advisor — Workspace Setup ===`n" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# 1. Verify prerequisites
# -----------------------------------------------------------------------------
Write-Host "[1/6] Checking Node.js and npm..." -ForegroundColor Yellow
node --version
npm --version

# -----------------------------------------------------------------------------
# 2. Create directory layout (idempotent)
# -----------------------------------------------------------------------------
Write-Host "[2/6] Creating workspace directories..." -ForegroundColor Yellow

$dirs = @(
    "server\src\config",
    "server\src\models",
    "server\src\routes",
    "server\src\controllers",
    "server\src\middlewares",
    "server\src\services",
    "server\src\types",
    "client",
    "scripts"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# -----------------------------------------------------------------------------
# 3. Scaffold Vite + React + TypeScript + Tailwind client (if not present)
# -----------------------------------------------------------------------------
Write-Host "[3/6] Scaffolding client (Vite + React + TS + Tailwind)..." -ForegroundColor Yellow

if (-not (Test-Path "client\package.json")) {
    npm create vite@latest client -- --template react-ts
    Set-Location client
    npm install
    npm install -D tailwindcss @tailwindcss/vite
    Set-Location $Root
} else {
    Write-Host "  client/package.json already exists — skipping Vite scaffold." -ForegroundColor DarkGray
}

# -----------------------------------------------------------------------------
# 4. Install root + server dependencies (npm workspaces)
# -----------------------------------------------------------------------------
Write-Host "[4/6] Installing monorepo dependencies..." -ForegroundColor Yellow
npm install

# -----------------------------------------------------------------------------
# 5. Copy environment template
# -----------------------------------------------------------------------------
Write-Host "[5/6] Preparing server environment file..." -ForegroundColor Yellow

if (-not (Test-Path "server\.env")) {
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "  Created server\.env from .env.example — update secrets before running." -ForegroundColor Green
} else {
    Write-Host "  server\.env already exists — skipped." -ForegroundColor DarkGray
}

# -----------------------------------------------------------------------------
# 6. Verify TypeScript build
# -----------------------------------------------------------------------------
Write-Host "[6/6] Verifying server TypeScript compilation..." -ForegroundColor Yellow
npm run build:server

Write-Host "`n=== Setup complete ===`n" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. Edit server\.env with your MongoDB URI, JWT secret, and OpenRouter API key"
Write-Host "  2. Start MongoDB locally (or use Atlas connection string)"
Write-Host "  3. Run:  npm run dev          # server + client concurrently"
Write-Host "  4. Or:   npm run dev:server    # backend only on http://localhost:5000"
Write-Host ""
