# KAIRO Production Deployment Notes

Date: 2026-06-27
Task: KAIRO Production Deploy & Smoke Test V1

## Deployment status

- Production Worker `kairo-worker-prod` is reachable again at `/api/health`.
- Replacement Worker `kairo-api-prod` remains on the account, but it is no longer needed for the current recovery path.
- Production D1 database is bound in `wrangler.toml` and the remote data set is populated.
- Cloudflare Pages project `kairo` exists and was redeployed with the live production API base URL.

## Production resources

- D1 database name: `kairo-prod`
- D1 database id: `b7b521f5-96d2-4cf9-9c73-6ff1245f9d35`
- Worker URLs:
  - `https://kairo-worker-prod.348421501.workers.dev`
  - `https://kairo-api-prod.348421501.workers.dev`
- Pages URLs:
  - `https://f828a223.kairo-5vg.pages.dev`
  - `https://6f92ba0d.kairo-5vg.pages.dev`
  - `https://c03bea43.kairo-5vg.pages.dev`
  - `https://14f5594c.kairo-5vg.pages.dev`
  - `https://5d787a18.kairo-5vg.pages.dev`
  - `https://be52293d.kairo-5vg.pages.dev`
  - `https://530722fb.kairo-5vg.pages.dev`

## Private Beta status

- Current recommendation: pause new invite expansion until production API reachability is healthy from the tester network or a same-origin Pages Functions API path has the production `DB` binding configured.
- Production API URL: `https://kairo-worker-prod.348421501.workers.dev`
- Latest verified Pages URL: `https://c03bea43.kairo-5vg.pages.dev`
- Latest Private Beta Pages URL: `https://530722fb.kairo-5vg.pages.dev`
- Beta support routes:
  - `/beta`
  - `/feedback`
  - GitHub feedback issue form: `https://github.com/tii-mom/KAIRO/issues/new?template=private-beta-feedback.yml`
- Known limitations:
  - Demo identity/session behavior is still used.
  - Admin is protected by demo header/session logic plus `ADMIN_API_TOKEN` and must not be treated as final production auth.
  - Seed content is still partially demo content.
  - No full authentication or analytics pipeline is in place yet.
  - Run a D1 backup/export before replacing seed/demo data with real beta data.
  - On 2026-06-27, `workers.dev` API probes from the current network timed out before Worker runtime and produced no `wrangler tail` events; Pages and D1 remained reachable.

## Validation summary

- `npm install`: passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm run verify:copy`: passed
- `npm run verify:routes`: passed
- Production Pages bundle rebuilt with `VITE_KAIRO_API_BASE_URL=https://kairo-worker-prod.348421501.workers.dev`
- Pages TLS verified with `curl -Iv` for both `kairo-5vg.pages.dev` and the latest deployment URL
- Browser smoke test loaded the homepage and core runtime layout successfully
- `/api/admin/stats` returned `403` without admin headers, `403` with admin headers but no production token, and `200` with demo admin headers plus `x-kairo-admin-token`
- Private Beta Pages deployment `https://530722fb.kairo-5vg.pages.dev` contains `/beta`, `/feedback`, the GitHub feedback issue form link, the admin token input, and the live Worker API base URL.
- Production D1 pre-import snapshot helper `npm run db:backup:remote` was verified and wrote a local ignored snapshot with expected table counts.

## D1 notes

- Seed file uses `INSERT OR REPLACE`.
- This is repeatable for demo launch data, but it overwrites rows with matching IDs.
- Remote migration command used:
  - `npm run db:migrate:remote`
- Remote seed command used:
  - `npm run db:seed:remote`
- Remote row counts now verified:
  - `users = 5`
  - `tokens = 8`
  - `bounties = 8`
  - `submissions = 8`
  - `boosts = 20`
  - `support_events = 10`
  - `curated_items = 8`

## Worker smoke test 

- `curl -Iv` against `https://kairo-worker-prod.348421501.workers.dev` completed TLS and returned `404` on `/` as expected.
- `curl -v https://kairo-worker-prod.348421501.workers.dev/api/health` returned `200` with the expected health payload.
- `curl -i https://kairo-worker-prod.348421501.workers.dev/api/admin/stats` returned `403` without admin headers.
- `curl -i -H 'x-kairo-role: admin' -H 'x-kairo-user-id: user-demo-admin' https://kairo-worker-prod.348421501.workers.dev/api/admin/stats` returned `403` after `ADMIN_API_TOKEN` was configured.
- `curl -i -H 'x-kairo-role: admin' -H 'x-kairo-user-id: user-demo-admin' -H 'x-kairo-admin-token: $ADMIN_API_TOKEN' https://kairo-worker-prod.348421501.workers.dev/api/admin/stats` returned `200` after `ADMIN_API_TOKEN` was configured.

## Pages notes

- `npx wrangler pages project list` shows a `kairo` project in the current account.
- Pages must be built with:
  - `VITE_KAIRO_API_BASE_URL=https://kairo-worker-prod.348421501.workers.dev`
- The latest deployed bundle uses the production Worker base URL.

## Known issues

- The `kairo-api-prod` Worker still exists as an extra deployment artifact, but the production path is healthy on `kairo-worker-prod`.
- Keep the `VITE_KAIRO_API_BASE_URL` production setting pointed at the working Worker unless the app is switched to same-origin Pages Functions later.
- Current network probes to both `kairo-worker-prod.348421501.workers.dev` and `kairo-api-prod.348421501.workers.dev` resolve to rotating non-Cloudflare-looking IPs and time out before TLS; `wrangler tail` shows no runtime hits during those probes.
- A same-origin Pages Functions wrapper was tested on `https://b224a696.kairo-5vg.pages.dev`: `/api/health` worked, but D1-backed routes returned `DB` undefined because the Pages project has no production `DB` binding. Do not use this path until the Pages project binding is configured.

## Rollback notes

- Worker rollback target: Cloudflare deployment version before `ba40b2c9-2774-421b-89dd-3b9e87870831`
- Do not run remote seed again unless the production dataset needs to be regenerated intentionally.
- Before real beta data is imported, capture a D1 backup/export so seed overwrite or content mistakes can be recovered.
