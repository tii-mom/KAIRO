# KAIRO

KAIRO Phase 0 is a Catalyst, Builder Submission, Boost, Momentum, Proof of Support, Funding Status, and Reward Records platform for dormant token communities that need visible product work and community signal.

## Phase 0 Scope

KAIRO Phase 0 focuses on:

- Catalyst discovery and publication.
- Builder submissions with demo, repository, media, and delivery status metadata.
- Community Boosts that create visible Momentum.
- Proof of Support for supporter activity history.
- Leaderboards for Catalysts, Builders, Submissions, Dormant Giants, Breakout Stories, Comeback Hall, and Genesis Candidates.
- Admin review flows for Catalyst status, submission status, Boost validity, curated items, Funding Status, and Reward Records.

## What KAIRO Is Not

KAIRO Phase 0 is not an investment product, token swap, trading venue, crowdfunding platform, token launch platform, staking system, yield product, custody provider, escrow service, or platform token economy.

Funding Status and Reward Records are public coordination labels for sponsor-provided reward information. They must not be described as KAIRO holding assets, a financial service, guaranteed payouts, guaranteed airdrops, or any guaranteed return.

## Architecture

- **Frontend:** Vite + React + TypeScript.
- **Hosting:** Cloudflare Pages for the frontend.
- **API:** Cloudflare Worker API using Hono.
- **Database:** Cloudflare D1.
- **Shared domain layer:** `shared/` contains Zod/domain types and mapping helpers shared by the runtime and Worker-adjacent code.

## Directory Structure

```text
.
├── client/                 # API-driven Phase 0 React runtime
│   ├── lib/                # API client, session helpers, formatters
│   ├── pages/              # Runtime pages and smoke-test routes
│   └── RuntimeV2Shell.tsx  # Main app shell
├── docs/                   # Launch checklist and operational docs
├── kairo_project_docs/     # Historical project docs and static preview
├── scripts/                # Verification scripts
├── shared/                 # Domain types, Zod schemas, and mappers
├── src/                    # Legacy visual preview retained under /legacy
├── worker/                 # Cloudflare Worker, D1 schema, services, seed data
│   ├── db/
│   ├── migrations/
│   └── services/
├── package.json
├── vite.config.ts
└── wrangler.toml
```

## Local Frontend Development

Install dependencies:

```bash
npm install
```

Run the Vite frontend:

```bash
npm run dev
```

The frontend runs on port `3000` by default. When `VITE_KAIRO_API_BASE_URL` is not set, the API client falls back to same-origin requests.

## Local Worker Development

Run the Worker locally:

```bash
npm run dev:worker
```

The Worker exposes the `/api/*` routes listed below. For a local split frontend and Worker setup, set `VITE_KAIRO_API_BASE_URL` to the Worker origin used by Wrangler.

## D1 Local Migration

Apply local D1 migrations:

```bash
npm run db:migrate:local
```

This runs the migration files in `worker/migrations/` against the local `kairo-local` D1 database configured in `wrangler.toml`.

## D1 Local Seed

Seed local launch demo data:

```bash
npm run db:seed:local
```

To verify the seed loaded, query D1 locally with Wrangler, for example:

```bash
npx wrangler d1 execute kairo-local --local --command="SELECT COUNT(*) AS count FROM bounties;"
npx wrangler d1 execute kairo-local --local --command="SELECT COUNT(*) AS count FROM submissions;"
npx wrangler d1 execute kairo-local --local --command="SELECT COUNT(*) AS count FROM boosts;"
```

## Production Deployment Overview

1. Create a Cloudflare D1 database for production.
2. Update `wrangler.toml` with the production D1 database name and ID.
3. Run remote migrations.
4. Apply the seed only to non-production or curated demo environments unless production launch data is approved.
5. Deploy the Worker.
6. Deploy the frontend to Cloudflare Pages.
7. Set `VITE_KAIRO_API_BASE_URL` in Cloudflare Pages when the Worker is not same-origin.
8. Run the production smoke test from `docs/LAUNCH_CHECKLIST.md`.

## Environment Variables

| Name | Used by | Purpose |
| --- | --- | --- |
| `VITE_KAIRO_API_BASE_URL` | Frontend | Optional absolute Worker API base URL. Leave unset for same-origin API requests. |

## Package Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite frontend. |
| `npm run build` | Build the frontend for production. |
| `npm run preview` | Preview the production frontend build. |
| `npm run lint` | Run TypeScript verification with `tsc --noEmit`. |
| `npm run dev:worker` | Run the Cloudflare Worker locally with Wrangler. |
| `npm run db:migrate:local` | Apply D1 migrations locally. |
| `npm run db:seed:local` | Seed local D1 with launch demo data. |
| `npm run db:migrate:remote` | Apply D1 migrations to the configured remote database. |
| `npm run deploy:worker` | Deploy the Worker with Wrangler. |
| `npm run verify:copy` | Scan public runtime code for forbidden public copy. |
| `npm run verify:routes` | Verify required Worker route strings and client page files. |

## API Route Overview

### Health

- `GET /api/health`

### Catalysts / Bounties

- `GET /api/bounties`
- `GET /api/bounties/:id`
- `POST /api/bounties`
- `PATCH /api/bounties/:id`
- `GET /api/bounties/:id/funding-events`
- `POST /api/bounties/:id/boost`
- `GET /api/bounties/:id/submissions`
- `POST /api/bounties/:id/submissions`

### Submissions

- `GET /api/submissions`
- `GET /api/submissions/:id`
- `POST /api/submissions`
- `PATCH /api/submissions/:id`
- `POST /api/submissions/:id/boost`

### Support Proof

- `GET /api/support/points/me`
- `GET /api/support/events/me`
- `GET /api/support/proof/me`
- `GET /api/support/proof/:userId`
- `GET /api/proof-of-support`

### Curated Runtime

- `GET /api/curated-items`
- `GET /api/curated-items/:placement`
- `GET /api/curated-items/type/:itemType`

### Leaderboard

- `GET /api/leaderboard`
- `GET /api/leaderboard/hottest-catalysts`
- `GET /api/leaderboard/confirmed-reward-catalysts`
- `GET /api/leaderboard/top-builders`
- `GET /api/leaderboard/most-boosted-submissions`
- `GET /api/leaderboard/dormant-giants`
- `GET /api/leaderboard/breakout-stories`
- `GET /api/leaderboard/comeback-hall`
- `GET /api/leaderboard/genesis-candidates`

### Admin

- `GET /api/admin/bounties`
- `PATCH /api/admin/bounties/:id/status`
- `PATCH /api/admin/bounties/:id/funding-status`
- `POST /api/admin/bounties/:id/funding-events`
- `GET /api/admin/submissions`
- `PATCH /api/admin/submissions/:id/status`
- `PATCH /api/admin/submissions/:id/delivery-status`
- `GET /api/admin/boosts`
- `PATCH /api/admin/boosts/:id/validity-status`
- `GET /api/admin/support-events`
- `PATCH /api/admin/support-events/:id/validity-status`
- `GET /api/admin/curated-items`
- `POST /api/admin/curated-items`
- `PATCH /api/admin/curated-items/:id`
- `GET /api/admin/stats`

## Admin Flow

Admin endpoints require `x-kairo-role: admin`. Without that role, admin routes must return forbidden access. Admin users can review Catalysts, update Funding Status, add Reward Records, moderate submissions, validate Boosts and support events, curate runtime placements, and view launch stats.

For local smoke tests, use:

```bash
curl -H "x-kairo-role: admin" http://127.0.0.1:8787/api/admin/stats
```

## Proof of Support Flow

Supporters create Proof of Support through Boosts, shares, referrals, and related support events. The API resolves the current demo user from request headers and returns support points, event history, and a proof payload for `/proof`.

Useful demo headers:

```bash
-H "x-kairo-user-id: user-demo-supporter"
-H "x-kairo-user-name: Demo Supporter"
```

## Funding Status / Reward Records Wording Policy

Use these public labels:

- Funding Status
- Funding Events
- Reward Records
- Reward confirmed
- Partial reward sent
- Reward paid
- Sponsor reward

Do not use public copy that describes KAIRO as a financial intermediary, asset holder, guaranteed reward provider, or financial service. Internal table names and enum values may exist for implementation compatibility, but public runtime labels must remain product-safe.

## Compliance Boundary

Boost is a community signal, not a financial action. Catalyst pages should describe concrete product work and Builder submissions, not financial promises. Proof of Support records early support behavior only; they do not guarantee badges, access, rewards, or airdrops.

Run this before launch:

```bash
npm run verify:copy
npm run verify:routes
```

## Launch Checklist

See [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md).
