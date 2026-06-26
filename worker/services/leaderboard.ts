import { listRows, type Env } from '../db/d1';

export async function getHottestCatalysts(env: Env) {
  return listRows(
    env.DB,
    `SELECT id, title, momentum_score, boost_count, submission_count, funding_status, status
     FROM bounties
     ORDER BY momentum_score DESC, boost_count DESC, created_at DESC
     LIMIT 20`,
  );
}

export async function getConfirmedRewardCatalysts(env: Env) {
  return listRows(
    env.DB,
    `SELECT id, title, momentum_score, boost_count, submission_count, funding_status, status
     FROM bounties
     WHERE funding_status IN ('kairo_confirmed', 'paid')
     ORDER BY momentum_score DESC, created_at DESC
     LIMIT 20`,
  );
}

export async function getTopBuilders(env: Env) {
  return listRows(
    env.DB,
    `SELECT builder_id, total_score, submitted_count, won_count, completed_count, boost_count
     FROM builder_scores
     ORDER BY total_score DESC, won_count DESC, submitted_count DESC
     LIMIT 20`,
  );
}

export async function getMostBoostedSubmissions(env: Env) {
  return listRows(
    env.DB,
    `SELECT submissions.*, bounties.title AS bounty_title
     FROM submissions
     LEFT JOIN bounties ON bounties.id = submissions.bounty_id
     ORDER BY submissions.boost_count DESC, submissions.momentum_score DESC, submissions.created_at DESC
     LIMIT 20`,
  );
}

export async function getDormantGiants(env: Env) {
  return listRows(
    env.DB,
    `SELECT *
     FROM curated_items
     WHERE item_type = 'dormant_giant' AND status = 'active'
     ORDER BY sort_order ASC, created_at DESC
     LIMIT 20`,
  );
}

export async function getBreakoutStories(env: Env) {
  return listRows(
    env.DB,
    `SELECT *
     FROM curated_items
     WHERE item_type = 'breakout_story' AND status = 'active'
     ORDER BY sort_order ASC, created_at DESC
     LIMIT 20`,
  );
}

export async function getComebackHall(env: Env) {
  return listRows(
    env.DB,
    `SELECT bounties.id, bounties.title, bounties.momentum_score, bounties.boost_count, bounties.submission_count
     FROM bounties
     WHERE bounties.status IN ('completed', 'voting')
     ORDER BY bounties.momentum_score DESC, bounties.updated_at DESC
     LIMIT 20`,
  );
}

export async function getGenesisCandidates(env: Env) {
  return listRows(
    env.DB,
    `SELECT *
     FROM curated_items
     WHERE item_type = 'genesis_candidate' AND status = 'active'
     ORDER BY sort_order ASC, created_at DESC
     LIMIT 20`,
  );
}

export async function getLeaderboard(env: Env) {
  const [hottestCatalysts, topBuilders, curatedItems] = await Promise.all([
    getHottestCatalysts(env),
    getTopBuilders(env),
    listRows(
      env.DB,
      `SELECT *
       FROM curated_items
       WHERE status = 'active'
       ORDER BY sort_order ASC, created_at DESC
       LIMIT 30`,
    ),
  ]);

  return { hottestCatalysts, topBuilders, curatedItems };
}
