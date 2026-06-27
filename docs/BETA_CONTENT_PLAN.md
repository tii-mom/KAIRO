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

Use `content/beta-import.example.json` as the working template for real beta content. Keep each batch small enough for review: 3-5 Catalysts, 10-20 Dormant Giants, and only verified Builder submissions.

Generate reviewable SQL:

```bash
npm run content:beta:sql
```

The command writes `content/beta-import.generated.sql`. Review the generated SQL before applying it to D1.

Apply only after backup/export and review:

```bash
npx wrangler d1 execute kairo-prod --remote --env production --file=content/beta-import.generated.sql
```

Post-import checks:

```bash
npx wrangler d1 execute kairo-prod --remote --env production --command "SELECT COUNT(*) AS count FROM tokens;"
npx wrangler d1 execute kairo-prod --remote --env production --command "SELECT COUNT(*) AS count FROM bounties;"
npx wrangler d1 execute kairo-prod --remote --env production --command "SELECT COUNT(*) AS count FROM submissions;"
npx wrangler d1 execute kairo-prod --remote --env production --command "SELECT item_type, COUNT(*) AS count FROM curated_items GROUP BY item_type;"
```

Do not commit real private contact details, sensitive links, or unreviewed evidence URLs into the repository.
