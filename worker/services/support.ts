import { getRow, listRows, type Env } from '../db/d1';

const DEMO_SUPPORTER_ID = 'user-demo-supporter';
const DEFAULT_ROLE = 'supporter';

export interface CurrentSupportUser {
  id: string;
  role: string;
  isDemoFallback: boolean;
}

interface SupportPointsRow {
  user_id: string;
  total_points: number | null;
  boost_points: number | null;
  referral_points: number | null;
  share_points: number | null;
  valid_boost_count: number | null;
  updated_at: string;
}

interface SupportEventRow {
  id: string;
  user_id: string;
  event_type: string;
  target_type: string;
  target_id: string;
  bounty_id: string | null;
  submission_id: string | null;
  referrer_id: string | null;
  points_delta: number | null;
  validity_status: string | null;
  source: string | null;
  metadata_json: string | null;
  created_at: string;
}

export interface SupportPoints {
  userId: string;
  totalPoints: number;
  boostPoints: number;
  referralPoints: number;
  sharePoints: number;
  validBoostCount: number;
  updatedAt: string | null;
}

export interface SupportEvent {
  id: string;
  userId: string;
  eventType: string;
  targetType: string;
  targetId: string;
  bountyId: string | null;
  submissionId: string | null;
  referrerId: string | null;
  pointsDelta: number;
  validityStatus: string;
  source: string;
  metadata: unknown;
  createdAt: string;
}

export interface ProofOfSupportPayload {
  user: CurrentSupportUser;
  points: SupportPoints;
  validBoostCount: number;
  events: SupportEvent[];
}

export function resolveCurrentSupportUser(headers: Headers): CurrentSupportUser {
  const headerUserId = headers.get('x-kairo-user-id')?.trim();
  const headerRole = headers.get('x-kairo-role')?.trim();

  return {
    id: headerUserId || DEMO_SUPPORTER_ID,
    role: headerRole || DEFAULT_ROLE,
    isDemoFallback: !headerUserId || !headerRole,
  };
}

export async function getSupportPoints(env: Env, userId: string): Promise<SupportPoints> {
  const row = await getRow<SupportPointsRow>(
    env.DB,
    `SELECT user_id, total_points, boost_points, referral_points, share_points, valid_boost_count, updated_at
     FROM support_points
     WHERE user_id = ?`,
    [userId],
  );

  return mapSupportPoints(row, userId);
}

export async function getSupportEvents(env: Env, userId: string): Promise<SupportEvent[]> {
  const rows = await listRows<SupportEventRow>(
    env.DB,
    `SELECT id, user_id, event_type, target_type, target_id, bounty_id, submission_id, referrer_id,
            points_delta, validity_status, source, metadata_json, created_at
     FROM support_events
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId],
  );

  return rows.map(mapSupportEvent);
}

export async function getProofOfSupport(env: Env, user: CurrentSupportUser): Promise<ProofOfSupportPayload> {
  const [points, events] = await Promise.all([
    getSupportPoints(env, user.id),
    getSupportEvents(env, user.id),
  ]);

  return {
    user,
    points,
    validBoostCount: points.validBoostCount,
    events,
  };
}

function mapSupportPoints(row: SupportPointsRow | null, userId: string): SupportPoints {
  return {
    userId,
    totalPoints: row?.total_points ?? 0,
    boostPoints: row?.boost_points ?? 0,
    referralPoints: row?.referral_points ?? 0,
    sharePoints: row?.share_points ?? 0,
    validBoostCount: row?.valid_boost_count ?? 0,
    updatedAt: row?.updated_at ?? null,
  };
}

function mapSupportEvent(row: SupportEventRow): SupportEvent {
  return {
    id: row.id,
    userId: row.user_id,
    eventType: row.event_type,
    targetType: row.target_type,
    targetId: row.target_id,
    bountyId: row.bounty_id,
    submissionId: row.submission_id,
    referrerId: row.referrer_id,
    pointsDelta: row.points_delta ?? 0,
    validityStatus: row.validity_status ?? 'valid',
    source: row.source ?? 'direct',
    metadata: parseMetadata(row.metadata_json),
    createdAt: row.created_at,
  };
}

function parseMetadata(metadataJson: string | null): unknown {
  if (!metadataJson) return null;

  try {
    return JSON.parse(metadataJson);
  } catch {
    return metadataJson;
  }
}
