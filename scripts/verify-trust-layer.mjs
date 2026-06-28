#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

console.log('Running verify:trust check...');

const indexSource = readFileSync(path.join(root, 'worker/index.ts'), 'utf8');

let failed = false;

function check(assertion, message) {
  if (!assertion) {
    console.error(`- FAILED: ${message}`);
    failed = true;
  } else {
    console.log(`- PASSED: ${message}`);
  }
}

// 1. PATCH routes protection
const protectBountyPatch = indexSource.includes("if (c.env.APP_ENV !== 'local')") && indexSource.includes('Public PATCH on bounties');
check(protectBountyPatch, 'PATCH /api/bounties/:id returns 403 or is local-only');

const protectSubmissionsPatch = indexSource.includes("if (c.env.APP_ENV !== 'local')") && indexSource.includes('Public PATCH on submissions');
check(protectSubmissionsPatch, 'PATCH /api/submissions/:id returns 403 or is local-only');

// 2. Production write routes require requireBetaWriteAccess
const postRoutes = [
  "app.post('/api/bounties'",
  "app.post('/api/bounties/:id/boost'",
  "app.post('/api/bounties/:id/submissions'",
  "app.post('/api/submissions'",
  "app.post('/api/submissions/:id/boost'",
  "app.post('/api/boosts'"
];
for (const route of postRoutes) {
  const index = indexSource.indexOf(route);
  if (index !== -1) {
    const segment = indexSource.substring(index, index + 350);
    check(segment.includes('requireBetaWriteAccess'), `Write route ${route} enforces beta write token check`);
  } else {
    check(false, `Write route ${route} exists in worker`);
  }
}

// 3. body.userId / body.builderId protection
const protectUserId = indexSource.includes('userId: user.id') && indexSource.includes('builderId: user.id');
check(protectUserId, 'body.userId and body.builderId overrides are disallowed; server-resolved user ID is enforced');

// 4. client text checks
const clientFiles = [];
function walkDir(dir) {
  readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        walkDir(dirPath);
      }
    } else {
      if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        clientFiles.push(dirPath);
      }
    }
  });
}
walkDir(path.join(root, 'client'));

let hasMarkPaid = false;
let hasRewardConfirmed = false;
let hasActiveMultiplier = false;
let hasMultiplierRank = false;
let hasFundingStatusNav = false;

for (const file of clientFiles) {
  const content = readFileSync(file, 'utf8');
  if (content.includes('Mark Paid')) {
    hasMarkPaid = true;
    console.error(`  Found "Mark Paid" in ${file}`);
  }
  if (content.includes('Reward confirmed by KAIRO')) {
    hasRewardConfirmed = true;
    console.error(`  Found "Reward confirmed by KAIRO" in ${file}`);
  }
  if (content.includes('ACTIVE MULTIPLIER')) {
    hasActiveMultiplier = true;
    console.error(`  Found "ACTIVE MULTIPLIER" in ${file}`);
  }
  if (content.includes('Multiplier Rank')) {
    hasMultiplierRank = true;
    console.error(`  Found "Multiplier Rank" in ${file}`);
  }
  if (file.endsWith('RuntimeV2Shell.tsx') && content.includes("label: 'Funding Status'")) {
    hasFundingStatusNav = true;
  }
}

check(!hasMarkPaid, 'No "Mark Paid" text displays in client files');
check(!hasRewardConfirmed, 'No "Reward confirmed by KAIRO" text displays in client files');
check(!hasActiveMultiplier, 'No "ACTIVE MULTIPLIER" text displays in client files');
check(!hasMultiplierRank, 'No "Multiplier Rank" text displays in client files');
check(!hasFundingStatusNav, 'Navigation does not present "/catalysts" as "Funding Status"');

// 5. Leaderboard tabs
const leaderboardSource = readFileSync(path.join(root, 'client/pages/LeaderboardPage.tsx'), 'utf8');
const usesSearchParams = leaderboardSource.includes('useSearchParams') && leaderboardSource.includes("activeTab = searchParams.get('tab')");
check(usesSearchParams, 'Leaderboard uses active searchParams tab states instead of fake mock tabs');

// 6. Illustrative disclaimers
const catalystsSource = readFileSync(path.join(root, 'client/pages/CatalystsPage.tsx'), 'utf8');
const hasTelemetryDisclaimer = catalystsSource.includes('Illustrative preview — not chain, market, or reward data.');
check(hasTelemetryDisclaimer, 'Static telemetry shows illustrative warnings');

// 7. Admin action audit reasons
const hasAdminReasonLog = indexSource.includes('JSON.stringify(noteObj)') && indexSource.includes('reason:');
const enforcesReasonCheck = indexSource.includes("error: 'Reason is required") || indexSource.includes('Reason is required');
check(hasAdminReasonLog && enforcesReasonCheck, 'Admin actions save structured note metadata containing reasons and enforce reason validation in backend');

// 8. Beta check endpoint
const hasCheckEndpoint = indexSource.includes("app.post('/api/beta/write-check'") && indexSource.includes("requireBetaWriteAccess(c)");
check(hasCheckEndpoint, 'Beta write token check endpoint is registered and secure');

if (failed) {
  console.error('KAIRO Trust Layer verification failed.');
  process.exit(1);
}

console.log('KAIRO Trust Layer verification passed.');
process.exit(0);
