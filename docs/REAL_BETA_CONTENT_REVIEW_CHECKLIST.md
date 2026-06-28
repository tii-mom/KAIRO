# KAIRO Real Beta Content Review Checklist

Use this checklist to review all content batches before creating JSON files and applying them to the production database.

---

## 1. Source Verification Checklist
- [ ] Every project, builder, and sponsor has a verifiable identity or source handle.
- [ ] Website URLs, GitHub repositories, and social handles are verified to resolve and belong to the correct entities.
- [ ] No unverified facts, rumors, or unconfirmed metrics are included in the public descriptions.

## 2. Public Display Permission Checklist
- [ ] The project owner, builder, or community lead has explicitly confirmed that their information can be publicly displayed on the KAIRO platform.
- [ ] Contact details, telegram handles, or email addresses intended to remain private are excluded from the public fields.

## 3. Risk Note Checklist
- [ ] Dormant Giants entries include a objective risk note describing why the token/project is currently inactive.
- [ ] Catalysts include details regarding technical challenges or potential barriers to completion.
- [ ] No speculative wording regarding the success or potential price recovery of any project is present.

## 4. Reward Evidence Checklist
- [ ] Any mentioned reward or catalyst bounty has concrete, publicly auditable evidence (e.g., transaction hash, multisig wallet address, or official forum post).
- [ ] If no evidence is available, the reward status is explicitly marked as "unfunded" or "sponsor claim recorded".
- [ ] KAIRO itself is never listed as the source or guarantor of rewards or funding.

## 5. Forbidden Copy Checklist
- [ ] The text has been scanned and contains **NONE** of the following forbidden words or concepts:
  - **Forbidden Words**: `APY`, `ROI`, `yield`, `guaranteed reward`, `guaranteed airdrop`, `price prediction`, `market cap prediction`, `invest`, `investment`, `investor`, `buy`, `sell`, `swap`, `KAIRO confirmed payment`, `KAIRO guaranteed reward`, `KAIRO custody`, `KAIRO escrow`, `KAIRO verified payment`.
  - **Forbidden Concepts**: Investment advice, price predictions, market cap predictions, yield/return promises, airdrop guarantees, buy/sell recommendations, token exchange/swap instructions, custody or escrow promises, unverified facts.

## 6. Recommended Safe Wording Checklist
- [ ] Safe, descriptive terms are used in place of high-risk operational language:
  - Use `Catalyst` or `Builder task` instead of bounty/investment contract.
  - Use `community signal` or `Proof of Support` instead of market signal or staking proof.
  - Use `External Reward Evidence`, `Evidence attached`, or `Sponsor claim recorded` instead of confirmed reward/payment.
  - Use `Externally reported complete` or `public evidence` instead of certified payment.
  - Use statements like `"KAIRO does not hold or control funds"` and `"KAIRO does not guarantee rewards or airdrops"` when describing rewards or funding statuses.

## 7. Reviewer Sign-Off Checklist
- [ ] The content reviewer has recorded their handle and reviewed timestamp.
- [ ] An admin action justification note is prepared to document the operational review reason when configuring the curated items.

## 8. Final Approval Checklist
- [ ] The project owner or the lead content reviewer has explicitly signed off on the exact text and metadata.
- [ ] Baseline verification scripts pass:
  ```bash
  node scripts/verify-real-beta-content-readiness.mjs content/<reviewed-file>.json
  node scripts/verify-beta-import.mjs content/<reviewed-file>.json
  npm run verify:copy
  npm run verify:trust
  ```
