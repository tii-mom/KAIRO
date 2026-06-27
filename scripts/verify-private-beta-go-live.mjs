#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const pagesUrl = process.env.KAIRO_PAGES_URL || 'https://e43fa2e9.kairo-5vg.pages.dev';
const apiBaseUrl = process.env.KAIRO_API_BASE_URL || pagesUrl;
const adminToken = process.env.ADMIN_API_TOKEN || '';
const customDomain = process.env.KAIRO_CUSTOM_DOMAIN || '';

const checks = [];

function record(status, name, detail) {
  checks.push({ status, name, detail });
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 300000,
    ...options,
  });
}

function requireFile(path) {
  if (existsSync(path)) record('pass', `File ${path}`, 'present');
  else record('fail', `File ${path}`, 'missing');
}

async function fetchText(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  return { response, text };
}

async function checkUrl(name, url, expectedStatus = 200, init) {
  try {
    const { response, text } = await fetchText(url, init);
    if (response.status !== expectedStatus) {
      throw new Error(`expected ${expectedStatus}, got ${response.status}: ${text.slice(0, 160)}`);
    }
    record('pass', name, `${response.status} ${url}`);
    return text;
  } catch (error) {
    record('fail', name, error instanceof Error ? error.message : String(error));
    return '';
  }
}

async function main() {
  if (adminToken) record('pass', 'ADMIN_API_TOKEN', 'present in environment');
  else record('fail', 'ADMIN_API_TOKEN', 'missing; source .env or pass ADMIN_API_TOKEN before go-live');

  requireFile('docs/PRIVATE_BETA_RUNBOOK.md');
  requireFile('docs/BETA_CONTENT_PLAN.md');
  requireFile('docs/LAUNCH_CHECKLIST.md');
  requireFile('.github/ISSUE_TEMPLATE/private-beta-feedback.yml');

  await checkUrl('Pages root', pagesUrl);
  await checkUrl('Beta route', `${pagesUrl}/beta`);
  await checkUrl('Feedback route', `${pagesUrl}/feedback`);
  await checkUrl('API health', `${apiBaseUrl}/api/health`);
  const bountiesText = await checkUrl('D1-backed bounties API', `${apiBaseUrl}/api/bounties`);
  try {
    const bounties = JSON.parse(bountiesText);
    const count = Array.isArray(bounties.data) ? bounties.data.length : 0;
    if (count >= 8) record('pass', 'Bounty count', String(count));
    else record('fail', 'Bounty count', `expected >= 8, got ${count}`);
  } catch {
    record('fail', 'Bounty count', 'unable to parse API response');
  }

  await checkUrl('Admin forbidden without role', `${apiBaseUrl}/api/admin/stats`, 403);
  await checkUrl('Admin forbidden without token', `${apiBaseUrl}/api/admin/stats`, 403, {
    headers: {
      'x-kairo-role': 'admin',
      'x-kairo-user-id': 'user-demo-admin',
    },
  });

  if (adminToken) {
    await checkUrl('Admin allowed with token', `${apiBaseUrl}/api/admin/stats`, 200, {
      headers: {
        'x-kairo-role': 'admin',
        'x-kairo-user-id': 'user-demo-admin',
        'x-kairo-admin-token': adminToken,
      },
    });
  }

  const copy = run('npm', ['run', 'verify:copy']);
  if (copy.status === 0) record('pass', 'Forbidden copy scanner', 'passed');
  else record('fail', 'Forbidden copy scanner', copy.stderr || copy.stdout || `exit ${copy.status}`);

  const routes = run('npm', ['run', 'verify:routes']);
  if (routes.status === 0) record('pass', 'Route verifier', 'passed');
  else record('fail', 'Route verifier', routes.stderr || routes.stdout || `exit ${routes.status}`);

  const backup = run('npm', ['run', 'db:backup:remote']);
  if (backup.status === 0) record('pass', 'Production D1 snapshot', 'created');
  else record('fail', 'Production D1 snapshot', backup.stderr || backup.stdout || `exit ${backup.status}`);

  if (customDomain) {
    await checkUrl('Custom domain root', `https://${customDomain}`);
  } else {
    record('warn', 'Custom domain', 'not configured; acceptable for invite-only beta, required before public launch');
  }

  for (const check of checks) {
    const label = check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL';
    console.log(`${label} ${check.name}: ${check.detail}`);
  }

  const failures = checks.filter((check) => check.status === 'fail');
  if (failures.length) {
    console.error(`Private beta go-live gate failed: ${failures.length} failing check(s).`);
    process.exit(1);
  }

  console.log('Private beta go-live gate passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
