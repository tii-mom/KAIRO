#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';

const [, , inputArg = 'content/beta-import.example.json'] = process.argv;
const inputPath = path.resolve(process.cwd(), inputArg);
const payload = JSON.parse(readFileSync(inputPath, 'utf8'));

const forbiddenPhrases = [
  'guaranteed return',
  'price prediction',
  'yield',
  'staking',
  'swap',
  'trading',
  'investment',
  'guaranteed airdrop',
  'guaranteed reward',
  'custody service',
  'escrow service',
  'financial service',
  'airdrop guaranteed',
];

const suspiciousPrivatePatterns = [
  { label: 'private key wording', pattern: /private\s*key|seed\s*phrase|mnemonic/i },
  { label: 'bearer token', pattern: /bearer\s+[a-z0-9._-]{12,}/i },
  { label: 'secret assignment', pattern: /(secret|api[_-]?key|token)\s*[:=]\s*[a-z0-9._-]{16,}/i },
];

const failures = [];
const warnings = [];

function arrayOf(name) {
  const value = payload[name];
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    failures.push(`${name} must be an array`);
    return [];
  }
  return value;
}

function requireString(recordType, id, value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    failures.push(`${recordType} ${id || '<unknown>'} missing ${field}`);
    return '';
  }
  return value.trim();
}

function collectText(value, parts = []) {
  if (value === null || value === undefined) return parts;
  if (typeof value === 'string') parts.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectText(item, parts));
  else if (typeof value === 'object') Object.values(value).forEach((item) => collectText(item, parts));
  return parts;
}

function checkSafeText(recordType, id, record) {
  const text = collectText(record).join(' ');
  const lower = text.toLowerCase();
  for (const phrase of forbiddenPhrases) {
    if (lower.includes(phrase)) failures.push(`${recordType} ${id} contains forbidden phrase: ${phrase}`);
  }
  for (const { label, pattern } of suspiciousPrivatePatterns) {
    if (pattern.test(text)) failures.push(`${recordType} ${id} may contain ${label}`);
  }
}

function checkUrl(recordType, id, value, field) {
  if (!value) return;
  if (typeof value !== 'string') {
    failures.push(`${recordType} ${id} ${field} must be a string URL`);
    return;
  }
  if (!/^https:\/\//i.test(value)) failures.push(`${recordType} ${id} ${field} must use https://`);
  if (value.includes('example.org') || value.includes('example.com')) {
    warnings.push(`${recordType} ${id} ${field} still uses an example domain`);
  }
}

function checkUnique(records, recordType) {
  const seen = new Set();
  for (const record of records) {
    const id = requireString(recordType, record.id, record.id, 'id');
    if (!id) continue;
    if (seen.has(id)) failures.push(`${recordType} ${id} is duplicated`);
    seen.add(id);
    checkSafeText(recordType, id, record);
  }
  return seen;
}

const tokens = arrayOf('tokens');
const catalysts = arrayOf('catalysts');
const submissions = arrayOf('submissions');
const curatedItems = arrayOf('curatedItems');
const fundingEvents = arrayOf('fundingEvents');

const tokenIds = checkUnique(tokens, 'token');
const catalystIds = checkUnique(catalysts, 'catalyst');
checkUnique(submissions, 'submission');
checkUnique(curatedItems, 'curatedItem');
checkUnique(fundingEvents, 'fundingEvent');

for (const token of tokens) {
  checkUrl('token', token.id, token.websiteUrl, 'websiteUrl');
  checkUrl('token', token.id, token.twitterUrl, 'twitterUrl');
  checkUrl('token', token.id, token.telegramUrl, 'telegramUrl');
}

for (const catalyst of catalysts) {
  if (!tokenIds.has(catalyst.tokenId)) failures.push(`catalyst ${catalyst.id} references unknown tokenId ${catalyst.tokenId}`);
  if (!['unverified', 'pledged', 'escrowed', 'paid'].includes(catalyst.fundingStatus || 'unverified')) {
    failures.push(`catalyst ${catalyst.id} has invalid fundingStatus ${catalyst.fundingStatus}`);
  }
  if (String(catalyst.contactInfo || '').includes('@example.')) {
    warnings.push(`catalyst ${catalyst.id} contactInfo still uses an example email`);
  }
}

for (const submission of submissions) {
  if (!catalystIds.has(submission.bountyId)) failures.push(`submission ${submission.id} references unknown bountyId ${submission.bountyId}`);
  checkUrl('submission', submission.id, submission.demoUrl, 'demoUrl');
  checkUrl('submission', submission.id, submission.githubUrl, 'githubUrl');
  checkUrl('submission', submission.id, submission.videoUrl, 'videoUrl');
  checkUrl('submission', submission.id, submission.screenshotUrl, 'screenshotUrl');
}

for (const item of curatedItems) {
  if (item.targetType === 'token' && item.targetId && !tokenIds.has(item.targetId)) {
    failures.push(`curatedItem ${item.id} references unknown token targetId ${item.targetId}`);
  }
  if (item.targetType === 'bounty' && item.targetId && !catalystIds.has(item.targetId)) {
    failures.push(`curatedItem ${item.id} references unknown bounty targetId ${item.targetId}`);
  }
  checkUrl('curatedItem', item.id, item.imageUrl, 'imageUrl');
  checkUrl('curatedItem', item.id, item.externalUrl, 'externalUrl');
}

for (const event of fundingEvents) {
  if (!catalystIds.has(event.bountyId)) failures.push(`fundingEvent ${event.id} references unknown bountyId ${event.bountyId}`);
  checkUrl('fundingEvent', event.id, event.proofUrl, 'proofUrl');
}

if (tokens.length === 0) warnings.push('No tokens provided');
if (catalysts.length === 0) warnings.push('No catalysts provided');
if (curatedItems.length === 0) warnings.push('No curated items provided');

for (const warning of warnings) console.warn(`WARN ${warning}`);

if (failures.length) {
  console.error('KAIRO beta import verification failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('KAIRO beta import verification passed.');
console.log(`Verified ${tokens.length} tokens, ${catalysts.length} catalysts, ${submissions.length} submissions, ${curatedItems.length} curated items, and ${fundingEvents.length} funding events.`);
