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
import { ActionLink, DataRow, EmptyPanel, Panel, StatusChip } from '../components/runtimeUi';
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

  if (isLoading) return <LoadingState label="Loading KAIRO homepage..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const banner = curatedItems.find((item) => item.itemType === 'homepage_banner');
  const featured = curatedItems.filter((item) => item.itemType === 'featured_catalyst').slice(0, 3);
  const hottest = (leaderboard?.hottestCatalysts ?? []).slice(0, 5);
  const mostBoosted = (leaderboard?.mostBoostedSubmissions ?? []).slice(0, 5);
  const confirmed = catalysts.filter((item) => item.fundingStatus !== 'unverified').slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Visual Hero Block */}
      <section className="glass-panel p-6 sm:p-10 xl:p-12 relative overflow-hidden pulse-bg text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0e14]/50 to-[#0c0e14] z-0 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto py-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded border border-[#EE1C25]/30 bg-[#EE1C25]/5 mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EE1C25] shadow-[0_0_5px_rgba(238,28,37,0.8)] animate-ping" />
            <h2 className="font-mono text-[10px] text-[#EE1C25] tracking-[0.25em] uppercase font-bold">喚醒沉睡的代幣</h2>
          </div>
          <h1 className="font-sans text-3xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Reignite the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb95f] via-[#ffd285] to-[#ffb95f] glow-text-primary">Dormant</span>
          </h1>
          <p className="font-sans text-sm sm:text-lg text-[#c4c7c7] max-w-2xl mx-auto mb-10 leading-relaxed">
            The institutional resurrection platform for legacy tokens. Revitalize dormant token ecosystems through community coordination, builder solutions, and proof-supported momentum.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <ActionLink to="/catalysts" className="w-full sm:w-auto text-xs uppercase tracking-widest font-bold">
              Explore Catalysts
            </ActionLink>
            <ActionLink to="/create-catalyst" tone="ignite" className="w-full sm:w-auto text-xs uppercase tracking-widest font-bold">
              Ignite a Catalyst
            </ActionLink>
          </div>
        </div>

        {/* Dynamic platform indicators */}
        <div className="relative z-10 mt-12 grid gap-4 sm:grid-cols-3 max-w-5xl mx-auto border-t border-white/5 pt-8">
          <div className="text-left px-4 py-2 border-l border-[#ffb95f]/25">
            <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">Active Catalysts</div>
            <div className="mt-1 font-mono text-2xl font-bold text-white">{catalysts.length}</div>
            <div className="text-[10px] text-white/50 mt-0.5">{confirmed.length} with confirmed public reward state</div>
          </div>
          <div className="text-left px-4 py-2 border-l border-[#4ade80]/25">
            <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">Support Proofs</div>
            <div className="mt-1 font-mono text-2xl font-bold text-white">{leaderboard?.mostBoostedSubmissions.length ?? 0}</div>
            <div className="text-[10px] text-white/50 mt-0.5">Visible submission-level support records</div>
          </div>
          <div className="text-left px-4 py-2 border-l border-[#ffddb8]/25">
            <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">Signal Lanes</div>
            <div className="mt-1 font-mono text-2xl font-bold text-white">{curatedItems.length}</div>
            <div className="text-[10px] text-white/50 mt-0.5">Curated momentum & comeback watch entries</div>
          </div>
        </div>
      </section>

      {/* Operational Panels */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          eyebrow="Momentum Board"
          title="Featured Catalyst Lanes"
          description="Curated high-stakes resurrection briefs appear here first, then resolve into the general board."
          icon={Sparkles}
        >
          <div className="grid gap-3">
            {(featured.length ? featured : curatedItems.slice(0, 3)).map((item) => (
              <DataRow
                key={item.id}
                title={item.title}
                subtitle={item.description ?? 'Curated ecosystem target'}
                badge={<StatusChip tone="gold">{(item.itemType ?? 'curated').replace(/_/g, ' ')}</StatusChip>}
                value={item.targetId ? `ID ${item.targetId}` : 'Featured'}
              />
            ))}
            {!featured.length && !curatedItems.length ? (
              <EmptyPanel
                title="No curated lanes published"
                description="Ecosystem curators haven't designated homepage lanes yet."
              />
            ) : null}
          </div>
        </Panel>

        <Panel
          eyebrow="Activity Feed"
          title="Hot Catalyst Stream"
          description="Live momentum rankings driven by support boosts and active developer submissions."
          icon={Activity}
        >
          <div className="grid gap-3">
            {hottest.length ? (
              hottest.map((row, index) => (
                <DataRow
                  key={`${String(row.id)}-${index}`}
                  rank={index + 1}
                  to={`/catalysts/${String(row.id)}`}
                  title={String(row.title ?? 'Untitled Catalyst')}
                  subtitle={`Momentum score: ${formatMomentumCount(Number(row.momentum_score ?? 0))}`}
                  badge={<StatusChip tone={index === 0 ? 'red' : 'slate'}>{index === 0 ? 'top runner' : 'hot lane'}</StatusChip>}
                />
              ))
            ) : (
              <EmptyPanel title="Awaiting stream signal" description="Lanes will populate here as booster actions happen." />
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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
                <DataRow
                  key={item.id}
                  to={`/catalysts/${item.id}`}
                  title={item.title}
                  subtitle={item.description}
                  value={formatMomentumCount(item.momentumScore)}
                  meta={`Status: ${formatFundingStatusLabel(item.fundingStatus)}`}
                  badge={<StatusChip tone="emerald">{formatFundingStatusLabel(item.fundingStatus)}</StatusChip>}
                />
              ))
            ) : (
              <EmptyPanel
                title="No verified reward records logged"
                description="Operator-confirmed entries will appear here once public proofs are verified."
              />
            )}
          </div>
        </Panel>

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
                <DataRow
                  key={`${String(row.id)}-${index}`}
                  to={`/submissions/${String(row.id)}`}
                  rank={index + 1}
                  title={String(row.name ?? 'Untitled Solution')}
                  subtitle={`Builder ID: ${String(row.builder_name ?? row.builder_id ?? 'unknown')}`}
                  value={`${String(row.boost_count ?? 0)} boosts`}
                  badge={<StatusChip tone="sky">proof event</StatusChip>}
                />
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
                className="glass-panel p-4 flex flex-col justify-between"
              >
                <div>
                  <StatusChip tone="gold">{(item.itemType ?? 'curated').replace(/_/g, ' ')}</StatusChip>
                  <h3 className="mt-4 text-base font-bold text-white tracking-tight leading-tight">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/50">
                    {item.description ?? 'Curated comeback metadata.'}
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
      className="glass-panel glass-panel-hover p-4 hover:border-[#ffb95f]/30 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        <ArrowRight className="h-3.5 w-3.5 text-white/20" />
      </div>
      <p className="mt-2 text-xs leading-5 text-white/40">{body}</p>
    </Link>
  );
}
