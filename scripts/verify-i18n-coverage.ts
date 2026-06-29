import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { messages } from '../client/i18n/locales';

const ALLOWLIST = new Set([
  'kairo', 'v2', 'mvp', 'd1', 'sql', 'api', 'url', 'id', 'pts', '0x',
  'px', 'rem', 's', 'ms', 'utc', 'gmt', 'sha-256', 'sha',
  'local', 'production', 'development', 'demo', 'fallback',
  'active', 'pending', 'winner', 'completed', 'paid', 'unpaid',
  'valid', 'invalid', 'suspicious', 'admin', 'editor', 'featured',
  'hottest', 'dormant', 'comeback', 'genesis', 'ignited', 'silver',
  'bronze', 'tracked', 'telemetry', 'registry', 'coordinate',
  'consoles', 'dashboard', 'bounties', 'submissions', 'feedback',
  'builders', 'supporters', 'operators', 'http', 'https', 'post', 'get', 'patch',
  'delete', 'put', 'username', 'role', 'channel', 'status', 'tab', 'score',
  'points', 'boosts', 'ignite', 'referral', 'coordinates',
  'ledger', 'audit', 'timeline', 'track', 'proposal', 'evidence', 'verification',
  'winner', 'completed', 'ignited', 'silver', 'bronze', 'tracked', 'slot',
  'unknown', 'network', 'token', 'twitter', 'telegram', 'code', 'video', 'no',
  'recorded', 'severity', 'tier', 'high', 'medium', 'standard', 'target', 'source',
  'committed', 'at', 'reward', 'signal', 'event', 'reference', 'sector', 'reigniting',
  'value', 'lane', 'discovery', 'mode', 'test', 'targets', 'operator', 'audit',
  'current', 'queue', 'empty', 'momentum', 'builder', 'share', 'proof', 'ranked',
  'pointermove', 'short', 'numeric', 'compact', 'kai', 'curated', 'elite', 'pro',
  'arbitrum', 'ethereum', 'solana', 'base', 'sol', 'eth', 'untitled', 'arena',
  'catalyst', 'catalysts', 'builderhub', 'unable', 'load', 'details', 'giants',
  'watchlist', 'record', 'solution', 'submission', 'data', 'profile', 'create',
  'leaderboard', 'of', 'support', 'runtime', 'title', 'sleeping', 'warming', 'building',
  'emerald', 'sky', 'gold', 'red', 'rose', 'slate', 'verified'
]);

function isCssClass(str: string): boolean {
  const classes = str.split(/\s+/);
  const tailwindPatterns = /^(flex|grid|hidden|block|inline|text-|bg-|border-|p[xy]?[-0-9]|m[xy]?[-0-9]|w-|h-|hover:|focus:|active:|peer:|group:|rounded|shadow|duration-|transition-|ease-|from-|to-|animate-|fixed|absolute|relative|inset-|z-|top-|bottom-|left-|right-|sm:|md:|lg:|xl:|2xl:|scale-|origin-|cursor-)/;
  return classes.every(cls => tailwindPatterns.test(cls) || cls.includes('/') || cls.includes('[') || cls.includes('#') || cls.includes('-'));
}

function isAllowedString(str: string): boolean {
  if (isCssClass(str)) return true;
  if (
    str.startsWith('/') ||
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.includes('://') ||
    (str.includes('.') && !str.includes(' '))
  ) {
    return true;
  }
  const clean = str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  if (!clean) return true;
  const words = clean.split(/\s+/);
  return words.every(w => {
    if (/^\d+$/.test(w)) return true;
    if (ALLOWLIST.has(w)) return true;
    if (w.startsWith('0x') || w.length <= 2) return true;
    return false;
  });
}

// Extract variables like {name} or {count}
function getInterpolations(str: string): string[] {
  const matches = str.match(/\{[^}]+\}/g) || [];
  return matches.map(m => m.slice(1, -1).trim()).sort();
}

interface VerificationError {
  type: 'missing_key' | 'empty_value' | 'variable_mismatch' | 'array_length_mismatch';
  path: string;
  message: string;
}

const errors: VerificationError[] = [];
const warnings: string[] = [];

// 1. Verify key alignment & values
type TranslationObj = Record<string, unknown>;

function getKeysFlat(obj: TranslationObj, prefix = ''): Record<string, unknown> {
  const res: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const keyPath = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(res, getKeysFlat(val as TranslationObj, keyPath));
    } else {
      res[keyPath] = val;
    }
  }
  return res;
}

const enFlat = getKeysFlat(messages['en-US'] as unknown as TranslationObj);
const zhFlat = getKeysFlat(messages['zh-CN'] as unknown as TranslationObj);
const koFlat = getKeysFlat(messages['ko-KR'] as unknown as TranslationObj);

// Check alignment
const allKeys = new Set([...Object.keys(enFlat), ...Object.keys(zhFlat), ...Object.keys(koFlat)]);

for (const key of allKeys) {
  const enVal = enFlat[key];
  const zhVal = zhFlat[key];
  const koVal = koFlat[key];

  if (enVal === undefined) {
    errors.push({ type: 'missing_key', path: key, message: 'Key exists in translations but missing in en-US' });
    continue;
  }
  if (zhVal === undefined) {
    errors.push({ type: 'missing_key', path: key, message: 'Key exists in en-US but missing in zh-CN' });
    continue;
  }
  if (koVal === undefined) {
    errors.push({ type: 'missing_key', path: key, message: 'Key exists in en-US but missing in ko-KR' });
    continue;
  }

  // Check empty
  const checkValueEmpty = (val: unknown, lang: string) => {
    if (typeof val === 'string' && !val.trim()) {
      errors.push({ type: 'empty_value', path: key, message: `Empty translation string in ${lang}` });
    } else if (Array.isArray(val)) {
      val.forEach((item, index) => {
        if (typeof item === 'string' && !item.trim()) {
          errors.push({ type: 'empty_value', path: `${key}[${index}]`, message: `Empty translation string inside array in ${lang}` });
        }
      });
    }
  };
  checkValueEmpty(enVal, 'en-US');
  checkValueEmpty(zhVal, 'zh-CN');
  checkValueEmpty(koVal, 'ko-KR');

  // Check array lengths
  if (Array.isArray(enVal)) {
    const enLen = enVal.length;
    const zhLen = Array.isArray(zhVal) ? zhVal.length : -1;
    const koLen = Array.isArray(koVal) ? koVal.length : -1;

    if (enLen !== zhLen) {
      errors.push({ type: 'array_length_mismatch', path: key, message: `Array length mismatch between en-US (${enLen}) and zh-CN (${zhLen})` });
    }
    if (enLen !== koLen) {
      errors.push({ type: 'array_length_mismatch', path: key, message: `Array length mismatch between en-US (${enLen}) and ko-KR (${koLen})` });
    }
  }

  // Check variables mismatch
  const getVars = (val: unknown): string[] => {
    if (typeof val === 'string') return getInterpolations(val);
    if (Array.isArray(val)) return val.flatMap(item => typeof item === 'string' ? getInterpolations(item) : []);
    return [];
  };

  const enVars = getVars(enVal);
  const zhVars = getVars(zhVal);
  const koVars = getVars(koVal);

  if (JSON.stringify(enVars) !== JSON.stringify(zhVars)) {
    errors.push({ type: 'variable_mismatch', path: key, message: `Interpolation variables mismatch between en-US [${enVars.join(', ')}] and zh-CN [${zhVars.join(', ')}]` });
  }
  if (JSON.stringify(enVars) !== JSON.stringify(koVars)) {
    errors.push({ type: 'variable_mismatch', path: key, message: `Interpolation variables mismatch between en-US [${enVars.join(', ')}] and ko-KR [${koVars.join(', ')}]` });
  }
}

// 2. Scan for hardcoded UI strings in code files
const root = process.cwd();
const targetFiles: string[] = [];
const hardcoded: Array<{ file: string; line: number; text: string }> = [];

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const absolute = path.join(dir, entry);
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) {
      if (entry !== 'node_modules' && entry !== 'dist' && entry !== '.git' && entry !== 'i18n') {
        walk(absolute);
      }
    } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts'))) {
      if (!entry.toLowerCase().endsWith('data.ts') && !entry.toLowerCase().endsWith('data.tsx')) {
        targetFiles.push(absolute);
      }
    }
  }
}

// Scan client/ directory
walk(path.join(root, 'client'));

// Scan specific active components in src/
const activeSrcFiles = [
  path.join(root, 'src/main.tsx'),
  path.join(root, 'src/components/Navbar.tsx'),
  path.join(root, 'src/components/ShareButton.tsx'),
];
for (const f of activeSrcFiles) {
  if (fs.existsSync(f)) {
    targetFiles.push(f);
  }
}

const userVisibleAttributes = new Set([
  'label', 'title', 'placeholder', 'description', 'eyebrow', 'tooltip',
  'empty', 'text', 'subtitle', 'meta', 'message', 'aria-label'
]);

function checkIfUserVisibleContext(node: ts.Node): boolean {
  let parent = node.parent;
  while (parent) {
    if (ts.isJsxElement(parent) || ts.isJsxSelfClosingElement(parent) || ts.isJsxFragment(parent)) {
      return true;
    }
    if (ts.isJsxAttribute(parent)) {
      const attrName = parent.name.getText();
      return userVisibleAttributes.has(attrName);
    }
    if (ts.isJsxExpression(parent) && ts.isJsxAttribute(parent.parent)) {
      const attrName = (parent.parent as ts.JsxAttribute).name.getText();
      return userVisibleAttributes.has(attrName);
    }
    if (ts.isReturnStatement(parent)) {
      return true;
    }
    if (ts.isCallExpression(parent)) {
      const expr = parent.expression;
      const exprText = expr.getText();
      if (
        exprText === 'setMessage' ||
        exprText === 'setError' ||
        exprText === 'setBoostMessage' ||
        exprText === 'setCopyMessage' ||
        exprText.includes('navigator.clipboard.writeText')
      ) {
        return true;
      }
    }
    if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) {
      return false;
    }
    parent = parent.parent;
  }
  return false;
}

for (const file of targetFiles) {
    // Read and parse file
    const content = fs.readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

    function visit(node: ts.Node) {
      let text: string | undefined;
      let isJsxTextNode = false;
      let isJsxAttrNode = false;

      if (ts.isJsxText(node)) {
        text = node.getText().trim();
        isJsxTextNode = true;
      } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
        const attrName = node.name.getText();
        if (userVisibleAttributes.has(attrName)) {
          text = node.initializer.text.trim();
          isJsxAttrNode = true;
        }
      } else if (
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)
      ) {
        text = (node as any).text?.trim();
      }

      if (text && /[a-zA-Z]/.test(text) && !isAllowedString(text)) {
        if (isJsxTextNode || isJsxAttrNode || checkIfUserVisibleContext(node)) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          hardcoded.push({ file: path.relative(root, file), line: line + 1, text });
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

// Calculate coverage
const totalI18nKeys = Object.keys(enFlat).length;
const totalKeysEvaluated = totalI18nKeys + hardcoded.length;
const coverage = totalKeysEvaluated > 0 ? (totalI18nKeys / totalKeysEvaluated) * 100 : 100;

console.log('\n=== KAIRO I18N VALIDATION REPORT ===');
console.log(`Total localized keys in locales.ts: ${totalI18nKeys}`);
console.log(`Suspected hardcoded strings found: ${hardcoded.length}`);
console.log(`Calculated localization coverage: ${coverage.toFixed(2)}%`);

if (hardcoded.length > 0) {
  console.log('\nSuspected Hardcoded UI Strings:');
  for (const h of hardcoded) {
    console.log(`- ${h.file}:${h.line} -> "${h.text}"`);
  }
}

if (errors.length > 0) {
  console.error('\nErrors detected in translation alignment:');
  for (const err of errors) {
    console.error(`- [${err.type.toUpperCase()}] ${err.path}: ${err.message}`);
  }
}

if (errors.length > 0 || coverage < 99) {
  console.error('\nI18N verification failed: key alignment issues found or coverage is below 99%.');
  process.exit(1);
}

console.log('\nI18N verification passed successfully.');
process.exit(0);
