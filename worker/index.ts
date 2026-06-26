import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { createBoost } from './services/boosts';
import {
  createAdminCuratedItem,
  createAdminFundingEvent,
  getAdminStats,
  listAdminBoosts,
  listAdminBounties,
  listAdminCuratedItems,
  listAdminSubmissions,
  listAdminSupportEvents,
  patchAdminBoostValidityStatus,
  patchAdminSupportEventValidityStatus,
  recordAdminAction,
  updateAdminBountyFundingStatus,
  updateAdminBountyStatus,
  updateAdminCuratedItem,
  updateAdminSubmissionDeliveryStatus,
  updateAdminSubmissionStatus,
} from './services/admin';
import { createBounty, getBounty, listBounties, updateBounty } from './services/bounties';
import { getCuratedItemsByPlacement, getCuratedItemsByType, listCuratedItems } from './services/curated';
import { listFundingEventsByBounty } from './services/funding-events';
import {
  getBreakoutStories,
  getComebackHall,
  getConfirmedRewardCatalysts,
  getDormantGiants,
  getGenesisCandidates,
  getHottestCatalysts,
  getLeaderboard,
  getMostBoostedSubmissions,
  getTopBuilders,
} from './services/leaderboard';
import { getProofOfSupport, getSupportEvents, getSupportPoints, resolveCurrentSupportUser } from './services/support';
import { createSubmission, getSubmission, listSubmissions, patchSubmission } from './services/submissions';
import type { Env } from './db/d1';
import { getCurrentUserFromHeaders, requireAdmin, safeJsonError } from './lib/http';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    service: 'kairo-worker',
    terms: ['Catalyst', 'Boost', 'Momentum', 'Funding Events', 'Proof of Support', 'KAIRO Score'],
  }),
);

app.get('/api/bounties', async (c) => c.json({ data: await listBounties(c.env) }));

app.get('/api/bounties/:id', async (c) => {
  const bounty = await getBounty(c.env, c.req.param('id'));
  if (!bounty) return c.json({ error: 'Bounty not found' }, 404);
  return c.json({ data: bounty });
});

app.post('/api/bounties', async (c) => {
  const user = getCurrentUserFromHeaders(c);
  return c.json({ data: await createBounty(c.env, { ...(await c.req.json()), createdBy: user.id }) }, 201);
});

app.patch('/api/bounties/:id', async (c) => {
  const bounty = await updateBounty(c.env, c.req.param('id'), await c.req.json());
  if (!bounty) return c.json({ error: 'Bounty not found' }, 404);
  return c.json({ data: bounty });
});

app.get('/api/bounties/:id/funding-events', async (c) =>
  c.json({ data: await listFundingEventsByBounty(c.env, c.req.param('id')) }),
);

app.post('/api/bounties/:id/boost', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const user = getCurrentUserFromHeaders(c);
  return c.json({ data: await createBoost(c.env, { ...body, userId: body.userId ?? user.id, bountyId: c.req.param('id') }) }, 201);
});

app.get('/api/bounties/:id/submissions', async (c) => c.json({ data: await listSubmissions(c.env, c.req.param('id')) }));

app.post('/api/bounties/:id/submissions', async (c) => {
  const body = await c.req.json();
  const user = getCurrentUserFromHeaders(c);
  return c.json({ data: await createSubmission(c.env, { ...body, builderId: body.builderId ?? user.id, bountyId: c.req.param('id') }) }, 201);
});

app.get('/api/submissions', async (c) => c.json({ data: await listSubmissions(c.env, c.req.query('bountyId')) }));

app.get('/api/submissions/:id', async (c) => {
  const submission = await getSubmission(c.env, c.req.param('id'));
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  return c.json({ data: submission });
});

app.post('/api/submissions', async (c) => c.json({ data: await createSubmission(c.env, await c.req.json()) }, 201));

app.patch('/api/submissions/:id', async (c) => {
  const submission = await patchSubmission(c.env, c.req.param('id'), await c.req.json());
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  return c.json({ data: submission });
});

app.post('/api/submissions/:id/boost', async (c) => {
  const submission = await getSubmission<{ bounty_id: string }>(c.env, c.req.param('id'));
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  const body = await c.req.json().catch(() => ({}));
  const user = getCurrentUserFromHeaders(c);

  return c.json(
    {
      data: await createBoost(c.env, {
        ...body,
        userId: body.userId ?? user.id,
        bountyId: submission.bounty_id,
        submissionId: c.req.param('id'),
      }),
    },
    201,
  );
});

app.post('/api/boosts', async (c) => {
  const body = await c.req.json();
  const user = getCurrentUserFromHeaders(c);
  return c.json({ data: await createBoost(c.env, { ...body, userId: body.userId ?? user.id }) }, 201);
});

app.get('/api/support/points/me', async (c) => {
  const user = resolveCurrentSupportUser(c.req.raw.headers);
  return c.json({ data: await getSupportPoints(c.env, user.id), user });
});

app.get('/api/support/events/me', async (c) => {
  const user = resolveCurrentSupportUser(c.req.raw.headers);
  return c.json({ data: await getSupportEvents(c.env, user.id), user });
});

app.get('/api/support/proof/me', async (c) => {
  const user = resolveCurrentSupportUser(c.req.raw.headers);
  return c.json({ data: await getProofOfSupport(c.env, user) });
});

app.get('/api/support/proof/:userId', async (c) => {
  const currentUser = resolveCurrentSupportUser(c.req.raw.headers);
  return c.json({ data: await getProofOfSupport(c.env, { ...currentUser, id: c.req.param('userId') }) });
});

app.get('/api/proof-of-support', async (c) => {
  const user = resolveCurrentSupportUser(c.req.raw.headers);
  return c.json({ data: await getProofOfSupport(c.env, user) });
});

app.get('/api/curated-items', async (c) => c.json({ data: await listCuratedItems(c.env) }));
app.get('/api/curated-items/:placement', async (c) => c.json({ data: await getCuratedItemsByPlacement(c.env, c.req.param('placement')) }));
app.get('/api/curated-items/type/:itemType', async (c) => c.json({ data: await getCuratedItemsByType(c.env, c.req.param('itemType')) }));

app.get('/api/leaderboard', async (c) => c.json({ data: await getLeaderboard(c.env) }));
app.get('/api/leaderboard/hottest-catalysts', async (c) => c.json({ data: await getHottestCatalysts(c.env) }));
app.get('/api/leaderboard/confirmed-reward-catalysts', async (c) => c.json({ data: await getConfirmedRewardCatalysts(c.env) }));
app.get('/api/leaderboard/top-builders', async (c) => c.json({ data: await getTopBuilders(c.env) }));
app.get('/api/leaderboard/most-boosted-submissions', async (c) => c.json({ data: await getMostBoostedSubmissions(c.env) }));
app.get('/api/leaderboard/dormant-giants', async (c) => c.json({ data: await getDormantGiants(c.env) }));
app.get('/api/leaderboard/breakout-stories', async (c) => c.json({ data: await getBreakoutStories(c.env) }));
app.get('/api/leaderboard/comeback-hall', async (c) => c.json({ data: await getComebackHall(c.env) }));
app.get('/api/leaderboard/genesis-candidates', async (c) => c.json({ data: await getGenesisCandidates(c.env) }));

app.get('/api/admin/bounties', async (c) => {
  requireAdmin(c);
  return c.json({
    data: await listAdminBounties(c.env, {
      status: c.req.query('status'),
      fundingStatus: c.req.query('fundingStatus'),
    }),
  });
});

app.patch('/api/admin/bounties/:id/status', async (c) => {
  const admin = requireAdmin(c);
  const result = await updateAdminBountyStatus(c.env, c.req.param('id'), await c.req.json());
  await recordAdminAction(c.env, admin.id, 'update_bounty_status', 'bounty', c.req.param('id'));
  return c.json({ data: result });
});

app.patch('/api/admin/bounties/:id/funding-status', async (c) => {
  const admin = requireAdmin(c);
  const result = await updateAdminBountyFundingStatus(c.env, c.req.param('id'), await c.req.json());
  await recordAdminAction(c.env, admin.id, 'update_bounty_funding_status', 'bounty', c.req.param('id'));
  return c.json({ data: result });
});

app.post('/api/admin/bounties/:id/funding-events', async (c) => {
  const admin = requireAdmin(c);
  const payload = await createAdminFundingEvent(c.env, c.req.param('id'), admin.id, await c.req.json());
  await recordAdminAction(c.env, admin.id, 'create_funding_event', 'bounty', c.req.param('id'));
  return c.json({ data: payload }, 201);
});

app.get('/api/admin/submissions', async (c) => {
  requireAdmin(c);
  return c.json({ data: await listAdminSubmissions(c.env) });
});

app.patch('/api/admin/submissions/:id/status', async (c) => {
  const admin = requireAdmin(c);
  const result = await updateAdminSubmissionStatus(c.env, c.req.param('id'), await c.req.json());
  await recordAdminAction(c.env, admin.id, 'update_submission_status', 'submission', c.req.param('id'));
  return c.json({ data: result });
});

app.patch('/api/admin/submissions/:id/delivery-status', async (c) => {
  const admin = requireAdmin(c);
  const result = await updateAdminSubmissionDeliveryStatus(c.env, c.req.param('id'), await c.req.json());
  await recordAdminAction(c.env, admin.id, 'update_submission_delivery_status', 'submission', c.req.param('id'));
  return c.json({ data: result });
});

app.get('/api/admin/boosts', async (c) => {
  requireAdmin(c);
  return c.json({ data: await listAdminBoosts(c.env) });
});

app.patch('/api/admin/boosts/:id/validity-status', async (c) => {
  const admin = requireAdmin(c);
  const result = await patchAdminBoostValidityStatus(c.env, c.req.param('id'), await c.req.json());
  await recordAdminAction(c.env, admin.id, 'update_boost_validity_status', 'boost', c.req.param('id'));
  return c.json({ data: result });
});

app.get('/api/admin/support-events', async (c) => {
  requireAdmin(c);
  return c.json({ data: await listAdminSupportEvents(c.env) });
});

app.patch('/api/admin/support-events/:id/validity-status', async (c) => {
  const admin = requireAdmin(c);
  const result = await patchAdminSupportEventValidityStatus(c.env, c.req.param('id'), await c.req.json());
  await recordAdminAction(c.env, admin.id, 'update_support_event_validity_status', 'support_event', c.req.param('id'));
  return c.json({ data: result });
});

app.get('/api/admin/curated-items', async (c) => {
  requireAdmin(c);
  return c.json({ data: await listAdminCuratedItems(c.env) });
});

app.post('/api/admin/curated-items', async (c) => {
  const admin = requireAdmin(c);
  const result = await createAdminCuratedItem(c.env, await c.req.json());
  await recordAdminAction(c.env, admin.id, 'create_curated_item', 'curated_item', String((result as { id?: string } | null)?.id ?? 'unknown'));
  return c.json({ data: result }, 201);
});

app.patch('/api/admin/curated-items/:id', async (c) => {
  const admin = requireAdmin(c);
  const result = await updateAdminCuratedItem(c.env, c.req.param('id'), await c.req.json());
  await recordAdminAction(c.env, admin.id, 'update_curated_item', 'curated_item', c.req.param('id'));
  return c.json({ data: result });
});

app.get('/api/admin/stats', async (c) => {
  requireAdmin(c);
  return c.json({ data: await getAdminStats(c.env) });
});

app.onError((error, c) => {
  const response = safeJsonError(error);
  if (!(error instanceof z.ZodError)) {
    console.error(error);
  }
  return c.json(response.body, response.status as 400 | 403 | 404 | 500);
});

export default app;
