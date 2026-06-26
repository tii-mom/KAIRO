import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { createBoost } from './services/boosts';
import { createBounty, getBounty, listBounties } from './services/bounties';
import { getLeaderboard } from './services/leaderboard';
import { createSubmission, getSubmission, listSubmissions, patchSubmission } from './services/submissions';
import type { Env } from './db/d1';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

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

app.get('/api/submissions', async (c) =>
  c.json({ data: await listSubmissions(c.env, c.req.query('bountyId')) }),
);

app.post('/api/submissions', async (c) =>
  c.json({ data: await createSubmission(c.env, await c.req.json()) }, 201),
);

app.get('/api/submissions/:id', async (c) => {
  const submission = await getSubmission(c.env, c.req.param('id'));
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  return c.json({ data: submission });
});

app.patch('/api/submissions/:id', async (c) => {
  const submission = await patchSubmission(c.env, c.req.param('id'), await c.req.json());
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  return c.json({ data: submission });
});

app.post('/api/submissions/:id/boost', async (c) => {
  const submission = await getSubmission<{ bounty_id: string }>(c.env, c.req.param('id'));
  if (!submission) return c.json({ error: 'Submission not found' }, 404);

  return c.json(
    {
      data: await createBoost(c.env, {
        ...(await c.req.json()),
        bountyId: submission.bounty_id,
        submissionId: c.req.param('id'),
      }),
    },
    201,
  );
});

app.post('/api/boosts', async (c) => c.json({ data: await createBoost(c.env, await c.req.json()) }, 201));

app.get('/api/leaderboard', async (c) => c.json({ data: await getLeaderboard(c.env) }));

app.onError((error, c) => {
  if (error instanceof z.ZodError) {
    return c.json({ error: 'Validation failed', issues: error.issues }, 400);
  }

  console.error(error);
  return c.json({ error: 'Unexpected KAIRO worker error' }, 500);
});

export default app;
