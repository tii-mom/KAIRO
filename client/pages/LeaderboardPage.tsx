import { useEffect, useState, type FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Crown, Orbit, Radar, Trophy, Users } from 'lucide-react';
import { getLeaderboard, type LeaderboardResponse } from '../lib/api';
import { formatMomentumCount } from '../lib/formatters';
import { DataRow, EmptyPanel, PageHero, Panel, StatusChip, AnimatedCounter, PointerGlowCard, cx } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';

type LeaderboardRow = Record<string, unknown>;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'builders';

  const load = async () => {
    setIsLoading(true);
    try {
      const payload = await getLeaderboard();
      setLeaderboard(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (isLoading) return <LoadingState label="Connecting to KAIRO Grid telemetry..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const hottest = (leaderboard?.hottestCatalysts ?? []) as LeaderboardRow[];
  const builders = (leaderboard?.topBuilders ?? []) as LeaderboardRow[];
  const rewardVisible = (leaderboard?.confirmedRewardCatalysts ?? []) as LeaderboardRow[];
  const boosted = (leaderboard?.mostBoostedSubmissions ?? []) as LeaderboardRow[];

  return (
    <div className="space-y-8 pb-12">
      {/* Grid Hero */}
      <PageHero
        eyebrow="The Grid Registry"
        title="Ecosystem Momentum & Rankings Console"
        description="Verify Catalyst activity, builder delivery indicators, support signals, and comeback milestones on a shared telemetry board."
        stats={[
          { label: 'Hottest Lanes', value: hottest.length, detail: 'Catalysts ranked by momentum' },
          { label: 'Active Builders', value: builders.length, detail: 'Score-based output ranks', tone: 'sky' },
          { label: 'Reward Evidence', value: rewardVisible.length, detail: 'Recorded reward evidence', tone: 'emerald' },
        ]}
        aside={
          <Panel eyebrow="Platform Leader" title="Front Runner" icon={Crown}>
            <div className="glass-panel p-4 border-[#ffb95f]/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#ffb95f]/5 blur-[20px] pointer-events-none" />
              <div className="relative z-10">
                <div className="text-[9px] font-mono uppercase tracking-widest text-[#ffb95f]">Current Leaderboard Lane</div>
                <div className="mt-2 text-base font-bold text-white tracking-tight leading-tight">
                  {String(hottest[0]?.title ?? 'Awaiting telemetry')}
                </div>
                <div className="mt-1 font-mono text-xs text-[#ffb95f]">
                  Momentum: {formatMomentumCount(Number(hottest[0]?.momentum_score ?? 0))} PTS
                </div>
              </div>
            </div>
          </Panel>
        }
      />

      {/* Navigation tabs header sub-menu */}
      <div className="w-full overflow-x-auto scrollbar-none border-b border-white/10 pb-1">
        <div className="flex gap-6 min-w-max px-1 font-mono text-[10px] uppercase tracking-wider text-white/50">
          <button
            onClick={() => setSearchParams({ tab: 'builders' })}
            className={cx(
              "pb-2 transition-colors uppercase font-mono font-bold border-b-2 bg-transparent border-transparent",
              activeTab === 'builders' ? "text-[#ffb95f] border-[#ffb95f]" : "hover:text-white cursor-pointer"
            )}
          >
            Top Builders
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'catalysts' })}
            className={cx(
              "pb-2 transition-colors uppercase font-mono font-bold border-b-2 bg-transparent border-transparent",
              activeTab === 'catalysts' ? "text-[#ffb95f] border-[#ffb95f]" : "hover:text-white cursor-pointer"
            )}
          >
            Hottest Catalysts
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'dormant' })}
            className={cx(
              "pb-2 transition-colors uppercase font-mono font-bold border-b-2 bg-transparent border-transparent",
              activeTab === 'dormant' ? "text-[#ffb95f] border-[#ffb95f]" : "hover:text-white cursor-pointer"
            )}
          >
            Dormant Giants & Breakouts
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'comeback' })}
            className={cx(
              "pb-2 transition-colors uppercase font-mono font-bold border-b-2 bg-transparent border-transparent",
              activeTab === 'comeback' ? "text-[#ffb95f] border-[#ffb95f]" : "hover:text-white cursor-pointer"
            )}
          >
            Comeback Hall & Genesis
          </button>
        </div>
      </div>

      {/* Main lists */}
      {activeTab === 'builders' && (
        <Panel eyebrow="Builder Board" title="Top Builders" description="Reputation scores earned by shipping functional solutions." icon={Users}>
          <RankList
            rows={builders}
            labelKey="builder_name"
            valueKey="total_score"
            subtitleKey="completed_count"
            subtitleLabel="completed"
            valueFormatter={formatCompactValue}
            tone="sky"
          />
        </Panel>
      )}

      {activeTab === 'catalysts' && (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Panel eyebrow="Heat Map" title="Hottest Catalysts" description="Lanes sorted by support injections and builder actions.">
            <RankList rows={hottest} labelKey="title" valueKey="momentum_score" valueFormatter={formatCompactValue} tone="gold" />
          </Panel>
          <Panel eyebrow="Support Surges" title="Most Boosted Solutions" description="Top-supported builder proposals ranked by total boosts." icon={Trophy}>
            <RankList
              rows={boosted}
              labelKey="name"
              valueKey="boost_count"
              subtitleKey="builder_name"
              subtitleLabel="builder"
              valueFormatter={(value) => `${String(value ?? 0)} boosts`}
              tone="gold"
            />
          </Panel>
        </div>
      )}

      {activeTab === 'dormant' && (
        <div className="grid gap-6">
          <Panel eyebrow="Comeback Tracks" title="Dormant Giants & Breakout Stories" icon={Orbit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniRankPanel
                title="Dormant Giants"
                rows={(leaderboard?.dormantGiants ?? []) as LeaderboardRow[]}
                labelKey="title"
                valueKey="sort_order"
              />
              <MiniRankPanel
                title="Breakout Stories"
                rows={(leaderboard?.breakoutStories ?? []) as LeaderboardRow[]}
                labelKey="title"
                valueKey="sort_order"
              />
            </div>
          </Panel>
          <Panel eyebrow="Public Evidence" title="Catalysts with External Evidence" description="Catalyst lanes with verified coordination evidence." icon={Radar}>
            <RankList
              rows={rewardVisible}
              labelKey="title"
              valueKey="boost_count"
              subtitleKey="momentum_score"
              subtitleLabel="momentum"
              valueFormatter={(value) => `${String(value ?? 0)} boosts`}
              tone="emerald"
            />
          </Panel>
        </div>
      )}

      {activeTab === 'comeback' && (
        <Panel eyebrow="Ecosystem Highlights" title="Comeback Hall & Genesis Candidates" icon={Trophy}>
          <div className="grid gap-4 sm:grid-cols-2">
            <MiniRankPanel
              title="Comeback Hall"
              rows={(leaderboard?.comebackHall ?? []) as LeaderboardRow[]}
              labelKey="title"
              valueKey="sort_order"
            />
            <MiniRankPanel
              title="Genesis Candidates"
              rows={(leaderboard?.genesisCandidates ?? []) as LeaderboardRow[]}
              labelKey="title"
              valueKey="sort_order"
            />
          </div>
        </Panel>
      )}
    </div>
  );
}

const RankList: FC<{
  rows: LeaderboardRow[];
  labelKey: string;
  valueKey: string;
  subtitleKey?: string;
  subtitleLabel?: string;
  valueFormatter: (value: unknown) => string;
  tone: 'gold' | 'sky' | 'emerald';
}> = ({
  rows,
  labelKey,
  valueKey,
  subtitleKey,
  subtitleLabel,
  valueFormatter,
  tone,
}) => {
  if (!rows.length) {
    return <EmptyPanel title="Awaiting ranking metrics" description="Telemetries will stream here once platform actions occur." />;
  }

  return (
    <div className="grid gap-3">
      {rows.map((row, index) => {
        const title = String(row[labelKey] ?? row.title ?? 'Unknown');
        const subtitleValue = subtitleKey ? String(row[subtitleKey] ?? '0') : null;
        const valNum = Number(row[valueKey] ?? 0);
        
        const maxVal = Number(rows[0]?.[valueKey] ?? 100);
        const percent = maxVal > 0 ? Math.min(100, Math.round((valNum / maxVal) * 100)) : 0;

        const rank = index + 1;

        if (rank === 1) {
          return (
            <PointerGlowCard key={`${title}-${index}`} className="glass-card rounded-xl p-4 sm:p-6 glow-active flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 kairo-tilt">
              <div className="absolute inset-0 bg-energy-line pointer-events-none" />
              <div className="flex-shrink-0 flex items-center gap-2 sm:flex-col sm:justify-center w-16 z-10">
                <span className="rank-red font-mono text-xl font-bold uppercase tracking-wider flex items-center gap-1">
                  🏆 #1
                </span>
              </div>
              <div className="flex-grow z-10 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-white tracking-tight truncate">{title}</h3>
                  <StatusChip tone="red">Ignited</StatusChip>
                </div>
                {subtitleValue ? (
                  <p className="text-xs text-white/50 mt-1 uppercase font-mono">{subtitleLabel ?? subtitleKey}: {subtitleValue}</p>
                ) : (
                  <p className="text-xs text-white/50 mt-1 uppercase font-mono">Ranked Core Runner</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 min-w-[150px] z-10 font-mono text-xs mt-3 sm:mt-0">
                <div className="flex justify-between w-full">
                  <span className="text-white/40">SCORE</span>
                  <span className="text-[#EE1C25] font-bold">
                    <AnimatedCounter value={valNum} formatter={valueFormatter} />
                  </span>
                </div>
                <div className="w-full progress-bar-bg">
                  <div className="progress-bar-fill-red" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </PointerGlowCard>
          );
        }

        if (rank === 2) {
          return (
            <PointerGlowCard key={`${title}-${index}`} className="glass-card rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:border-white/10 transition-colors kairo-tilt">
              <div className="flex-shrink-0 flex items-center gap-2 sm:flex-col sm:justify-center w-16">
                <span className="rank-silver font-mono text-xl font-bold uppercase tracking-wider">
                  🥈 #2
                </span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-white tracking-tight truncate">{title}</h3>
                  <StatusChip tone="slate">Silver</StatusChip>
                </div>
                {subtitleValue ? (
                  <p className="text-xs text-white/50 mt-1 uppercase font-mono">{subtitleLabel ?? subtitleKey}: {subtitleValue}</p>
                ) : (
                  <p className="text-xs text-white/50 mt-1 uppercase font-mono">Ranked Contributor</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 min-w-[150px] font-mono text-xs mt-3 sm:mt-0">
                <div className="flex justify-between w-full">
                  <span className="text-white/40">SCORE</span>
                  <span className="text-white font-bold">
                    <AnimatedCounter value={valNum} formatter={valueFormatter} />
                  </span>
                </div>
                <div className="w-full progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </PointerGlowCard>
          );
        }

        if (rank === 3) {
          return (
            <PointerGlowCard key={`${title}-${index}`} className="glass-card rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:border-white/10 transition-colors kairo-tilt">
              <div className="flex-shrink-0 flex items-center gap-2 sm:flex-col sm:justify-center w-16">
                <span className="rank-bronze font-mono text-xl font-bold uppercase tracking-wider">
                  🥉 #3
                </span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-white tracking-tight truncate">{title}</h3>
                  <StatusChip tone="gold">Bronze</StatusChip>
                </div>
                {subtitleValue ? (
                  <p className="text-xs text-white/50 mt-1 uppercase font-mono">{subtitleLabel ?? subtitleKey}: {subtitleValue}</p>
                ) : (
                  <p className="text-xs text-white/50 mt-1 uppercase font-mono">Ranked Contributor</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 min-w-[150px] font-mono text-xs mt-3 sm:mt-0">
                <div className="flex justify-between w-full">
                  <span className="text-white/40">SCORE</span>
                  <span className="text-white font-bold">
                    <AnimatedCounter value={valNum} formatter={valueFormatter} />
                  </span>
                </div>
                <div className="w-full progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </PointerGlowCard>
          );
        }

        return (
          <div key={`${title}-${index}`} className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors bg-[#0c0e14]/50">
            <div className="flex items-center gap-4 min-w-0">
              <div className="text-xs font-mono font-bold text-white/40 w-6">#{rank}</div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white tracking-tight truncate">{title}</h4>
                {subtitleValue ? (
                  <p className="text-[10px] font-mono text-white/40 uppercase mt-0.5">{subtitleLabel ?? subtitleKey}: {subtitleValue}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0 font-mono text-xs mt-2 sm:mt-0 self-end sm:self-auto">
              <span className="text-white/60 font-bold">{valueFormatter(row[valueKey])}</span>
              <StatusChip tone="slate">ranked</StatusChip>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MiniRankPanel: FC<{
  title: string;
  rows: LeaderboardRow[];
  labelKey: string;
  valueKey: string;
}> = ({
  title,
  rows,
  labelKey,
  valueKey,
}) => {
  return (
    <div className="glass-panel p-4 flex flex-col justify-between bg-[#0c0e14]/40">
      <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3 border-b border-white/5 pb-2">{title}</div>
      <div className="grid gap-3">
        {rows.length ? (
          rows.slice(0, 5).map((row, index) => (
            <DataRow
              key={`${String(row[labelKey] ?? row.id)}-${index}`}
              rank={index + 1}
              title={String(row[labelKey] ?? 'Unknown')}
              value={String(row[valueKey] ?? 0)}
              badge={<StatusChip tone="slate">tracked</StatusChip>}
            />
          ))
        ) : (
          <EmptyPanel title={`No ${title}`} description="Tracking queue is currently empty." />
        )}
      </div>
    </div>
  );
};

function formatCompactValue(value: unknown) {
  return formatMomentumCount(Number(value ?? 0));
}
