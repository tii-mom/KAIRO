import { createBoostSchema } from '../../shared/domain';
import { type Env } from '../db/d1';

export async function createBoost(env: Env, payload: unknown) {
  const input = createBoostSchema.parse(payload);
  const now = new Date().toISOString();
  const boostId = crypto.randomUUID();
  const supportEventId = crypto.randomUUID();
  const targetType = input.submissionId ? 'submission' : 'bounty';
  const targetId = input.submissionId ?? input.bountyId;
  const pointsDelta = input.submissionId ? 15 : 10;
  const eventType = input.submissionId ? 'boost_submission' : 'boost_bounty';

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO boosts (id, user_id, bounty_id, submission_id, referrer_id, source, validity_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'valid', ?)`,
    ).bind(
      boostId,
      input.userId,
      input.bountyId ?? null,
      input.submissionId ?? null,
      input.referrerId ?? null,
      input.source,
      now,
    ),
    env.DB.prepare(
      `INSERT INTO support_events (
        id, user_id, event_type, target_type, target_id, bounty_id,
        submission_id, referrer_id, points_delta, validity_status, source, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'valid', ?, ?)`,
    ).bind(
      supportEventId,
      input.userId,
      eventType,
      targetType,
      targetId,
      input.bountyId ?? null,
      input.submissionId ?? null,
      input.referrerId ?? null,
      pointsDelta,
      input.source,
      now,
    ),
    env.DB.prepare(
      `INSERT INTO support_points (
        user_id, total_points, boost_points, valid_boost_count, updated_at
      ) VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        total_points = total_points + excluded.total_points,
        boost_points = boost_points + excluded.boost_points,
        valid_boost_count = valid_boost_count + 1,
        updated_at = excluded.updated_at`,
    ).bind(input.userId, pointsDelta, pointsDelta, now),
    env.DB.prepare(
      `UPDATE bounties
       SET boost_count = boost_count + 1, momentum_score = momentum_score + 250, updated_at = ?
       WHERE id = ?`,
    ).bind(now, input.bountyId ?? ''),
    env.DB.prepare(
      `UPDATE submissions
       SET boost_count = boost_count + 1, momentum_score = momentum_score + 150, updated_at = ?
       WHERE id = ?`,
    ).bind(now, input.submissionId ?? ''),
  ]);

  return { id: boostId, supportEventId, pointsDelta, createdAt: now };
}
