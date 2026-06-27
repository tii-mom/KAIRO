#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const operationsDocPath = 'docs/BETA_COHORT_OPERATIONS.md';
const runbookPath = 'docs/PRIVATE_BETA_RUNBOOK.md';
const checklistPath = 'docs/LAUNCH_CHECKLIST.md';
const contentDir = 'content';
const backupDir = 'backups/d1';
const expectedPagesUrl = 'https://kairo.cfd';

const checks = [];

function record(status, name, detail) {
  checks.push({ status, name, detail });
}

function pass(name, detail) {
  record('pass', name, detail);
}

function fail(name, detail) {
  record('fail', name, detail);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function sectionLines(markdown, heading) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return [];

  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith('## ')) break;
    collected.push(line);
  }
  return collected;
}

function tableRows(markdown, heading) {
  return sectionLines(markdown, heading)
    .filter((line) => line.trim().startsWith('|'))
    .slice(2)
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
}

function containsAny(text, patterns) {
  return patterns.some((pattern) => text.includes(pattern));
}

function isResolvedValue(value) {
  return value && value !== 'TBD' && value !== 'Not started';
}

function main() {
  const operationsDoc = read(operationsDocPath);
  const runbook = read(runbookPath);
  const checklist = read(checklistPath);

  if (operationsDoc.includes(`Current Pages URL: \`${expectedPagesUrl}\``)) {
    pass('Current Pages URL', expectedPagesUrl);
  } else {
    fail('Current Pages URL', `${operationsDocPath} is not pointing at ${expectedPagesUrl}`);
  }

  if (containsAny(`${operationsDoc}\n${runbook}\n${checklist}`, [
    'The custom-domain warning is acceptable for invite-only beta only.',
    'with only the custom-domain warning allowed for invite-only beta',
  ])) {
    fail('Custom domain docs', 'stale pre-domain warning text still exists in launch docs');
  } else {
    pass('Custom domain docs', 'launch docs no longer describe custom domain as a missing blocker');
  }

  const operatorRows = tableRows(operationsDoc, '## Operator Roster');
  if (!operatorRows.length) {
    fail('Operator roster', 'operator roster table missing');
  } else {
    for (const [role, owner, backup] of operatorRows) {
      if (!isResolvedValue(owner) || !isResolvedValue(backup)) {
        fail(`Operator roster ${role}`, `owner=${owner || 'missing'}, backup=${backup || 'missing'}`);
      } else {
        pass(`Operator roster ${role}`, `${owner} / ${backup}`);
      }
    }
  }

  const inviteRows = tableRows(operationsDoc, '## Invite Batch Log');
  const internalInviteRow = inviteRows.find((row) => row[2] === 'Internal operators');
  if (!internalInviteRow) {
    fail('Internal operator batch', 'batch 0 row missing');
  } else {
    const [date, batch, group, count, gatePassed] = internalInviteRow;
    if (!isResolvedValue(date) || !isResolvedValue(gatePassed)) {
      fail('Internal operator batch', `date=${date || 'missing'}, gate=${gatePassed || 'missing'}`);
    } else {
      pass('Internal operator batch', `${date} batch ${batch} ${group} count=${count} gate=${gatePassed}`);
    }
  }

  const contentRows = tableRows(operationsDoc, '## Content Import Notes');
  const recordedImportRow = contentRows.find((row) => row.some((cell) => cell && cell !== 'TBD'));
  if (!recordedImportRow) {
    fail('Content import log', 'no recorded snapshot/import row yet');
  } else {
    const [date, snapshotFile, importFile, operator, result] = recordedImportRow;
    if (!existsSync(join(backupDir, snapshotFile))) {
      fail('Content import snapshot', `${snapshotFile} is recorded but not present under ${backupDir}`);
    } else {
      pass('Content import snapshot', snapshotFile);
    }
    const resultLower = result.toLowerCase();
    if (importFile.toLowerCase().includes('not yet') || resultLower.includes('no real beta import yet') || resultLower.includes('pending') || !/(applied|imported|verified live)/i.test(result)) {
      fail('Real beta import', `${date} ${importFile}; ${result}`);
    } else {
      pass('Real beta import', `${date} ${importFile} by ${operator}: ${result}`);
    }
  }

  const reviewedImportFiles = readdirSync(contentDir)
    .filter((file) => file.startsWith('beta-import') && file.endsWith('.json') && file !== 'beta-import.example.json');
  if (!reviewedImportFiles.length) {
    fail('Reviewed beta import file', 'no non-example beta import JSON file found under content/');
  } else {
    pass('Reviewed beta import file', reviewedImportFiles.join(', '));
  }

  const reviewedSqlFiles = readdirSync(contentDir)
    .filter((file) => file.startsWith('beta-import') && file.endsWith('.sql') && file !== 'beta-import.generated.sql');
  if (!reviewedSqlFiles.length) {
    fail('Reviewed beta import SQL', 'no reviewed beta import SQL file found under content/');
  } else {
    pass('Reviewed beta import SQL', reviewedSqlFiles.join(', '));
  }

  for (const check of checks) {
    const label = check.status === 'pass' ? 'PASS' : 'FAIL';
    console.log(`${label} ${check.name}: ${check.detail}`);
  }

  const failures = checks.filter((check) => check.status === 'fail');
  if (failures.length) {
    console.error(`Operations readiness failed: ${failures.length} blocking check(s).`);
    process.exit(1);
  }

  console.log('Operations readiness checks passed.');
}

main();
