#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const databaseName = process.env.KAIRO_D1_DATABASE || 'kairo-prod';
const environment = process.env.KAIRO_WRANGLER_ENV || 'production';
const outDir = process.argv[2] || path.join('backups', 'd1');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = path.join(outDir, `kairo-prod-snapshot-${timestamp}.json`);
const wranglerTimeoutMs = Number(process.env.KAIRO_D1_BACKUP_TIMEOUT_MS || 300000);
const wranglerCommand = process.env.WRANGLER_BIN || 'npx';
const includeRows = process.env.KAIRO_D1_BACKUP_INCLUDE_ROWS === '1';

const tables = [
  'users',
  'tokens',
  'bounties',
  'submissions',
  'boosts',
  'support_points',
  'support_events',
  'builder_scores',
  'referrals',
  'escrow_events',
  'curated_items',
  'admin_actions',
];

function runD1(command) {
  const wranglerArgs = ['d1', 'execute', databaseName, '--remote', '--env', environment, '--command', command];
  const args = wranglerCommand === 'npx' ? ['wrangler', ...wranglerArgs] : wranglerArgs;
  console.log(`Running read-only D1 query with ${wranglerCommand}...`);
  const result = spawnSync(wranglerCommand, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: wranglerTimeoutMs });
  const output = result.stdout ?? '';
  console.log('D1 query completed; parsing snapshot output...');

  if (result.error) throw result.error;
  if (result.status !== 0 && !output.includes('"success": true')) {
    throw new Error(result.stderr || `${wranglerCommand} exited with status ${result.status}`);
  }

  const jsonStart = output.indexOf('[\n');
  if (jsonStart === -1) {
    throw new Error(`Unable to parse wrangler JSON output for command: ${command}`);
  }

  return JSON.parse(output.slice(jsonStart));
}

function singleResult(command) {
  const parsed = runD1(command);
  return parsed[0]?.results ?? [];
}

function batchedResults(command) {
  return runD1(command).map((result) => result?.results ?? []);
}

const snapshot = {
  databaseName,
  environment,
  createdAt: new Date().toISOString(),
  note: 'Read-only KAIRO production D1 pre-import snapshot. Keep outside commits; use before real beta content import or seed reruns.',
  counts: {},
  rowsIncluded: includeRows,
  rows: includeRows ? {} : undefined,
};

const countCommand = tables.map((table) => `SELECT COUNT(*) AS count FROM ${table};`).join(' ');
const countResults = batchedResults(countCommand);

tables.forEach((table, index) => {
  const countRows = countResults[index] ?? [];
  snapshot.counts[table] = Number(countRows[0]?.count ?? 0);
});

if (includeRows) {
  for (const table of tables) {
    snapshot.rows[table] = singleResult(`SELECT * FROM ${table};`);
  }
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Wrote production D1 snapshot: ${outFile}`);
for (const [table, count] of Object.entries(snapshot.counts)) {
  console.log(`${table}: ${count}`);
}
