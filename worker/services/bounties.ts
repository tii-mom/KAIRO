import { createBountySchema } from '../../shared/domain';
import { getRow, listRows, type Env } from '../db/d1';

export async function listBounties(env: Env) {
  return listRows(env.DB,
    `SELECT bounties.*, tokens.symbol AS token_symbol, tokens.name AS token_name
     FROM bounties LEFT JOIN tokens ON tokens.id = bounties.token_id
     ORDER BY bounties.momentum_score DESC, bounties.created_at DESC LIMIT 50`);
}

export async function getBounty(env: Env, id: string) {
  return getRow(env.DB,
    `SELECT bounties.*, tokens.symbol AS token_symbol, tokens.name AS token_name
     FROM bounties LEFT JOIN tokens ON tokens.id = bounties.token_id
     WHERE bounties.id = ?`, [id]);
}

export async function createBounty(env: Env, payload: unknown) {
  const input = createBountySchema.parse(payload);
  const now = new Date().toISOString();
  const tokenId = input.tokenId;
  const bountyId = crypto.randomUUID();
  await env.DB.batch([
    env.DB.prepare(`INSERT OR IGNORE INTO tokens (id, name, symbol, status, created_at, updated_at) VALUES (?, ?, ?, 'sleeping', ?, ?)`).bind(tokenId, input.tokenSymbol ?? tokenId, input.tokenSymbol ?? tokenId, now, now),
    env.DB.prepare(`INSERT INTO bounties (id, token_id, created_by, title, description, reward_text, reward_type, funding_status, contact_info, deadline, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, ?)`).bind(bountyId, tokenId, input.createdBy, input.title, input.description, input.rewardText ?? null, input.rewardType, input.fundingStatus, input.contactInfo ?? null, input.deadline ?? null, now, now),
  ]);
  return getBounty(env, bountyId);
}

export async function updateBounty(env: Env, id: string, payload: Record<string, unknown>) {
  const now = new Date().toISOString();
  const sets: string[] = []; const vals: unknown[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (['title','description','reward_text','funding_status','status','deadline','contact_info'].includes(k)) {
      sets.push(`${k} = ?`); vals.push(v);
    }
  }
  if (sets.length === 0) return getBounty(env, id);
  sets.push('updated_at = ?'); vals.push(now); vals.push(id);
  await env.DB.prepare(`UPDATE bounties SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  return getBounty(env, id);
}
