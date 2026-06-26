import { listRows, type Env } from '../db/d1';

export async function listFundingEventsByBounty(env: Env, bountyId: string) {
  return listRows(
    env.DB,
    `SELECT id, bounty_id, actor_id, event_type, amount_text, proof_url, note, created_at
     FROM escrow_events
     WHERE bounty_id = ?
     ORDER BY created_at DESC`,
    [bountyId],
  );
}
