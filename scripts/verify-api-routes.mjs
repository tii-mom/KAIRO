#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const workerSource = readFileSync(path.join(root, 'worker/index.ts'), 'utf8');
const api = '/api';
const admin = `${api}/admin`;
const routes = [
  `${api}/health`,
  `${api}/bounties`,
  `${api}/bounties/:id`,
  `${api}/bounties/:id/boost`,
  `${api}/bounties/:id/submissions`,
  `${api}/submissions/:id`,
  `${api}/submissions/:id/boost`,
  `${api}/support/proof/me`,
  `${api}/support/events/me`,
  `${api}/support/points/me`,
  `${api}/leaderboard`,
  `${admin}/bounties`,
  `${admin}/submissions`,
  `${admin}/boosts`,
  `${admin}/support-events`,
  `${admin}/curated-items`,
  `${admin}/stats`,
];
const pages = [
  'client/pages/AdminPage.tsx',
  'client/pages/ProofOfSupportPage.tsx',
  'client/pages/LeaderboardPage.tsx',
  'client/pages/DormantGiantsPage.tsx',
  'client/pages/CreateCatalystPage.tsx',
  'client/pages/SubmitProjectPage.tsx',
  'client/pages/SubmissionDetailPage.tsx',
];

const missingRoutes = routes.filter((route) => !workerSource.includes(`'${route}'`) && !workerSource.includes(`"${route}"`));
const missingPages = pages.filter((page) => !existsSync(path.join(root, page)));

if (missingRoutes.length || missingPages.length) {
  console.error('KAIRO API route verification failed.');
  missingRoutes.forEach((route) => console.error(`- Missing Worker route: ${route}`));
  missingPages.forEach((page) => console.error(`- Missing client page: ${page}`));
  process.exit(1);
}

console.log('KAIRO API route verification passed.');
console.log(`Verified ${routes.length} Worker routes and ${pages.length} client pages.`);
