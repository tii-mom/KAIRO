import { z } from 'zod';
import { bountyStatuses, curatedItemSchema, deliveryStatuses, fundingStatuses, submissionStatuses } from '../../shared/domain';
import { getRow, listRows, type Env } from '../db/d1';
import { normalizeValidityStatus } from '../lib/http';

const curatedPayloadSchema = curatedItemSchema.omit({ id: true }).extend({
  imageUrl: z.string().url().optional().or(z.literal('')).transform((value) => value || undefined),
  externalUrl: z.string().url().optional().or(z.literal('')).transform((value) => value || undefined),
});

const curatedPatchSchema = curatedPayloadSchema.partial();

const fundingEventSchema = z.object({
  amountText: z.string().min(1).optional(),
  proofUrl: z.string().url().optional().or(z.literal('')).transform((value) => value || undefined),
  note: z.string().min(1),
  eventType: z.string().min(1).default('reward_recorded'),
});

const bountyStatusSchema = z.object({ status: z.enum(bountyStatuses) });
const bountyFundingStatusSchema = z.object({ fundingStatus: z.enum(fundingStatuses) });
const submissionStatusSchema = z.object({ status: z.enum(submissionStatuses) });
const submissionDeliveryStatusSchema = z.object({ deliveryStatus: z.enum(deliveryStatuses) });

export async function listAdminBounties(env: Env, filters: { status?: string; fundingStatus?: string }) {
  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (filters.status) {
    conditions.push('bounties.status = ?');
    bindings.push(filters.status);
  }

  if (filters.fundingStatus) {
    conditions.push('bounties.funding_status = ?');
    bindings.push(filters.fundingStatus);
  }

  return listRows(
    env.DB,
    `SELECT bounties.*, tokens.symbol AS token_symbol, tokens.name AS token_name
     FROM bounties
     LEFT JOIN tokens ON tokens.id = bounties.token_id
     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
     ORDER BY bounties.updated_at DESC, bounties.created_at DESC`,
    bindings,
  );
}

export async function updateAdminBountyStatus(env: Env, bountyId: string, payload: unknown) {
  const input = bountyStatusSchema.parse(payload);
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE bounties SET status = ?, updated_at = ? WHERE id = ?`).bind(input.status, now, bountyId).run();
  return getRow(env.DB, `SELECT * FROM bounties WHERE id = ?`, [bountyId]);
}

export async function updateAdminBountyFundingStatus(env: Env, bountyId: string, payload: unknown) {
  const input = bountyFundingStatusSchema.parse(payload);
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE bounties SET funding_status = ?, updated_at = ? WHERE id = ?`).bind(input.fundingStatus, now, bountyId).run();
  return getRow(env.DB, `SELECT * FROM bounties WHERE id = ?`, [bountyId]);
}

export async function createAdminFundingEvent(env: Env, bountyId: string, adminId: string, payload: unknown) {
  const input = fundingEventSchema.parse(payload);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO escrow_events (id, bounty_id, actor_id, event_type, amount_text, proof_url, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, bountyId, adminId, input.eventType, input.amountText ?? null, input.proofUrl ?? null, input.note, now).run();

  return getRow(env.DB, `SELECT * FROM escrow_events WHERE id = ?`, [id]);
}

export async function listAdminSubmissions(env: Env) {
  return listRows(
    env.DB,
    `SELECT submissions.*, bounties.title AS bounty_title
     FROM submissions
     LEFT JOIN bounties ON bounties.id = submissions.bounty_id
     ORDER BY submissions.updated_at DESC, submissions.created_at DESC`,
  );
}

export async function updateAdminSubmissionStatus(env: Env, submissionId: string, payload: unknown) {
  const input = submissionStatusSchema.parse(payload);
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE submissions SET status = ?, updated_at = ? WHERE id = ?`).bind(input.status, now, submissionId).run();
  return getRow(env.DB, `SELECT * FROM submissions WHERE id = ?`, [submissionId]);
}

export async function updateAdminSubmissionDeliveryStatus(env: Env, submissionId: string, payload: unknown) {
  const input = submissionDeliveryStatusSchema.parse(payload);
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE submissions SET delivery_status = ?, updated_at = ? WHERE id = ?`).bind(input.deliveryStatus, now, submissionId).run();
  return getRow(env.DB, `SELECT * FROM submissions WHERE id = ?`, [submissionId]);
}

async function updateValidityStatusTable(env: Env, table: 'boosts' | 'support_events', id: string, validityStatus: string) {
  await env.DB.prepare(`UPDATE ${table} SET validity_status = ? WHERE id = ?`).bind(validityStatus, id).run();
}

export async function listAdminBoosts(env: Env) {
  return listRows(env.DB, `SELECT * FROM boosts ORDER BY created_at DESC LIMIT 200`);
}

export async function patchAdminBoostValidityStatus(env: Env, boostId: string, payload: unknown) {
  const validityStatus = normalizeValidityStatus((payload as { validityStatus?: unknown }).validityStatus);
  await updateValidityStatusTable(env, 'boosts', boostId, validityStatus);
  return getRow(env.DB, `SELECT * FROM boosts WHERE id = ?`, [boostId]);
}

export async function listAdminSupportEvents(env: Env) {
  return listRows(env.DB, `SELECT * FROM support_events ORDER BY created_at DESC LIMIT 200`);
}

export async function patchAdminSupportEventValidityStatus(env: Env, eventId: string, payload: unknown) {
  const validityStatus = normalizeValidityStatus((payload as { validityStatus?: unknown }).validityStatus);
  await updateValidityStatusTable(env, 'support_events', eventId, validityStatus);
  return getRow(env.DB, `SELECT * FROM support_events WHERE id = ?`, [eventId]);
}

export async function listAdminCuratedItems(env: Env) {
  return listRows(env.DB, `SELECT * FROM curated_items ORDER BY placement ASC, sort_order ASC, created_at DESC`);
}

export async function createAdminCuratedItem(env: Env, payload: unknown) {
  const input = curatedPayloadSchema.parse(payload);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO curated_items (
      id, item_type, placement, target_type, target_id, title, description, image_url, external_url, sort_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id,
    input.itemType,
    input.placement,
    input.targetType,
    input.targetId ?? null,
    input.title,
    input.description ?? null,
    input.imageUrl ?? null,
    input.externalUrl ?? null,
    input.sortOrder,
    input.status,
    now,
    now,
  ).run();

  return getRow(env.DB, `SELECT * FROM curated_items WHERE id = ?`, [id]);
}

export async function updateAdminCuratedItem(env: Env, itemId: string, payload: unknown) {
  const input = curatedPatchSchema.parse(payload);
  const updates: string[] = [];
  const bindings: unknown[] = [];

  const set = (column: string, value: unknown) => {
    updates.push(`${column} = ?`);
    bindings.push(value ?? null);
  };

  if (input.itemType !== undefined) set('item_type', input.itemType);
  if (input.placement !== undefined) set('placement', input.placement);
  if (input.targetType !== undefined) set('target_type', input.targetType);
  if (input.targetId !== undefined) set('target_id', input.targetId);
  if (input.title !== undefined) set('title', input.title);
  if (input.description !== undefined) set('description', input.description);
  if (input.imageUrl !== undefined) set('image_url', input.imageUrl);
  if (input.externalUrl !== undefined) set('external_url', input.externalUrl);
  if (input.sortOrder !== undefined) set('sort_order', input.sortOrder);
  if (input.status !== undefined) set('status', input.status);

  if (!updates.length) {
    return getRow(env.DB, `SELECT * FROM curated_items WHERE id = ?`, [itemId]);
  }

  updates.push('updated_at = ?');
  bindings.push(new Date().toISOString(), itemId);
  await env.DB.prepare(`UPDATE curated_items SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();
  return getRow(env.DB, `SELECT * FROM curated_items WHERE id = ?`, [itemId]);
}

export async function getAdminStats(env: Env) {
  const [bounties, submissions, boosts, supportEvents, curatedItems] = await Promise.all([
    getRow<{ count: number }>(env.DB, `SELECT COUNT(*) AS count FROM bounties`),
    getRow<{ count: number }>(env.DB, `SELECT COUNT(*) AS count FROM submissions`),
    getRow<{ count: number }>(env.DB, `SELECT COUNT(*) AS count FROM boosts`),
    getRow<{ count: number }>(env.DB, `SELECT COUNT(*) AS count FROM support_events`),
    getRow<{ count: number }>(env.DB, `SELECT COUNT(*) AS count FROM curated_items WHERE status = 'active'`),
  ]);

  return {
    bounties: bounties?.count ?? 0,
    submissions: submissions?.count ?? 0,
    boosts: boosts?.count ?? 0,
    supportEvents: supportEvents?.count ?? 0,
    activeCuratedItems: curatedItems?.count ?? 0,
  };
}

export async function recordAdminAction(env: Env, adminId: string, actionType: string, targetType: string, targetId: string, note?: string) {
  await env.DB.prepare(
    `INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(crypto.randomUUID(), adminId, actionType, targetType, targetId, note ?? null, new Date().toISOString()).run();
}
