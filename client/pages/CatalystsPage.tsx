import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Award, Flame, Info, Plus, ShieldCheck } from 'lucide-react';
import { boostBounty, getBounty, listBounties, listFundingEvents, listSubmissions, type PublicBountyRecord } from '../lib/api';
import { type SubmissionRecord, type FundingEventRecord } from '../../shared/domain';
import { fallbackText, formatDate, formatFundingStatusLabel, formatMomentumCount } from '../lib/formatters';
import { ActionButton, ActionLink, DataRow, EmptyPanel, MomentumBar, PageHero, Panel, StatusChip, AnimatedCounter, PointerGlowCard } from '../components/runtimeUi';
import { EmptyState, ErrorState, LoadingState } from './pageUtils';
import { useI18n } from '../i18n/useI18n';

type ApiBounty = PublicBountyRecord & {
  tokenSymbol?: string | null;
  tokenName?: string | null;
  tokenChain?: string | null;
};

export function CatalystDetailPage() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const [catalyst, setCatalyst] = useState<ApiBounty | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [fundingEvents, setFundingEvents] = useState<FundingEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [boostSuccess, setBoostSuccess] = useState(false);

  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [bountyData, submissionData, fundingData] = await Promise.all([
        getBounty(id),
        listSubmissions(id),
        listFundingEvents(id),
      ]);
      setCatalyst(bountyData as ApiBounty);
      setSubmissions(submissionData);
      setFundingEvents(fundingData);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Catalyst details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  if (!id) return <Navigate to="/catalysts" replace />;
  if (isLoading) return <LoadingState label={t('catalysts.loadingDetails')} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!catalyst) return <Navigate to="/catalysts" replace />;

  const handleBoost = async () => {
    try {
      const result = await boostBounty(id);
      setBoostMessage(result.duplicate ? t('submissionDetail.boostSuccess') : `Boost recorded: +${result.pointsDelta ?? 0} support points.`);
      if (!result.duplicate) {
        setBoostSuccess(true);
        setTimeout(() => setBoostSuccess(false), 700);
      }
      await load();
    } catch (boostError) {
      setBoostMessage(boostError instanceof Error ? boostError.message : 'Unable to record Boost.');
    }
  };

  const copyAddress = () => {
    const address = catalyst.tokenContractAddress || '';
    if (!address) return;
    void navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Detail Header Block */}
      <div className="border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Link to="/catalysts" className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffb95f] hover:underline">
            ← {t('catalysts.backToRegistry')}
          </Link>
          <span className="text-white/20">|</span>
          <span className="inline-flex rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-[#ffb95f]">
            {t('catalysts.activeCatalystLanes')}
          </span>
          <span className="text-white/40 font-mono text-[9px] uppercase tracking-wider">{t('catalysts.detailEyebrow')}: Discovery Mode</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">{catalyst.title}</h1>
        <p className="font-sans text-[#c4c7c7] text-sm sm:text-base max-w-3xl leading-relaxed">{catalyst.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details, Objectives, Milestones */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Project Profile & Chart */}
          <PointerGlowCard className="glass-panel rounded-lg overflow-hidden kairo-tilt">
            <div className="glass-header px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80">{t('catalysts.projectProfile')}</h2>
              <div className="flex gap-2">
                {catalyst.tokenWebsiteUrl ? (
                  <a href={catalyst.tokenWebsiteUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-2.5 py-1 text-[9px] font-mono tracking-widest font-bold">
                    {t('catalysts.website')}
                  </a>
                ) : (
                  <span className="text-[9px] font-mono text-white/30 border border-white/5 px-2.5 py-1 rounded">{t('catalysts.websiteUnavailable')}</span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded bg-[#0c0e14] flex items-center justify-center border border-white/5 shadow-[0_0_15px_rgba(255,185,95,0.15)] text-[#ffb95f]">
                  <span className="font-mono text-xl font-bold">{catalyst.tokenSymbol ? catalyst.tokenSymbol.slice(0, 3) : 'KAI'}</span>
                </div>
                <div>
                  <div className="font-sans text-lg font-bold text-white">{catalyst.tokenName || 'KAIRO Network Token'}</div>
                  <div className="font-mono text-[11px] text-white/50 flex items-center gap-2 mt-1">
                    <span>{t('catalysts.address')} {catalyst.tokenContractAddress ? `${catalyst.tokenContractAddress.slice(0, 6)}...${catalyst.tokenContractAddress.slice(-4)}` : t('catalysts.pendingVerification')}</span>
                    {catalyst.tokenContractAddress ? (
                      <button onClick={copyAddress} className="text-[#ffb95f] hover:text-white transition-colors cursor-pointer" title={t('catalysts.copy')}>
                        {copied ? t('catalysts.copied') : t('catalysts.copy')}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Compact metadata rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6 text-xs font-mono mb-6">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/40">{t('catalysts.chain')}</span>
                  <span className="text-white font-bold uppercase">{catalyst.tokenChain || t('catalysts.unknown')}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/40">{t('catalysts.website')}</span>
                  {catalyst.tokenWebsiteUrl ? (
                    <a href={catalyst.tokenWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-[#ffb95f] hover:underline">
                      {t('catalysts.link')}
                    </a>
                  ) : (
                    <span className="text-white/30 italic">{t('catalysts.notProvided')}</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5 md:border-b-0">
                  <span className="text-white/40">TWITTER</span>
                  {catalyst.tokenTwitterUrl ? (
                    <a href={catalyst.tokenTwitterUrl} target="_blank" rel="noopener noreferrer" className="text-[#ffb95f] hover:underline">
                      {t('catalysts.link')}
                    </a>
                  ) : (
                    <span className="text-white/30 italic">{t('catalysts.notProvided')}</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-1.5 md:py-0">
                  <span className="text-white/40">TELEGRAM</span>
                  {catalyst.tokenTelegramUrl ? (
                    <a href={catalyst.tokenTelegramUrl} target="_blank" rel="noopener noreferrer" className="text-[#ffb95f] hover:underline">
                      {t('catalysts.link')}
                    </a>
                  ) : (
                    <span className="text-white/30 italic">{t('catalysts.notProvided')}</span>
                  )}
                </div>
              </div>

              {/* simulated Telemetry Chart Area */}
              <div className="w-full h-44 bg-[#050608] rounded border border-white/5 relative overflow-hidden flex flex-col justify-between p-4">
                <div className="absolute inset-0 bg-energy-line opacity-10 pointer-events-none" />
                <div className="font-mono text-[10px] text-[#ffb95f] flex justify-between z-10">
                  <span>{t('catalysts.revivalSignalTelemetry')}</span>
                  <span className="text-[#4ade80]">+28.4% MOMENTUM</span>
                </div>
                
                {/* Visual grid chart bars */}
                <div className="w-full h-24 flex items-end justify-between px-2 pb-1 relative z-10">
                  <div className="w-[12%] h-[20%] bg-[#ffb95f]/10 border-t border-[#ffb95f]/30 rounded-t"></div>
                  <div className="w-[12%] h-[35%] bg-[#ffb95f]/15 border-t border-[#ffb95f]/40 rounded-t"></div>
                  <div className="w-[12%] h-[25%] bg-[#ffb95f]/10 border-t border-[#ffb95f]/30 rounded-t"></div>
                  <div className="w-[12%] h-[55%] bg-[#ffb95f]/20 border-t border-[#ffb95f]/50 rounded-t"></div>
                  <div className="w-[12%] h-[40%] bg-[#ffb95f]/15 border-t border-[#ffb95f]/40 rounded-t"></div>
                  <div className="w-[12%] h-[75%] bg-[#ffb95f]/30 border-t-2 border-[#ffb95f] rounded-t relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ffb95f] rounded-full animate-ping" />
                  </div>
                </div>

                <div className="text-[9px] font-mono text-white/30 italic text-left border-t border-white/5 pt-1.5 z-10">
                  {t('common.telemetryDisclaimer')}
                </div>
              </div>
            </div>
          </PointerGlowCard>

          {/* Mission Objectives */}
          <section className="glass-panel rounded-lg p-6">
            <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80 border-b border-white/5 pb-4 mb-4">{t('catalysts.descriptionTitle')}</h2>
            <div className="font-sans text-xs sm:text-sm text-white/70 space-y-4 leading-relaxed">
              <p>{t('catalysts.objectiveClaimDesc')}</p>
              <div className="bg-[#050608] p-4 rounded border border-white/5 mt-4">
                <h3 className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-3">{t('catalysts.keyTechnicalTargets')}</h3>
                <ul className="list-disc list-inside space-y-2 font-mono text-xs text-white/60">
                  <li>{t('catalysts.target1')}</li>
                  <li>{t('catalysts.target2')}</li>
                  <li>{t('catalysts.target3')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Project Milestones */}
          <section className="glass-panel rounded-lg p-6">
            <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80 border-b border-white/5 pb-4 mb-6">{t('catalysts.workflowPipeline')}</h2>
            <p className="text-[11px] text-white/40 mb-6 font-mono">{t('catalysts.workflowPipelineDesc')}</p>
            <div className="relative pl-6 border-l border-white/5 space-y-8">
              <div className="relative">
                <div className="absolute -left-[30px] top-1 w-3 h-3 rounded bg-[#ffb95f] ring-4 ring-[#0c0e14]"></div>
                <div className="font-mono text-[10px] text-[#ffb95f] mb-1">{t('catalysts.stage1')}</div>
                <h4 className="font-sans text-sm font-bold text-white mb-1">{t('catalysts.stage1Title')}</h4>
                <p className="font-sans text-xs text-white/50">{t('catalysts.stage1Desc')}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[30px] top-1 w-3 h-3 rounded bg-[#EE1C25] ring-4 ring-[#0c0e14] shadow-[0_0_8px_rgba(238,28,37,0.5)] animate-pulse"></div>
                <div className="font-mono text-[10px] text-[#EE1C25] mb-1">{t('catalysts.stage2')}</div>
                <h4 className="font-sans text-sm font-bold text-white mb-1">{t('catalysts.stage2Title')}</h4>
                <p className="font-sans text-xs text-white/50">{t('catalysts.stage2Desc')}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[30px] top-1 w-3 h-3 rounded bg-white/20 ring-4 ring-[#0c0e14]"></div>
                <div className="font-mono text-[10px] text-white/30 mb-1">{t('catalysts.stage3')}</div>
                <h4 className="font-sans text-sm font-bold text-white mb-1">{t('catalysts.stage3Title')}</h4>
                <p className="font-sans text-xs text-white/50">{t('catalysts.stage3Desc')}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Support, Bounty Pool, Top Boosters */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Support Panel */}
          <section className="glass-panel rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#EE1C25]/5 blur-[40px] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">{t('catalysts.ecosystemMomentum')}</div>
              <div className="font-sans text-4xl font-black text-[#EE1C25] tracking-tight mb-4 flex items-baseline gap-1">
                <AnimatedCounter value={catalyst.momentumScore} formatter={formatMomentumCount} /> <span className="font-mono text-xs text-white/40 uppercase">{t('catalysts.pts')}</span>
              </div>
              <MomentumBar percentage={75} className="w-full mb-6" />
              <ActionButton tone="ignite" onClick={() => void handleBoost()} className={`w-full py-3 text-xs uppercase tracking-widest font-bold ${boostSuccess ? 'animate-success-pulse' : ''}`}>
                {t('catalysts.boostButton')}
              </ActionButton>
              {boostMessage ? (
                <div className="mt-4 w-full rounded border border-white/5 bg-white/[0.02] p-3 text-[11px] font-mono text-[#ffb95f]">
                  {boostMessage}
                </div>
              ) : null}
            </div>
          </section>

          {/* Builder Bounty */}
          <section className="glass-panel rounded-lg p-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80">{t('catalysts.builderReward')}</h2>
              <Award className="h-4 w-4 text-[#ffb95f]" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-white/40 mb-1">{t('catalysts.verifiedPool')}</div>
              <div className="font-sans text-xl font-bold text-white mb-4">
                {catalyst.rewardText ? catalyst.rewardText : <span className="text-white/40 italic">{t('catalysts.rewardPending')}</span>}
              </div>
              <div className="flex items-center justify-between p-3 bg-[#050608] rounded border border-white/5 mb-4 text-xs font-mono">
                <span className="text-white/40">{t('catalysts.fundingStatus')}</span>
                <span className="bg-[#ffb95f]/15 text-[#ffb95f] border border-[#ffb95f]/30 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">
                  {formatFundingStatusLabel(catalyst.fundingStatus, locale)}
                </span>
              </div>
              <p className="text-xs text-white/50 leading-5">
                {t('catalysts.fundingLabelDesc')}
              </p>
            </div>
          </section>

          {/* Top Supporters */}
          <section className="glass-panel rounded-lg overflow-hidden">
            <div className="glass-header px-6 py-4">
              <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80">{t('catalysts.topSupporters')}</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono py-1.5 border-b border-white/5">
                <span className="text-white/60">1. {t('catalysts.referralNetwork')}</span>
                <span className="font-mono text-xs text-[#ffb95f] font-semibold">2,400 {t('catalysts.pts')}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono py-1.5 border-b border-white/5">
                <span className="text-white/60">2. {t('catalysts.devScoreBoard')}</span>
                <span className="font-mono text-xs text-[#ffb95f] font-semibold">1,950 {t('catalysts.pts')}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono py-1.5">
                <span className="text-white/60">3. {t('catalysts.supportTimeline')}</span>
                <span className="font-mono text-xs text-[#ffb95f] font-semibold">1,850 {t('catalysts.pts')}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="mt-12 border-t border-white/5 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">{t('catalysts.builderSubmissions')}</h2>
          <span className="bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 rounded text-xs font-mono">{submissions.length}</span>
        </div>
        
        {submissions.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="glass-panel p-5 bg-[#0c0e14]/60 border-white/5 hover:border-[#ffb95f]/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{submission.name}</h4>
                      <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">
                        BUILDER: {submission.builderName || submission.builderId || 'Unknown'}
                      </p>
                    </div>
                    <Link to={`/submissions/${submission.id}`} className="text-white/30 hover:text-[#ffb95f] transition-colors shrink-0" title={t('catalysts.solutionDetails')}>
                      <Info className="h-4 w-4" />
                    </Link>
                  </div>
                  <p className="text-xs text-white/60 leading-5 mb-4">{submission.tagline || submission.description}</p>
                </div>
                
                {/* Proof Links Row */}
                <div className="flex flex-wrap gap-2 text-[10px] font-mono mb-4 text-white/40">
                  {submission.demoUrl ? (
                    <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ffb95f] underline">DEMO</a>
                  ) : <span className="opacity-50">NO_DEMO</span>}
                  <span>·</span>
                  {submission.githubUrl ? (
                    <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ffb95f] underline">CODE</a>
                  ) : <span className="opacity-50">NO_CODE</span>}
                  <span>·</span>
                  {submission.videoUrl ? (
                    <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ffb95f] underline">VIDEO</a>
                  ) : <span className="opacity-50">NO_VIDEO</span>}
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-auto">
                  <StatusChip tone={submission.status === 'approved' ? 'emerald' : 'gold'}>
                    {submission.status}
                  </StatusChip>
                  <div className="text-right">
                    <span className="font-mono text-xs text-[#ffb95f] font-bold">{t('catalysts.boostsCount', { count: submission.boostCount })}</span>
                    <div className="text-[9px] font-mono text-white/30 mt-0.5">{formatDate(submission.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel
            title={t('catalysts.awaitingSubmissionsTitle')}
            description={t('catalysts.awaitingSubmissionsDesc')}
          />
        )}
      </div>

      {/* Funding log */}
      <div className="mt-8">
        <Panel eyebrow={t('catalysts.evidenceLog')} title={t('catalysts.rewardConfirmationRecords')} description={t('catalysts.publicSafeRecords')} icon={ShieldCheck}>
          <div className="grid gap-3">
            {fundingEvents.length ? (
              fundingEvents.map((event) => (
                <DataRow
                  key={event.id}
                  title={event.amountText ?? t('catalysts.rewardConfirmationNote')}
                  subtitle={event.note ?? t('catalysts.verifiedByCommunity')}
                  meta={formatDate(event.createdAt)}
                  badge={<StatusChip tone="emerald">recorded</StatusChip>}
                />
              ))
            ) : (
              <EmptyPanel
                title={t('catalysts.awaitingEventLogsTitle')}
                description={t('catalysts.awaitingEventLogsDesc')}
              />
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default function CatalystsPage() {
  const { t, locale } = useI18n();
  const [catalysts, setCatalysts] = useState<ApiBounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const items = await listBounties();
      setCatalysts(items as ApiBounty[]);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Catalysts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (isLoading) return <LoadingState label={t('catalysts.loadingRegistry')} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const confirmed = catalysts.filter((item) => item.fundingStatus !== 'unverified');
  const featured = catalysts.filter((item) => item.featured).slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* Registry Hero */}
      <PageHero
        eyebrow={t('catalysts.title')}
        title={t('catalysts.resurrectionMarketplace')}
        description={t('catalysts.marketplaceDesc')}
        actions={
          <>
            <ActionLink to="/create-catalyst" className="text-xs uppercase tracking-widest font-bold">{t('catalysts.createCatalyst')}</ActionLink>
            <ActionLink tone="secondary" to="/leaderboard" className="text-xs uppercase tracking-widest font-bold">{t('catalysts.openRankingsGrid')}</ActionLink>
          </>
        }
        stats={[
          { label: t('catalysts.liveLanes'), value: catalysts.length, detail: t('catalysts.resurrectionMissionsActive') },
          { label: t('catalysts.verified'), value: confirmed.length, detail: t('catalysts.publicRewardStateRecorded'), tone: 'emerald' },
          { label: t('catalysts.featured'), value: featured.length, detail: t('catalysts.highPriorityLanes'), tone: 'sky' },
        ]}
        aside={
          <Panel eyebrow={t('catalysts.ignitionSwitch')} title={t('catalysts.igniteNewCatalyst')} icon={Plus}>
            <p className="text-xs leading-5 text-white/50">
              {t('catalysts.ignitionDesc')}
            </p>
            <div className="mt-5">
              <Link className="btn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5" to="/create-catalyst">
                {t('catalysts.igniteNewCatalyst')}
                <Plus className="h-4 w-4" />
              </Link>
            </div>
          </Panel>
        }
      />

      {catalysts.length ? (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Panel eyebrow={t('catalysts.registryGrid')} title={t('catalysts.activeCatalystLanes')} description={t('catalysts.exploreLanesDesc')}>
            <div className="grid gap-3">
              {catalysts.map((catalyst) => (
                <DataRow
                  key={catalyst.id}
                  to={`/catalysts/${catalyst.id}`}
                  title={catalyst.title}
                  subtitle={catalyst.description}
                  value={formatMomentumCount(catalyst.momentumScore)}
                  meta={`Boosts: ${catalyst.boostCount}  Solutions: ${catalyst.submissionCount}`}
                  badge={<StatusChip tone="gold">{formatFundingStatusLabel(catalyst.fundingStatus, locale)}</StatusChip>}
                />
              ))}
            </div>
          </Panel>

          <div className="grid gap-6">
            <Panel eyebrow={t('catalysts.telemetryStatus')} title={t('catalysts.rewardVisibleLanes')} icon={ShieldCheck}>
              <div className="grid gap-3">
                {confirmed.length ? (
                  confirmed.slice(0, 5).map((item) => (
                    <DataRow
                      key={item.id}
                      to={`/catalysts/${item.id}`}
                      title={item.title}
                      subtitle={item.tokenSymbol ?? item.tokenId}
                      value={formatFundingStatusLabel(item.fundingStatus, locale)}
                      badge={<StatusChip tone="emerald">{t('catalysts.verifiedRewards')}</StatusChip>}
                    />
                  ))
                ) : (
                  <EmptyPanel
                    title={t('catalysts.noConfirmedRewardsTitle')}
                    description={t('catalysts.noConfirmedRewardsDesc')}
                  />
                )}
              </div>
            </Panel>

            <Panel eyebrow={t('catalysts.catalystWatch')} title={t('catalysts.ecosystemHighlights')} icon={Flame}>
              <div className="grid gap-3">
                {(featured.length ? featured : catalysts.slice(0, 3)).map((catalyst) => (
                  <article key={catalyst.id} className="glass-panel p-4 flex flex-col justify-between bg-[#0c0e14]/40">
                    <div>
                      <StatusChip tone="gold">{catalyst.featured ? t('catalysts.featuredTarget') : t('catalysts.watchlist')}</StatusChip>
                      <h3 className="mt-4 text-base font-bold tracking-tight text-white">{catalyst.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-white/50">{catalyst.description}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 border-t border-white/5 pt-3 font-mono text-[9px] uppercase tracking-wider text-white/30">
                      <span>Momentum: {formatMomentumCount(catalyst.momentumScore)}</span>
                      <span>Boosts: {catalyst.boostCount}</span>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <EmptyState title={t('catalysts.noCatalystsYetTitle')} description={t('catalysts.noCatalystsYetDesc')} />
      )}
    </div>
  );
}
