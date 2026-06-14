# AI Crypto Advisor

A personalized crypto intelligence dashboard built for the **Moveo Coding Task**. Users authenticate, complete a multi-step onboarding flow, and receive a tailored terminal with live market prices, static curated news, AI briefings, memes, and interactive feedback across every widget.

---

## 1. Project Title & Live Links

| Environment | URL |
|-------------|-----|
| **Frontend (Vercel)** | `https://your-app-name.vercel.app` |
| **Backend (Render)** | `https://your-api-name.onrender.com` |

> Replace the placeholders above with your production deployment URLs after publishing.

---

## 2. Tech Stack & Architecture

This project is a **npm workspaces monorepo** with a decoupled client/server architecture.

### Frontend
- **React 19** + **TypeScript**
- **Vite 6** (build tooling & dev server)
- **Tailwind CSS 4** (utility-first styling)
- **React Router 7** (client-side routing)
- **Axios** (authenticated API client)

### Backend
- **Node.js 20+** with **Express 5** + **TypeScript**
- **Prisma ORM** with the **`@prisma/adapter-pg`** driver adapter
- **JWT** authentication (`jsonwebtoken` + `bcryptjs`)
- **OpenRouter SDK** for AI insight generation
- **Axios** for CoinGecko market data (with retry/backoff)

### Database
- **PostgreSQL** hosted on **Neon** (serverless, pooled connections)
- Schema managed via **Prisma Migrate**

### High-Level Data Flow

```
React Client (Vercel)
    │
    │  JWT Bearer token
    ▼
Express API (Render)  ──►  Neon PostgreSQL
    │
    ├── CoinGecko API      (live crypto prices, 60s cache)
    ├── OpenRouter API     (AI insights, 5min cache)
    └── Local mock layer   (static news, price/news fallbacks, memes)
```

### Repository Layout

```
AICryptoAdvisor/
├── client/          # React + Vite frontend
├── server/          # Express + Prisma backend
│   ├── prisma/      # Schema & migrations
│   └── src/         # Routes, controllers, services, mappers
├── package.json     # Workspace root scripts
└── README.md
```

---

## 3. Features Implemented

### Authentication & Onboarding
- **JWT-based auth** — register, login, protected routes, token persistence in `localStorage`
- **Multi-step onboarding** — investor profile (HODLer / Day Trader / NFT Collector), crypto watchlist (presets + custom asset search), and modular content-type selection
- **Settings modal** — update preferences post-onboarding with server-side validation and cache invalidation

### Dashboard Intelligence Modules
- **CoinGecko Price Widget** — live USD prices, 24h change, and market-cap formatting for the user's watchlist and marquee benchmarks
  - **60-second stale-while-revalidate cache** (`PRICE_TTL_MS`) in `dashboard-cache.service.ts`
  - Cold cache miss triggers a blocking CoinGecko fetch; expired entries serve stale data while refreshing in the background
- **Static Market News** — curated headlines from local mock data (`FALLBACK_NEWS`), filtered and prioritized by the user's watchlist (no external news API dependency)
- **AI Briefing** — daily insight via OpenRouter, cached for **5 minutes** per investor-type + watchlist key
- **Crypto Memes** — locally sourced meme library with fallback typography cards
- **Fear & Greed Index** — alternative.me market sentiment dial
- **Ticker Marquee** — always-on benchmark ribbon (BTC, ETH, SOL, BNB, USDT)

### Interactivity Feedback Loop
- **Thumbs Up / Down voting** persisted to PostgreSQL across all dashboard widgets:
  - `ai_insight`
  - `market_news`
  - `coin_prices` (per symbol)
  - `meme`
- Upsert semantics via `@@unique([userId, sectionName, contentId])` — one vote per user per content item
- Toggle logic on the client; votes reload with the dashboard payload

### Resilience & Production Hardening
- CoinGecko URL validation, API-key misconfiguration detection, and exponential retry on 429/network errors
- Graceful fallback to static price snapshots when CoinGecko is unavailable
- Dynamic CORS allowing `localhost` and all `*.vercel.app` preview/production origins

---

## 4. How to Run the Project Locally

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- A **Neon PostgreSQL** database (or any PostgreSQL 14+ instance)
- (Optional) **CoinGecko Demo API key** for improved rate limits
- (Optional) **OpenRouter API key** for live AI insights (fallback copy used when missing)

### 1. Clone the repository

```bash
git clone https://github.com/Eitan-Djavarov/AICryptoAdvisor.git
cd AICryptoAdvisor
```

### 2. Install dependencies

From the **repository root** (installs both workspaces via npm workspaces):

```bash
npm install
```

### 3. Configure environment variables

#### Server — `server/.env`

Copy the example file and fill in your values:

```bash
cp server/.env.example server/.env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string (`postgresql://...?sslmode=require`) |
| `JWT_SECRET` | Long random string for signing access tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI insights |
| `OPENROUTER_MODEL` | Model slug (default: `openai/gpt-4o-mini`) |
| `COINGECKO_API_BASE` | CoinGecko base URL (default: `https://api.coingecko.com/api/v3`) |
| `COINGECKO_API_KEY` | Optional CoinGecko demo/pro API key |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `PORT` | API port (default: `5000`) |

#### Client — `client/.env`

```bash
cp client/.env.example client/.env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base (e.g. `http://localhost:5000/api`) |

### 4. Run database migrations

```bash
cd server
npx prisma migrate deploy
cd ..
```

For a fresh local database during development, you may alternatively use:

```bash
cd server
npx prisma migrate dev
cd ..
```

### 5. Start development servers

Open **two terminals** from the repository root:

**Terminal 1 — API server (port 5000):**

```bash
npm run dev:server
```

**Terminal 2 — React client (port 5173):**

```bash
npm run dev:client
```

Visit **http://localhost:5173**, register an account, and complete onboarding.

### 6. Production builds (optional)

```bash
# Build both workspaces
npm run build

# Or individually
npm run build:server
npm run build:client

# Start compiled API
npm run start
```

### Deployment Notes

| Service | Root Directory | Build Command | Output |
|---------|----------------|---------------|--------|
| **Vercel** (client) | `client` | `npm run build` | `dist` |
| **Render** (server) | `server` or repo root | `npm run build:server` | `server/dist` |

Set `VITE_API_BASE_URL` in Vercel to your Render API URL (e.g. `https://your-api.onrender.com/api`). Set `DATABASE_URL`, `JWT_SECRET`, and AI/CoinGecko keys in Render environment variables.

---

## 5. AI Collaboration & Thinking Process Summary

This project was engineered iteratively with **Cursor** as an AI pair-programming partner, following a disciplined build → audit → harden → deploy lifecycle.

### Architecture & Data-Flow Audits
We ran full-stack audits tracing the path from Neon `UserPreferences` through Express controllers, in-memory caches, and CoinGecko/OpenRouter integrations to React hooks and dashboard components. These audits surfaced monorepo deployment misconfigurations (Vercel root directory, missing `VITE_API_BASE_URL`), schema/documentation drift (SQLite comments vs PostgreSQL reality), and stale-while-revalidate TTL documentation.

### Tier 1 Code Cleanup
A targeted technical-debt pass removed:
- Dead route aliases (`/api/news` duplicate of `/interactions`)
- Redundant `.catch()` blocks on services that never throw
- Unreachable `try/catch` around `fetchAIInsight` (the AI service already returns fallback inline)
- Unused exports (`validateCryptoAssetSelection`, public `TOKEN_KEY` re-export)
- Stale favicon reference (`/vite.svg` → `/favicon.svg`)

This reduced noise, tightened the public API surface, and eliminated dead promise chains that could mask real failures.

### CORS & Deployment Debugging
Production initially failed when Vercel generated new preview URLs not whitelisted on Render. We implemented dynamic CORS in `server/src/app.ts` to allow all `*.vercel.app` origins and `localhost` dev ports, while preserving explicit production domain allowlisting. Combined with correct monorepo build settings (`client` root, `dist` output), this closed the local/production symmetry gap.

### Performance: Replacing CryptoPanic with Local News
An audit revealed CryptoPanic added an external HTTP round-trip on **every** dashboard load with **zero server-side caching**. We removed the integration entirely and serve static `FALLBACK_NEWS` through `getFallbackNews()`, which filters and prioritizes headlines by the user's watchlist in-process.

**Result:** the news slice of the dashboard response is resolved synchronously from memory—no network latency, no API-key dependency—contributing to sub-50ms dashboard payload assembly for the news segment (the overall dashboard still awaits parallel price/AI/meme fetches).

### CoinGecko Hardening
We added `resolveCoinGeckoConfig()` to detect malformed base URLs (including API keys accidentally placed in `COINGECKO_API_BASE`), wired `x-cg-demo-api-key` headers, implemented 3-attempt exponential backoff for 429/network errors, and fixed `alignPricesToAssets` to prefer mock fallbacks over invalid live rows displaying `--`.

---

## 6. 🎁 Bonus — Future Model Improvements & Training Process

The `Feedback` table is not merely a UX affordance—it is a **structured preference signal** that can power the next generation of personalized crypto intelligence.

### Schema Recap

```prisma
model Feedback {
  userId      String
  sectionName String   // ai_insight | market_news | coin_prices | meme
  contentId   String   // insight ID, news ID, coin symbol, meme ID
  vote        String   // LIKE | DISLIKE | FAVORITE
  @@unique([userId, sectionName, contentId])
}
```

Each row is a labeled interaction: *user U expressed preference P over content item I in section S*.

### A. Collaborative Filtering & Recommendation

Construct a **User–Item interaction matrix** \( R \in \{-1, 0, +1\}^{|U| \times |I|} \) where:

- \( R_{u,i} = +1 \) for `LIKE`
- \( R_{u,i} = -1 \) for `DISLIKE`
- \( R_{u,i} = 0 \) for no interaction

Jointly factorize \( R \approx U \cdot V^\top \) (matrix factorization) or train a neural collaborative filter to recommend:
- News articles similar to those a HODLer cohort upvoted
- Meme styles preferred by Day Traders
- Asset combinations that co-occur in high-satisfaction watchlists

Cold-start users inherit priors from their `investorType` cluster before accumulating personal feedback.

### B. LLM Alignment via Preference Optimization

Aggregate feedback into a structured dataset:

\[
\mathcal{D} = \{(x, y_w, y_l)\}
\]

where:
- \( x \) = prompt context (investor archetype, watchlist, market snapshot)
- \( y_w \) = the AI insight (or content variant) the user **liked**
- \( y_l \) = the rejected alternative (prior insight, generic fallback, or a sampled negative)

**Direct Preference Optimization (DPO)** trains a policy \( \pi_\theta \) to maximize:

\[
\mathcal{L}_{\text{DPO}} = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \left[ \log \sigma \left( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{\text{ref}}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{\text{ref}}(y_l \mid x)} \right) \right]
\]

This aligns briefing tone, risk framing, and asset emphasis with **HODLer** (long-horizon, accumulation) vs **Day Trader** (momentum, volatility) archetypes without explicit rule engines.

Alternatively, a classical **RLHF** pipeline—reward model trained on pairwise votes, followed by PPO fine-tuning—scales to multi-section feedback (news summaries, meme selection, price commentary).

### C. Adaptive UI via Negative-Feedback Weights

Maintain a per-section **dissatisfaction score** for each user:

\[
w_s = \frac{\text{dislikes}_s}{\text{dislikes}_s + \text{likes}_s + \epsilon}
\]

Use \( w_s \) to dynamically:
- Deprioritize sections in `layoutSections` ordering (e.g., shrink meme panel if \( w_{\text{meme}} > 0.6 \))
- Suppress content IDs with repeated dislikes across sessions
- Trigger A/B layout experiments only for users with high engagement but mixed sentiment

Over time, the dashboard becomes a **closed-loop personalization system**: feedback → training data → better models → higher satisfaction → richer feedback.

---

## License

Private — Moveo Coding Task submission.
