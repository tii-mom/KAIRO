# KAIRO Launch Checklist

Use this checklist before Cloudflare deployment testing and before public launch candidate review.

## A. Local Verification

```bash
npm install
npm run lint
npm run build
npm run verify:copy
npm run verify:routes
```

Expected result: every command exits successfully.

For production readiness after deploy:

```bash
ADMIN_API_TOKEN="..." npm run verify:production
```

## B. D1 Verification

Apply migrations locally:

```bash
npm run db:migrate:local
```

Seed local D1:

```bash
npm run db:seed:local
```

Verify seed loaded:

```bash
npx wrangler d1 execute kairo-local --local --command="SELECT COUNT(*) AS count FROM users;"
npx wrangler d1 execute kairo-local --local --command="SELECT COUNT(*) AS count FROM tokens;"
npx wrangler d1 execute kairo-local --local --command="SELECT COUNT(*) AS count FROM bounties;"
npx wrangler d1 execute kairo-local --local --command="SELECT COUNT(*) AS count FROM submissions;"
npx wrangler d1 execute kairo-local --local --command="SELECT COUNT(*) AS count FROM boosts;"
npx wrangler d1 execute kairo-local --local --command="SELECT item_type, COUNT(*) AS count FROM curated_items GROUP BY item_type;"
```

Seed expectations:

- Required demo users exist: `user-demo-supporter`, `user-demo-builder`, `user-demo-admin`.
- At least 8 tokens, 8 Catalysts, 8 submissions, and 20 Boosts exist.
- `support_points`, `support_events`, `builder_scores`, internal `escrow_events`, and `curated_items` are populated.
- Curated items cover homepage banner, featured Catalyst, Dormant Giant, featured Builder, Breakout Story, Comeback Hall, Genesis Candidate, and sponsor campaign.

## C. Worker Smoke Test

Start the Worker:

```bash
npm run dev:worker
```

Health endpoint:

```bash
curl http://127.0.0.1:8787/api/health
```

Bounties endpoint:

```bash
curl http://127.0.0.1:8787/api/bounties
```

Support proof endpoint:

```bash
curl -H "x-kairo-user-id: user-demo-supporter" http://127.0.0.1:8787/api/support/proof/me
```

Leaderboard endpoint:

```bash
curl http://127.0.0.1:8787/api/leaderboard
```

Admin forbidden without admin role:

```bash
curl -i http://127.0.0.1:8787/api/admin/stats
```

Admin allowed with `x-kairo-role: admin`:

```bash
curl -i -H "x-kairo-role: admin" -H "x-kairo-user-id: user-demo-admin" http://127.0.0.1:8787/api/admin/stats
```

Production admin must also require `x-kairo-admin-token` matching `ADMIN_API_TOKEN`:

```bash
curl -i -H "x-kairo-role: admin" -H "x-kairo-user-id: user-demo-admin" https://kairo-worker-prod.348421501.workers.dev/api/admin/stats
curl -i -H "x-kairo-role: admin" -H "x-kairo-user-id: user-demo-admin" -H "x-kairo-admin-token: $ADMIN_API_TOKEN" https://kairo-worker-prod.348421501.workers.dev/api/admin/stats
```

## D. Frontend Smoke Test

Start the frontend:

```bash
npm run dev
```

Verify these routes:

- `/`
- `/catalysts`
- `/catalysts/:id`
- `/create-catalyst`
- `/catalysts/:id/submit`
- `/submissions/:id`
- `/leaderboard`
- `/dormant-giants`
- `/proof`
- `/beta`
- `/feedback`
- `/admin`
- `/about`
- `/how-it-works`
- `/for-builders`
- `/for-communities`
- `/submit-token`
- `/disclaimer`

Note: the current app also exposes Catalyst creation at `/catalysts/create`; verify route behavior before deployment.

## E. Content Checklist

- Homepage is not empty.
- Dormant Giants is not empty.
- Leaderboard is not empty.
- Proof page is not empty for the demo supporter.
- Funding Events display safe public wording.
- Reward Records display safe public wording.
- Catalyst copy sounds like real project revival tasks.
- Submission copy sounds like real Builder demos.

## F. Compliance Checklist

- No swap route.
- No `TokenSwap` component.
- No public UX for buying, trading, investment, yield, or custody concepts.
- Funding Status is not described as a financial service.
- Boost is not described as investment.
- No guaranteed reward or airdrop claims.
- `npm run verify:copy` passes.

## G. Private Beta Checklist

- Production Worker URL is documented.
- Production Pages URL is documented.
- `/beta` explains the invite-only beta scope and Phase 0 limits.
- `/feedback` provides a copyable feedback template.
- GitHub private beta feedback issue form exists.
- Feedback owner and triage cadence are assigned before invites.
- `docs/PRIVATE_BETA_RUNBOOK.md` is current.
- `docs/BETA_COHORT_OPERATIONS.md` is current.
- `docs/BETA_CONTENT_PLAN.md` is current.
- Admin operators understand that demo header/session logic is not final production auth.
- `ADMIN_API_TOKEN` is set as a production Worker secret before inviting operators.
- Admin API returns `403` without the token and `200` with the token.
- `ADMIN_API_TOKEN="..." npm run verify:production` passes.
- `ADMIN_API_TOKEN="..." npm run verify:beta:go-live` passes on `https://kairo.cfd`.
- `npm run verify:operations` passes once operator ownership and real beta content readiness are recorded.
- `npm run db:backup:remote` is run and the snapshot filename is recorded before importing real beta data or rerunning seed.
- `node scripts/verify-beta-import.mjs content/<reviewed-file>.json` passes for the reviewed import JSON.
- Real beta content SQL is generated from reviewed JSON and reviewed before apply.
- `npm run content:beta:import -- --help` has been reviewed by the operator if they are using the scripted import path.
- `content/beta-import.example.json`, `content/beta-import.template.json`, and `content/beta-import.reviewed-2026-06-27.json` are not treated as approved production operating data.
- Post-import row counts and public pages are verified.

## H. Cloudflare Deployment Checklist

1. Create a production D1 database.
2. Update `wrangler.toml` with the production D1 database name and ID.
3. Run remote migration:

   ```bash
   npm run db:migrate:remote
   ```

4. Run or manually apply approved seed data in the intended environment.
5. Set production admin secret:

   ```bash
   npx wrangler secret put ADMIN_API_TOKEN --env production
   ```

6. Deploy Worker:

   ```bash
   npm run deploy:worker
   ```

7. Deploy Pages.
8. Set `VITE_KAIRO_API_BASE_URL` if the Worker is not same-origin.
9. Verify CORS and API base URL behavior.
10. Run production smoke tests.
11. Public launch domain is `https://kairo.cfd`. Keep `kairo-5vg.pages.dev` preview URLs for rollback/debug use only.

## I. Rollback Notes

Worker rollback:

- Roll back to a previous Worker deployment in the Cloudflare dashboard.
- Or redeploy the last known-good commit with `npm run deploy:worker`.

Pages rollback:

- Promote the last known-good Pages deployment.
- Confirm `VITE_KAIRO_API_BASE_URL` points to the intended Worker.

D1 rollback or reset:

- Restore from a Cloudflare D1 backup when available.
- For non-production, recreate the database, rerun migrations, and reapply seed.
- Do not reset production data without backup and explicit approval.
