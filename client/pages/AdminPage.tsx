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
import { useI18n } from '../i18n/useI18n';

const adminIdentity = { id: 'user-demo-admin', role: 'admin' as const, label: 'Demo Admin' };
const adminTokenStorageKey = 'kairo-admin-token';

interface AuditModalState {
  isOpen: boolean;
  actionTitle: string;
  onConfirm: (audit: { reason: string; evidenceUrl?: string; publicNote?: string; internalNote?: string }) => Promise<void>;
  requireEvidenceUrl: boolean;
}

export default function AdminPage() {
  const { t } = useI18n();
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
    setMessage(t('admin.tokenSaved'));
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

  if (isLoading) return <LoadingState label={t('admin.loading')} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow={t('admin.hubEyebrow')}
        title={t('admin.hubTitle')}
        description={t('admin.hubDescription')}
        stats={[
          { label: t('admin.totalCatalysts'), value: stats?.bounties ?? 0, detail: t('admin.totalCatalystsDetail') },
          { label: t('admin.submissionsQueue'), value: stats?.submissions ?? 0, detail: t('admin.submissionsQueueDetail'), tone: 'sky' },
          { label: t('admin.supportSignals'), value: stats?.supportEvents ?? 0, detail: t('admin.supportSignalsDetail'), tone: 'emerald' },
        ]}
      />

      {/* Admin Auth Notice */}
      <Panel eyebrow={t('admin.accessControl')} title={t('admin.eyebrow')} icon={ShieldAlert}>
        <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-5">
          <p className="max-w-4xl text-xs sm:text-sm leading-6 text-[#ffb95f] mb-4 font-sans">
            {t('admin.adminGateDesc')}
          </p>
          <form onSubmit={saveAdminToken} className="flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              type="password"
              placeholder={t('admin.tokenPlaceholder')}
              className="kairo-form-field flex-1"
            />
            <button type="submit" className="btn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
              {t('admin.saveToken')}
            </button>
          </form>
          {message ? <div className="mt-3 text-xs font-mono text-[#ffb95f]">{message}</div> : null}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        
        {/* Catalyst Reviews */}
        <Panel eyebrow={t('admin.reviewQueue')} title={t('admin.catalystReviewDashboard')}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <input value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} placeholder={t('admin.filterStatusPlaceholder')} className="kairo-form-field" />
            <input value={fundingStatusFilter} onChange={(event) => setFundingStatusFilter(event.target.value)} placeholder={t('admin.filterFundingPlaceholder')} className="kairo-form-field" />
          </div>
          <div className="grid gap-3">
            {bounties.slice(0, 12).map((bounty) => (
              <AdminRow
                key={String(bounty.id)}
                title={String(bounty.title)}
                subtitle={`Status: ${String(bounty.status)} · Funding: ${String(bounty.funding_status)}`}
                actions={[
                  {
                    label: t('admin.markActive'),
                    onClick: () => triggerAuditAction(
                      t('admin.markActive'),
                      false,
                      (audit) => patchAdminBountyStatus(String(bounty.id), 'active', audit, options),
                      'Catalyst marked active.'
                    ),
                  },
                  {
                    label: t('admin.recordCompletion'),
                    onClick: () => triggerAuditAction(
                      t('admin.recordCompletion'),
                      true,
                      (audit) => patchAdminBountyFundingStatus(String(bounty.id), 'paid', audit, options),
                      'External completion recorded.'
                    ),
                  },
                  {
                    label: t('admin.addEvidence'),
                    onClick: () => triggerAuditAction(
                      t('admin.addEvidence'),
                      true,
                      (audit) => createAdminFundingEvent(String(bounty.id), { note: audit.publicNote ?? 'Evidence updated', proofUrl: audit.evidenceUrl, amountText: 'Manual evidence note', ...audit } as any, options),
                      t('admin.evidenceAdded')
                    ),
                  },
                ]}
              />
            ))}
          </div>
        </Panel>

        {/* Curated list / metrics */}
        <div className="grid gap-6">
          <Panel eyebrow={t('admin.telemetryStats')} title={t('admin.platformStatistics')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricBox label={t('admin.totalBoosts')} value={String(stats?.boosts ?? 0)} />
              <MetricBox label={t('admin.curatedItems')} value={String(stats?.activeCuratedItems ?? 0)} />
              <MetricBox label={t('admin.tabSubmissions')} value={String(stats?.submissions ?? 0)} />
              <MetricBox label={t('admin.tabBounties')} value={String(stats?.bounties ?? 0)} />
            </div>
          </Panel>

          <Panel eyebrow={t('admin.curatorLane')} title={t('admin.publishCuratedStory')}>
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
                  t('admin.itemCreated'),
                );
              }}
            >
              <input name="itemType" placeholder={t('admin.itemTypePlaceholder')} className="kairo-form-field" required />
              <input name="placement" placeholder={t('admin.placementPlaceholder')} className="kairo-form-field" required />
              <input name="targetType" placeholder={t('admin.targetTypePlaceholder')} className="kairo-form-field" required />
              <input name="targetId" placeholder={t('admin.targetIdPlaceholder')} className="kairo-form-field" />
              <input name="title" placeholder={t('admin.curatedItemTitlePlaceholder')} className="kairo-form-field" required />
              <textarea name="description" placeholder={t('admin.curatedDescPlaceholder')} className="kairo-form-field min-h-24 resize-y" required />
              <input name="sortOrder" type="number" placeholder={t('admin.sortOrderPlaceholder')} className="kairo-form-field" required />
              <button type="submit" className="btn-primary px-6 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
                {t('admin.publishHighlight')}
              </button>
            </form>
          </Panel>
        </div>
      </div>

      {/* Builder Submission Reviews */}
      <GridSection title={t('admin.solutionAudits')}>
        {submissions.slice(0, 10).map((submission) => (
          <AdminRow
            key={String(submission.id)}
            title={String(submission.name)}
            subtitle={`Status: ${String(submission.status)} · Delivery: ${String(submission.delivery_status)}`}
            actions={[
              {
                label: t('admin.markWinner'),
                onClick: () => triggerAuditAction(
                  t('admin.markWinner'),
                  false,
                  (audit) => patchAdminSubmissionStatus(String(submission.id), 'winner', audit, options),
                  t('admin.winnerApproved')
                ),
              },
              {
                label: t('admin.markCompleted'),
                onClick: () => triggerAuditAction(
                  t('admin.markCompleted'),
                  true,
                  (audit) => patchAdminSubmissionDeliveryStatus(String(submission.id), 'completed', audit, options),
                  t('admin.deliveryRecorded')
                ),
              },
            ]}
          />
        ))}
      </GridSection>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Boost verification */}
        <GridSection title={t('admin.boostSignalAudits')}>
          {boosts.slice(0, 10).map((boost) => (
            <AdminRow
              key={String(boost.id)}
              title={`Boost ID: ${String(boost.id).slice(0, 8)}...`}
              subtitle={`Status: ${String(boost.validity_status)} · Source: ${String(boost.source)}`}
              actions={[
                {
                  label: t('admin.valid'),
                  onClick: () => triggerAuditAction(
                    t('admin.valid'),
                    false,
                    (audit) => patchAdminBoostValidityStatus(String(boost.id), 'valid', audit, options),
                    t('admin.boostApproved')
                  ),
                },
                {
                  label: t('admin.suspicious'),
                  onClick: () => triggerAuditAction(
                    t('admin.suspicious'),
                    false,
                    (audit) => patchAdminBoostValidityStatus(String(boost.id), 'suspicious', audit, options),
                    t('admin.boostSuspicious')
                  ),
                },
                {
                  label: t('admin.invalid'),
                  onClick: () => triggerAuditAction(
                    t('admin.invalid'),
                    false,
                    (audit) => patchAdminBoostValidityStatus(String(boost.id), 'invalid', audit, options),
                    t('admin.boostInvalid')
                  ),
                },
              ]}
            />
          ))}
        </GridSection>

        {/* Support event logs */}
        <GridSection title={t('admin.timelineEventAudits')}>
          {supportEvents.slice(0, 10).map((event) => (
            <AdminRow
              key={String(event.id)}
              title={String(event.event_type)}
              subtitle={`Status: ${String(event.validity_status)} · User: ${String(event.user_id).slice(0, 8)}...`}
              actions={[
                {
                  label: t('admin.valid'),
                  onClick: () => triggerAuditAction(
                    t('admin.valid'),
                    false,
                    (audit) => patchAdminSupportEventValidityStatus(String(event.id), 'valid', audit, options),
                    t('admin.eventApproved')
                  ),
                },
                {
                  label: t('admin.suspicious'),
                  onClick: () => triggerAuditAction(
                    t('admin.suspicious'),
                    false,
                    (audit) => patchAdminSupportEventValidityStatus(String(event.id), 'suspicious', audit, options),
                    t('admin.eventSuspicious')
                  ),
                },
                {
                  label: t('admin.invalid'),
                  onClick: () => triggerAuditAction(
                    t('admin.invalid'),
                    false,
                    (audit) => patchAdminSupportEventValidityStatus(String(event.id), 'invalid', audit, options),
                    t('admin.eventInvalid')
                  ),
                },
              ]}
            />
          ))}
        </GridSection>

        {/* Curator content list */}
        <GridSection title={t('admin.curatedComebackItems')}>
          {curatedItems.slice(0, 10).map((item) => (
            <AdminRow
              key={String(item.id)}
              title={String(item.title)}
              subtitle={`Type: ${String(item.item_type)} · Status: ${String(item.status)}`}
              actions={[
                {
                  label: String(item.status) === 'hidden' ? t('admin.unhide') : t('admin.hide'),
                  onClick: () => triggerAuditAction(
                    String(item.status) === 'hidden' ? t('admin.unhide') : t('admin.hide'),
                    false,
                    (audit) => patchAdminCuratedItem(String(item.id), { status: item.status === 'hidden' ? 'active' : 'hidden', ...audit } as any, options),
                    t('admin.itemUpdated')
                  ),
                },
              ]}
            />
          ))}
        </GridSection>
      </div>

      {/* Confirmation Modal */}
      {auditModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050608]/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 bg-[#0c0e14] border-[#ffb95f]/30">
            <div className="border-b border-white/5 pb-2">
              <span className="font-mono text-[9px] text-[#ffb95f] uppercase tracking-widest">{t('admin.auditConfirmationRequired')}</span>
              <h3 className="text-base font-bold text-white mt-1">{auditModal.actionTitle}</h3>
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-white/40 block mb-1">{t('admin.actionReasonLabel')}</label>
                <textarea
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  placeholder={t('admin.actionReasonPlaceholder')}
                  className="kairo-form-field min-h-16 resize-y w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-white/40 block mb-1">
                  {auditModal.requireEvidenceUrl && !bypassEvidenceUrl ? t('admin.evidenceUrlLabelRequired') : t('admin.evidenceUrlLabelOptional')}
                </label>
                <input
                  value={modalEvidenceUrl}
                  onChange={(e) => setModalEvidenceUrl(e.target.value)}
                  type="url"
                  placeholder={t('admin.evidenceUrlPlaceholder')}
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
                  <span>{t('admin.noUrlDeclareManual')}</span>
                </label>
              )}

              <div>
                <label className="text-white/40 block mb-1">{t('admin.publicNoteLabel')}</label>
                <input
                  value={modalPublicNote}
                  onChange={(e) => setModalPublicNote(e.target.value)}
                  placeholder={t('admin.publicNotePlaceholder')}
                  className="kairo-form-field w-full text-xs"
                  required={auditModal.requireEvidenceUrl && bypassEvidenceUrl}
                />
              </div>

              <div>
                <label className="text-white/40 block mb-1">{t('admin.internalNoteLabel')}</label>
                <input
                  value={modalInternalNote}
                  onChange={(e) => setModalInternalNote(e.target.value)}
                  placeholder={t('admin.internalNotePlaceholder')}
                  className="kairo-form-field w-full text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setAuditModal(prev => ({ ...prev, isOpen: false }))}
                className="btn-ghost px-4 py-2 text-xs uppercase cursor-pointer"
              >
                {t('admin.cancelButton')}
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
                className="btn-primary px-4 py-2 text-xs uppercase font-bold cursor-pointer"
              >
                {t('admin.confirmAction')}
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
  const { t } = useI18n();
  return (
    <Panel eyebrow={t('admin.operatorAudit')} title={title}>
      <div className="grid gap-3">
        {children || <EmptyPanel title={`No ${title.toLowerCase()} recorded`} description={t('admin.emptyAuditQueue')} />}
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
            <button key={action.label} type="button" onClick={() => void action.onClick()} className="btn-ghost px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
