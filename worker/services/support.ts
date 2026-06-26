import { getRow, listRows, type Env } from '../db/d1';

export async function getSupportPoints(env: Env, userId: string) {
  const points = await getRow(
    env.DB,
    `SELECT * FROM support_points WHERE user_id = ?`,
    [userId],
  );

  return (
    points ?? {
      user_id: userId,
      total_points: 0,
      boost_points: 0,
      referral_points: 0,
      share_points: 0,
      valid_boost_count: 0,
      updated_at: null,
    }
  );
}

export async function listSupportEvents(env: Env, userId: string) {
  return listRows(
    env.DB,
    `SELECT *
     FROM support_events
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId],
  );
}

export async function getProofOfSupport(env: Env, userId: string) {
  const [points, events] = await Promise.all([
    getSupportPoints(env, userId),
    listSupportEvents(env, userId),
  ]);

  return {
    user_id: userId,
    points,
    events,
    generated_at: new Date().toISOString(),
  };
}
