import { createBountySchema, updateBountySchema } from '../../shared/domain';
import { getRow, listRows, type Env } from '../db/d1';

export async function listBounties(env: Env) {
  return listRows(
    env.DB,
    `SELECT bounties.*, tokens.symbol AS token_symbol, tokens.name AS token_name
     FROM bounties
     LEFT JOIN tokens ON tokens.id = bounties.token_id
     ORDER BY bounties.momentum_score DESC, bounties.created_at DESC
     LIMIT 50`,
  );
}

export async function getBounty(env: Env, id: string) {
  return getRow(
    env.DB,
    `SELECT bounties.*, tokens.symbol AS token_symbol, tokens.name AS token_name
     FROM bounties
     LEFT JOIN tokens ON tokens.id = bounties.token_id
     WHERE bounties.id = ?`,
    [id],
  );
}

export async function createBounty(env: Env, payload: unknown) {
  const input = createBountySchema.parse(payload);
  const now = new Date().toISOString();
  const tokenId = input.tokenId;
  const bountyId = crypto.randomUUID();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT OR IGNORE INTO tokens (id, name, symbol, status, created_at, updated_at)
       VALUES (?, ?, ?, 'sleeping', ?, ?)`,
    ).bind(tokenId, input.tokenSymbol ?? tokenId, input.tokenSymbol ?? tokenId, now, now),
    env.DB.prepare(
      `INSERT INTO bounties (
        id, token_id, created_by, title, description, reward_text, reward_type,
        funding_status, contact_info, deadline, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, ?)`,
    ).bind(
      bountyId,
      tokenId,
      input.createdBy,
      input.title,
      input.description,
      input.rewardText ?? null,
      input.rewardType,
      input.fundingStatus,
      input.contactInfo ?? null,
      input.deadline ?? null,
      now,
      now,
    ),
  ]);

  return getBounty(env, bountyId);
}

export async function updateBounty(env: Env, id: string, payload: unknown) {
  const input = updateBountySchema.parse(payload);
  const updates: string[] = [];
  const bindings: unknown[] = [];

  const set = (column: string, value: unknown) => {
    updates.push(`${column} = ?`);
    bindings.push(value ?? null);
  };

  if (input.tokenId !== undefined) set('token_id', input.tokenId);
  if (input.title !== undefined) set('title', input.title);
  if (input.description !== undefined) set('description', input.description);
  if (input.rewardText !== undefined) set('reward_text', input.rewardText);
  if (input.rewardType !== undefined) set('reward_type', input.rewardType);
  if (input.fundingStatus !== undefined) set('funding_status', input.fundingStatus);
  if (input.contactInfo !== undefined) set('contact_info', input.contactInfo);
  if (input.deadline !== undefined) set('deadline', input.deadline);
  if (input.status !== undefined) set('status', input.status);
  if (input.featured !== undefined) set('featured', input.featured ? 1 : 0);

  if (updates.length === 0) return getBounty(env, id);

  const now = new Date().toISOString();
  updates.push('updated_at = ?');
  bindings.push(now, id);

  await env.DB.prepare(`UPDATE bounties SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();
  return getBounty(env, id);
}
