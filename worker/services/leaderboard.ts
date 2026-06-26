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
    `SELECT id, title, reward_text, funding_status, momentum_score, boost_count, submission_count
     FROM bounties
     WHERE status != 'hidden'
     ORDER BY momentum_score DESC, boost_count DESC, created_at DESC
     LIMIT ?`,
    [limit],
  );
}

export async function getConfirmedRewardCatalysts(env: Env, limit = DEFAULT_LIMIT) {
  const catalysts = await listRows<ConfirmedRewardCatalyst>(
    env.DB,
    `SELECT id, title, reward_text, funding_status, momentum_score, boost_count, submission_count
     FROM bounties
     WHERE funding_status IN (?, ?, ?)
       AND status != 'hidden'
     ORDER BY momentum_score DESC, boost_count DESC, created_at DESC
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
    `SELECT builder_id, total_score, submitted_count, shortlisted_count, won_count,
            completed_count, confirmed_reward_completed_count, boost_count, referral_boost_count
     FROM builder_scores
     ORDER BY total_score DESC, won_count DESC, completed_count DESC, boost_count DESC, updated_at DESC
     LIMIT ?`,
    [limit],
  );
}

export async function getMostBoostedSubmissions(env: Env, limit = DEFAULT_LIMIT) {
  return listRows(
    env.DB,
    `SELECT id, bounty_id, builder_id, name, tagline, demo_url, github_url, video_url,
            screenshot_url, status, boost_count, momentum_score, delivery_status, created_at
     FROM submissions
     WHERE status != 'hidden'
     ORDER BY boost_count DESC, momentum_score DESC, created_at DESC
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
