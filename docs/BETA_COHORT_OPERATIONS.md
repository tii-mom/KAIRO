# KAIRO Beta Cohort Operations

Date: 2026-06-27

Use this document as the live operating sheet for the first invite-only beta cohort. Do not store private keys, seed phrases, confidential evidence, or sensitive personal data here.

## Current Beta Entry

- Current Pages URL: `https://kairo.cfd`
- API path: same-origin `/api/*`
- Feedback form: `https://github.com/tii-mom/KAIRO/issues/new?template=private-beta-feedback.yml`
- Required gate before invites:

```bash
KAIRO_PAGES_URL="https://kairo.cfd" KAIRO_API_BASE_URL="https://kairo.cfd" ADMIN_API_TOKEN="..." npm run verify:beta:go-live
```

The custom domain is now live on `kairo.cfd`. Continue to use the gate above before each invite batch.

For true operator readiness, also run:

```bash
npm run verify:operations
```

## Operator Roster

Record only role names or public handles.

| Role | Owner | Backup | Notes |
| --- | --- | --- | --- |
| Beta lead | tii-mom | tii-mom | Temporary single-handle coverage for batch 0 only; assign a distinct backup before expanding invites. |
| Admin operator | tii-mom | tii-mom | Holds `ADMIN_API_TOKEN`; temporary single-handle coverage for internal smoke only. |
| Feedback triage | tii-mom | tii-mom | Reviews new feedback once per beta day until a separate triage owner is assigned. |
| Content reviewer | tii-mom | tii-mom | Reviews Catalyst/Dormant Giant wording before import; separate reviewer still preferred before scale-up. |

## Cohort Targets

Start smaller than the maximum target and expand only after the daily go/no-go check passes.

| Group | First wave | Target range | Invite status |
| --- | ---: | ---: | --- |
| Builders | 2-3 | 5-10 | Not started |
| Supporters | 5-10 | 20-50 | Not started |
| Catalysts | 1-2 | 3-5 | Not started |
| Dormant Giant candidates | 5 | 10-20 | Not started |
| Admin operators | 1 | 1-2 | Not started |

## Invite Batch Log

| Date | Batch | Group | Count | Gate passed? | Notes |
| --- | --- | --- | ---: | --- | --- |
| 2026-06-27 | 0 | Internal operators | 1 | Yes | Production smoke, admin gate, custom domain, and beta go-live checks passed on `kairo.cfd`; no external invites sent yet. |
| TBD | 1 | Builders + supporters | 5-10 | TBD | Expand only if no blocker feedback. |

## Daily Operator Loop

Run this once per beta day:

1. Run `npm run verify:beta:go-live` with the current Pages URL and admin token.
2. Check GitHub beta feedback issues.
3. Label each valid issue with `beta-feedback` and one severity label.
4. Confirm no blocker or unresolved major issue affects core flows.
5. Check `/admin` with the admin token from a trusted operator browser.
6. Record any content imports, admin changes, or workaround decisions.
7. Decide: pause, continue same cohort, or expand next batch.

## Pause Conditions

Pause new invites if any of these happen:

- API health fails.
- D1-backed bounties are unavailable.
- Admin no-token request returns anything other than `403`.
- A Boost or submission mutation creates incorrect or duplicate public state.
- A beta tester reports investment, trading, guaranteed reward, custody, or token-launch confusion caused by public copy.
- A blocker issue is open without a workaround.

## Expand Conditions

Expand the cohort only when all are true:

- `npm run verify:beta:go-live` passes.
- No blocker issue is open.
- Major issues have owners and workarounds.
- At least one Builder and one Supporter completed their core flows.
- Feedback triage has been reviewed within the last beta day.

## Content Import Notes

Before importing real content:

1. Run `npm run db:backup:remote`.
2. Record the generated snapshot filename.
3. Run `npm run content:beta:verify`.
4. Review `content/beta-import.generated.sql` for public-safe wording.
5. Apply only reviewed content.
6. Re-run `npm run verify:beta:go-live`.

| Date | Snapshot file | Import file | Operator | Result |
| --- | --- | --- | --- | --- |
| 2026-06-27 | kairo-prod-snapshot-2026-06-27T09-35-34-518Z.json | beta-import.template.json (not applied) | tii-mom | No approved real beta content batch is available in-repo; template and operator docs were updated, and live apply remains blocked pending project-owner or content-reviewer approval. |
| 2026-06-28 | kairo-prod-snapshot-2026-06-28T04-07-58-383Z.json | N/A | tii-mom | blocked (approved real beta content missing) |

## Exit Criteria For Private Beta

Private beta can move toward open beta or public launch planning only after:

- Core Builder, Supporter, and Admin flows are completed by real users.
- Feedback triage has no unresolved blockers.
- Real content import flow is proven with backup and post-import verification.
- A custom domain is bound and verified.
- Stronger operator auth is planned or implemented for post-beta operations.
- Public copy still passes `npm run verify:copy`.
