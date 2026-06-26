# KAIRO Production Deployment Notes

Date: 2026-06-27
Task: KAIRO Production Deploy & Smoke Test V1

## Deployment status

- Worker deployed to production.
- Production D1 database created and bound in `wrangler.toml`.
- Remote D1 migration did not complete because Cloudflare D1 returned platform error `7500`.
- Remote seed did not complete because the schema migration did not create tables.
- Cloudflare Pages project `kairo` does not exist in the current account, so Pages production deploy was not completed in this session.

## Production resources

- D1 database name: `kairo-prod`
- D1 database id: `b7b521f5-96d2-4cf9-9c73-6ff1245f9d35`
- Worker URL: `https://kairo-worker-prod.348421501.workers.dev`
- Pages URL: not deployed

## Validation summary

- `npm install`: passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm run verify:copy`: passed
- `npm run verify:routes`: passed

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
- `/api/health` on the workers.dev URL returned Cloudflare `1042` during one request, while application API routes were otherwise reachable. Treat this as an edge/platform inconsistency to re-check after D1 is healthy.

## Pages notes

- `npx wrangler pages project list` shows no `kairo` project in the current account.
- Current local production bundle still contains `http://localhost:8787`, which means Pages must be built with:
  - `VITE_KAIRO_API_BASE_URL=https://kairo-worker-prod.348421501.workers.dev`
- Redeploy Pages only after setting that production environment variable and after Worker API data routes pass.

## Known issues

- Cloudflare D1 migration platform failure blocks data-backed API routes.
- Production Pages project is missing.
- Current local `dist` output still resolves API requests to localhost when `VITE_KAIRO_API_BASE_URL` is not injected at build time.

## Rollback notes

- Worker rollback target: Cloudflare deployment version before `ba40b2c9-2774-421b-89dd-3b9e87870831`
- Do not run remote seed again until remote migration succeeds and tables exist.
