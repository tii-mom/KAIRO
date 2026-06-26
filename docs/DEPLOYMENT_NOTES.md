# KAIRO Production Deployment Notes

Date: 2026-06-27
Task: KAIRO Production Deploy & Smoke Test V1

## Deployment status

- Worker redeployed to production.
- Production D1 database created and bound in `wrangler.toml`.
- Remote D1 migration did not complete because Cloudflare D1 returned platform error `7500`.
- Remote seed did not complete because the schema migration did not create tables.
- Cloudflare Pages project `kairo` exists and production Pages has been redeployed.

## Production resources

- D1 database name: `kairo-prod`
- D1 database id: `b7b521f5-96d2-4cf9-9c73-6ff1245f9d35`
- Worker URL: `https://kairo-worker-prod.348421501.workers.dev`
- Pages URLs:
  - `https://f828a223.kairo-5vg.pages.dev`
  - `https://6f92ba0d.kairo-5vg.pages.dev`

## Validation summary

- `npm install`: passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm run verify:copy`: passed
- `npm run verify:routes`: passed
- Production Pages bundle rebuilt with `VITE_KAIRO_API_BASE_URL=https://kairo-worker-prod.348421501.workers.dev`
- Pages TLS verified with `curl -Iv` for both `kairo-5vg.pages.dev` and the latest deployment URL
- Browser smoke test reached the Pages site, but the runtime stayed on the loading shell because Worker fetches timed out

## D1 notes

- Seed file uses `INSERT OR REPLACE`.
- This is repeatable for demo launch data, but it overwrites rows with matching IDs.
- Remote migration command used:
  - `npm run db:migrate:remote`
- Remote seed command used:
  - `npm run db:seed:remote`
- Migration failed with Cloudflare API error:
  - `internal error; reference = e_PVSMDp_32114137e2bc4871bcf9cd7fd51e223b [code: 7500]`
- Because migration failed, seed then failed with:
  - `no such table: users: SQLITE_ERROR`

## Worker smoke test

- `/api/admin/stats` without admin headers returned `403` as expected.
- `/api/bounties`, `/api/leaderboard`, `/api/curated-items`, `/api/support/proof/me`, and admin stats with admin headers currently fail because production D1 tables were not created.
- `curl -Iv --http1.1 --connect-timeout 10 --max-time 20 https://kairo-worker-prod.348421501.workers.dev/api/health` timed out after the Worker redeploy.
- Browser requests to `https://kairo-worker-prod.348421501.workers.dev/api/bounties`, `/api/curated-items/home`, and `/api/leaderboard` also timed out.

## Pages notes

- `npx wrangler pages project list` shows a `kairo` project in the current account.
- Pages must be built with:
  - `VITE_KAIRO_API_BASE_URL=https://kairo-worker-prod.348421501.workers.dev`
- The latest deployed bundle uses the production Worker base URL.

## Known issues

- Cloudflare D1 migration platform failure blocks data-backed API routes.
- Production Worker edge requests are timing out from shell and browser probes, even after a fresh redeploy.
- Pages renders the loading shell because the Worker fetches never complete.

## Rollback notes

- Worker rollback target: Cloudflare deployment version before `ba40b2c9-2774-421b-89dd-3b9e87870831`
- Do not run remote seed again until remote migration succeeds and tables exist.
