-- Generated KAIRO beta import SQL. Review before applying to D1.
-- Source: content/beta-import.reviewed-2026-06-27.json
BEGIN TRANSACTION;
INSERT OR REPLACE INTO tokens (id,name,symbol,chain,contract_address,logo_url,website_url,twitter_url,telegram_url,status,created_at,updated_at) VALUES
('token-real-example','Example Dormant Network','EXDN','Base','0x0000000000000000000000000000000000000000',NULL,'https://example.org','https://x.com/example','https://t.me/example','sleeping','2026-06-27T08:30:00.000Z','2026-06-27T08:30:00.000Z');

INSERT OR REPLACE INTO bounties (id,token_id,created_by,title,description,reward_text,reward_type,funding_status,contact_info,deadline,status,boost_count,momentum_score,submission_count,featured,created_at,updated_at) VALUES
('bounty-real-example-dashboard','token-real-example','user-demo-admin','Example Dormant Network Contributor Dashboard','Build a public dashboard that helps the community understand recent workstreams, demo submissions, and supporter activity.','Sponsor reward information pending admin confirmation','offchain','unverified','ops@example.org','2026-08-15T23:59:59.000Z','pending_review',0,0,0,0,'2026-06-27T08:30:00.000Z','2026-06-27T08:30:00.000Z');

INSERT OR REPLACE INTO submissions (id,bounty_id,builder_id,name,tagline,demo_url,github_url,video_url,screenshot_url,description,status,boost_count,momentum_score,delivery_status,created_at,updated_at) VALUES
('submission-real-example-dashboard','bounty-real-example-dashboard','user-demo-builder','Example Contributor Lens','A read-only dashboard for workstream and support visibility.','https://example.org/demo','https://github.com/example/example-contributor-lens',NULL,NULL,'Shows recent builder work, community support events, and next-step recommendations.','submitted',0,0,'submitted_for_review','2026-06-27T08:30:00.000Z','2026-06-27T08:30:00.000Z');

INSERT OR REPLACE INTO curated_items (id,item_type,placement,target_type,target_id,title,description,image_url,external_url,sort_order,status,created_at,updated_at) VALUES
('curated-real-example-dormant','dormant_giant','dormant_giant','token','token-real-example','Example Dormant Network: quiet community, clear workflow gap','A beta candidate with public community channels, recent low activity, and a concrete dashboard Catalyst angle.',NULL,'https://example.org',100,'active','2026-06-27T08:30:00.000Z','2026-06-27T08:30:00.000Z');

INSERT OR REPLACE INTO escrow_events (id,bounty_id,actor_id,event_type,amount_text,proof_url,note,created_at) VALUES
('funding-event-real-example-note','bounty-real-example-dashboard','user-demo-admin','admin_note','Reward information pending','https://example.org/evidence','Funding Event: sponsor information is under review and not guaranteed by KAIRO.','2026-06-27T08:30:00.000Z');

COMMIT;
