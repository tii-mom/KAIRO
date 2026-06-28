import type { ReactNode, FC } from 'react';
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

interface AuditModalState {
  isOpen: boolean;
  actionTitle: string;
  onConfirm: (audit: { reason: string; evidenceUrl?: string; publicNote?: string; internalNote?: string }) => Promise<void>;
  requireEvidenceUrl: boolean;
}

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

  // Audit modal states
  const [auditModal, setAuditModal] = useState<AuditModalState>({
    isOpen: false,
    actionTitle: '',
    onConfirm: async () => {},
    requireEvidenceUrl: false
  });
  const [modalReason, setModalReason] = useState('');
  const [modalEvidenceUrl, setModalEvidenceUrl] = useState('');
  const [modalPublicNote, setModalPublicNote] = useState('');
  const [modalInternalNote, setModalInternalNote] = useState('');
  const [bypassEvidenceUrl, setBypassEvidenceUrl] = useState(false);

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

  const triggerAuditAction = (
    actionTitle: string,
    requireEvidenceUrl: boolean,
    onConfirmAction: (audit: { reason: string; evidenceUrl?: string; publicNote?: string; internalNote?: string }) => Promise<unknown>,
    successMessage: string
  ) => {
    setModalReason('');
    setModalEvidenceUrl('');
    setModalPublicNote('');
    setModalInternalNote('');
    setBypassEvidenceUrl(false);
    
    setAuditModal({
      isOpen: true,
      actionTitle,
      requireEvidenceUrl,
      onConfirm: async (auditData) => {
        await withRefresh(() => onConfirmAction(auditData), successMessage);
      }
    });
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
                    onClick: () => triggerAuditAction(
                      'Mark Catalyst Active',
                      false,
                      (audit) => patchAdminBountyStatus(String(bounty.id), 'active', audit, options),
                      'Catalyst marked active.'
                    ),
                  },
                  {
                    label: 'Record External Completion',
                    onClick: () => triggerAuditAction(
                      'Record External Completion',
                      true,
                      (audit) => patchAdminBountyFundingStatus(String(bounty.id), 'paid', audit, options),
                      'External completion recorded.'
                    ),
                  },
                  {
                    label: 'Add External Reward Evidence',
                    onClick: () => triggerAuditAction(
                      'Add External Reward Evidence',
                      true,
                      (audit) => createAdminFundingEvent(String(bounty.id), { note: audit.publicNote ?? 'Evidence updated', proofUrl: audit.evidenceUrl, amountText: 'Manual evidence note', ...audit } as any, options),
                      'External evidence added.'
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
                onClick: () => triggerAuditAction(
                  'Approve Winner Selection',
                  false,
                  (audit) => patchAdminSubmissionStatus(String(submission.id), 'winner', audit, options),
                  'Winner status approved.'
                ),
              },
              {
                label: 'Mark Completed',
                onClick: () => triggerAuditAction(
                  'Record Delivery Completion',
                  true,
                  (audit) => patchAdminSubmissionDeliveryStatus(String(submission.id), 'completed', audit, options),
                  'Delivery status recorded.'
                ),
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
                  onClick: () => triggerAuditAction(
                    'Verify Boost Signal',
                    false,
                    (audit) => patchAdminBoostValidityStatus(String(boost.id), 'valid', audit, options),
                    'Boost signal approved.'
                  ),
                },
                {
                  label: 'Suspicious',
                  onClick: () => triggerAuditAction(
                    'Flag Boost Suspicious',
                    false,
                    (audit) => patchAdminBoostValidityStatus(String(boost.id), 'suspicious', audit, options),
                    'Boost flagged suspicious.'
                  ),
                },
                {
                  label: 'Invalid',
                  onClick: () => triggerAuditAction(
                    'Flag Boost Invalid',
                    false,
                    (audit) => patchAdminBoostValidityStatus(String(boost.id), 'invalid', audit, options),
                    'Boost marked invalid.'
                  ),
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
                  onClick: () => triggerAuditAction(
                    'Verify Timeline Event',
                    false,
                    (audit) => patchAdminSupportEventValidityStatus(String(event.id), 'valid', audit, options),
                    'Support event marked valid.'
                  ),
                },
                {
                  label: 'Suspicious',
                  onClick: () => triggerAuditAction(
                    'Flag Timeline Event Suspicious',
                    false,
                    (audit) => patchAdminSupportEventValidityStatus(String(event.id), 'suspicious', audit, options),
                    'Support event flagged suspicious.'
                  ),
                },
                {
                  label: 'Invalid',
                  onClick: () => triggerAuditAction(
                    'Flag Timeline Event Invalid',
                    false,
                    (audit) => patchAdminSupportEventValidityStatus(String(event.id), 'invalid', audit, options),
                    'Support event marked invalid.'
                  ),
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
                  onClick: () => triggerAuditAction(
                    String(item.status) === 'hidden' ? 'Unhide Curated Item' : 'Hide Curated Item',
                    false,
                    (audit) => patchAdminCuratedItem(String(item.id), { status: item.status === 'hidden' ? 'active' : 'hidden', ...audit } as any, options),
                    'Curated item updated.'
                  ),
                },
              ]}
            />
          ))}
        </GridSection>
      </div>

      {/* Confirmation Modal */}
      {auditModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050608]/80 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 bg-[#0c0e14] border-[#ffb95f]/30">
            <div className="border-b border-white/5 pb-2">
              <span className="font-mono text-[9px] text-[#ffb95f] uppercase tracking-widest">Audit Confirmation Required</span>
              <h3 className="text-base font-bold text-white mt-1">{auditModal.actionTitle}</h3>
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-white/40 block mb-1">Reason for Action (Required)</label>
                <textarea
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  placeholder="Explain why this action is being taken..."
                  className="kairo-form-field min-h-16 resize-y w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-white/40 block mb-1">Evidence URL {auditModal.requireEvidenceUrl && !bypassEvidenceUrl ? '(Required)' : '(Optional)'}</label>
                <input
                  value={modalEvidenceUrl}
                  onChange={(e) => setModalEvidenceUrl(e.target.value)}
                  type="url"
                  placeholder="https://..."
                  className="kairo-form-field w-full text-xs"
                  required={auditModal.requireEvidenceUrl && !bypassEvidenceUrl}
                />
              </div>

              {auditModal.requireEvidenceUrl && (
                <label className="flex items-center gap-2 cursor-pointer text-[10px] text-white/50">
                  <input
                    type="checkbox"
                    checked={bypassEvidenceUrl}
                    onChange={(e) => setBypassEvidenceUrl(e.target.checked)}
                  />
                  <span>No URL? Declare manual note & explain in Public Note below</span>
                </label>
              )}

              <div>
                <label className="text-white/40 block mb-1">Public Note (Optional)</label>
                <input
                  value={modalPublicNote}
                  onChange={(e) => setModalPublicNote(e.target.value)}
                  placeholder="E.g. manual verification details..."
                  className="kairo-form-field w-full text-xs"
                  required={auditModal.requireEvidenceUrl && bypassEvidenceUrl}
                />
              </div>

              <div>
                <label className="text-white/40 block mb-1">Internal Note (Optional)</label>
                <input
                  value={modalInternalNote}
                  onChange={(e) => setModalInternalNote(e.target.value)}
                  placeholder="Confidential notes for team audit trail..."
                  className="kairo-form-field w-full text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setAuditModal(prev => ({ ...prev, isOpen: false }))}
                className="btn-ghost px-4 py-2 text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!modalReason.trim() || (auditModal.requireEvidenceUrl && !bypassEvidenceUrl && !modalEvidenceUrl.trim()) || (auditModal.requireEvidenceUrl && bypassEvidenceUrl && !modalPublicNote.trim())}
                onClick={async () => {
                  setAuditModal(prev => ({ ...prev, isOpen: false }));
                  await auditModal.onConfirm({
                    reason: modalReason.trim(),
                    evidenceUrl: modalEvidenceUrl.trim() || undefined,
                    publicNote: modalPublicNote.trim() || undefined,
                    internalNote: modalInternalNote.trim() || undefined,
                  });
                }}
                className="btn-primary px-4 py-2 text-xs uppercase font-bold"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
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

interface AdminRowProps {
  title: string;
  subtitle: string;
  actions: Array<{ label: string; onClick: () => Promise<unknown> }>;
}

const AdminRow: FC<AdminRowProps> = ({
  title,
  subtitle,
  actions,
}) => {
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
};
