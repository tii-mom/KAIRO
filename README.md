# KAIRO MVP

KAIRO Phase 0 is positioned as a **Crypto Comeback Launchpad**: dormant crypto communities can publish Catalysts, AI Builders can submit comeback demos, and supporters can Boost the strongest revival paths into visible Momentum and leaderboard placement.

The current implementation keeps the existing neon fintech preview experience while adding the scalable MVP structure:

- `src/`: preserved visual mock experience and reusable UI components.
- `client/`: React Router entrypoints and new product pages.
- `shared/`: KAIRO domain types, Zod schemas, and mapping helpers.
- `worker/`: Cloudflare Workers + Hono API, service layer, and D1 migrations.
- `kairo_project_docs/`: product docs, static preview, and original schema reference.

## Product Boundary

Phase 0 focuses on Catalyst discovery, Builder submissions, community Boosts, Momentum ranking, Proof of Support, Funding Status, and public leaderboards.

Phase 0 explicitly does **not** include token swap, investment products, custody, crowdfunding, or a platform token economy. Funding Status is a user-facing reward commitment and verification signal only; do not describe it as custody, escrow, or a KAIRO-held asset service. Frontend copy must display `Reward confirmed by KAIRO` / `奖励已由 KAIRO 确认` instead of escrow or custody language.

## Local Development

Install dependencies:

```bash
npm install
```

Run the local frontend dev server:

```bash
npm run dev
```

Vite starts on port `3000` by default and will pick the next open port if needed.

Useful routes:

- `/`: Runtime V2 home
- `/catalysts`: Catalyst list
- `/catalysts/:id`: Catalyst detail
- `/leaderboard`: Leaderboard
- `/builder`: Builder board
- `/proof`: Proof of Support
- `/admin`: Redirects to Catalyst list

## Worker And D1

Run the Cloudflare Worker locally:

```bash
npm run dev:worker
```

Apply local D1 migrations:

```bash
npm run db:migrate:local
```

Seed the local D1 database with demo Phase 0 data:

```bash
npm run db:seed:local
```

Deploy after replacing the placeholder D1/KV IDs in `wrangler.toml`:

```bash
npm run db:migrate:remote
npm run deploy:worker
```

## API Endpoints

Current Worker endpoints are:

### Bounties / Catalysts

- `GET /api/bounties` — list Catalysts ordered by Momentum.
- `GET /api/bounties/:id` — fetch one Catalyst.
- `POST /api/bounties` — create a Catalyst record.
- `PATCH /api/bounties/:id` — update Catalyst metadata.
- `POST /api/bounties/:id/boost` — Boost a Catalyst.
- `GET /api/bounties/:id/submissions` — list submissions for a Catalyst.
- `POST /api/bounties/:id/submissions` — submit a project to a Catalyst.

### Submissions

- `GET /api/submissions` — list recent submissions.
- `GET /api/submissions?bountyId=:id` — list submissions for a Catalyst.
- `GET /api/submissions/:id` — fetch one submission.
- `POST /api/submissions` — create a Builder submission.
- `PATCH /api/submissions/:id` — update a submission.
- `POST /api/submissions/:id/boost` — Boost a submission.

### Boost

- `POST /api/boosts` — Boost a Catalyst or submission and create the related support event.

### Support Proof

- `GET /proof` — frontend Proof of Support page for Phase 0 supporter activity.
- `GET /api/support/points/me` — read the current supporter's points.
- `GET /api/support/events/me` — read the current supporter's support event timeline.
- `GET /api/support/proof/me` — read the current supporter's Proof of Support payload.
- `GET /api/proof-of-support` — compatibility endpoint for the Proof of Support payload.

### Leaderboards

- `GET /api/leaderboard` — return all Runtime V2 leaderboard groups.
- `GET /api/leaderboard/hottest-catalysts`
- `GET /api/leaderboard/confirmed-reward-catalysts`
- `GET /api/leaderboard/top-builders`
- `GET /api/leaderboard/most-boosted-submissions`
- `GET /api/leaderboard/dormant-giants`
- `GET /api/leaderboard/breakout-stories`
- `GET /api/leaderboard/comeback-hall`
- `GET /api/leaderboard/genesis-candidates`

## Verification

```bash
npm run lint
npm run build
```
