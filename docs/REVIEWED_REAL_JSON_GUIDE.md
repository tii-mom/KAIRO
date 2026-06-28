# Reviewed Real JSON Guide

This guide explains how to prepare, verify, and apply the real beta content JSON file to the production database when approved content is provided.

---

## 1. Conditions and Naming

1. **Approved Content Requirement**: Do **NOT** create this file until the project owner or assigned content reviewer has explicitly approved the real beta content and completed the checks in [REAL_BETA_CONTENT_REVIEW_CHECKLIST.md](file:///Users/yudeyou/Desktop/KAIRO/KAIRO/docs/REAL_BETA_CONTENT_REVIEW_CHECKLIST.md).
2. **File Name Format**: Create a new file with the date of review:
   `content/beta-import.reviewed-real-YYYY-MM-DD.json`
   *Example*: `content/beta-import.reviewed-real-2026-06-28.json`
3. **No Placeholders**: Do **NOT** use dummy data, example links, or placeholder addresses.
4. **No Auto-Generation**: Do **NOT** run auto-seed scripts to fabricate content. All records must represent real-world projects and tasks.
5. **Do Not Overwrite Templates**: Do **NOT** overwrite or edit the following baseline files:
   - `content/beta-import.example.json`
   - `content/beta-import.template.json`
   - `content/beta-import.real-template.json`
   - `content/beta-import.reviewed-2026-06-27.json`

---

## 2. Execution Workflow

When the real JSON file is created, run the following verification and import steps in order:

### Step 1: Content Compliance & Format Checks
Run the readiness and validation scripts to verify that schema requirements, safety constraints, and forbidden copy scans all pass:
```bash
node scripts/verify-real-beta-content-readiness.mjs content/beta-import.reviewed-real-YYYY-MM-DD.json
node scripts/verify-beta-import.mjs content/beta-import.reviewed-real-YYYY-MM-DD.json
```

### Step 2: Content Import Dry-Run
Run a dry-run check to verify the database import script without writing to the production database:
```bash
npm run content:beta:import -- content/beta-import.reviewed-real-YYYY-MM-DD.json
```

### Step 3: Production D1 Backup
Always run a remote D1 database backup immediately before executing any live write command:
```bash
npm run db:backup:remote
```
Record the resulting backup file path and timestamp.

### Step 4: Apply Production Import
Apply the real content to the production D1 database:
```bash
npm run content:beta:import -- content/beta-import.reviewed-real-YYYY-MM-DD.json --apply
```

### Step 5: Post-Import Operations Gate Verification
Verify that the `verify:operations` check is now fully green and all other gates pass:
```bash
env $(grep -v '^#' .env | xargs) node scripts/verify-operations-readiness.mjs
```
Confirm that the live website at `https://kairo.cfd` displays the imported content correctly.
