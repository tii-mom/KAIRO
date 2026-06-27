import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  HeartHandshake,
  Radar,
  ShieldCheck,
  Sparkles,
  Trophy,
  Waves,
} from 'lucide-react';
import { getLeaderboard, listBounties, listCuratedItemsByPlacement, type LeaderboardResponse } from '../lib/api';
import type { BountyRecord, CuratedItemRecord } from '../../shared/domain';
import { formatFundingStatusLabel, formatMomentumCount } from '../lib/formatters';
import { ActionLink, EmptyPanel, Panel, StatusChip, AnimatedCounter, PointerGlowCard } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';

export default function RuntimeHomePage() {
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

  if (isLoading) return <LoadingState label="Loading KAIRO console..." />;
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
              <h2 className="font-mono text-[10px] text-[#EE1C25] tracking-[0.25em] uppercase font-bold">喚醒沉睡的代幣</h2>
            </div>
            <h1 className="font-sans text-3xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight">
              Reignite the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb95f] via-[#ffd285] to-[#ffb95f] glow-text-primary">Dormant</span>
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#c4c7c7] leading-relaxed max-w-xl">
              The institutional resurrection platform for legacy tokens. Revitalize dormant token ecosystems through community coordination, builder solutions, and proof-supported momentum.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <Link to="/catalysts" className="btn-primary px-6 py-3 text-xs uppercase tracking-widest font-bold w-full sm:w-auto text-center">
                Explore Catalysts
              </Link>
              <Link to="/create-catalyst" className="btn-ignite px-6 py-3 text-xs uppercase tracking-widest font-bold w-full sm:w-auto text-center">
                Ignite a Catalyst
              </Link>
              <Link to="/leaderboard" className="btn-ghost px-6 py-3 text-xs uppercase tracking-widest font-bold w-full sm:w-auto text-center">
                Explore The Grid
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
                  Live Telemetry
                </span>
                <span className="text-[9px] font-mono text-[#ffb95f] bg-[#ffb95f]/10 border border-[#ffb95f]/20 px-2 py-0.5 rounded">
                  CONSOLE V2
                </span>
              </div>

              <div className="space-y-4 z-10 relative">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase">ACTIVE CATALYSTS</span>
                  <span className="font-mono text-sm font-bold text-white">
                    <AnimatedCounter value={catalysts.length} />
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase">SUPPORT PROOFS</span>
                  <span className="font-mono text-sm font-bold text-white">
                    <AnimatedCounter value={leaderboard?.mostBoostedSubmissions.length ?? 0} />
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase">SIGNAL LANES</span>
                  <span className="font-mono text-sm font-bold text-white">
                    <AnimatedCounter value={curatedItems.length} />
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase">NETWORK STATE</span>
                  <span className="text-[9px] font-mono text-[#4ade80] uppercase tracking-wider font-semibold">
                    ONLINE // SECURE
                  </span>
                </div>
              </div>
            </PointerGlowCard>
          </div>
        </div>
      </section>

      {/* Operational Panels */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        
        {/* Protocol Signal Board */}
        <Panel
          eyebrow="Momentum Board"
          title="Featured Catalyst Lanes"
          description="Curated high-stakes resurrection briefs resolve into the general board."
          icon={Sparkles}
        >
          <div className="grid gap-3">
            {(featured.length ? featured : curatedItems.slice(0, 3)).map((item) => {
              const cRec = catalysts.find((c) => String(c.id) === String(item.targetId));
              return (
                <PointerGlowCard key={item.id} className="glass-panel p-4 hover:border-[#ffb95f]/30 transition-all duration-300 bg-[#050608]/50 kairo-tilt">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{item.title}</span>
                        <StatusChip tone="gold">{(item.itemType ?? 'curated').replace(/_/g, ' ')}</StatusChip>
                      </div>
                      <p className="text-xs text-white/50 mt-1 max-w-xl">{item.description ?? 'Curated ecosystem lane'}</p>
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
                            <div className="text-[#4ade80] font-semibold">{formatFundingStatusLabel(cRec.fundingStatus)}</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-left text-white/30 italic text-[10px]">
                          Target details loading...
                        </div>
                      )}
                      <Link to={cRec ? `/catalysts/${cRec.id}` : '/catalysts'} className="btn-ghost px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider shrink-0">
                        View Lane
                      </Link>
                    </div>
                  </div>
                </PointerGlowCard>
              );
            })}
            {!featured.length && !curatedItems.length ? (
              <EmptyPanel
                title="No curated lanes published"
                description="Ecosystem curators haven't designated homepage lanes yet."
              />
            ) : null}
          </div>
        </Panel>

        {/* High Density Activity Stream */}
        <Panel
          eyebrow="Activity Feed"
          title="Hot Catalyst Stream"
          description="Live momentum rankings driven by support boosts and active developer submissions."
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
                          SIGNAL: {index === 0 ? 'IGNITED_RUNNER' : 'CATALYST_LANE'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[#EE1C25] font-bold">{formatMomentumCount(Number(row.momentum_score ?? 0))}</div>
                        <div className="text-[8px] text-white/30 uppercase">MOMENTUM</div>
                      </div>
                      <StatusChip tone={index === 0 ? 'red' : 'slate'}>
                        {index === 0 ? 'ignited' : 'active'}
                      </StatusChip>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyPanel title="Awaiting stream signal" description="Lanes will populate here as booster actions happen." />
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        
        {/* Reward telemetry */}
        <Panel
          eyebrow="Reward Telemetry"
          title="Confirmed Public Reward Records"
          description="Verified coordination labels summarizing token rewards without asset control transfers."
          icon={ShieldCheck}
          action={<Link className="btn-ghost px-4 py-1.5 text-[10px]" to="/catalysts">View All Catalysts</Link>}
        >
          <div className="grid gap-3">
            {confirmed.length ? (
              confirmed.map((item) => (
                <div key={item.id} className="glass-panel p-4 hover:border-white/10 transition-colors bg-[#050608]/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <StatusChip tone="emerald">{formatFundingStatusLabel(item.fundingStatus)}</StatusChip>
                    </div>
                    <p className="text-xs text-white/50 mt-1 max-w-xl">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center text-xs font-mono">
                    <div className="text-left">
                      <div className="text-[8px] text-white/30 uppercase">MOMENTUM</div>
                      <div className="text-white font-bold">{formatMomentumCount(item.momentumScore)}</div>
                    </div>
                    <Link to={`/catalysts/${item.id}`} className="btn-ghost px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider">
                      Open Detail
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <EmptyPanel
                title="No verified reward records logged"
                description="Operator-confirmed entries will appear here once public proofs are verified."
              />
            )}
          </div>
        </Panel>

        {/* Proof Trail */}
        <Panel
          eyebrow="Proof Trail"
          title="Most Boosted Solution Feed"
          description="Previews which builder solutions are attracting the strongest support momentum."
          icon={HeartHandshake}
          action={<Link className="btn-ghost px-4 py-1.5 text-[10px]" to="/leaderboard">Open Leaderboards</Link>}
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
                    <p className="text-xs text-white/50 mt-1">Builder Reference ID: <strong className="text-white">{String(row.builder_name ?? row.builder_id ?? 'unknown')}</strong></p>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center text-xs font-mono">
                    <div className="text-left">
                      <div className="text-[8px] text-white/30 uppercase">BOOSTS</div>
                      <div className="text-white font-bold">{String(row.boost_count ?? 0)}</div>
                    </div>
                    <Link to={`/submissions/${String(row.id)}`} className="btn-ghost px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider">
                      View Solution
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <EmptyPanel
                title="No boosted solutions submitted"
                description="Solutions will appear here as builders deliver code and supporters boost their files."
              />
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {/* Protocol Links */}
        <Panel
          eyebrow="Protocol Links"
          title="Consoles & Fast Paths"
          description="Fast command panel switches to navigate key components of the resurrection cycle."
          icon={Waves}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink
              to="/builder"
              title="Builder Board"
              body="Monitor rank, deliverables, and KAIRO score."
            />
            <QuickLink
              to="/proof"
              title="Proof of Support"
              body="Verify community referral boosts and support records."
            />
            <QuickLink
              to="/beta"
              title="Private Beta Lanes"
              body="Review test limits, active telemetry scopes, and parameters."
            />
            <QuickLink
              to="/feedback"
              title="Feedback Intake"
              body="File system blockers, visual glitches, and code suggestions."
            />
          </div>
        </Panel>

        {/* Comeback highlights */}
        <Panel
          eyebrow="Resurrection Stories"
          title="Comeback Pulse"
          description="Operator reviews highlighting project revivals and historical dormant giant catalysts."
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
                    {item.description ?? 'Curated comeback highlight item.'}
                  </p>
                </div>
                <div className="mt-4 font-mono text-[9px] uppercase tracking-wider text-white/30">
                  Sector: {item.placement}
                </div>
              </article>
            ))}
            {!curatedItems.length ? (
              <div className="md:col-span-2">
                <EmptyPanel
                  title="Resurrection stream empty"
                  description="Curated highlights will populate once operators catalog live highlights."
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
