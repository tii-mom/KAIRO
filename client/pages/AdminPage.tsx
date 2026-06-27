import type { ReactNode } from 'react';
import { FormEvent, useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
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
  patchAdminBountyFundingStatus,
  patchAdminBountyStatus,
  patchAdminCuratedItem,
  patchAdminSubmissionDeliveryStatus,
  patchAdminSubmissionStatus,
  patchAdminSupportEventValidityStatus,
  type AdminStats,
} from '../lib/api';
import { ErrorState, LoadingState } from './pageUtils';

const adminIdentity = { id: 'user-demo-admin', role: 'admin' as const, label: 'Demo Admin' };

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bounties, setBounties] = useState<Array<Record<string, unknown>>>([]);
  const [submissions, setSubmissions] = useState<Array<Record<string, unknown>>>([]);
  const [boosts, setBoosts] = useState<Array<Record<string, unknown>>>([]);
  const [supportEvents, setSupportEvents] = useState<Array<Record<string, unknown>>>([]);
  const [curatedItems, setCuratedItems] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [fundingStatusFilter, setFundingStatusFilter] = useState('');

  const options = { identity: adminIdentity };

  const load = async () => {
    setIsLoading(true);
    try {
      const [statsData, bountyData, submissionData, boostData, supportData, curatedData] = await Promise.all([
        getAdminStats(options),
        listAdminBounties({ status: statusFilter || undefined, fundingStatus: fundingStatusFilter || undefined }, options),
        listAdminSubmissions(options),
        listAdminBoosts(options),
        listAdminSupportEvents(options),
        listAdminCuratedItems(options),
      ]);
      setStats(statsData);
      setBounties(bountyData);
      setSubmissions(submissionData);
      setBoosts(boostData);
      setSupportEvents(supportData);
      setCuratedItems(curatedData);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter, fundingStatusFilter]);

  const withRefresh = async (action: () => Promise<unknown>, success: string) => {
    await action();
    setMessage(success);
    await load();
  };

  if (isLoading) return <LoadingState label="Loading admin operations..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <h1 className="text-4xl font-black text-white">Admin Operations V1</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">Operational review surface for Catalyst moderation, Reward Records, validity checks, curated content, and launch stats. Requests are sent with `x-kairo-role: admin`.</p>
        {message ? <div className="mt-4 text-sm text-[#ffd285]">{message}</div> : null}
      </section>

      <section className="rounded-2xl border border-[#ffd285]/20 bg-[#ffd285]/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-[#ffd285]" />
          <div>
            <h2 className="text-lg font-black text-white">Private beta admin warning</h2>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-white/70">
              Admin is currently protected by demo header/session logic for beta operations. Do not use this as final production auth, do not publish the admin route broadly, and replace it with stronger auth before open beta or public launch.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Stat label="Catalysts" value={stats?.bounties ?? 0} />
        <Stat label="Submissions" value={stats?.submissions ?? 0} />
        <Stat label="Boosts" value={stats?.boosts ?? 0} />
        <Stat label="Support Events" value={stats?.supportEvents ?? 0} />
        <Stat label="Active Curated" value={stats?.activeCuratedItems ?? 0} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c0e14]/70 p-6">
        <div className="mb-4 flex gap-3">
          <input value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} placeholder="Filter by status" className="rounded-xl border border-white/10 bg-[#05070d] px-4 py-2 text-sm text-white" />
          <input value={fundingStatusFilter} onChange={(event) => setFundingStatusFilter(event.target.value)} placeholder="Filter by funding_status" className="rounded-xl border border-white/10 bg-[#05070d] px-4 py-2 text-sm text-white" />
        </div>
        <div className="space-y-4">
          {bounties.slice(0, 12).map((bounty) => (
            <div key={String(bounty.id)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="font-black text-white">{String(bounty.title)}</div>
              <div className="mt-1 text-sm text-white/50">{String(bounty.status)} · {String(bounty.funding_status)}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => void withRefresh(() => patchAdminBountyStatus(String(bounty.id), 'active', options), 'Catalyst marked active.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Mark active</button>
                <button type="button" onClick={() => void withRefresh(() => patchAdminBountyFundingStatus(String(bounty.id), 'paid', options), 'Funding Status updated.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Mark paid</button>
                <button type="button" onClick={() => void withRefresh(() => createAdminFundingEvent(String(bounty.id), { note: 'Reward confirmed by KAIRO', amountText: 'Manual admin note' }, options), 'Funding Event added.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Add Funding Event</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <GridSection title="Submissions">
        {submissions.slice(0, 10).map((submission) => (
          <div key={String(submission.id)}>
            <RowCard title={String(submission.name)} subtitle={`${String(submission.status)} · ${String(submission.delivery_status)}`}>
              <button type="button" onClick={() => void withRefresh(() => patchAdminSubmissionStatus(String(submission.id), 'winner', options), 'Submission status updated.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Mark winner</button>
              <button type="button" onClick={() => void withRefresh(() => patchAdminSubmissionDeliveryStatus(String(submission.id), 'completed', options), 'Delivery Status updated.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Mark completed</button>
            </RowCard>
          </div>
        ))}
      </GridSection>

      <GridSection title="Boosts">
        {boosts.slice(0, 10).map((boost) => (
          <div key={String(boost.id)}>
            <RowCard title={String(boost.id)} subtitle={`${String(boost.validity_status)} · ${String(boost.source)}`}>
              <button type="button" onClick={() => void withRefresh(() => patchAdminBoostValidityStatus(String(boost.id), 'valid', options), 'Boost marked valid.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Valid</button>
              <button type="button" onClick={() => void withRefresh(() => patchAdminBoostValidityStatus(String(boost.id), 'suspicious', options), 'Boost marked suspicious.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Suspicious</button>
              <button type="button" onClick={() => void withRefresh(() => patchAdminBoostValidityStatus(String(boost.id), 'invalid', options), 'Boost marked invalid.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Invalid</button>
            </RowCard>
          </div>
        ))}
      </GridSection>

      <GridSection title="Support Events">
        {supportEvents.slice(0, 10).map((event) => (
          <div key={String(event.id)}>
            <RowCard title={String(event.event_type)} subtitle={`${String(event.validity_status)} · ${String(event.user_id)}`}>
              <button type="button" onClick={() => void withRefresh(() => patchAdminSupportEventValidityStatus(String(event.id), 'valid', options), 'Support event marked valid.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Valid</button>
              <button type="button" onClick={() => void withRefresh(() => patchAdminSupportEventValidityStatus(String(event.id), 'suspicious', options), 'Support event marked suspicious.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Suspicious</button>
              <button type="button" onClick={() => void withRefresh(() => patchAdminSupportEventValidityStatus(String(event.id), 'invalid', options), 'Support event marked invalid.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">Invalid</button>
            </RowCard>
          </div>
        ))}
      </GridSection>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[#0c0e14]/70 p-6">
          <h2 className="text-lg font-black text-white">Curated Items</h2>
          <div className="mt-4 space-y-3">
            {curatedItems.slice(0, 10).map((item) => (
              <div key={String(item.id)}>
                <RowCard title={String(item.title)} subtitle={`${String(item.item_type)} · ${String(item.status)}`}>
                  <button type="button" onClick={() => void withRefresh(() => patchAdminCuratedItem(String(item.id), { status: item.status === 'hidden' ? 'active' : 'hidden' }, options), 'Curated item updated.')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">{String(item.status) === 'hidden' ? 'Unhide' : 'Hide'}</button>
                </RowCard>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0c0e14]/70 p-6">
          <h2 className="text-lg font-black text-white">Create Curated Item</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void withRefresh(
                () =>
                  createAdminCuratedItem(
                    {
                      itemType: String(form.get('itemType') ?? 'featured_catalyst'),
                      placement: String(form.get('placement') ?? 'home'),
                      targetType: String(form.get('targetType') ?? 'external'),
                      targetId: String(form.get('targetId') ?? '') || undefined,
                      title: String(form.get('title') ?? ''),
                      description: String(form.get('description') ?? ''),
                      sortOrder: Number(form.get('sortOrder') ?? 0),
                      status: 'active',
                    },
                    options,
                  ),
                'Curated item created.',
              );
            }}
          >
            <input name="itemType" placeholder="itemType" className="w-full rounded-xl border border-white/10 bg-[#05070d] px-4 py-2 text-sm text-white" />
            <input name="placement" placeholder="placement" className="w-full rounded-xl border border-white/10 bg-[#05070d] px-4 py-2 text-sm text-white" />
            <input name="targetType" placeholder="targetType" className="w-full rounded-xl border border-white/10 bg-[#05070d] px-4 py-2 text-sm text-white" />
            <input name="targetId" placeholder="targetId" className="w-full rounded-xl border border-white/10 bg-[#05070d] px-4 py-2 text-sm text-white" />
            <input name="title" placeholder="title" className="w-full rounded-xl border border-white/10 bg-[#05070d] px-4 py-2 text-sm text-white" />
            <textarea name="description" placeholder="description" className="w-full rounded-xl border border-white/10 bg-[#05070d] px-4 py-2 text-sm text-white" />
            <input name="sortOrder" type="number" placeholder="sortOrder" className="w-full rounded-xl border border-white/10 bg-[#05070d] px-4 py-2 text-sm text-white" />
            <button type="submit" className="rounded-full bg-[#ffd285] px-4 py-2 text-sm font-black text-[#05070d]">Create</button>
          </form>
        </section>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-white/10 bg-[#0c0e14]/70 p-4"><div className="text-[10px] uppercase text-white/35">{label}</div><div className="mt-2 text-2xl font-black text-white">{value}</div></div>;
}

function GridSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#0c0e14]/70 p-6"><h2 className="mb-4 text-lg font-black text-white">{title}</h2><div className="space-y-3">{children}</div></section>;
}

function RowCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="font-black text-white">{title}</div><div className="mt-1 text-sm text-white/50">{subtitle}</div><div className="mt-3 flex flex-wrap gap-2">{children}</div></div>;
}
