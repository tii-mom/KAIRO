# KAIRO MVP End-to-End Product Smoke Test Plan (V1)

This document provides a systematic checklist to verify the stability, compliance, and user workflows of the KAIRO platform prior to launch.

---

## 1. Environment & Setup

- **Beta Domain**: `https://kairo.cfd`
- **Preview Staging**: Deploy branch staging link (e.g., `https://afde3711.kairo-5vg.pages.dev`)
- **Local Dev Server**: `npm run dev` (usually binds to `http://localhost:3000`)
- **Local API Endpoint**: `http://localhost:8787`

---

## 2. E2E Manual Test Matrix

Perform these validations across three viewports: **1440px (Desktop)**, **768px (Tablet)**, and **375px (Mobile)**.

### Page Loading & Navigation
- `[ ]` Load `/` (Homepage). Verify grid background, live telemetry counters animate up, and signal boards render.
- `[ ]` Load `/catalysts` (Registry list). Confirm all available catalyst lanes show.
- `[ ]` Load `/catalysts/bounty-demo-1` (Catalyst Detail). Check that Project Profile metadata rows display.
- `[ ]` Load `/create-catalyst` (Ignite Flow). Verify 5-step track layout.
- `[ ]` Load `/leaderboard` (The Grid). Confirm ranks 1, 2, and 3 cards show glowing medal designs.
- `[ ]` Load `/proof` (Supporter Dashboard). Check metric summary cards load.
- `[ ]` Load `/admin` (Governance Hub). Confirm lane layouts load.

### Core User Flows
- `[ ]` **Boost Action**: Open a catalyst detail page, click "Boost Catalyst". Verify that the button performs a brief glow pulse animation upon successful API resolution.
- `[ ]` **Create Flow**: Fill out the 5-step form in `/create-catalyst`. Confirm validations work at Step 1 and 2, and submitting successfully redirects to the new detail page.
- `[ ]` **Submit Solution**: Open active catalyst, fill builder solution proof details.

### Safety & Compliance Audits
- `[ ]` **No Fake Address**: Confirm empty `tokenContractAddress` displays as `"Pending verification / Not provided"` with Copy disabled.
- `[ ]` **No Fake Reward**: Check that empty reward pools display `"Reward record pending"` instead of hardcoded numbers.
- `[ ]` **No Dead Links**: Verify footer links route cleanly inside the app.
- `[ ]` **Reduced Motion**: Enable "Reduce Motion" in OS settings. Confirm 3D card tilt and counter animations freeze instantly.

---

## 3. Automated Telemetry Validations

Run these commands locally before commits or deployments:
```bash
# 1. Lint and Type check compilation
npm run lint

# 2. Build production assets
npm run build

# 3. Scan codebase for compliance copy rules
npm run verify:copy

# 4. Check routing tables
npm run verify:routes

# 5. Verify local D1 tables and API status
npm run verify:production

# 6. Check beta content for production safety
npm run verify:real-beta-content
```
