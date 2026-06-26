# KAIRO MVP

KAIRO is a Web3 Catalyst and Boost platform for reviving dormant token ecosystems.

## Project Structure

- `src/`: preserved visual mock experience and reusable UI components.
- `client/`: React Router entrypoints and new product pages.
- `shared/`: KAIRO domain types, Zod schemas, and mapping helpers.
- `worker/`: Cloudflare Workers + Hono API, service layer, and D1 migrations.
- `kairo_project_docs/`: product docs, static preview, and original schema reference.

## Quick Start

```bash
npm install
npm run dev          # Frontend on :3000
npm run dev:worker   # Worker API on :8787
```

## API Reference

All endpoints are served from the Cloudflare Worker at `/api/`.

### Bounties (Catalysts)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bounties` | List all bounties, ordered by momentum |
| GET | `/api/bounties/:id` | Get single bounty details |
| POST | `/api/bounties` | Create a new bounty (catalyst) |
| PATCH | `/api/bounties/:id` | Update bounty fields (funding_status, etc.) |

### Submissions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/submissions?bountyId=` | List submissions, optional filter by bounty |
| POST | `/api/submissions` | Submit a builder solution |
| PATCH | `/api/submissions/:id` | Update submission (mark winner, etc.) |

### Boosts

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/boosts` | Boost a catalyst or submission (+300 momentum) |

### Leaderboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leaderboard` | Hottest catalysts, top builders, curated items |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/curated` | Add curated item to homepage/leaderboard |
| DELETE | `/api/admin/curated/:id` | Remove curated item |
| GET | `/api/admin/audit` | List pending reviews |

### Support & Proof

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/support/points/:userId` | Get user support point balance |
| GET | `/api/support/events/:userId` | Immutable support event history (proof of support) |

## Database Schema (Cloudflare D1)

| Table | Purpose |
|-------|---------|
| `bounties` | Catalyst records with funding_status, momentum_score |
| `submissions` | Builder submissions linked to bounties |
| `boosts` | Boost events with anti-abuse checks |
| `tokens` | Token metadata for dormant coin ecosystems |
| `builder_scores` | Aggregated builder reputation scores |
| `curated_items` | Admin-placed items for homepage/leaderboard |
| `support_points` | User support point balances |
| `support_events` | Immutable event log for Proof of Support |
| `escrow_events` | Funding history (not shown as escrow to users) |
| `referrals` | Referral link tracking |
| `admin_actions` | Audit log for admin operations |

## Deployment

```bash
# Deploy D1 migrations
npm run db:migrate:remote

# Deploy worker
npm run deploy:worker

# Deploy frontend (Cloudflare Pages)
npm run build
npm run deploy:pages
```

Replace the placeholder D1/KV IDs in `wrangler.toml` before deploying.

## Frontend Routes

| Path | Page |
|------|------|
| `/` | Arena dashboard |
| `/catalysts` | Catalyst list |
| `/catalysts/:id` | Catalyst detail |
| `/leaderboard` | Leaderboard with multiple categories |
| `/builder` | Builder terminal |
| `/proof` | Proof of Support |
| `/admin` | Admin workspace |

## Key Concepts

- **Catalyst**: A project bounty posted by a token team to revive their dormant ecosystem.
- **Boost**: Community upvote mechanism that adds Momentum.
- **Momentum**: Composite score based on boosts, submissions, shares, and referrals.
- **KAIRO Score**: Weighted builder reputation (delivery > boosts).
- **Proof of Support**: Immutable record of a user's contributions.
- **Funding Status**: `unverified` → `pledged` → `escrowed` → `partially_paid` → `paid` → `disputed` → `cancelled`

## Verification

```bash
npm run lint
npm run build
```

Frontend copy must display "Reward confirmed by KAIRO" instead of escrow/custody language.
