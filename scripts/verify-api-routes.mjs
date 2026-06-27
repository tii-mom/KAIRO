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
  'client/pages/BetaPage.tsx',
  'client/pages/FeedbackPage.tsx',
  'client/pages/ProofOfSupportPage.tsx',
  'client/pages/LeaderboardPage.tsx',
  'client/pages/DormantGiantsPage.tsx',
  'client/pages/CreateCatalystPage.tsx',
  'client/pages/SubmitProjectPage.tsx',
  'client/pages/SubmissionDetailPage.tsx',
];
const staticRoutes = ['/beta', '/feedback'];
const docs = ['docs/PRIVATE_BETA_RUNBOOK.md', 'docs/BETA_CONTENT_PLAN.md'];

const missingRoutes = routes.filter((route) => !workerSource.includes(`'${route}'`) && !workerSource.includes(`"${route}"`));
const missingPages = pages.filter((page) => !existsSync(path.join(root, page)));
const routerSource = readFileSync(path.join(root, 'client/AppRouter.tsx'), 'utf8');
const missingStaticRoutes = staticRoutes.filter((route) => !routerSource.includes(`path="${route}"`) && !routerSource.includes(`path='${route}'`));
const missingDocs = docs.filter((doc) => !existsSync(path.join(root, doc)));

if (missingRoutes.length || missingPages.length || missingStaticRoutes.length || missingDocs.length) {
  console.error('KAIRO API route verification failed.');
  missingRoutes.forEach((route) => console.error(`- Missing Worker route: ${route}`));
  missingPages.forEach((page) => console.error(`- Missing client page: ${page}`));
  missingStaticRoutes.forEach((route) => console.error(`- Missing client route: ${route}`));
  missingDocs.forEach((doc) => console.error(`- Missing beta document: ${doc}`));
  process.exit(1);
}

console.log('KAIRO API route verification passed.');
console.log(`Verified ${routes.length} Worker routes, ${pages.length} client pages, ${staticRoutes.length} beta routes, and ${docs.length} beta docs.`);
