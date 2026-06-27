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
import { EmptyPanel, PageHero, Panel } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';

const adminIdentity = { id: 'user-demo-admin', role: 'admin' as const, label: 'Demo Admin' };
const adminTokenStorageKey = 'kairo-admin-token';

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
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem(adminTokenStorageKey) ?? '');

  const options = { identity: { ...adminIdentity, adminToken: adminToken || undefined } };

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
  }, [statusFilter, fundingStatusFilter, adminToken]);

  const saveAdminToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sessionStorage.setItem(adminTokenStorageKey, adminToken.trim());
    setAdminToken(adminToken.trim());
    setMessage('Admin token saved for this browser session.');
    setTimeout(() => setMessage(null), 3000);
  };

  const withRefresh = async (action: () => Promise<unknown>, success: string) => {
    await action();
    setMessage(success);
    await load();
    setTimeout(() => setMessage(null), 3000);
  };

  if (isLoading) return <LoadingState label="Loading admin operations console..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow="Admin Hub"
        title="Protocol Governance & Review Console"
        description="Operator controls for Catalyst validations, solution audits, support verification, and comeback highlight items."
        stats={[
          { label: 'Total Catalysts', value: stats?.bounties ?? 0, detail: 'Tracked in admin dashboard' },
          { label: 'Submissions Queue', value: stats?.submissions ?? 0, detail: 'Requiring verification review', tone: 'sky' },
          { label: 'Support Signals', value: stats?.supportEvents ?? 0, detail: 'Recorded validity events', tone: 'emerald' },
        ]}
      />

      {/* Admin Auth Notice */}
      <Panel eyebrow="Access Control" title="Private Beta Admin Gate" icon={ShieldAlert}>
        <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-5">
          <p className="max-w-4xl text-xs sm:text-sm leading-6 text-[#ffb95f] mb-4 font-sans">
            Operations require the private beta admin authorization token. Save your token value below to authenticate session API triggers.
          </p>
          <form onSubmit={saveAdminToken} className="flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              type="password"
              placeholder="Private beta admin token"
              className="kairo-form-field flex-1"
            />
            <button type="submit" className="btn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
              Save Token
            </button>
          </form>
          {message ? <div className="mt-3 text-xs font-mono text-[#ffb95f]">{message}</div> : null}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        
        {/* Catalyst Reviews */}
        <Panel eyebrow="Review queue" title="Catalyst Review Dashboard">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <input value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} placeholder="Filter by status (e.g. active)" className="kairo-form-field" />
            <input value={fundingStatusFilter} onChange={(event) => setFundingStatusFilter(event.target.value)} placeholder="Filter by funding status (e.g. paid)" className="kairo-form-field" />
          </div>
          <div className="grid gap-3">
            {bounties.slice(0, 12).map((bounty) => (
              <AdminRow
                key={String(bounty.id)}
                title={String(bounty.title)}
                subtitle={`Status: ${String(bounty.status)} · Funding: ${String(bounty.funding_status)}`}
                actions={[
                  {
                    label: 'Mark Active',
                    onClick: () => withRefresh(() => patchAdminBountyStatus(String(bounty.id), 'active', options), 'Catalyst marked active.'),
                  },
                  {
                    label: 'Mark Paid',
                    onClick: () => withRefresh(() => patchAdminBountyFundingStatus(String(bounty.id), 'paid', options), 'Funding Status updated.'),
                  },
                  {
                    label: 'Add Funding Event',
                    onClick: () =>
                      withRefresh(
                        () => createAdminFundingEvent(String(bounty.id), { note: 'Reward confirmed by KAIRO', amountText: 'Manual admin note' }, options),
                        'Funding Event added.',
                      ),
                  },
                ]}
              />
            ))}
          </div>
        </Panel>

        {/* Curated list / metrics */}
        <div className="grid gap-6">
          <Panel eyebrow="Telemetry stats" title="Platform Statistics">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricBox label="Total Boosts" value={String(stats?.boosts ?? 0)} />
              <MetricBox label="Curated Items" value={String(stats?.activeCuratedItems ?? 0)} />
              <MetricBox label="Submissions" value={String(stats?.submissions ?? 0)} />
              <MetricBox label="Catalysts" value={String(stats?.bounties ?? 0)} />
            </div>
          </Panel>

          <Panel eyebrow="Curator Lane" title="Publish Curated Comeback Story">
            <form
              className="space-y-4"
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
              <input name="itemType" placeholder="Item Type (e.g. featured_catalyst)" className="kairo-form-field" required />
              <input name="placement" placeholder="Placement Slot (e.g. home)" className="kairo-form-field" required />
              <input name="targetType" placeholder="Target Type (e.g. external)" className="kairo-form-field" required />
              <input name="targetId" placeholder="Target ID Reference" className="kairo-form-field" />
              <input name="title" placeholder="Curated Item Title" className="kairo-form-field" required />
              <textarea name="description" placeholder="Description content..." className="kairo-form-field min-h-24 resize-y" required />
              <input name="sortOrder" type="number" placeholder="Sort Order Rank (e.g. 0)" className="kairo-form-field" required />
              <button type="submit" className="btn-primary px-6 py-2 text-xs font-bold uppercase tracking-wider">
                Publish Highlight
              </button>
            </form>
          </Panel>
        </div>
      </div>

      {/* Builder Submission Reviews */}
      <GridSection title="Solution Submissions Audits">
        {submissions.slice(0, 10).map((submission) => (
          <AdminRow
            key={String(submission.id)}
            title={String(submission.name)}
            subtitle={`Status: ${String(submission.status)} · Delivery: ${String(submission.delivery_status)}`}
            actions={[
              {
                label: 'Mark Winner',
                onClick: () => withRefresh(() => patchAdminSubmissionStatus(String(submission.id), 'winner', options), 'Submission status updated.'),
              },
              {
                label: 'Mark Completed',
                onClick: () =>
                  withRefresh(() => patchAdminSubmissionDeliveryStatus(String(submission.id), 'completed', options), 'Delivery Status updated.'),
              },
            ]}
          />
        ))}
      </GridSection>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Boost verification */}
        <GridSection title="Boost Signal Audits">
          {boosts.slice(0, 10).map((boost) => (
            <AdminRow
              key={String(boost.id)}
              title={`Boost ID: ${String(boost.id).slice(0, 8)}...`}
              subtitle={`Status: ${String(boost.validity_status)} · Source: ${String(boost.source)}`}
              actions={[
                {
                  label: 'Valid',
                  onClick: () => withRefresh(() => patchAdminBoostValidityStatus(String(boost.id), 'valid', options), 'Boost marked valid.'),
                },
                {
                  label: 'Suspicious',
                  onClick: () =>
                    withRefresh(() => patchAdminBoostValidityStatus(String(boost.id), 'suspicious', options), 'Boost marked suspicious.'),
                },
                {
                  label: 'Invalid',
                  onClick: () => withRefresh(() => patchAdminBoostValidityStatus(String(boost.id), 'invalid', options), 'Boost marked invalid.'),
                },
              ]}
            />
          ))}
        </GridSection>

        {/* Support event logs */}
        <GridSection title="Timeline Event Audits">
          {supportEvents.slice(0, 10).map((event) => (
            <AdminRow
              key={String(event.id)}
              title={String(event.event_type)}
              subtitle={`Status: ${String(event.validity_status)} · User: ${String(event.user_id).slice(0, 8)}...`}
              actions={[
                {
                  label: 'Valid',
                  onClick: () =>
                    withRefresh(() => patchAdminSupportEventValidityStatus(String(event.id), 'valid', options), 'Support event marked valid.'),
                },
                {
                  label: 'Suspicious',
                  onClick: () =>
                    withRefresh(() => patchAdminSupportEventValidityStatus(String(event.id), 'suspicious', options), 'Support event marked suspicious.'),
                },
                {
                  label: 'Invalid',
                  onClick: () =>
                    withRefresh(() => patchAdminSupportEventValidityStatus(String(event.id), 'invalid', options), 'Support event marked invalid.'),
                },
              ]}
            />
          ))}
        </GridSection>

        {/* Curator content list */}
        <GridSection title="Curated Comeback Items">
          {curatedItems.slice(0, 10).map((item) => (
            <AdminRow
              key={String(item.id)}
              title={String(item.title)}
              subtitle={`Type: ${String(item.item_type)} · Status: ${String(item.status)}`}
              actions={[
                {
                  label: String(item.status) === 'hidden' ? 'Unhide' : 'Hide',
                  onClick: () =>
                    withRefresh(
                      () => patchAdminCuratedItem(String(item.id), { status: item.status === 'hidden' ? 'active' : 'hidden' }, options),
                      'Curated item updated.',
                    ),
                },
              ]}
            />
          ))}
        </GridSection>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-4 border-white/5 bg-[#050608]">
      <div className="text-[9px] font-mono uppercase tracking-wider text-white/30">{label}</div>
      <div className="mt-1.5 font-mono text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function GridSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Panel eyebrow="Operator audit" title={title}>
      <div className="grid gap-3">
        {children || <EmptyPanel title={`No ${title.toLowerCase()} recorded`} description="Current audit queue is empty." />}
      </div>
    </Panel>
  );
}

function AdminRow({
  title,
  subtitle,
  actions,
  key,
}: {
  key?: string | number;
  title: string;
  subtitle: string;
  actions: Array<{ label: string; onClick: () => Promise<unknown> }>;
}) {
  return (
    <div className="glass-panel p-4 hover:border-white/10 transition-colors">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-bold tracking-tight text-white">{title}</div>
          <div className="mt-1 text-xs text-white/50">{subtitle}</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {actions.map((action) => (
            <button key={action.label} type="button" onClick={() => void action.onClick()} className="btn-ghost px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
