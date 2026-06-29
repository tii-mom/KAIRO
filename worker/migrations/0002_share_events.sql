-- KAIRO D1 Schema Migration V2
-- Share and Referral Events Tracking Table

CREATE TABLE IF NOT EXISTS share_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  channel TEXT NOT NULL,
  referrer_id TEXT,
  source TEXT,
  points_delta INTEGER NOT NULL DEFAULT 0,
  validity_status TEXT NOT NULL DEFAULT 'valid',
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_share_events_user_id ON share_events(user_id);
CREATE INDEX IF NOT EXISTS idx_share_events_target ON share_events(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_share_events_referrer_id ON share_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_share_events_created_at ON share_events(created_at);
