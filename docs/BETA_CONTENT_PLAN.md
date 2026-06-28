# KAIRO Beta Content Plan

Date: 2026-06-27

This plan prepares real beta content without introducing investment, trading, yield, token launch, custody, or guaranteed upside claims.

## Dormant Giant Candidate Template

- Token name:
- Symbol:
- Chain:
- Contract/source link:
- Why dormant:
- Community status:
- Suggested Catalyst angle:
- Risk notes:
- Public-safe description:

## Catalyst Template

- Title:
- Token/project:
- Problem:
- Desired demo:
- Success criteria:
- Reward text:
- Deadline:
- Contact:
- `funding_status`:
- Admin notes:

## Builder Submission Template

- Demo name:
- Builder name:
- Demo URL:
- GitHub URL:
- Video URL:
- Screenshot URL:
- What it solves:
- Implementation status:
- Next steps:

## Reward Record / Funding Event Template

- Event type:
- Title:
- Description:
- Evidence link:
- Status:
- Public-safe wording:

## First Dormant Giants Placeholder List

1. DORM Signal Network
2. Ember DAO
3. Pixel Grove
4. Atlas Mesh
5. Lumen Trust
6. Orbit Forge
7. Nova Commons
8. Harbor Guild
9. Echo Blocks
10. Meridian Club
11. Alloy Market
12. Keystone Labs
13. Prism Chain
14. Foundry Social
15. Grove Vault
16. Vector Garden
17. Signal Reef
18. Northstar DAO
19. Relay Habitat
20. Civic Mesh

## First Catalyst Placeholder List

1. Build the DORM Telegram Signal Mini App.
2. Ember DAO Contributor Reputation Dashboard.
3. Pixel Grove UGC Quest Engine.
4. Atlas Mesh Dormant Wallet Indexer.
5. Lumen Trust Proof Freshness Widget.

## Content Review Checklist

- Catalyst asks for a concrete demo or workflow.
- Public copy avoids price predictions and upside claims.
- Reward text is conditional, evidence-backed, and not guaranteed by KAIRO.
- Funding Status is not described as custody, escrow, or a financial service.
- Dormant Giant notes include risk context and source links.
- Builder submissions include verifiable demo, repository, video, or screenshot links.
- Admin notes separate private review context from public-safe wording.
- No investment, swap, trading, token launch, yield, custody, or guaranteed airdrop language is present.

## Import Workflow

Use `content/beta-import.template.json` as the working template for real beta content. Keep each batch small enough for review: 3-5 Catalysts, 10-20 Dormant Giants, and only verified Builder submissions.

Do not apply `content/beta-import.example.json` or `content/beta-import.reviewed-2026-06-27.json` to production. Both remain placeholder/example content and are not approved operating data.

Approval rule:

- Real beta content must be approved by the project owner or the assigned content reviewer before `--apply`.
- The approval source should be recorded in the reviewed JSON metadata or the operator notes.
- If approved real content is not available, stop before apply and keep the operations launch blocked.
- Checked on 2026-06-28: No approved real beta content was provided, so no reviewed-real JSON was created and the import workflow remains blocked.

JSON shape reference:

| Section | Runtime key | Required import fields |
| --- | --- | --- |
| Dormant Giants | `tokens[]` | `id`, `name`, `symbol`, `chain`, `contractAddress`, `websiteUrl`, `twitterUrl`, `telegramUrl`, `status` |
| Catalysts | `catalysts[]` | `id`, `tokenId`, `createdBy`, `title`, `description`, `rewardText`, `rewardType`, `fundingStatus`, `contactInfo`, `deadline`, `status`, `featured` |
| Builder submissions | `submissions[]` | `id`, `bountyId`, `builderId`, `name`, `tagline`, `demoUrl`, `githubUrl`, `videoUrl`, `screenshotUrl`, `description`, `status`, `deliveryStatus` |
| Curated runtime placements | `curatedItems[]` | `id`, `itemType`, `placement`, `targetType`, `targetId`, `title`, `description`, `imageUrl`, `externalUrl`, `sortOrder`, `status` |
| Reward Records / Funding Events | `fundingEvents[]` | `id`, `bountyId`, `actorId`, `eventType`, `amountText`, `proofUrl`, `note` |

Generate reviewable SQL:

```bash
node scripts/verify-beta-import.mjs content/<reviewed-file>.json
node scripts/generate-beta-import-sql.mjs content/<reviewed-file>.json content/<reviewed-file>.sql
```

Or run the full reviewed-content prepare flow in one step:

```bash
npm run content:beta:import
```

That workflow captures a fresh D1 snapshot, verifies the reviewed JSON, and regenerates the reviewed SQL without applying production writes.

Operator help:

```bash
npm run content:beta:import -- --help
```

The verify command checks references, public-safe wording, obvious secret leakage, URL shape, and placeholder/example-domain warnings. The SQL command writes `content/beta-import.generated.sql`. Review the generated SQL before applying it to D1.

Capture a read-only production snapshot before applying real beta content:

```bash
npm run db:backup:remote
```

Use `KAIRO_D1_BACKUP_INCLUDE_ROWS=1 npm run db:backup:remote` when the operator needs a fuller local row export in addition to the default table-count snapshot.

Apply only after backup/export and review:

```bash
npx wrangler d1 execute kairo-prod --remote --env production --file=content/beta-import.generated.sql
```

When a reviewed file is ready for production apply, use:

```bash
node scripts/import-beta-content.mjs content/<reviewed-file>.json --apply
```

You can also route through npm while keeping the same arguments:

```bash
npm run content:beta:import -- content/<reviewed-file>.json --apply
```

The import script now refuses `--apply` for files that still look like example/template content or still contain obvious placeholder/example markers.

Post-import checks:

```bash
npx wrangler d1 execute kairo-prod --remote --env production --command "SELECT COUNT(*) AS count FROM tokens;"
npx wrangler d1 execute kairo-prod --remote --env production --command "SELECT COUNT(*) AS count FROM bounties;"
npx wrangler d1 execute kairo-prod --remote --env production --command "SELECT COUNT(*) AS count FROM submissions;"
npx wrangler d1 execute kairo-prod --remote --env production --command "SELECT item_type, COUNT(*) AS count FROM curated_items GROUP BY item_type;"
```

Do not commit real private contact details, sensitive links, or unreviewed evidence URLs into the repository.
