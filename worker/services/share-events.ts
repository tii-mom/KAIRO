import { listRows, type Env } from '../db/d1';
import { shareEventSchema } from '../../shared/domain';

const POINTS = {
  copy: 5,
  x: 15,
  telegram: 15,
} as const;

function toSupportTarget(
  input: { targetType: 'catalyst' | 'submission' | 'proof' | 'home'; targetId?: string },
  userId: string,
) {
  switch (input.targetType) {
    case 'catalyst':
      return {
        targetType: 'bounty' as const,
        targetId: input.targetId ?? userId,
        bountyId: input.targetId ?? null,
        submissionId: null,
      };
    case 'submission':
      return {
        targetType: 'submission' as const,
        targetId: input.targetId ?? userId,
        bountyId: null,
        submissionId: input.targetId ?? null,
      };
    case 'proof':
    case 'home':
    default:
      return {
        targetType: 'profile' as const,
        targetId: input.targetId ?? userId,
        bountyId: null,
        submissionId: null,
      };
  }
}

export async function createShareEvent(env: Env, userId: string, payload: unknown) {
  const input = shareEventSchema.parse(payload);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const pointsDelta = POINTS[input.channel] ?? 0;
  const supportTarget = toSupportTarget(input, userId);

  // Anti-spam rule: check if same user shared the same target on the same channel on the same calendar day (UTC)
  const today = now.slice(0, 10); // YYYY-MM-DD
  const existing = await env.DB.prepare(
    `SELECT id FROM share_events 
     WHERE user_id = ? AND target_type = ? AND target_id = ? AND channel = ? AND SUBSTR(created_at, 1, 10) = ? 
     LIMIT 1`
  ).bind(userId, input.targetType, input.targetId ?? '', input.channel, today).first<{ id: string }>();

  const actualPointsDelta = existing ? 0 : pointsDelta;
  const metadata = {
    ...input.metadata,
    duplicate: !!existing,
    reason: existing ? 'duplicate_daily_share' : undefined,
  };

  const statements = [
    env.DB.prepare(
      `INSERT INTO share_events (id, user_id, target_type, target_id, channel, referrer_id, source, points_delta, validity_status, metadata_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'valid', ?, ?)`
    ).bind(
      id,
      userId,
      input.targetType,
      input.targetId ?? null,
      input.channel,
      input.referrerId ?? null,
      input.source ?? null,
      actualPointsDelta,
      JSON.stringify(metadata),
      now
    )
  ];

  if (actualPointsDelta > 0) {
    // Record support event
    const supportEventId = crypto.randomUUID();
    statements.push(
      env.DB.prepare(
        `INSERT INTO support_events (
          id, user_id, event_type, target_type, target_id, bounty_id, submission_id,
          referrer_id, points_delta, validity_status, source, metadata_json, created_at
        )
         VALUES (?, ?, 'share', ?, ?, ?, ?, ?, ?, 'valid', ?, ?, ?)`
      ).bind(
        supportEventId,
        userId,
        supportTarget.targetType,
        supportTarget.targetId,
        supportTarget.bountyId,
        supportTarget.submissionId,
        input.referrerId ?? null,
        actualPointsDelta,
        input.source ?? 'share',
        JSON.stringify(metadata),
        now
      )
    );

    // Update support points
    statements.push(
      env.DB.prepare(
        `INSERT INTO support_points (user_id, total_points, share_points, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           total_points = total_points + excluded.share_points,
           share_points = share_points + excluded.share_points,
           updated_at = excluded.updated_at`
      ).bind(userId, actualPointsDelta, actualPointsDelta, now)
    );
  }

  // Handle Referral Points attribution
  if (input.referrerId && input.referrerId !== userId) {
    // Award the referrer points for bringing a new action/user session, if not already referred
    const isAlreadyReferred = await env.DB.prepare(
      `SELECT id FROM referrals WHERE referrer_id = ? AND referred_user_id = ? LIMIT 1`
    ).bind(input.referrerId, userId).first<{ id: string }>();

    if (!isAlreadyReferred) {
      const referralId = crypto.randomUUID();
      const refSupportEventId = crypto.randomUUID();
      const referralPoints = 20; // 20 coordination points for successful referral

      statements.push(
        env.DB.prepare(
          `INSERT INTO referrals (id, referrer_id, referred_user_id, source, created_at)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(referralId, input.referrerId, userId, input.source ?? 'share', now)
      );

      statements.push(
        env.DB.prepare(
          `INSERT INTO support_events (id, user_id, event_type, target_type, target_id, points_delta, validity_status, source, created_at)
           VALUES (?, ?, 'referral_signup', 'profile', ?, ?, 'valid', ?, ?)`
        ).bind(refSupportEventId, input.referrerId, userId, referralPoints, input.source ?? 'referral', now)
      );

      statements.push(
        env.DB.prepare(
          `INSERT INTO support_points (user_id, total_points, referral_points, updated_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET
             total_points = total_points + excluded.referral_points,
             referral_points = referral_points + excluded.referral_points,
             updated_at = excluded.updated_at`
        ).bind(input.referrerId, referralPoints, referralPoints, now)
      );
    }
  }

  await env.DB.batch(statements);

  return {
    id,
    pointsDelta: actualPointsDelta,
    duplicate: !!existing,
    message: existing ? 'Daily share limit reached for this target' : 'Share recorded successfully',
  };
}

export async function listShareEventsByUser(env: Env, userId: string) {
  return listRows(
    env.DB,
    `SELECT * FROM share_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
    [userId],
  );
}

export async function getReferralSummary(env: Env, userId: string) {
  const shareCountRow = await env.DB.prepare(
    `SELECT COUNT(*) as count, SUM(points_delta) as pts FROM share_events WHERE user_id = ?`
  ).bind(userId).first<{ count: number; pts: number | null }>();

  const referralCountRow = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM referrals WHERE referrer_id = ?`
  ).bind(userId).first<{ count: number }>();

  const pointsRow = await env.DB.prepare(
    `SELECT share_points, referral_points FROM support_points WHERE user_id = ?`
  ).bind(userId).first<{ share_points: number; referral_points: number }>();

  return {
    userId,
    referralCode: userId,
    shareCount: shareCountRow?.count ?? 0,
    referralCount: referralCountRow?.count ?? 0,
    sharePoints: pointsRow?.share_points ?? 0,
    referralPoints: pointsRow?.referral_points ?? 0,
  };
}
