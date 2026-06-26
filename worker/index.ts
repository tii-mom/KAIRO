import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { createBoost } from './services/boosts';
import { createBounty, getBounty, listBounties, updateBounty } from './services/bounties';
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
import { getProofOfSupport, getSupportPoints, listSupportEvents } from './services/support';
import { createSubmission, getSubmission, listSubmissions, updateSubmission } from './services/submissions';
import type { Env } from './db/d1';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

const getCurrentUserId = (c: Context<{ Bindings: Env }>) =>
  c.req.header('x-user-id') ?? c.req.query('userId') ?? 'demo-user';

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    service: 'kairo-worker',
    terms: ['Catalyst', 'Boost', 'Momentum', 'Proof of Support', 'KAIRO Score'],
  }),
);

app.get('/api/bounties', async (c) => c.json({ data: await listBounties(c.env) }));

app.get('/api/bounties/:id', async (c) => {
  const bounty = await getBounty(c.env, c.req.param('id'));
  if (!bounty) return c.json({ error: 'Bounty not found' }, 404);
  return c.json({ data: bounty });
});

app.post('/api/bounties', async (c) => c.json({ data: await createBounty(c.env, await c.req.json()) }, 201));

app.patch('/api/bounties/:id', async (c) => {
  const bounty = await updateBounty(c.env, c.req.param('id'), await c.req.json());
  if (!bounty) return c.json({ error: 'Bounty not found' }, 404);
  return c.json({ data: bounty });
});

app.post('/api/bounties/:id/boost', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ data: await createBoost(c.env, { ...body, userId: body.userId ?? getCurrentUserId(c), bountyId: c.req.param('id') }) }, 201);
});

app.get('/api/bounties/:id/submissions', async (c) =>
  c.json({ data: await listSubmissions(c.env, c.req.param('id')) }),
);

app.post('/api/bounties/:id/submissions', async (c) => {
  const body = await c.req.json();
  return c.json({ data: await createSubmission(c.env, { ...body, userId: body.userId ?? getCurrentUserId(c), bountyId: c.req.param('id') }) }, 201);
});

app.get('/api/submissions', async (c) =>
  c.json({ data: await listSubmissions(c.env, c.req.query('bountyId')) }),
);

app.get('/api/submissions/:id', async (c) => {
  const submission = await getSubmission(c.env, c.req.param('id'));
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  return c.json({ data: submission });
});

app.post('/api/submissions', async (c) =>
  c.json({ data: await createSubmission(c.env, await c.req.json()) }, 201),
);

app.patch('/api/submissions/:id', async (c) => {
  const submission = await updateSubmission(c.env, c.req.param('id'), await c.req.json());
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  return c.json({ data: submission });
});

app.post('/api/submissions/:id/boost', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ data: await createBoost(c.env, { ...body, userId: body.userId ?? getCurrentUserId(c), submissionId: c.req.param('id') }) }, 201);
});

app.post('/api/boosts', async (c) => c.json({ data: await createBoost(c.env, await c.req.json()) }, 201));

app.get('/api/support/points/me', async (c) => c.json({ data: await getSupportPoints(c.env, getCurrentUserId(c)) }));
app.get('/api/support/events/me', async (c) => c.json({ data: await listSupportEvents(c.env, getCurrentUserId(c)) }));
app.get('/api/support/proof/me', async (c) => c.json({ data: await getProofOfSupport(c.env, getCurrentUserId(c)) }));

app.get('/api/leaderboard', async (c) => c.json({ data: await getLeaderboard(c.env) }));
app.get('/api/leaderboard/hottest-catalysts', async (c) => c.json({ data: await getHottestCatalysts(c.env) }));
app.get('/api/leaderboard/confirmed-reward-catalysts', async (c) =>
  c.json({ data: await getConfirmedRewardCatalysts(c.env) }),
);
app.get('/api/leaderboard/top-builders', async (c) => c.json({ data: await getTopBuilders(c.env) }));
app.get('/api/leaderboard/most-boosted-submissions', async (c) =>
  c.json({ data: await getMostBoostedSubmissions(c.env) }),
);
app.get('/api/leaderboard/dormant-giants', async (c) => c.json({ data: await getDormantGiants(c.env) }));
app.get('/api/leaderboard/breakout-stories', async (c) => c.json({ data: await getBreakoutStories(c.env) }));
app.get('/api/leaderboard/comeback-hall', async (c) => c.json({ data: await getComebackHall(c.env) }));
app.get('/api/leaderboard/genesis-candidates', async (c) => c.json({ data: await getGenesisCandidates(c.env) }));

app.get('/api/admin/stats', (c) => c.json({ data: { status: 'stubbed', message: 'Admin API is partially implemented.' } }));
app.get('/api/admin/*', (c) => c.json({ data: [], status: 'stubbed' }));
app.post('/api/admin/*', (c) => c.json({ data: null, status: 'stubbed' }, 202));
app.patch('/api/admin/*', (c) => c.json({ data: null, status: 'stubbed' }, 202));
app.delete('/api/admin/*', (c) => c.json({ data: null, status: 'stubbed' }, 202));

app.onError((error, c) => {
  if (error instanceof z.ZodError) {
    return c.json({ error: 'Validation failed', issues: error.issues }, 400);
  }

  console.error(error);
  return c.json({ error: 'Unexpected KAIRO worker error' }, 500);
});

export default app;
