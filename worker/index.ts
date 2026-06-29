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
import { createShareEvent, listShareEventsByUser, getReferralSummary } from './services/share-events';
import { createSubmission, getSubmission, listSubmissions, patchSubmission } from './services/submissions';
import type { Env } from './db/d1';
import { getCurrentUserFromHeaders, requireAdmin, requireBetaWriteAccess, safeJsonError } from './lib/http';


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

app.post('/api/beta/write-check', async (c) => {
  requireBetaWriteAccess(c);
  return c.json({ ok: true, message: 'Valid beta write token' });
});

app.post('/api/bounties', async (c) => {
  const user = requireBetaWriteAccess(c);
  const body = await c.req.json();
  return c.json({ data: await createBounty(c.env, { ...body, createdBy: user.id }) }, 201);
});

app.patch('/api/bounties/:id', async (c) => {
  if (c.env.APP_ENV !== 'local') {
    return c.json({ error: 'Public PATCH on bounties is disabled in production environments' }, 403);
  }
  const bounty = await updateBounty(c.env, c.req.param('id'), await c.req.json());
  if (!bounty) return c.json({ error: 'Bounty not found' }, 404);
  return c.json({ data: bounty });
});

app.get('/api/bounties/:id/funding-events', async (c) =>
  c.json({ data: await listFundingEventsByBounty(c.env, c.req.param('id')) }),
);

app.post('/api/bounties/:id/boost', async (c) => {
  const user = requireBetaWriteAccess(c);
  const body = await c.req.json().catch(() => ({}));
  return c.json({ data: await createBoost(c.env, { ...body, userId: user.id, bountyId: c.req.param('id') }) }, 201);
});

app.get('/api/bounties/:id/submissions', async (c) => c.json({ data: await listSubmissions(c.env, c.req.param('id')) }));

app.post('/api/bounties/:id/submissions', async (c) => {
  const user = requireBetaWriteAccess(c);
  const body = await c.req.json();
  return c.json({ data: await createSubmission(c.env, { ...body, builderId: user.id, bountyId: c.req.param('id') }) }, 201);
});

app.get('/api/submissions', async (c) => c.json({ data: await listSubmissions(c.env, c.req.query('bountyId')) }));

app.get('/api/submissions/:id', async (c) => {
  const submission = await getSubmission(c.env, c.req.param('id'));
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  return c.json({ data: submission });
});

app.post('/api/submissions', async (c) => {
  const user = requireBetaWriteAccess(c);
  const body = await c.req.json();
  return c.json({ data: await createSubmission(c.env, { ...body, builderId: user.id }) }, 201);
});

app.patch('/api/submissions/:id', async (c) => {
  if (c.env.APP_ENV !== 'local') {
    return c.json({ error: 'Public PATCH on submissions is disabled in production environments' }, 403);
  }
  const submission = await patchSubmission(c.env, c.req.param('id'), await c.req.json());
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  return c.json({ data: submission });
});

app.post('/api/submissions/:id/boost', async (c) => {
  const user = requireBetaWriteAccess(c);
  const submission = await getSubmission<{ bounty_id: string }>(c.env, c.req.param('id'));
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  const body = await c.req.json().catch(() => ({}));

  return c.json(
    {
      data: await createBoost(c.env, {
        ...body,
        userId: user.id,
        bountyId: submission.bounty_id,
        submissionId: c.req.param('id'),
      }),
    },
    201,
  );
});

app.post('/api/share-events', async (c) => {
  const user = getCurrentUserFromHeaders(c);
  const body = await c.req.json();
  const res = await createShareEvent(c.env, user.id, body);
  return c.json({ data: res }, 201);
});

app.get('/api/share-events/me', async (c) => {
  const user = getCurrentUserFromHeaders(c);
  return c.json({ data: await listShareEventsByUser(c.env, user.id) });
});

app.get('/api/referral/me', async (c) => {
  const user = getCurrentUserFromHeaders(c);
  return c.json({ data: await getReferralSummary(c.env, user.id) });
});

app.post('/api/boosts', async (c) => {

  const user = requireBetaWriteAccess(c);
  const body = await c.req.json();
  return c.json({ data: await createBoost(c.env, { ...body, userId: user.id }) }, 201);
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
  const body = await c.req.json();
  const { status, reason, evidenceUrl, publicNote, internalNote } = body;
  if (!reason || !reason.trim()) {
    return c.json({ error: 'Reason is required for status updates' }, 400);
  }
  const result = await updateAdminBountyStatus(c.env, c.req.param('id'), body);
  const noteObj = {
    action: `Changed status to ${status}`,
    reason: reason.trim(),
    evidenceUrl,
    publicNote,
    internalNote
  };
  await recordAdminAction(c.env, admin.id, 'update_bounty_status', 'bounty', c.req.param('id'), JSON.stringify(noteObj));
  return c.json({ data: result });
});

app.patch('/api/admin/bounties/:id/funding-status', async (c) => {
  const admin = requireAdmin(c);
  const body = await c.req.json();
  const { fundingStatus, reason, evidenceUrl, publicNote, internalNote, bypassEvidenceUrl } = body;
  if (!reason || !reason.trim()) {
    return c.json({ error: 'Reason is required for funding status updates' }, 400);
  }
  const hasEvidenceUrl = evidenceUrl && evidenceUrl.trim();
  const hasPublicNote = publicNote && publicNote.trim();
  if (!hasEvidenceUrl && !(bypassEvidenceUrl && hasPublicNote)) {
    return c.json({ error: 'Evidence URL is required, or you must bypass with a manual public note' }, 400);
  }
  const result = await updateAdminBountyFundingStatus(c.env, c.req.param('id'), body);
  const noteObj = {
    action: `Changed fundingStatus to ${fundingStatus}`,
    reason: reason.trim(),
    evidenceUrl: hasEvidenceUrl ? evidenceUrl.trim() : undefined,
    publicNote: hasPublicNote ? publicNote.trim() : undefined,
    internalNote
  };
  await recordAdminAction(c.env, admin.id, 'update_bounty_funding_status', 'bounty', c.req.param('id'), JSON.stringify(noteObj));
  return c.json({ data: result });
});

app.post('/api/admin/bounties/:id/funding-events', async (c) => {
  const admin = requireAdmin(c);
  const body = await c.req.json();
  const { amountText, proofUrl, note, eventType, reason, evidenceUrl, publicNote, internalNote, bypassEvidenceUrl } = body;
  const effectiveReason = reason || note;
  if (!effectiveReason || !effectiveReason.trim()) {
    return c.json({ error: 'Reason / note is required for funding events' }, 400);
  }
  const effectiveEvidenceUrl = evidenceUrl || proofUrl;
  const effectivePublicNote = publicNote || note;
  const hasEvidenceUrl = effectiveEvidenceUrl && effectiveEvidenceUrl.trim();
  const hasPublicNote = effectivePublicNote && effectivePublicNote.trim();
  if (!hasEvidenceUrl && !(bypassEvidenceUrl && hasPublicNote)) {
    return c.json({ error: 'Evidence URL / proof URL is required, or you must bypass with a manual public note' }, 400);
  }
  const payload = await createAdminFundingEvent(c.env, c.req.param('id'), admin.id, body);
  const noteObj = {
    action: `Created funding event: ${amountText || ''}`,
    reason: effectiveReason.trim(),
    evidenceUrl: hasEvidenceUrl ? effectiveEvidenceUrl.trim() : undefined,
    publicNote: hasPublicNote ? effectivePublicNote.trim() : undefined,
    internalNote
  };
  await recordAdminAction(c.env, admin.id, 'create_funding_event', 'bounty', c.req.param('id'), JSON.stringify(noteObj));
  return c.json({ data: payload }, 201);
});

app.get('/api/admin/submissions', async (c) => {
  requireAdmin(c);
  return c.json({ data: await listAdminSubmissions(c.env) });
});

app.patch('/api/admin/submissions/:id/status', async (c) => {
  const admin = requireAdmin(c);
  const body = await c.req.json();
  const { status, reason, evidenceUrl, publicNote, internalNote } = body;
  if (!reason || !reason.trim()) {
    return c.json({ error: 'Reason is required for submission status updates' }, 400);
  }
  const result = await updateAdminSubmissionStatus(c.env, c.req.param('id'), body);
  const noteObj = {
    action: `Changed status to ${status}`,
    reason: reason.trim(),
    evidenceUrl,
    publicNote,
    internalNote
  };
  await recordAdminAction(c.env, admin.id, 'update_submission_status', 'submission', c.req.param('id'), JSON.stringify(noteObj));
  return c.json({ data: result });
});

app.patch('/api/admin/submissions/:id/delivery-status', async (c) => {
  const admin = requireAdmin(c);
  const body = await c.req.json();
  const { deliveryStatus, reason, evidenceUrl, publicNote, internalNote, bypassEvidenceUrl } = body;
  if (!reason || !reason.trim()) {
    return c.json({ error: 'Reason is required for delivery status updates' }, 400);
  }
  if (deliveryStatus === 'completed') {
    const hasEvidenceUrl = evidenceUrl && evidenceUrl.trim();
    const hasPublicNote = publicNote && publicNote.trim();
    if (!hasEvidenceUrl && !(bypassEvidenceUrl && hasPublicNote)) {
      return c.json({ error: 'Evidence URL is required for completed delivery status, or you must bypass with a manual public note' }, 400);
    }
  }
  const result = await updateAdminSubmissionDeliveryStatus(c.env, c.req.param('id'), body);
  const noteObj = {
    action: `Changed deliveryStatus to ${deliveryStatus}`,
    reason: reason.trim(),
    evidenceUrl,
    publicNote,
    internalNote
  };
  await recordAdminAction(c.env, admin.id, 'update_submission_delivery_status', 'submission', c.req.param('id'), JSON.stringify(noteObj));
  return c.json({ data: result });
});

app.get('/api/admin/boosts', async (c) => {
  requireAdmin(c);
  return c.json({ data: await listAdminBoosts(c.env) });
});

app.patch('/api/admin/boosts/:id/validity-status', async (c) => {
  const admin = requireAdmin(c);
  const body = await c.req.json();
  const { validityStatus, reason, evidenceUrl, publicNote, internalNote } = body;
  if (!reason || !reason.trim()) {
    return c.json({ error: 'Reason is required for validity status updates' }, 400);
  }
  const result = await patchAdminBoostValidityStatus(c.env, c.req.param('id'), body);
  const noteObj = {
    action: `Changed validityStatus to ${validityStatus}`,
    reason: reason.trim(),
    evidenceUrl,
    publicNote,
    internalNote
  };
  await recordAdminAction(c.env, admin.id, 'update_boost_validity_status', 'boost', c.req.param('id'), JSON.stringify(noteObj));
  return c.json({ data: result });
});

app.get('/api/admin/support-events', async (c) => {
  requireAdmin(c);
  return c.json({ data: await listAdminSupportEvents(c.env) });
});

app.patch('/api/admin/support-events/:id/validity-status', async (c) => {
  const admin = requireAdmin(c);
  const body = await c.req.json();
  const { validityStatus, reason, evidenceUrl, publicNote, internalNote } = body;
  if (!reason || !reason.trim()) {
    return c.json({ error: 'Reason is required for validity status updates' }, 400);
  }
  const result = await patchAdminSupportEventValidityStatus(c.env, c.req.param('id'), body);
  const noteObj = {
    action: `Changed validityStatus to ${validityStatus}`,
    reason: reason.trim(),
    evidenceUrl,
    publicNote,
    internalNote
  };
  await recordAdminAction(c.env, admin.id, 'update_support_event_validity_status', 'support_event', c.req.param('id'), JSON.stringify(noteObj));
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
  const body = await c.req.json();
  const { reason, evidenceUrl, publicNote, internalNote } = body;
  if (!reason || !reason.trim()) {
    return c.json({ error: 'Reason is required for curated items updates' }, 400);
  }
  const result = await updateAdminCuratedItem(c.env, c.req.param('id'), body);
  const noteObj = {
    action: `Updated curated item`,
    reason: reason.trim(),
    evidenceUrl,
    publicNote,
    internalNote
  };
  await recordAdminAction(c.env, admin.id, 'update_curated_item', 'curated_item', c.req.param('id'), JSON.stringify(noteObj));
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
  return c.json(response.body, response.status as any);
});

export default app;
