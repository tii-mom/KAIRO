#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const defaultInput = process.env.KAIRO_BETA_IMPORT_FILE || 'content/beta-import.reviewed-2026-06-27.json';
const defaultMode = process.env.KAIRO_BETA_IMPORT_MODE || '--prepare';
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/import-beta-content.mjs <input.json> [--prepare|--apply]');
  console.log(`Default input: ${defaultInput}`);
  console.log(`Default mode: ${defaultMode}`);
  console.log('Modes:');
  console.log('  --prepare  Verify JSON, back up production D1, and regenerate reviewed SQL only.');
  console.log('  --apply    Apply the reviewed SQL to production after passing all safeguards.');
  console.log('Safety rules:');
  console.log('  - --apply refuses files whose names still look like example/template content.');
  console.log('  - --apply refuses payloads that still contain obvious placeholder/example markers.');
  console.log('  - Do not apply content until the project owner/content reviewer has approved the batch.');
  process.exit(0);
}

const inputArg = args.find((arg) => !arg.startsWith('--')) || defaultInput;
const modeArg = args.find((arg) => ['--prepare', '--apply'].includes(arg)) || defaultMode;

if (!inputArg) {
  console.error('Usage: node scripts/import-beta-content.mjs <input.json> [--prepare|--apply]');
  process.exit(1);
}

if (!['--prepare', '--apply'].includes(modeArg)) {
  console.error(`Unknown mode: ${modeArg}`);
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputArg);
if (!existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const payload = JSON.parse(readFileSync(inputPath, 'utf8'));
const baseName = path.basename(inputPath, path.extname(inputPath));
const outputSqlPath = path.join(path.dirname(inputPath), `${baseName}.sql`);
const databaseName = process.env.KAIRO_D1_DATABASE || 'kairo-prod';
const environment = process.env.KAIRO_WRANGLER_ENV || 'production';
const placeholderMarkers = [
  'example.org',
  'example.com',
  'token-real-example',
  'bounty-real-example',
  'submission-real-example',
  'curated-real-example',
  'funding-event-real-example',
  'example dormant network',
  'ops@example.org',
];

function run(label, command, args, options = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 300000,
    ...options,
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}`);
  return result;
}

function collectStrings(value, bucket = []) {
  if (typeof value === 'string') bucket.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => collectStrings(entry, bucket));
  else if (value && typeof value === 'object') Object.values(value).forEach((entry) => collectStrings(entry, bucket));
  return bucket;
}

function assertApplySafe() {
  const lowerBaseName = baseName.toLowerCase();
  if (lowerBaseName.includes('example') || lowerBaseName.includes('template')) {
    throw new Error(`Refusing to apply placeholder file ${path.relative(process.cwd(), inputPath)}. Use an approved reviewed real-content file instead.`);
  }

  const lowerPayloadText = collectStrings(payload).join('\n').toLowerCase();
  const matchedMarker = placeholderMarkers.find((marker) => lowerPayloadText.includes(marker));
  if (matchedMarker) {
    throw new Error(`Refusing to apply placeholder/example content. Found marker: ${matchedMarker}`);
  }
}

function queryCount(table) {
  const result = spawnSync('npx', [
    'wrangler',
    'd1',
    'execute',
    databaseName,
    '--remote',
    '--env',
    environment,
    '--command',
    `SELECT COUNT(*) AS count FROM ${table};`,
  ], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 300000,
  });

  if (result.error) throw result.error;
  if (result.status !== 0 && !(result.stdout || '').includes('"success": true')) {
    throw new Error(result.stderr || `row-count query failed for ${table}`);
  }

  const jsonStart = (result.stdout || '').indexOf('[\n');
  if (jsonStart === -1) throw new Error(`unable to parse row-count output for ${table}`);
  const parsed = JSON.parse(result.stdout.slice(jsonStart));
  return Number(parsed[0]?.results?.[0]?.count ?? 0);
}

function expectedCounts() {
  return {
    tokens: Array.isArray(payload.tokens) ? payload.tokens.length : 0,
    bounties: Array.isArray(payload.catalysts) ? payload.catalysts.length : 0,
    submissions: Array.isArray(payload.submissions) ? payload.submissions.length : 0,
    curated_items: Array.isArray(payload.curatedItems) ? payload.curatedItems.length : 0,
    escrow_events: Array.isArray(payload.fundingEvents) ? payload.fundingEvents.length : 0,
  };
}

function printPostApplyCounts() {
  const expectations = expectedCounts();
  for (const [table, minimumAdded] of Object.entries(expectations)) {
    const count = queryCount(table);
    console.log(`POST-IMPORT ${table}: ${count} rows (batch contributed up to ${minimumAdded})`);
  }
}

function main() {
  if (modeArg === '--apply') {
    assertApplySafe();
  }

  run('Backup production D1', 'npm', ['run', 'db:backup:remote']);
  run('Verify beta import JSON', 'node', ['scripts/verify-beta-import.mjs', inputArg]);
  run('Generate beta import SQL', 'node', ['scripts/generate-beta-import-sql.mjs', inputArg, path.relative(process.cwd(), outputSqlPath)]);

  if (modeArg === '--prepare') {
    console.log(`\nPrepared reviewed SQL: ${path.relative(process.cwd(), outputSqlPath)}`);
    console.log('No production write performed. Re-run with --apply after final content approval.');
    return;
  }

  run('Apply beta import SQL to production D1', 'npx', [
    'wrangler',
    'd1',
    'execute',
    databaseName,
    '--remote',
    '--env',
    environment,
    '--file',
    path.relative(process.cwd(), outputSqlPath),
  ]);

  console.log('\n== Post-import row counts ==');
  printPostApplyCounts();
}

main();
