#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , inputArg, outputArg] = process.argv;

if (!inputArg || !outputArg) {
  console.error('Usage: node scripts/generate-beta-import-sql.mjs <input.json> <output.sql>');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputArg);
const outputPath = path.resolve(process.cwd(), outputArg);
const payload = JSON.parse(readFileSync(inputPath, 'utf8'));
const now = payload.generatedAt || new Date().toISOString();

const forbidden = [
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
];

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  return value.trim();
}

function optionalString(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error(`Expected optional string, received ${typeof value}`);
  return value.trim();
}

function assertSafeText(recordType, id, values) {
  const text = values.filter(Boolean).join(' ').toLowerCase();
  for (const phrase of forbidden) {
    if (text.includes(phrase)) {
      throw new Error(`${recordType} ${id} contains forbidden phrase: ${phrase}`);
    }
  }
}

function sql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function insert(table, columns, rows) {
  if (!rows.length) return '';
  const values = rows.map((row) => `(${columns.map((column) => sql(row[column])).join(',')})`).join(',\n');
  return `INSERT OR REPLACE INTO ${table} (${columns.join(',')}) VALUES\n${values};\n`;
}

const tokenRows = (payload.tokens || []).map((token) => {
  const id = requireString(token.id, 'token.id');
  assertSafeText('token', id, [token.name, token.symbol, token.status]);
  return {
    id,
    name: requireString(token.name, 'token.name'),
    symbol: requireString(token.symbol, 'token.symbol'),
    chain: optionalString(token.chain),
    contract_address: optionalString(token.contractAddress),
    logo_url: optionalString(token.logoUrl),
    website_url: optionalString(token.websiteUrl),
    twitter_url: optionalString(token.twitterUrl),
    telegram_url: optionalString(token.telegramUrl),
    status: optionalString(token.status) || 'sleeping',
    created_at: now,
    updated_at: now,
  };
});

const catalystRows = (payload.catalysts || []).map((catalyst) => {
  const id = requireString(catalyst.id, 'catalyst.id');
  assertSafeText('catalyst', id, [catalyst.title, catalyst.description, catalyst.rewardText, catalyst.contactInfo]);
  return {
    id,
    token_id: requireString(catalyst.tokenId, 'catalyst.tokenId'),
    created_by: requireString(catalyst.createdBy, 'catalyst.createdBy'),
    title: requireString(catalyst.title, 'catalyst.title'),
    description: requireString(catalyst.description, 'catalyst.description'),
    reward_text: optionalString(catalyst.rewardText),
    reward_type: optionalString(catalyst.rewardType) || 'offchain',
    funding_status: optionalString(catalyst.fundingStatus) || 'unverified',
    contact_info: optionalString(catalyst.contactInfo),
    deadline: optionalString(catalyst.deadline),
    status: optionalString(catalyst.status) || 'pending_review',
    boost_count: Number(catalyst.boostCount || 0),
    momentum_score: Number(catalyst.momentumScore || 0),
    submission_count: Number(catalyst.submissionCount || 0),
    featured: Boolean(catalyst.featured),
    created_at: now,
    updated_at: now,
  };
});

const submissionRows = (payload.submissions || []).map((submission) => {
  const id = requireString(submission.id, 'submission.id');
  assertSafeText('submission', id, [submission.name, submission.tagline, submission.description]);
  return {
    id,
    bounty_id: requireString(submission.bountyId, 'submission.bountyId'),
    builder_id: requireString(submission.builderId, 'submission.builderId'),
    name: requireString(submission.name, 'submission.name'),
    tagline: requireString(submission.tagline, 'submission.tagline'),
    demo_url: optionalString(submission.demoUrl),
    github_url: optionalString(submission.githubUrl),
    video_url: optionalString(submission.videoUrl),
    screenshot_url: optionalString(submission.screenshotUrl),
    description: optionalString(submission.description),
    status: optionalString(submission.status) || 'submitted',
    boost_count: Number(submission.boostCount || 0),
    momentum_score: Number(submission.momentumScore || 0),
    delivery_status: optionalString(submission.deliveryStatus) || 'submitted_for_review',
    created_at: now,
    updated_at: now,
  };
});

const curatedRows = (payload.curatedItems || []).map((item) => {
  const id = requireString(item.id, 'curatedItem.id');
  assertSafeText('curated item', id, [item.title, item.description]);
  return {
    id,
    item_type: requireString(item.itemType, 'curatedItem.itemType'),
    placement: optionalString(item.placement) || 'home',
    target_type: requireString(item.targetType, 'curatedItem.targetType'),
    target_id: optionalString(item.targetId),
    title: requireString(item.title, 'curatedItem.title'),
    description: optionalString(item.description),
    image_url: optionalString(item.imageUrl),
    external_url: optionalString(item.externalUrl),
    sort_order: Number(item.sortOrder || 0),
    status: optionalString(item.status) || 'active',
    created_at: now,
    updated_at: now,
  };
});

const fundingRows = (payload.fundingEvents || []).map((event) => {
  const id = requireString(event.id, 'fundingEvent.id');
  assertSafeText('funding event', id, [event.eventType, event.amountText, event.note]);
  return {
    id,
    bounty_id: requireString(event.bountyId, 'fundingEvent.bountyId'),
    actor_id: requireString(event.actorId, 'fundingEvent.actorId'),
    event_type: requireString(event.eventType, 'fundingEvent.eventType'),
    amount_text: optionalString(event.amountText),
    proof_url: optionalString(event.proofUrl),
    note: optionalString(event.note),
    created_at: now,
  };
});

const output = [
  '-- Generated KAIRO beta import SQL. Review before applying to D1.',
  `-- Source: ${path.relative(process.cwd(), inputPath)}`,
  'BEGIN TRANSACTION;',
  insert('tokens', ['id', 'name', 'symbol', 'chain', 'contract_address', 'logo_url', 'website_url', 'twitter_url', 'telegram_url', 'status', 'created_at', 'updated_at'], tokenRows),
  insert('bounties', ['id', 'token_id', 'created_by', 'title', 'description', 'reward_text', 'reward_type', 'funding_status', 'contact_info', 'deadline', 'status', 'boost_count', 'momentum_score', 'submission_count', 'featured', 'created_at', 'updated_at'], catalystRows),
  insert('submissions', ['id', 'bounty_id', 'builder_id', 'name', 'tagline', 'demo_url', 'github_url', 'video_url', 'screenshot_url', 'description', 'status', 'boost_count', 'momentum_score', 'delivery_status', 'created_at', 'updated_at'], submissionRows),
  insert('curated_items', ['id', 'item_type', 'placement', 'target_type', 'target_id', 'title', 'description', 'image_url', 'external_url', 'sort_order', 'status', 'created_at', 'updated_at'], curatedRows),
  insert('escrow_events', ['id', 'bounty_id', 'actor_id', 'event_type', 'amount_text', 'proof_url', 'note', 'created_at'], fundingRows),
  'COMMIT;',
  '',
].join('\n');

writeFileSync(outputPath, output);
console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
console.log(`Rows: tokens=${tokenRows.length}, catalysts=${catalystRows.length}, submissions=${submissionRows.length}, curatedItems=${curatedRows.length}, fundingEvents=${fundingRows.length}`);
