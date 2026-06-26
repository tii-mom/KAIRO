-- KAIRO local demo seed data.
-- Run with: wrangler d1 execute kairo-local --local --file=worker/db/seed.sql

INSERT OR REPLACE INTO users (
  id, email, display_name, avatar_url, role, wallet_address,
  twitter_handle, telegram_handle, created_at, updated_at
) VALUES
  ('user-demo-supporter', 'supporter@demo.kairo.local', 'Demo Supporter', 'https://api.dicebear.com/9.x/shapes/svg?seed=kairo-supporter', 'supporter', '0x1000000000000000000000000000000000000001', '@kairo_supporter', '@kairo_supporter', '2026-06-20T10:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('user-demo-builder', 'builder@demo.kairo.local', 'Demo Builder', 'https://api.dicebear.com/9.x/shapes/svg?seed=kairo-builder', 'builder', '0x2000000000000000000000000000000000000002', '@kairo_builder', '@kairo_builder', '2026-06-20T10:05:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('user-demo-admin', 'admin@demo.kairo.local', 'Demo Admin', 'https://api.dicebear.com/9.x/shapes/svg?seed=kairo-admin', 'admin', '0x3000000000000000000000000000000000000003', '@kairo_admin', '@kairo_admin', '2026-06-20T10:10:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('user-builder-mira', 'mira@demo.kairo.local', 'Mira Protocols', 'https://api.dicebear.com/9.x/shapes/svg?seed=mira', 'builder', '0x4000000000000000000000000000000000000004', '@mira_protocols', '@mira_protocols', '2026-06-21T09:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('user-builder-orion', 'orion@demo.kairo.local', 'Orion Labs', 'https://api.dicebear.com/9.x/shapes/svg?seed=orion', 'builder', '0x5000000000000000000000000000000000000005', '@orion_labs', '@orion_labs', '2026-06-21T09:30:00.000Z', '2026-06-26T10:00:00.000Z');

INSERT OR REPLACE INTO tokens (
  id, name, symbol, chain, contract_address, logo_url, website_url,
  twitter_url, telegram_url, status, created_at, updated_at
) VALUES
  ('token-dorm', 'Dormant Yields', 'DORM', 'Arbitrum', '0xd000000000000000000000000000000000000001', 'https://api.dicebear.com/9.x/shapes/svg?seed=dorm', 'https://demo.kairo.local/tokens/dorm', 'https://x.com/dormantyields', 'https://t.me/dormantyields', 'sleeping', '2026-06-20T11:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('token-ember', 'Ember DAO', 'EMBER', 'Base', '0xe000000000000000000000000000000000000002', 'https://api.dicebear.com/9.x/shapes/svg?seed=ember', 'https://demo.kairo.local/tokens/ember', 'https://x.com/emberdao', 'https://t.me/emberdao', 'reviving', '2026-06-20T11:05:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('token-atlas', 'Atlas Mesh', 'ATLAS', 'Ethereum', '0xa000000000000000000000000000000000000003', 'https://api.dicebear.com/9.x/shapes/svg?seed=atlas', 'https://demo.kairo.local/tokens/atlas', 'https://x.com/atlasmesh', 'https://t.me/atlasmesh', 'sleeping', '2026-06-20T11:10:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('token-pixel', 'Pixel Grove', 'PXG', 'Polygon', '0x9000000000000000000000000000000000000004', 'https://api.dicebear.com/9.x/shapes/svg?seed=pxg', 'https://demo.kairo.local/tokens/pxg', 'https://x.com/pixelgrove', 'https://t.me/pixelgrove', 'reviving', '2026-06-20T11:15:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('token-neon', 'Neon Keepers', 'NEON', 'Optimism', '0x7000000000000000000000000000000000000005', 'https://api.dicebear.com/9.x/shapes/svg?seed=neon', 'https://demo.kairo.local/tokens/neon', 'https://x.com/neonkeepers', 'https://t.me/neonkeepers', 'sleeping', '2026-06-20T11:20:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('token-lumen', 'Lumen Vault', 'LUMEN', 'Solana', 'So11111111111111111111111111111111111111115', 'https://api.dicebear.com/9.x/shapes/svg?seed=lumen', 'https://demo.kairo.local/tokens/lumen', 'https://x.com/lumenvault', 'https://t.me/lumenvault', 'sleeping', '2026-06-20T11:25:00.000Z', '2026-06-26T10:00:00.000Z');

INSERT OR REPLACE INTO bounties (
  id, token_id, created_by, title, description, reward_text, reward_type,
  funding_status, contact_info, deadline, status, boost_count,
  momentum_score, submission_count, featured, created_at, updated_at
) VALUES
  ('bounty-dorm-miniapp', 'token-dorm', 'user-demo-admin', 'Build the DORM Telegram Yield Mini App', 'Create a Telegram Mini App that helps Dormant Yields holders discover revived vault strategies and claim reactivation quests.', '35,000 DORM + 2,500 USDC', 'token', 'escrowed', 'admin@demo.kairo.local', '2026-07-20T23:59:59.000Z', 'active', 142, 18650, 2, 1, '2026-06-21T12:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('bounty-ember-reputation', 'token-ember', 'user-demo-admin', 'Ember DAO Contributor Reputation Dashboard', 'Ship a contributor reputation dashboard that turns old governance activity into visible proof for new working groups.', '18,000 EMBER', 'token', 'pledged', 'ops@ember.demo', '2026-07-18T23:59:59.000Z', 'active', 96, 14300, 1, 1, '2026-06-21T12:20:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('bounty-atlas-indexer', 'token-atlas', 'user-demo-admin', 'Atlas Mesh Dormant Wallet Indexer', 'Index dormant Atlas wallets and surface reactivation cohorts for targeted community campaigns.', '4,000 USDC', 'offchain', 'escrowed', 'revival@atlas.demo', '2026-07-25T23:59:59.000Z', 'active', 78, 12100, 1, 0, '2026-06-21T12:40:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('bounty-pxg-ugc', 'token-pixel', 'user-demo-admin', 'Pixel Grove UGC Quest Engine', 'Prototype a quest engine that rewards holders for remixing Pixel Grove assets and posting verified creations.', '12,500 PXG + merch pool', 'token', 'pledged', 'quests@pixel.demo', '2026-07-30T23:59:59.000Z', 'active', 88, 13450, 1, 1, '2026-06-21T13:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('bounty-neon-genesis', 'token-neon', 'user-demo-admin', 'Neon Keepers Genesis Catalyst Kit', 'Design the landing page, waitlist mechanics, and social proof feed for a potential Neon Keepers genesis round.', '8,000 USDC', 'offchain', 'unverified', 'genesis@neon.demo', '2026-08-02T23:59:59.000Z', 'pending_review', 52, 8200, 0, 0, '2026-06-21T13:20:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('bounty-lumen-audit', 'token-lumen', 'user-demo-admin', 'Lumen Vault Proof-of-Reserve Audit Widget', 'Build an embeddable widget that explains Lumen Vault reserves and monitors proof freshness for community trust.', '6,500 USDC', 'offchain', 'escrowed', 'security@lumen.demo', '2026-08-05T23:59:59.000Z', 'active', 61, 9700, 0, 0, '2026-06-21T13:40:00.000Z', '2026-06-26T10:00:00.000Z');

INSERT OR REPLACE INTO submissions (
  id, bounty_id, builder_id, name, tagline, demo_url, github_url, video_url,
  screenshot_url, description, status, boost_count, momentum_score,
  delivery_status, created_at, updated_at
) VALUES
  ('submission-dorm-pulsebot', 'bounty-dorm-miniapp', 'user-demo-builder', 'DORM PulseBot', 'Telegram-first vault discovery with support quests.', 'https://demo.kairo.local/submissions/dorm-pulsebot', 'https://github.com/kairo-demo/dorm-pulsebot', 'https://demo.kairo.local/video/dorm-pulsebot', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', 'A Mini App that maps dormant wallets to revived vaults, guides claims, and emits shareable proof cards.', 'shortlisted', 47, 7100, 'submitted_for_review', '2026-06-23T09:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('submission-dorm-vaultlens', 'bounty-dorm-miniapp', 'user-builder-mira', 'VaultLens Reactivation', 'Holder segmentation and vault recommender.', 'https://demo.kairo.local/submissions/vaultlens', 'https://github.com/kairo-demo/vaultlens', NULL, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31', 'Segment dormant holders by historical yield behavior and recommend the safest re-entry journey.', 'submitted', 29, 4300, 'building', '2026-06-23T10:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('submission-ember-forge', 'bounty-ember-reputation', 'user-builder-orion', 'Ember Forge', 'Governance reputation from old votes to new squads.', 'https://demo.kairo.local/submissions/ember-forge', 'https://github.com/kairo-demo/ember-forge', 'https://demo.kairo.local/video/ember-forge', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa', 'Transforms old Snapshot and forum activity into contributor badges and squad matching.', 'submitted', 35, 5400, 'submitted_for_review', '2026-06-23T11:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('submission-atlas-radar', 'bounty-atlas-indexer', 'user-demo-builder', 'Atlas Radar', 'Dormant wallet cohorts with campaign exports.', 'https://demo.kairo.local/submissions/atlas-radar', 'https://github.com/kairo-demo/atlas-radar', NULL, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', 'Indexes holder inactivity, labels whale clusters, and exports privacy-safe activation lists.', 'submitted', 24, 3900, 'building', '2026-06-24T09:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('submission-pxg-remix', 'bounty-pxg-ugc', 'user-builder-mira', 'PXG Remix Quests', 'UGC quests with proof cards for Pixel Grove holders.', 'https://demo.kairo.local/submissions/pxg-remix', 'https://github.com/kairo-demo/pxg-remix', 'https://demo.kairo.local/video/pxg-remix', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742', 'A creative challenge engine with asset packs, verification queues, and holder reward proofs.', 'winner', 58, 8900, 'completed', '2026-06-24T11:00:00.000Z', '2026-06-26T10:00:00.000Z');

INSERT OR REPLACE INTO support_points (
  user_id, total_points, boost_points, referral_points, share_points,
  valid_boost_count, updated_at
) VALUES
  ('user-demo-supporter', 1260, 1080, 120, 60, 72, '2026-06-26T10:00:00.000Z'),
  ('user-demo-builder', 540, 420, 60, 60, 28, '2026-06-26T10:00:00.000Z'),
  ('user-demo-admin', 230, 200, 0, 30, 12, '2026-06-26T10:00:00.000Z');

INSERT OR REPLACE INTO support_events (
  id, user_id, event_type, target_type, target_id, bounty_id,
  submission_id, referrer_id, points_delta, validity_status, source,
  metadata_json, created_at
) VALUES
  ('support-event-001', 'user-demo-supporter', 'boost_bounty', 'bounty', 'bounty-dorm-miniapp', 'bounty-dorm-miniapp', NULL, NULL, 10, 'valid', 'homepage_banner', '{"label":"Banner boost"}', '2026-06-25T08:00:00.000Z'),
  ('support-event-002', 'user-demo-supporter', 'boost_submission', 'submission', 'submission-dorm-pulsebot', 'bounty-dorm-miniapp', 'submission-dorm-pulsebot', NULL, 15, 'valid', 'submission_card', '{"label":"Builder support"}', '2026-06-25T08:10:00.000Z'),
  ('support-event-003', 'user-demo-supporter', 'share', 'bounty', 'bounty-pxg-ugc', 'bounty-pxg-ugc', NULL, NULL, 30, 'valid', 'share_button', '{"network":"x"}', '2026-06-25T08:20:00.000Z'),
  ('support-event-004', 'user-demo-builder', 'boost_bounty', 'bounty', 'bounty-ember-reputation', 'bounty-ember-reputation', NULL, 'user-demo-supporter', 10, 'valid', 'referral', '{"campaign":"ember-revival"}', '2026-06-25T09:00:00.000Z'),
  ('support-event-005', 'user-demo-admin', 'boost_submission', 'submission', 'submission-pxg-remix', 'bounty-pxg-ugc', 'submission-pxg-remix', NULL, 15, 'valid', 'admin_review', '{"note":"Featured win"}', '2026-06-25T09:30:00.000Z'),
  ('support-event-006', 'user-demo-supporter', 'boost_bounty', 'bounty', 'bounty-atlas-indexer', 'bounty-atlas-indexer', NULL, NULL, 10, 'valid', 'dormant_giants', '{"rank":2}', '2026-06-25T10:00:00.000Z'),
  ('support-event-007', 'user-demo-builder', 'share', 'submission', 'submission-atlas-radar', 'bounty-atlas-indexer', 'submission-atlas-radar', NULL, 30, 'valid', 'builder_hub', '{"network":"telegram"}', '2026-06-25T10:30:00.000Z');

INSERT OR REPLACE INTO builder_scores (
  builder_id, total_score, submitted_count, shortlisted_count, won_count,
  completed_count, confirmed_reward_completed_count, boost_count,
  referral_boost_count, violation_count, dispute_lost_count, updated_at
) VALUES
  ('user-demo-builder', 15100, 2, 1, 0, 0, 0, 71, 8, 0, 0, '2026-06-26T10:00:00.000Z'),
  ('user-builder-mira', 18900, 2, 1, 1, 1, 1, 87, 12, 0, 0, '2026-06-26T10:00:00.000Z'),
  ('user-builder-orion', 10400, 1, 0, 0, 0, 0, 35, 5, 0, 0, '2026-06-26T10:00:00.000Z');

INSERT OR REPLACE INTO curated_items (
  id, item_type, placement, target_type, target_id, title, description,
  image_url, external_url, sort_order, status, created_at, updated_at
) VALUES
  ('curated-homepage-banner-dorm', 'homepage_banner', 'home', 'bounty', 'bounty-dorm-miniapp', 'DORM revival sprint is live', 'Escrow-backed DORM rewards are ready for builders who can revive dormant yield demand.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', NULL, 1, 'active', '2026-06-25T07:00:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('curated-dormant-giants-atlas', 'dormant_giants', 'home', 'token', 'token-atlas', 'Atlas Mesh: large holder base, low activity', 'A once-active infrastructure token with whale cohorts waiting for a credible activation campaign.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', NULL, 10, 'active', '2026-06-25T07:05:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('curated-breakout-stories-pxg', 'breakout_stories', 'home', 'submission', 'submission-pxg-remix', 'PXG Remix Quests turned holders into creators', 'A winning builder submission shows how proof cards can convert passive holders into viral UGC loops.', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742', NULL, 20, 'active', '2026-06-25T07:10:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('curated-genesis-candidates-neon', 'genesis_candidates', 'home', 'bounty', 'bounty-neon-genesis', 'Neon Keepers is testing genesis demand', 'A genesis candidate seeking a landing system, waitlist mechanics, and measurable social proof.', 'https://images.unsplash.com/photo-1519608487953-e999c86e7455', NULL, 30, 'active', '2026-06-25T07:15:00.000Z', '2026-06-26T10:00:00.000Z'),
  ('curated-featured-catalysts-ember', 'featured_catalysts', 'home', 'bounty', 'bounty-ember-reputation', 'Ember DAO needs contributor reputation', 'A featured catalyst for builders who can reconnect governance history to current work squads.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa', NULL, 40, 'active', '2026-06-25T07:20:00.000Z', '2026-06-26T10:00:00.000Z');

-- Internal escrow events are intentionally stored with operational event_type values.
-- Frontend consumers should label these as Funding Events / Reward Records rather than exposing internal names.
INSERT OR REPLACE INTO escrow_events (
  id, bounty_id, actor_id, event_type, amount_text, proof_url, note, created_at
) VALUES
  ('escrow-event-dorm-funded', 'bounty-dorm-miniapp', 'user-demo-admin', 'internal_funding_deposited', '35,000 DORM + 2,500 USDC', 'https://demo.kairo.local/proofs/dorm-funded', 'Funding event: multisig deposit confirmed for the DORM sprint.', '2026-06-22T08:00:00.000Z'),
  ('escrow-event-dorm-topup', 'bounty-dorm-miniapp', 'user-demo-admin', 'internal_funding_top_up', '500 USDC', 'https://demo.kairo.local/proofs/dorm-topup', 'Funding event: sponsor added review stipend for shortlisted builders.', '2026-06-24T08:00:00.000Z'),
  ('escrow-event-atlas-funded', 'bounty-atlas-indexer', 'user-demo-admin', 'internal_funding_deposited', '4,000 USDC', 'https://demo.kairo.local/proofs/atlas-funded', 'Funding event: stablecoin funding record received and tagged to Atlas indexer bounty.', '2026-06-22T09:00:00.000Z'),
  ('escrow-event-pxg-reward', 'bounty-pxg-ugc', 'user-demo-admin', 'internal_reward_recorded', '12,500 PXG + merch pool', 'https://demo.kairo.local/proofs/pxg-reward', 'Reward record: winning PXG Remix Quests delivery marked complete.', '2026-06-25T16:00:00.000Z'),
  ('escrow-event-lumen-funded', 'bounty-lumen-audit', 'user-demo-admin', 'internal_funding_deposited', '6,500 USDC', 'https://demo.kairo.local/proofs/lumen-funded', 'Funding event: reserve audit widget bounty confirmed pending submissions.', '2026-06-23T12:00:00.000Z');
