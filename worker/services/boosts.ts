import { createBoostSchema } from '../../shared/domain';
import { type Env } from '../db/d1';

const BOOST_POINTS = {
  bounty: 10,
  submission: 15,
} as const;

const BOOST_MOMENTUM = {
  bounty: 250,
  submission: 150,
} as const;

type SubmissionTarget = {
  bounty_id: string | null;
};

export async function createBoost(env: Env, payload: unknown) {
  const input = createBoostSchema.parse(payload);
  const now = new Date().toISOString();
  const boostId = crypto.randomUUID();
  const supportEventId = crypto.randomUUID();
  const targetType = input.submissionId ? 'submission' : 'bounty';
  const pointsDelta = input.submissionId ? BOOST_POINTS.submission : BOOST_POINTS.bounty;

  let bountyId = input.bountyId ?? null;

  if (input.submissionId) {
    const submission = await env.DB.prepare(
      `SELECT bounty_id
       FROM submissions
       WHERE id = ?`,
    )
      .bind(input.submissionId)
      .first<SubmissionTarget>();

    bountyId = input.bountyId ?? submission?.bounty_id ?? null;
  }

  const targetId = input.submissionId ?? bountyId;

  if (!targetId) {
    throw new Error('A Boost must target a bounty or submission.');
  }

  const existingBoost = input.submissionId
    ? await env.DB.prepare(
        `SELECT id
         FROM boosts
         WHERE user_id = ?
           AND submission_id = ?
           AND validity_status = 'valid'
         LIMIT 1`,
      )
        .bind(input.userId, input.submissionId)
        .first<{ id: string }>()
    : await env.DB.prepare(
        `SELECT id
         FROM boosts
         WHERE user_id = ?
           AND bounty_id = ?
           AND submission_id IS NULL
           AND validity_status = 'valid'
         LIMIT 1`,
      )
        .bind(input.userId, bountyId)
        .first<{ id: string }>();

  if (existingBoost) {
    return {
      duplicate: true,
      message: input.submissionId
        ? 'User already has a valid boost for this submission.'
        : 'User already has a valid boost for this bounty.',
      existingBoostId: existingBoost.id,
    };
  }

  const statements = [
    env.DB.prepare(
      `INSERT INTO boosts (id, user_id, bounty_id, submission_id, referrer_id, source, validity_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'valid', ?)`,
    ).bind(
      boostId,
      input.userId,
      bountyId,
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
      input.submissionId ? 'boost_submission' : 'boost_bounty',
      targetType,
      targetId,
      bountyId,
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
  ];

  if (input.submissionId) {
    statements.push(
      env.DB.prepare(
        `UPDATE submissions
         SET boost_count = boost_count + 1, momentum_score = momentum_score + ?, updated_at = ?
         WHERE id = ?`,
      ).bind(BOOST_MOMENTUM.submission, now, input.submissionId),
    );

    if (bountyId) {
      statements.push(
        env.DB.prepare(
          `UPDATE bounties
           SET momentum_score = momentum_score + ?, updated_at = ?
           WHERE id = ?`,
        ).bind(BOOST_MOMENTUM.submission, now, bountyId),
      );
    }
  } else {
    statements.push(
      env.DB.prepare(
        `UPDATE bounties
         SET boost_count = boost_count + 1, momentum_score = momentum_score + ?, updated_at = ?
         WHERE id = ?`,
      ).bind(BOOST_MOMENTUM.bounty, now, bountyId),
    );
  }

  await env.DB.batch(statements);

  return { id: boostId, supportEventId, pointsDelta, createdAt: now };
}
