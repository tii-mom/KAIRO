#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const workerUrl = process.env.KAIRO_WORKER_URL || 'https://kairo-worker-prod.348421501.workers.dev';
const pagesUrl = process.env.KAIRO_PAGES_URL || 'https://be52293d.kairo-5vg.pages.dev';
const adminToken = process.env.ADMIN_API_TOKEN || '';
const minCounts = {
  users: 3,
  tokens: 8,
  bounties: 8,
  submissions: 8,
  boosts: 20,
  support_events: 10,
  curated_items: 8,
};

const results = [];

function pass(name, detail) {
  results.push({ status: 'pass', name, detail });
}

function skip(name, detail) {
  results.push({ status: 'skip', name, detail });
}

function fail(name, error) {
  results.push({ status: 'fail', name, detail: error instanceof Error ? error.message : String(error) });
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
}

async function checkHttp(name, url, expectedStatus, init) {
  const { response, body } = await fetchJson(url, init);
  if (response.status !== expectedStatus) {
    throw new Error(`expected ${expectedStatus}, got ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }
  return body;
}

function d1Counts() {
  const tables = Object.keys(minCounts);
  const countQuery = tables.map((table) => `SELECT COUNT(*) AS count FROM ${table};`).join(' ');
  const command = ['wrangler', 'd1', 'execute', 'kairo-prod', '--remote', '--env', 'production', '--command', countQuery];
  const result = spawnSync('npx', command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
  const output = result.stdout ?? '';
  if (result.error && !output.includes('"success": true')) throw result.error;
  if (result.status && result.status !== 0 && !output.includes('"success": true')) {
    throw new Error(result.stderr || `wrangler exited with status ${result.status}`);
  }
  const jsonStart = output.indexOf('[\n');
  if (jsonStart === -1) throw new Error('Unable to parse wrangler D1 output');
  const parsed = JSON.parse(output.slice(jsonStart));
  return Object.fromEntries(tables.map((table, index) => [table, Number(parsed[index]?.results?.[0]?.count ?? 0)]));
}

async function main() {
  try {
    const health = await checkHttp('Worker health', `${workerUrl}/api/health`, 200);
    if (!health?.ok) throw new Error('health payload missing ok=true');
    pass('Worker health', `${workerUrl}/api/health`);
  } catch (error) {
    fail('Worker health', error);
  }

  try {
    const body = await checkHttp('Pages root', pagesUrl, 200);
    const html = String(body);
    if (!html.includes('/assets/')) throw new Error('Pages HTML missing bundled assets');
    pass('Pages root', pagesUrl);
  } catch (error) {
    fail('Pages root', error);
  }

  for (const route of ['/beta', '/feedback', '/admin']) {
    try {
      await checkHttp(`Pages route ${route}`, `${pagesUrl}${route}`, 200);
      pass(`Pages route ${route}`, `${pagesUrl}${route}`);
    } catch (error) {
      fail(`Pages route ${route}`, error);
    }
  }

  try {
    const html = await (await fetch(pagesUrl)).text();
    const assetMatch = html.match(/src="([^"]*\/assets\/index-[^"]+\.js)"/);
    if (!assetMatch) throw new Error('Unable to find production JS asset');
    const assetUrl = new URL(assetMatch[1], pagesUrl).toString();
    const js = await (await fetch(assetUrl)).text();
    if (js.includes('localhost:8787')) throw new Error('Bundle contains localhost API base');
    if (!js.includes(workerUrl)) throw new Error('Bundle does not contain production Worker API base');
    if (!js.includes('x-kairo-admin-token')) throw new Error('Bundle missing admin token header support');
    pass('Pages bundle configuration', assetUrl);
  } catch (error) {
    fail('Pages bundle configuration', error);
  }

  try {
    const bounties = await checkHttp('Public bounties API', `${workerUrl}/api/bounties`, 200);
    const count = Array.isArray(bounties?.data) ? bounties.data.length : 0;
    if (count < minCounts.bounties) throw new Error(`expected at least ${minCounts.bounties} bounties, got ${count}`);
    pass('Public bounties API', `${count} bounties`);
  } catch (error) {
    fail('Public bounties API', error);
  }

  try {
    await checkHttp('Admin forbidden without role', `${workerUrl}/api/admin/stats`, 403);
    pass('Admin forbidden without role', '403');
  } catch (error) {
    fail('Admin forbidden without role', error);
  }

  try {
    await checkHttp('Admin forbidden without token', `${workerUrl}/api/admin/stats`, 403, {
      headers: {
        'x-kairo-role': 'admin',
        'x-kairo-user-id': 'user-demo-admin',
      },
    });
    pass('Admin forbidden without token', '403');
  } catch (error) {
    fail('Admin forbidden without token', error);
  }

  if (adminToken) {
    try {
      const stats = await checkHttp('Admin allowed with token', `${workerUrl}/api/admin/stats`, 200, {
        headers: {
          'x-kairo-role': 'admin',
          'x-kairo-user-id': 'user-demo-admin',
          'x-kairo-admin-token': adminToken,
        },
      });
      if (!stats?.data?.bounties) throw new Error('admin stats payload missing bounties count');
      pass('Admin allowed with token', JSON.stringify(stats.data));
    } catch (error) {
      fail('Admin allowed with token', error);
    }
  } else {
    skip('Admin allowed with token', 'ADMIN_API_TOKEN not set in environment');
  }

  try {
    const counts = d1Counts();
    for (const [table, minimum] of Object.entries(minCounts)) {
      const count = counts[table] ?? 0;
      if (count < minimum) throw new Error(`expected >= ${minimum}, got ${count}`);
      pass(`D1 count ${table}`, String(count));
    }
  } catch (error) {
    for (const table of Object.keys(minCounts)) fail(`D1 count ${table}`, error);
  }

  for (const result of results) {
    const icon = result.status === 'pass' ? 'PASS' : result.status === 'skip' ? 'SKIP' : 'FAIL';
    console.log(`${icon} ${result.name}: ${result.detail}`);
  }

  const failures = results.filter((result) => result.status === 'fail');
  if (failures.length) {
    console.error(`Production readiness failed: ${failures.length} failing check(s).`);
    process.exit(1);
  }

  console.log('Production readiness checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
