import { listRows, type Env } from '../db/d1';

export async function listCuratedItems(env: Env) {
  return listRows(
    env.DB,
    `SELECT *
     FROM curated_items
     WHERE status = 'active'
     ORDER BY placement ASC, sort_order ASC, created_at DESC`,
  );
}

export async function getCuratedItemsByPlacement(env: Env, placement: string) {
  return listRows(
    env.DB,
    `SELECT *
     FROM curated_items
     WHERE status = 'active' AND placement = ?
     ORDER BY sort_order ASC, created_at DESC`,
    [placement],
  );
}

export async function getCuratedItemsByType(env: Env, itemType: string) {
  return listRows(
    env.DB,
    `SELECT *
     FROM curated_items
     WHERE status = 'active' AND item_type = ?
     ORDER BY sort_order ASC, created_at DESC`,
    [itemType],
  );
}
