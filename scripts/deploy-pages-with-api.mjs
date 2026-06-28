#!/usr/bin/env node
import { mkdtempSync, cpSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const tmpRoot = mkdtempSync(path.join(tmpdir(), 'kairo-pages-api-'));
const projectName = process.env.KAIRO_PAGES_PROJECT || 'kairo';
const databaseName = process.env.KAIRO_D1_DATABASE || 'kairo-prod';
const databaseId = process.env.KAIRO_D1_DATABASE_ID || 'b7b521f5-96d2-4cf9-9c73-6ff1245f9d35';
const commitDirty = process.env.KAIRO_PAGES_COMMIT_DIRTY || 'true';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function copyIntoTemp(source, target) {
  cpSync(path.join(root, source), path.join(tmpRoot, target), { recursive: true });
}

run('npm', ['run', 'build'], {
  env: {
    ...process.env,
    VITE_KAIRO_API_BASE_URL: '',
  },
});

copyIntoTemp('dist', 'dist');
copyIntoTemp('worker', 'worker');
copyIntoTemp('shared', 'shared');
copyIntoTemp('functions', 'functions');

symlinkSync(path.join(root, 'node_modules'), path.join(tmpRoot, 'node_modules'), 'dir');

writeFileSync(
  path.join(tmpRoot, 'wrangler.toml'),
  `name = "${projectName}"
compatibility_date = "2026-06-26"
pages_build_output_dir = "dist"

[vars]
APP_ENV = "production"

[[d1_databases]]
binding = "DB"
database_name = "${databaseName}"
database_id = "${databaseId}"
`,
);

run(
  'npx',
  ['wrangler', 'pages', 'deploy', 'dist', '--project-name', projectName, '--branch', 'main', '--commit-dirty', commitDirty, '--cwd', tmpRoot],
);
