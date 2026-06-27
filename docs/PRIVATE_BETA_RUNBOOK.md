# KAIRO Private Beta Runbook

Date: 2026-06-27

## Beta Purpose

KAIRO Private Beta tests whether a small cohort can understand and complete the Phase 0 workflow:

- Project/community owners publish or review Catalysts.
- Builders find Catalysts and submit working demos.
- Supporters Boost useful Catalysts or submissions and copy Proof of Support.
- Admin/operators review content, Funding Status, Reward Records, Boosts, and support events.

This beta is not testing public launch scale, financial products, trading, token launch mechanics, custody, or guaranteed reward distribution.

Target cohort:

- 5-10 Builders
- 20-50 Supporters
- 3-5 real Catalysts
- 10-20 Dormant Giants candidates
- 1-2 admin operators

## User Groups

- Builder: finds Catalysts, ships demos, submits proof of work, and checks visibility.
- Supporter: browses Catalysts, Boosts work, checks Proof of Support, and reports confusing flows.
- Admin/operator: reviews submissions and public content, updates Funding Status, adds Reward Records, and moderates validity.
- Project/community owner: proposes Dormant Giants, provides Catalyst context, and reviews public-safe copy.

## Test Flows

Supporter flow:

1. Open the production Pages URL.
2. Browse Catalysts.
3. Open a Catalyst detail page.
4. Boost a Catalyst or Submission.
5. Open Proof of Support.
6. Copy the proof summary.
7. Report feedback through `/feedback`.

Builder flow:

1. Browse Catalysts.
2. Open a Submit Demo page.
3. Submit project/demo details.
4. Verify the submission appears in the Catalyst or Submission detail view.
5. Ask a Supporter to Boost the submission.
6. Check leaderboard and Proof of Support visibility.

Admin flow:

1. Open the Admin page from a trusted operator context only.
2. Review Catalysts.
3. Update Catalyst status when needed.
4. Update `funding_status` with public-safe wording.
5. Add Reward Records / Funding Events only when evidence is available.
6. Review submissions.
7. Mark suspicious Boosts or support events when needed.

## Tester Expectations

Testers should not expect:

- Real rewards to be guaranteed.
- Airdrops to be guaranteed.
- Investment functionality.
- Swap or trading functionality.
- Custody, escrow, or asset-holding services.
- Full production authentication.

## Feedback Protocol

Use `/feedback` to copy the feedback template, then submit it in the private beta feedback channel or issue tracker.

Preferred issue form:

- `https://github.com/tii-mom/KAIRO/issues/new?template=private-beta-feedback.yml`

Include:

- Role: Builder / Supporter / Admin / Project owner.
- Page URL.
- What happened.
- Expected behavior.
- Screenshot or short video link when useful.
- Severity: blocker / major / minor / idea.
- Optional wallet, social handle, or contact if follow-up is needed.

Severity levels:

- Blocker: cannot complete a core beta flow or production data is unavailable.
- Major: core flow works only with confusing state, incorrect data, or repeated retries.
- Minor: copy, layout, or clarity issue.
- Idea: product or workflow suggestion for later.

Do not include private keys, seed phrases, sensitive personal data, non-public credentials, or confidential project data.

## Feedback Triage

Operator cadence:

- Review new beta feedback at least once per beta day.
- Label valid issues with `beta-feedback` and one severity label: `severity:blocker`, `severity:major`, `severity:minor`, or `severity:idea`.
- Add one owner or next action before closing the triage pass.

Severity response:

- Blocker: pause new invites, reproduce immediately, and either fix or document a workaround before continuing.
- Major: keep beta running only if a clear workaround exists; prioritize before expanding the cohort.
- Minor: batch into polish work unless it affects compliance, safety, or core comprehension.
- Idea: keep for post-beta planning unless it clarifies the current Phase 0 workflow.

Close criteria:

- The issue has a verified fix, a documented workaround, or an explicit decision to defer.
- Any production fix has passed `npm run verify:production`.
- If the issue touches public copy, `npm run verify:copy` passes.

## Known Limitations

- Demo identity/session behavior is still used.
- Admin access uses demo role headers plus the `ADMIN_API_TOKEN` shared secret for controlled beta operations.
- Seed content is still partially demo content.
- Full authentication is not implemented yet.
- No analytics pipeline is implemented yet.
- The extra `kairo-api-prod` Worker exists but is not the current production path.

## Go/No-Go Checklist

- Production Worker healthy.
- Pages healthy.
- Production D1 populated.
- Production D1 backup/export captured before real content import.
- Real beta content import SQL reviewed before applying.
- Boost works.
- Proof of Support works.
- Leaderboard works.
- Admin 403/200 check works.
- Admin API requires `x-kairo-admin-token` in production.
- `ADMIN_API_TOKEN="..." npm run verify:production` passes.
- `ADMIN_API_TOKEN="..." npm run verify:beta:go-live` passes on `https://kairo.cfd`.
- `npm run verify:operations` passes before claiming operator readiness for a live beta cohort.
- Forbidden copy scanner passes.
- Beta feedback issue form exists and operator triage cadence is assigned.
- Operators understand admin auth limitations.
- `docs/BETA_COHORT_OPERATIONS.md` is current before the first external invite.
- Production D1 backup/export is captured before real beta data replaces seed/demo data.

## D1 Backup And Import Procedure

Before importing real beta content, capture an export or backup from Cloudflare D1. The repo includes a read-only snapshot helper:

```bash
npm run db:backup:remote
```

The command writes a timestamped JSON snapshot under `backups/d1/`, which is ignored by git. By default it captures production table counts as a fast pre-import guard. Set `KAIRO_D1_BACKUP_INCLUDE_ROWS=1` to include table rows when an operator needs a fuller local export. Record the filename, timestamp, and operator in the beta notes. If the Cloudflare dashboard provides a native D1 backup/export for the account, capture that too.

Recommended import path:

1. Run `npm run db:backup:remote` and record the snapshot filename.
2. Copy `content/beta-import.example.json` into a dated local working file.
3. Replace placeholder entries with reviewed real Catalysts, Dormant Giants, Builder submissions, and Funding Events.
4. Run `node scripts/verify-beta-import.mjs <input.json>`.
5. Run `node scripts/generate-beta-import-sql.mjs <input.json> <output.sql>`.
6. Review generated SQL for public-safe wording and correct IDs.
7. Apply the SQL with `npx wrangler d1 execute kairo-prod --remote --env production --file=<output.sql>`.
8. Re-run row-count checks and open the affected production pages.

Stop the import if any record includes private keys, sensitive personal data, confidential reward evidence, price predictions, trading instructions, or unreviewed sponsor claims.

## Admin Operator Access

Production admin requests require both:

- `x-kairo-role: admin`
- `x-kairo-admin-token` matching the Worker `ADMIN_API_TOKEN` secret

Set or rotate the production token with:

```bash
npx wrangler secret put ADMIN_API_TOKEN --env production
```

Operator guidance:

- Share the token only with the 1-2 beta operators.
- Enter the token in `/admin`; it is stored only in browser `sessionStorage`.
- Rotate the token if it is shared in the wrong channel.
- Replace this shared-token gate with stronger operator auth before open beta or public launch.
