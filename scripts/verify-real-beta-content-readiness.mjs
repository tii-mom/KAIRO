#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const inputArg = process.argv[2] || 'content/beta-import.reviewed-2026-06-27.json';
const inputPath = path.resolve(process.cwd(), inputArg);

if (!existsSync(inputPath)) {
  console.log(`Content file not found at ${inputArg}. Production import status: BLOCKED.`);
  process.exit(0);
}

const content = readFileSync(inputPath, 'utf8');

const placeholderPatterns = [
  /example/i,
  /placeholder/i,
  /replace_with/i,
  /lorem/i,
  /0x0000000000000000000000000000000000000000/,
  /ops@example.org/,
  /https:\/\/example.org/,
  /https:\/\/x.com\/example/,
  /https:\/\/t.me\/example/
];

const failures = [];

// Search raw content string for placeholders
for (const pattern of placeholderPatterns) {
  if (pattern.test(content)) {
    failures.push(`Found placeholder pattern matching: ${pattern.toString()}`);
  }
}

if (failures.length > 0) {
  console.error('❌ KAIRO Real Beta Content Readiness Check FAILED!');
  console.error('The following placeholder/demo markers were detected in the production content batch:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error('\nProduction Content Status: BLOCKED. Do not import this file to live environments.');
  process.exit(1);
} else {
  console.log('✅ KAIRO Real Beta Content Readiness Check PASSED.');
  console.log('No placeholder patterns found in the reviewed production content batch.');
}
