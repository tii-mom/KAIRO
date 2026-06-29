import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Trophy,
  Waves,
} from 'lucide-react';
import { getLeaderboard, listBounties, listCuratedItemsByPlacement, type LeaderboardResponse } from '../lib/api';
import type { BountyRecord, CuratedItemRecord } from '../../shared/domain';
import { formatFundingStatusLabel, formatMomentumCount } from '../lib/formatters';
import { EmptyPanel, Panel, StatusChip, AnimatedCounter, PointerGlowCard } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';
import { useI18n } from '../i18n/useI18n';

import { getRevivalState, getRevivalStateTone, getRevivalStateLabel } from '../lib/revivalState';
import ShareButton from '../components/ShareButton';

export default function RuntimeHomePage() {
  const { t, locale } = useI18n();
  const [catalysts, setCatalysts] = useState<BountyRecord[]>([]);
  const [curatedItems, setCuratedItems] = useState<CuratedItemRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [bounties, curated, board] = await Promise.all([
        listBounties(),
        listCuratedItemsByPlacement('home'),
        getLeaderboard(),
      ]);
      setCatalysts(bounties);
      setCuratedItems(curated);
      setLeaderboard(board);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load runtime data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (isLoading) return <LoadingState label={t('common.loading')} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const featured = curatedItems.filter((item) => item.itemType === 'featured_catalyst').slice(0, 3);
  const hottest = (leaderboard?.hottestCatalysts ?? []).slice(0, 5);
  const mostBoosted = (leaderboard?.mostBoostedSubmissions ?? []).slice(0, 5);
  const confirmed = catalysts.filter((item) => item.fundingStatus !== 'unverified').slice(0, 4);

  return (
    <div className="space-y-8 pb-12">

      {/* Visual Hero Block */}
      <section className="glass-panel p-6 sm:p-10 xl:p-12 relative overflow-hidden pulse-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0e14]/50 to-[#0c0e14] z-0 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headings & CTAs */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded border border-[#EE1C25]/30 bg-[#EE1C25]/5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EE1C25] shadow-[0_0_5px_rgba(238,28,37,0.8)] animate-ping" />
              <h2 className="font-mono text-[10px] text-[#EE1C25] tracking-[0.25em] uppercase font-bold">{t('beta.arenaTitle')}</h2>
            </div>
            <h1 className="font-sans text-3xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight">
              {t('beta.arenaHeader')}
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#c4c7c7] leading-relaxed max-w-xl">
              {t('beta.arenaDesc')}
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <Link to="/catalysts" className="btn-primary px-6 py-3 text-xs uppercase tracking-widest font-bold w-full sm:w-auto text-center">
                {t('beta.btnBoostToken')}
              </Link>
              <Link to="/create-catalyst" className="btn-ignite px-6 py-3 text-xs uppercase tracking-widest font-bold w-full sm:w-auto text-center">
                {t('beta.btnSubmitDeadToken')}
              </Link>
              <Link to="/proof" className="btn-ghost px-6 py-3 text-xs uppercase tracking-widest font-bold w-full sm:w-auto text-center">
                {t('beta.btnClaimProof')}
              </Link>
            </div>
          </div>

          {/* Right Column: Telemetry Console */}
          <div className="lg:col-span-5 w-full">
            <PointerGlowCard className="glass-panel p-5 bg-[#050608]/90 border-white/5 relative overflow-hidden group hover:border-[#ffb95f]/20 transition-all duration-300 kairo-tilt">
              <div className="absolute inset-0 bg-energy-line opacity-30 pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 z-10 relative">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EE1C25] animate-pulse" />
                  {t('home.liveTelemetry')}
                </span>
                <span className="text-[9px] font-mono text-[#ffb95f] bg-[#ffb95f]/10 border border-[#ffb95f]/20 px-2 py-0.5 rounded">
                  {t('home.consoleV2')}
                </span>
              </div>

              <div className="space-y-4 z-10 relative">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase">{t('home.activeCatalysts')}</span>
                  <span className="font-mono text-sm font-bold text-white">
                    <AnimatedCounter value={catalysts.length} />
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase">{t('home.supportProofs')}</span>
                  <span className="font-mono text-sm font-bold text-white">
                    <AnimatedCounter value={leaderboard?.mostBoostedSubmissions.length ?? 0} />
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase">{t('home.signalLanes')}</span>
                  <span className="font-mono text-sm font-bold text-white">
                    <AnimatedCounter value={curatedItems.length} />
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase">{t('home.networkState')}</span>
                  <span className="text-[9px] font-mono text-[#4ade80] uppercase tracking-wider font-semibold">
                    {t('home.onlineSecure')}
                  </span>
                </div>
                <div className="text-[8px] font-mono text-white/30 mt-3 pt-2 border-t border-white/5 leading-snug">
                  {t('home.telemetryDesc')}
                </div>
              </div>
            </PointerGlowCard>
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="grid gap-6 md:grid-cols-3">
        <PointerGlowCard className="glass-panel p-6 bg-[#0c0e14]/40 hover:border-[#ffb95f]/30 transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#ffb95f] uppercase tracking-widest">[01] {t('beta.roleHolderTitle')}</span>
            <p className="text-xs text-white/60 leading-relaxed mt-2">
              {t('beta.roleHolderDesc')}
            </p>
          </div>
          <Link to="/catalysts" className="btn-primary mt-4 py-2 text-center text-xs font-bold uppercase tracking-wider">
            {t('beta.roleHolderAction')}
          </Link>
        </PointerGlowCard>

        <PointerGlowCard className="glass-panel p-6 bg-[#0c0e14]/40 hover:border-[#ffb95f]/30 transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#ffb95f] uppercase tracking-widest">[02] {t('beta.roleOwnerTitle')}</span>
            <p className="text-xs text-white/60 leading-relaxed mt-2">
              {t('beta.roleOwnerDesc')}
            </p>
          </div>
          <Link to="/create-catalyst" className="btn-ignite mt-4 py-2 text-center text-xs font-bold uppercase tracking-wider">
            {t('beta.roleOwnerAction')}
          </Link>
        </PointerGlowCard>

        <PointerGlowCard className="glass-panel p-6 bg-[#0c0e14]/40 hover:border-[#ffb95f]/30 transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#ffb95f] uppercase tracking-widest">[03] {t('home.roleBuilderTitle')}</span>
            <p className="text-xs text-white/60 leading-relaxed mt-2">
              {t('beta.roleBuilderDesc')}
            </p>
          </div>
          <Link to="/catalysts" className="btn-ghost mt-4 py-2 text-center text-xs font-bold uppercase tracking-wider">
            {t('beta.roleBuilderAction')}
          </Link>
        </PointerGlowCard>
      </section>

      {/* Operational Panels */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        
        {/* Protocol Signal Board */}
        <Panel
          eyebrow={t('home.momentumBoard')}
          title={t('home.featuredCatalysts')}
          description={t('home.featuredDesc')}
          icon={Sparkles}
        >
          <div className="grid gap-3">
            {(featured.length ? featured : curatedItems.slice(0, 3)).map((item) => {
              const cRec = catalysts.find((c) => String(c.id) === String(item.targetId));
              const rState = cRec ? getRevivalState(cRec) : 'sleeping';
              return (
                <PointerGlowCard key={item.id} className="glass-panel p-4 hover:border-[#ffb95f]/30 transition-all duration-300 bg-[#050608]/50 kairo-tilt">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{item.title}</span>
                        <StatusChip tone={getRevivalStateTone(rState)}>
                          {getRevivalStateLabel(rState, locale)}
                        </StatusChip>
                      </div>
                      <p className="text-xs text-white/50 mt-1 max-w-xl">{item.description ?? t('home.curatedEcosystemLane')}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center text-xs font-mono">
                      {cRec ? (
                        <>
                          <div className="text-left min-w-[70px]">
                            <div className="text-[8px] text-white/30 uppercase">MOMENTUM</div>
                            <div className="text-white font-bold">
                              <AnimatedCounter value={cRec.momentumScore} formatter={formatMomentumCount} />
                            </div>
                          </div>
                          <div className="text-left min-w-[90px]">
                            <div className="text-[8px] text-white/30 uppercase">REWARD</div>
                            <div className="text-[#ffb95f] font-semibold truncate max-w-[80px]" title={cRec.rewardText || 'Pending'}>
                              {cRec.rewardText || 'Pending'}
                            </div>
                          </div>
                          <div className="text-left min-w-[70px]">
                            <div className="text-[8px] text-white/30 uppercase">STATUS</div>
                            <div className="text-[#4ade80] font-semibold">{formatFundingStatusLabel(cRec.fundingStatus, locale)}</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-left text-white/30 italic text-[10px]">
                          {t('home.targetDetailsLoading')}
                        </div>
                      )}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={cRec ? `/catalysts/${cRec.id}` : '/catalysts'} className="btn-ghost px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider">
                          {t('catalysts.viewDetails')}
                        </Link>
                        {cRec && (
                          <ShareButton id={cRec.id} type="catalyst" title={cRec.title} variant="inline" />
                        )}
                      </div>
                    </div>
                  </div>
                </PointerGlowCard>
              );
            })}
            {!featured.length && !curatedItems.length ? (
              <EmptyPanel
                title={t('home.noCuratedLanesTitle')}
                description={t('home.noCuratedLanesDesc')}
              />
            ) : null}
          </div>
        </Panel>

        {/* High Density Activity Stream */}
        <Panel
          eyebrow={t('home.activityFeed')}
          title={t('home.hotCatalystStream')}
          description={t('home.hotCatalystStreamDesc')}
          icon={Activity}
        >
          <div className="grid gap-3">
            {hottest.length ? (
              <div className="space-y-3 font-mono">
                {hottest.map((row, index) => (
                  <Link 
                    key={`${String(row.id)}-${index}`}
                    to={`/catalysts/${String(row.id)}`}
                    className="flex items-center justify-between p-3 rounded border border-white/5 bg-[#050608]/70 hover:border-[#EE1C25]/20 hover:bg-[#EE1C25]/5 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[10px] font-bold shrink-0 ${index === 0 ? 'text-[#EE1C25]' : 'text-white/40'}`}>
                        [{index + 1}]
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-white font-semibold">{String(row.title ?? 'Untitled Catalyst')}</div>
                        <div className="text-[9px] text-white/30 mt-0.5 uppercase">
                          SIGNAL: {index === 0 ? t('home.signalIgnitedRunner') : t('home.signalCatalystLane')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[#EE1C25] font-bold">{formatMomentumCount(Number(row.momentum_score ?? 0))}</div>
                        <div className="text-[8px] text-white/30 uppercase">MOMENTUM</div>
                      </div>
                      <StatusChip tone={index === 0 ? 'red' : 'slate'}>
                        {index === 0 ? t('home.signalIgnitedRunner') : t('catalysts.filterActive')}
                      </StatusChip>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyPanel title={t('home.awaitingStreamSignal')} description={t('home.awaitingStreamSignalDesc')} />
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        
        {/* Reward telemetry */}
        <Panel
          eyebrow={t('home.rewardTelemetry')}
          title={t('home.confirmedEvidenceTitle')}
          description={t('home.confirmedEvidenceDesc')}
          icon={ShieldCheck}
          action={<Link className="btn-ghost px-4 py-1.5 text-[10px]" to="/catalysts">{t('home.viewAllCatalysts')}</Link>}
        >
          <div className="grid gap-3">
            {confirmed.length ? (
              confirmed.map((item) => (
                <div key={item.id} className="glass-panel p-4 hover:border-white/10 transition-colors bg-[#050608]/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <StatusChip tone="emerald">{formatFundingStatusLabel(item.fundingStatus, locale)}</StatusChip>
                    </div>
                    <p className="text-xs text-white/50 mt-1 max-w-xl">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center text-xs font-mono">
                    <div className="text-left">
                      <div className="text-[8px] text-white/30 uppercase">MOMENTUM</div>
                      <div className="text-white font-bold">{formatMomentumCount(item.momentumScore)}</div>
                    </div>
                    <Link to={`/catalysts/${item.id}`} className="btn-ghost px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider">
                      {t('catalysts.viewDetails')}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <EmptyPanel
                title={t('home.noConfirmedEvidenceTitle')}
                description={t('home.noConfirmedEvidenceDesc')}
              />
            )}
          </div>
        </Panel>

        {/* Proof Trail */}
        <Panel
          eyebrow={t('home.proofTrail')}
          title={t('home.mostBoostedSolutionsTitle')}
          description={t('home.mostBoostedSolutionsDesc')}
          icon={HeartHandshake}
          action={<Link className="btn-ghost px-4 py-1.5 text-[10px]" to="/leaderboard">{t('leaderboard.title')}</Link>}
        >
          <div className="grid gap-3">
            {mostBoosted.length ? (
              mostBoosted.map((row, index) => (
                <div key={`${String(row.id)}-${index}`} className="glass-panel p-4 hover:border-white/10 transition-colors bg-[#050608]/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{String(row.name ?? 'Untitled Solution')}</span>
                      <StatusChip tone="sky">proof event</StatusChip>
                    </div>
                    <p className="text-xs text-white/50 mt-1">{t('home.builderReferenceId')} <strong className="text-white">{String(row.builder_name ?? row.builder_id ?? 'unknown')}</strong></p>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center text-xs font-mono">
                    <div className="text-left">
                      <div className="text-[8px] text-white/30 uppercase">BOOSTS</div>
                      <div className="text-white font-bold">{String(row.boost_count ?? 0)}</div>
                    </div>
                    <Link to={`/submissions/${String(row.id)}`} className="btn-ghost px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider">
                      {t('submissionDetail.viewSolution')}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <EmptyPanel
                title={t('home.noBoostedSolutionsTitle')}
                description={t('home.noBoostedSolutionsDesc')}
              />
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {/* Protocol Links */}
        <Panel
          eyebrow={t('home.protocolLinks')}
          title={t('home.fastPathsTitle')}
          description={t('home.fastPathsDesc')}
          icon={Waves}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink
              to="/builder"
              title={t('nav.builderBoard')}
              body={t('home.quickLinkBuilderDesc')}
            />
            <QuickLink
              to="/proof"
              title={t('nav.supportProof')}
              body={t('home.quickLinkProofDesc')}
            />
            <QuickLink
              to="/beta"
              title={t('nav.beta')}
              body={t('home.quickLinkBetaDesc')}
            />
            <QuickLink
              to="/feedback"
              title={t('nav.feedback')}
              body={t('home.quickLinkFeedbackDesc')}
            />
          </div>
        </Panel>

        {/* Comeback highlights */}
        <Panel
          eyebrow={t('home.resurrectionStories')}
          title={t('home.comebackPulseTitle')}
          description={t('home.comebackPulseDesc')}
          icon={Trophy}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {curatedItems.slice(0, 4).map((item) => (
              <article
                key={item.id}
                className="glass-panel p-4 flex flex-col justify-between hover:border-white/15 transition-all bg-[#0c0e14]/40"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <StatusChip tone="gold">{(item.itemType ?? 'curated').replace(/_/g, ' ')}</StatusChip>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-white tracking-tight leading-snug">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/50">
                    {item.description ?? t('home.curatedComebackHighlightItem')}
                  </p>
                </div>
                <div className="mt-4 font-mono text-[9px] uppercase tracking-wider text-white/30">
                  {t('home.sector')} {item.placement}
                </div>
              </article>
            ))}
            {!curatedItems.length ? (
              <div className="md:col-span-2">
                <EmptyPanel
                  title={t('home.resurrectionStreamEmptyTitle')}
                  description={t('home.resurrectionStreamEmptyDesc')}
                />
              </div>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function QuickLink({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link
      to={to}
      className="glass-panel glass-panel-hover p-4 hover:border-[#ffb95f]/30 flex flex-col justify-between bg-[#050608]/40"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-white tracking-tight">{title}</h3>
        <ArrowRight className="h-3 w-3 text-white/20" />
      </div>
      <p className="mt-2 text-[11px] leading-5 text-white/40">{body}</p>
    </Link>
  );
}
