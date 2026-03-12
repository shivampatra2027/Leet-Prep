# Leet Prep Backend

Backend API for the Leet Prep platform. This service handles authentication, problem delivery, profile state, premium payments, referrals, contest aggregation, AI resume analysis, and sheet content.

## Stack

- Node.js + Express 5
- MongoDB + Mongoose
- Redis or in-memory cache fallback
- Passport Google OAuth
- JWT access + refresh token auth
- Razorpay payments
- Gemini-based resume feedback with local heuristics and quota controls
- `node-cron` background jobs
- Vercel-compatible serverless export

## Runtime Overview

- Entry point: `src/server.js`
- Serverless export: `src/index.js`
- MongoDB is required on startup through `MONGODB_URI`
- Redis is optional; if not configured, cache falls back to memory in non-production
- Contest and referral cron jobs are imported automatically when the server boots
- `/health` is the health check endpoint

## Main Features

- Email/password auth restricted to `@kiit.ac.in`
- Google OAuth login
- JWT auth with refresh token cookie
- Problem listing, company filters, and per-problem fetch
- User profile and solved-problem tracking
- Premium access checks
- Razorpay one-time payment flow with webhook-based activation
- Referral codes, leaderboard, rewards, and redemption
- Resume analysis with file upload or plain text input
- Multi-platform contest feed aggregation
- Curated sheet fetch by slug
- Simple site-like counter

## Project Structure

```text
backend/
  src/
    auth/           Google strategy
    config/         DB, Redis, AI quota config
    controllers/    Route handlers
    jobs/           Cron jobs
    middlewares/    Auth, limits, quota, errors
    models/         Mongoose schemas
    routes/         API routes
    services/       External service integrations
    scripts/        Data import/update scripts
    utils/          Cache, JWT, contest store, logging
  scripts/          Utility scripts
  vercel.json       Vercel routing/build config
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Fill required environment variables.

4. Start the API:

```bash
npm run dev
```

Default local port is `8080` unless `PORT` is set.

## Environment Variables

### Required

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `JWT_SECRET` | Legacy/general JWT secret used in parts of auth flow |
| `CLIENT_URL` | Canonical frontend URL for CORS and redirects |
| `FRONTEND_URL` | Frontend redirect target after Google OAuth |
| `CORS_ORIGIN` | Allowed frontend origin |
| `GOOGLE_CLIENT_ID` | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |

### Payments

| Variable | Purpose |
| --- | --- |
| `RAZORPAY_KEY_ID` | Razorpay publishable key id |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature validation |

### Optional but Recommended

| Variable | Purpose |
| --- | --- |
| `API_PUBLIC_URL` | Canonical backend URL used for OAuth redirect normalization |
| `COOKIE_DOMAIN` | Parent domain for refresh cookie if needed |
| `COOKIE_USE_DOMAIN` | Set `1` to apply `COOKIE_DOMAIN` |
| `COOKIE_SAME_SITE` | Override computed SameSite policy |
| `REDIS_URL` | Enables Redis-backed cache and queue connectivity |
| `USE_REDIS` | Optional explicit Redis enable switch |
| `REDIS_HOST` / `REDIS_PORT` | Local Redis alternative to `REDIS_URL` |
| `GOOGLE_GENAI_API_KEY` | Enables Gemini resume feedback |
| `LEETCODE_API` | Custom LeetCode GraphQL endpoint override |
| `NODE_ENV` | Production/development behavior |
| `PORT` | HTTP port for local/server deployment |

## Auth Model

- Access token is sent in `Authorization: Bearer <token>`
- Refresh token is stored in an HTTP-only cookie named `refreshToken`
- `protect` middleware verifies the access token, loads the user, downgrades expired premium users, and tracks login activity
- Google OAuth and regular login both issue access and refresh tokens
- In production, cookie behavior depends on `COOKIE_DOMAIN`, `COOKIE_USE_DOMAIN`, request host, and `COOKIE_SAME_SITE`

## Rate Limits and Guardrails

- Global `/api` limiter: `120` requests per minute per client key
- Strict limiter: `20` failed/sensitive requests per `10` minutes
- Payment polling limiter: `300` requests per minute
- Health, Google OAuth, and Razorpay webhook are exempt from baseline throttling
- Resume analysis also uses per-user AI credit limits and cooldowns

## API Surface

All mounted routes are registered in `src/server.js`.

### Health

- `GET /health` - health check
- `GET /` - simple backend status text

### Auth

Base path: `/auth`

- `POST /signup` - email/password signup, KIIT email only
- `POST /login` - email/password login
- `GET /google` - start Google OAuth
- `GET /google/callback` - Google OAuth callback, redirects to frontend with access token
- `POST /refresh` - issue a new access token from refresh cookie
- `POST /logout` - clear refresh cookie
- `GET /fail` - OAuth failure response

### Problems

Base path: `/api/problems`

- `GET /` - protected; supports `difficulty`, `company`, `q`, `page`, `limit`
- `GET /:id` - protected; fetch single problem by Mongo id
- `GET /companies` - protected; list distinct companies

Notes:

- Responses are cached
- Problem sorting uses `sortOrder` then newest first
- There is a route file entry for `/companies/:companyId`, but it currently points to the single-problem handler

### Profile

Base path: `/api/profile`

- `GET /` - protected; profile summary and premium status
- `GET /solved-problems` - protected; list solved problem ids
- `POST /solved-problems` - protected; add `{ problemId }`
- `DELETE /solved-problems/:problemId` - protected; remove solved marker
- `GET /solved-summary` - protected; solved count, total, and progress

### Premium

Base path: `/api/premium`

- `GET /check-dashboard` - protected; returns dashboard access based on tier

### Payments

Base path: `/api/payment`

- `POST /create-order` - protected; creates Razorpay order
- `POST /verify` - protected; verifies client payment signature
- `GET /status/:orderId` - protected; reads payment state and user premium state
- `POST /refund` - protected; processes refund for the user's payment
- `GET /history` - protected; payment history
- `POST /webhook` - public; raw-body Razorpay webhook endpoint

Notes:

- Webhook uses `express.raw()` because Razorpay signature verification needs the raw payload
- Premium activation is expected to happen from webhook processing, not from client verify alone

### Resume Analysis

Base path: `/api/resume`

- `POST /analyze` - protected; multipart field `resume` or body `text`

Accepted inputs:

- `text/plain`
- `application/pdf`
- `.docx`
- raw text in request body

Response includes:

- heuristic score and resume diagnostics
- optional Gemini feedback
- cache hit status
- remaining AI quota

### Study Assistant (RAG)

Base path: `/api/study`

- `GET /materials` - protected; list indexed study materials for the user
- `POST /upload` - protected; upload `file` (`pdf`, `docx`, `txt`) or send body `text`
- `POST /ask` - protected; grounded Q&A against indexed material
- `POST /summarize` - protected; topic summary from indexed material
- `POST /quiz` - protected; generate MCQ quiz JSON from indexed material

Notes:

- Requires `CHROMA_URL` and a running ChromaDB instance
- Uses `GOOGLE_GENAI_API_KEY` for embeddings and grounded response generation
- Data is isolated per user in a dedicated Chroma collection

### Referral

Base path: `/api/referral`

- `GET /leaderboard` - public; cached weekly and all-time leaderboard
- `GET /me` - protected; current user referral stats and rewards
- `POST /join` - protected; generate referral code
- `POST /apply` - protected; attach inviter code
- `POST /redeem` - protected; redeem points

Referral points:

- signup: `1`
- active next day: `5`
- purchase: `50`

Redemption tiers currently include premium unlocks and physical prize claims.

### Contests

Base path: `/api/contests`

- `GET /` - returns aggregated contests

Query params:

- `type=upcoming` default
- `type=expired` returns only recently expired contests from the last 7 days

### Sheets

Base path: `/api/sheets`

- `GET /:slug` - fetch a curated sheet with topics and problems

### Likes

Base path: `/api/likes`

- `GET /` - current like count
- `POST /` - increment global like count

## Data Models

### `User`

Stores:

- auth identity
- role and premium tier
- solved problems
- AI credits and usage counters
- referral code, stats, badges, and prize claims
- login tracking and last IP

Important behavior:

- premium users are downgraded automatically after expiry
- TTL index exists on `expireAt`

### `Problem`

Stores:

- unique `problemId`
- title, URL, companies, difficulty
- topic tags
- acceptance percentage
- `sortOrder`

### `Payment`

Stores:

- user link
- Razorpay order/payment ids
- status and refund metadata
- receipt, notes, and captured timestamps

### `ReferralEvent`

Stores delayed and processed referral rewards with:

- inviter and invitee ids
- event type
- points
- delayed processing timestamp
- anti-abuse metadata
- TTL expiry

### `Sheet`

Stores sheet metadata and nested topic/problem lists.

### `AIResponseCache`

Stores hashed resume-analysis responses for 7 days.

## Background Jobs

### Contest Job

File: `src/jobs/contestJob.js`

- fetches contests from LeetCode, Codeforces, CodeChef, and AtCoder
- runs every 6 hours
- also triggers once shortly after startup
- stores contests in memory via `contestStore`

### Referral Job

File: `src/jobs/referralJob.js`

- weekly referral points reset every Monday at `00:05 UTC`
- processes pending signup and next-day referral events every 30 minutes
- includes duplicate-run lock logic for weekly reset

## Caching

- Problem and company responses use cache helpers in `src/utils/cache.js`
- Redis is used when available
- In development without Redis, cache falls back to in-memory storage
- In production without Redis, cache reads/writes are effectively disabled

## AI Quota Rules

Current defaults in `src/config/aiQuota.js`:

- free credits/day: `100`
- premium credits/day: `2000`
- free cooldown: `20s`
- free heavy-analysis cap/day: `3`
- resume analysis cost: `20`

Quota resets on UTC day boundaries.

## Scripts

Top-level npm scripts:

- `npm start` - run production server
- `npm run dev` - run with nodemon
- `npm run redis:monitor` - monitor Redis behavior
- `npm run seed:sheet` - import sheet data
- `npm run chroma:docker` - run a local ChromaDB container for study assistant features

Additional import/update utilities exist in `src/scripts/` and `scripts/` for seeding problems, sheets, hints, and sort-order updates.

## Deployment Notes

- `vercel.json` routes all HTTP methods to `src/index.js`
- `src/server.js` starts an HTTP listener only when `VERCEL !== "1"`
- On Vercel, the app connects to MongoDB without starting `listen()`
- If deploying behind a proxy or CDN, `trust proxy` is already enabled

## Known Implementation Notes

- `src/routes/adminRoutes.js` and `src/routes/sitemapRoutes.js` exist in the repository but are not currently mounted in `src/server.js`
- Google OAuth and CORS origin handling include explicit production and localhost allowlists
- Payment webhook is the critical source of truth for premium activation
