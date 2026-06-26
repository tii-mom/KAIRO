import { listRows, type Env } from '../db/d1';

const DEFAULT_LIMIT = 20;
const CURATED_LIMIT = 30;

const CONFIRMED_REWARD_STATUSES = ['escrowed', 'partially_paid', 'paid'] as const;

const FUNDING_STATUS_LABELS: Record<(typeof CONFIRMED_REWARD_STATUSES)[number], string> = {
  escrowed: 'Reward confirmed',
  partially_paid: 'Partial reward sent',
  paid: 'Reward paid',
};

type ConfirmedRewardCatalyst = {
  id: string;
  title: string;
  reward_text: string | null;
  funding_status: keyof typeof FUNDING_STATUS_LABELS;
  momentum_score: number;
  boost_count: number;
  submission_count: number;
};

export async function getHottestCatalysts(env: Env, limit = DEFAULT_LIMIT) {
  return listRows(
    env.DB,
    `SELECT bounties.id, bounties.title, bounties.reward_text, bounties.funding_status, bounties.momentum_score,
            COUNT(DISTINCT boosts.id) AS boost_count, bounties.submission_count
     FROM bounties
     LEFT JOIN boosts ON boosts.bounty_id = bounties.id AND boosts.validity_status = 'valid' AND boosts.submission_id IS NULL
     WHERE status != 'hidden'
     GROUP BY bounties.id
     ORDER BY bounties.momentum_score DESC, boost_count DESC, bounties.created_at DESC
     LIMIT ?`,
    [limit],
  );
}

export async function getConfirmedRewardCatalysts(env: Env, limit = DEFAULT_LIMIT) {
  const catalysts = await listRows<ConfirmedRewardCatalyst>(
    env.DB,
    `SELECT bounties.id, bounties.title, bounties.reward_text, bounties.funding_status, bounties.momentum_score,
            COUNT(DISTINCT boosts.id) AS boost_count, bounties.submission_count
     FROM bounties
     LEFT JOIN boosts ON boosts.bounty_id = bounties.id AND boosts.validity_status = 'valid' AND boosts.submission_id IS NULL
     WHERE funding_status IN (?, ?, ?)
       AND status != 'hidden'
     GROUP BY bounties.id
     ORDER BY bounties.momentum_score DESC, boost_count DESC, bounties.created_at DESC
     LIMIT ?`,
    [...CONFIRMED_REWARD_STATUSES, limit],
  );

  return catalysts.map((catalyst) => ({
    ...catalyst,
    funding_status_label: FUNDING_STATUS_LABELS[catalyst.funding_status],
  }));
}

export async function getTopBuilders(env: Env, limit = DEFAULT_LIMIT) {
  return listRows(
    env.DB,
    `SELECT builder_scores.builder_id, users.display_name AS builder_name, builder_scores.total_score,
            builder_scores.submitted_count, builder_scores.shortlisted_count, builder_scores.won_count,
            builder_scores.completed_count, builder_scores.confirmed_reward_completed_count, builder_scores.boost_count, builder_scores.referral_boost_count
     FROM builder_scores
     LEFT JOIN users ON users.id = builder_scores.builder_id
     ORDER BY builder_scores.total_score DESC, builder_scores.won_count DESC, builder_scores.completed_count DESC, builder_scores.boost_count DESC, builder_scores.updated_at DESC
     LIMIT ?`,
    [limit],
  );
}

export async function getMostBoostedSubmissions(env: Env, limit = DEFAULT_LIMIT) {
  return listRows(
    env.DB,
    `SELECT submissions.id, submissions.bounty_id, submissions.builder_id, submissions.name, submissions.tagline, submissions.demo_url, submissions.github_url, submissions.video_url,
            submissions.screenshot_url, submissions.status, COUNT(DISTINCT boosts.id) AS boost_count, submissions.momentum_score, submissions.delivery_status, submissions.created_at
     FROM submissions
     LEFT JOIN boosts ON boosts.submission_id = submissions.id AND boosts.validity_status = 'valid'
     WHERE status != 'hidden'
     GROUP BY submissions.id
     ORDER BY boost_count DESC, submissions.momentum_score DESC, submissions.created_at DESC
     LIMIT ?`,
    [limit],
  );
}

export async function getCuratedLeaderboardItems(env: Env, itemType: string, limit = CURATED_LIMIT) {
  return listRows(
    env.DB,
    `SELECT id, item_type, placement, target_type, target_id, title, description,
            image_url, external_url, sort_order, created_at, updated_at
     FROM curated_items
     WHERE status = 'active'
       AND item_type = ?
     ORDER BY sort_order ASC, created_at DESC
     LIMIT ?`,
    [itemType, limit],
  );
}

export async function getDormantGiants(env: Env, limit = CURATED_LIMIT) {
  return getCuratedLeaderboardItems(env, 'dormant_giant', limit);
}

export async function getBreakoutStories(env: Env, limit = CURATED_LIMIT) {
  return getCuratedLeaderboardItems(env, 'breakout_story', limit);
}

export async function getComebackHall(env: Env, limit = CURATED_LIMIT) {
  return getCuratedLeaderboardItems(env, 'comeback_hall', limit);
}

export async function getGenesisCandidates(env: Env, limit = CURATED_LIMIT) {
  return getCuratedLeaderboardItems(env, 'genesis_candidate', limit);
}

export async function getLeaderboard(env: Env) {
  const [
    hottestCatalysts,
    confirmedRewardCatalysts,
    topBuilders,
    mostBoostedSubmissions,
    dormantGiants,
    breakoutStories,
    comebackHall,
    genesisCandidates,
  ] = await Promise.all([
    getHottestCatalysts(env),
    getConfirmedRewardCatalysts(env),
    getTopBuilders(env),
    getMostBoostedSubmissions(env),
    getDormantGiants(env),
    getBreakoutStories(env),
    getComebackHall(env),
    getGenesisCandidates(env),
  ]);

  return {
    hottestCatalysts,
    confirmedRewardCatalysts,
    topBuilders,
    mostBoostedSubmissions,
    dormantGiants,
    breakoutStories,
    comebackHall,
    genesisCandidates,
  };
}
