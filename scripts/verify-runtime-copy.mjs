#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const includeRoots = ['client', 'src', 'shared'];
const allowedExt = new Set(['.ts', '.tsx']);
const forbidden = [
  '/swap',
  'TokenSwap',
  '代币兑换',
  '闪兑',
  '买入',
  '卖出',
  '投资者',
  '投资与治理',
  '收益',
  '分红',
  '资金托管',
  'escrowed by KAIRO',
  'custody',
  // Required Chinese terms
  '投资收益',
  '保证收益',
  '质押收益',
  '托管资金',
  '空投保证',
  '确认付款',
  '已支付奖励',
  // Required Korean terms
  '투자 수익 보장',
  '수익 보장',
  '매수',
  '매도',
  '예치',
  '스테이킹 수익',
  '에어드롭 보장',
  '지급 보장',
  '결제 확인',
];

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const absolute = path.join(dir, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      walk(absolute, files);
      continue;
    }
    if (stat.isFile() && allowedExt.has(path.extname(entry))) {
      files.push(absolute);
    }
  }
  return files;
}

const files = includeRoots.flatMap((dir) => walk(path.join(root, dir)));
const failures = [];

for (const file of files) {
  const relative = path.relative(root, file);
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  for (const phrase of forbidden) {
    lines.forEach((line, index) => {
      if (line.includes(phrase)) {
        failures.push({ file: relative, line: index + 1, phrase, text: line.trim() });
      }
    });
  }
}

if (failures.length) {
  console.error('KAIRO runtime copy verification failed.');
  console.error(`Scanned ${files.length} public runtime files.`);
  for (const failure of failures) {
    console.error(`- ${failure.file}:${failure.line} contains "${failure.phrase}"`);
    console.error(`  ${failure.text}`);
  }
  process.exit(1);
}

console.log('KAIRO runtime copy verification passed.');
console.log(`Scanned ${files.length} public runtime files.`);
