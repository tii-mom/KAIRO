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
  - `https://e43fa2e9.kairo-5vg.pages.dev`

## Private Beta status

- Current recommendation: invite-only Private Beta can continue on the Pages same-origin API path while `workers.dev` reachability remains unreliable from the current network.
- Formal operations launch remains blocked as of 2026-06-27 because no approved real beta content batch has been imported into production yet.
- Current production Pages URL: `https://kairo.cfd`
- Current production API URL: `https://kairo.cfd/api`
- Historical Worker API URL: `https://kairo-worker-prod.348421501.workers.dev`
- Latest verified Pages URL: `https://c03bea43.kairo-5vg.pages.dev`
- Latest Private Beta Pages URL: `https://kairo.cfd`
- Beta support routes:
  - `/beta`
  - `/feedback`
  - GitHub feedback issue form: `https://github.com/tii-mom/KAIRO/issues/new?template=private-beta-feedback.yml`
- Known limitations:
  - Demo identity/session behavior is still used.
  - Admin is protected by demo header/session logic plus `ADMIN_API_TOKEN` and must not be treated as final production auth.
  - Seed content is still partially demo content.
  - `content/beta-import.reviewed-2026-06-27.json` is placeholder/example content only and must not be live-applied.
  - No full authentication or analytics pipeline is in place yet.
  - Run a D1 backup/export before replacing seed/demo data with real beta data.
  - On 2026-06-27, `workers.dev` API probes from the current network timed out before Worker runtime and produced no `wrangler tail` events; Pages and D1 remained reachable.
  - The current operational path is Pages Functions on the Pages domain, with production D1 bound as `DB`.

## Validation summary

- `npm install`: passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm run verify:copy`: passed
- `npm run verify:routes`: passed
- Production Pages bundle rebuilt with same-origin API requests; it contains no `localhost:8787`, `workers.dev`, or `kairo-worker-prod` API base.
- Pages TLS verified with `curl -Iv` for both `kairo-5vg.pages.dev` and `kairo.cfd`
- Browser smoke test loaded the homepage and core runtime layout successfully
- `/api/admin/stats` returned `403` without admin headers and `403` with admin headers but no production token; admin-token `200` check passed after setting the Pages production `ADMIN_API_TOKEN` secret.
- Private Beta Pages deployment `https://kairo.cfd` contains `/beta`, `/feedback`, the GitHub feedback issue form link, the admin token input, and the live same-origin API path.
- Production D1 pre-import snapshot helper `npm run db:backup:remote` was verified and wrote a local ignored snapshot with expected table counts.
- `KAIRO_PAGES_URL=https://kairo.cfd KAIRO_API_BASE_URL=https://kairo.cfd ADMIN_API_TOKEN=... npm run verify:production` passed with API health, D1-backed bounties, admin no-role `403`, admin no-token `403`, admin token `200`, and D1 counts.
- `KAIRO_PAGES_URL=https://kairo.cfd KAIRO_API_BASE_URL=https://kairo.cfd KAIRO_CUSTOM_DOMAIN=kairo.cfd ADMIN_API_TOKEN=... npm run verify:beta:go-live` passed with the custom domain root check and no remaining domain warning.
- `set -a; source .env; set +a; npm run verify:beta:go-live` passed locally on 2026-06-27 after sourcing the production admin token from `.env`.
- `npm run verify:operations` still fails exactly one check, `Real beta import`, because no approved real-content batch has been applied yet.
- `npm run content:beta:import -- --help` now documents the import modes and refuses `--apply` for example/template or placeholder-marked content.

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
- Pages same-origin API deploys should use:
  - `npm run deploy:pages:api`
- The deploy script builds with `VITE_KAIRO_API_BASE_URL` cleared, creates a temporary Pages `wrangler.toml`, binds production D1 as `DB`, uploads the Functions bundle, and keeps the repo's Worker `wrangler.toml` untouched.

## Known issues

- The `kairo-api-prod` Worker still exists as an extra deployment artifact.
- Keep `VITE_KAIRO_API_BASE_URL` unset for the current Pages same-origin API path.
- Current network probes to both `kairo-worker-prod.348421501.workers.dev` and `kairo-api-prod.348421501.workers.dev` resolve to rotating non-Cloudflare-looking IPs and time out before TLS; `wrangler tail` shows no runtime hits during those probes.
- Earlier same-origin Pages Functions tests without the temporary Pages config returned `DB` undefined; `npm run deploy:pages:api` fixes this by deploying with the D1 binding in a temporary Pages config.

## Rollback notes

- Worker rollback target: Cloudflare deployment version before `ba40b2c9-2774-421b-89dd-3b9e87870831`
- Do not run remote seed again unless the production dataset needs to be regenerated intentionally.
- Before real beta data is imported, capture a D1 backup/export so seed overwrite or content mistakes can be recovered.
- Latest recorded pre-import backup during this blocker pass: `backups/d1/kairo-prod-snapshot-2026-06-27T09-35-34-518Z.json`

## Frontend Visual Refresh Acceptance & Launch Blocker Audit V1

Date: 2026-06-28
Task: Frontend Visual Refresh Audit & Blocker Pass

### Summary of Audit Results

- **Production Bundle Verification**: Confirmed that the live production Pages deployment (`https://kairo.cfd`) serves the latest visual refresh assets:
  - JS bundle (`index-DiSeiIW2.js`) contains selectors: `kairo-root`, `glow-text-primary`, `kairo-marquee-track`, `kairo-shell`, and the logo asset `kairo-logo-dark.png`.
  - CSS stylesheet (`index-Bo6WZXSI.css`) contains the visual tokens: `--kairo-canvas`, `--kairo-gold`, `momentum-bar`, and `pulse-bg`.
- **No Financial Semantics**: Fully audited the client routes. All references to forbidden phrases (such as `APY`, `invest`, `swap`, `buy`, etc.) and visual investment hints (trading charts, buy/sell components) are absent.
- **Verification Scripts**:
  - `npm run lint`: Passed
  - `npm run build`: Passed
  - `npm run verify:copy`: Passed
  - `npm run verify:routes`: Passed
  - `npm run verify:production`: Passed (All endpoints and database records healthy)
  - `npm run verify:beta:go-live`: Passed (With environment variables `CI=true` and `WRANGLER_SEND_METRICS=false` to bypass Wrangler telemetry prompts)
  - `npm run verify:operations`: Failed ONLY on `Real beta import` (As expected due to pending real beta content approval; not a block for Private Beta or Technical launch).
- **Production Smoke Test**:
  - Tested routes `/`, `/catalysts`, `/dormant-giants`, `/leaderboard`, `/proof`, `/admin`, `/beta`, `/feedback`, and `/disclaimer`. All returned correct HTTP statuses and resolved successfully.
  - Deployed bundle requests APIs correctly via same-origin (`/api`) with zero localhost leaks.

## KAIRO Formal Operations Launch Gate V1

Date: 2026-06-28
Task: KAIRO Formal Operations Launch Gate V1

### Token Rotation
- Rotated `ADMIN_API_TOKEN` for both standalone Cloudflare Worker (`kairo-worker-prod`) and Cloudflare Pages project (`kairo`).
- Verified old token rejected with `403` status.
- Verified request without token rejected with `403` status.
- Verified new token accepted with `200` status.
- Token value is redacted and not committed to Git.

### Data Backup
- Captured a new remote D1 backup: `backups/d1/kairo-prod-snapshot-2026-06-28T04-07-58-383Z.json`.
- Row counts at backup:
  - `users`: 5
  - `tokens`: 8
  - `bounties`: 8
  - `submissions`: 8
  - `boosts`: 20
  - `support_points`: 5
  - `support_events`: 10
  - `builder_scores`: 3
  - `referrals`: 0
  - `escrow_events`: 4
  - `curated_items`: 8
  - `admin_actions`: 0

### Content Status
- Formal operations launch remains blocked due to "approved real beta content missing".
- No mock content was applied to the production database.
- `verify:operations` fails only on `Real beta import` check.


