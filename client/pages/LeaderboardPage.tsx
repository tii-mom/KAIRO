import { useEffect, useState } from 'react';
import { Crown, Orbit, Radar, Trophy, Users } from 'lucide-react';
import { getLeaderboard, type LeaderboardResponse } from '../lib/api';
import { formatMomentumCount } from '../lib/formatters';
import { DataRow, EmptyPanel, PageHero, Panel, StatusChip } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';

type LeaderboardRow = Record<string, unknown>;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        description="Verify Catalyst activity, builder delivery indicators, support multipliers, and comeback milestones on a shared telemetry board."
        stats={[
          { label: 'Hottest Lanes', value: hottest.length, detail: 'Catalysts ranked by momentum' },
          { label: 'Active Builders', value: builders.length, detail: 'Score-based output ranks', tone: 'sky' },
          { label: 'Confirmed Reward', value: rewardVisible.length, detail: 'Verified coordinate rewards', tone: 'emerald' },
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

      {/* Main lists */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel eyebrow="Heat Map" title="Hottest Catalysts" description="Lanes sorted by support injections and builder actions.">
          <RankList rows={hottest} labelKey="title" valueKey="momentum_score" valueFormatter={formatCompactValue} tone="gold" />
        </Panel>

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
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel eyebrow="Public Evidence" title="Confirmed Reward Catalysts" description="Catalyst lanes with verified coordination contracts." icon={Radar}>
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

      {/* Comeback highlight grids */}
      <div className="grid gap-6 xl:grid-cols-2">
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
      </div>
    </div>
  );
}

function RankList({
  rows,
  labelKey,
  valueKey,
  subtitleKey,
  subtitleLabel,
  valueFormatter,
  tone,
}: {
  rows: LeaderboardRow[];
  labelKey: string;
  valueKey: string;
  subtitleKey?: string;
  subtitleLabel?: string;
  valueFormatter: (value: unknown) => string;
  tone: 'gold' | 'sky' | 'emerald';
}) {
  if (!rows.length) {
    return <EmptyPanel title="Awaiting ranking metrics" description="Telemetries will stream here once platform actions occur." />;
  }

  return (
    <div className="grid gap-3">
      {rows.map((row, index) => {
        const title = String(row[labelKey] ?? row.title ?? 'Unknown');
        const subtitleValue = subtitleKey ? String(row[subtitleKey] ?? '0') : null;

        return (
          <DataRow
            key={`${title}-${index}`}
            rank={index + 1}
            title={title}
            subtitle={subtitleValue ? `${subtitleLabel ?? subtitleKey}: ${subtitleValue}` : undefined}
            value={valueFormatter(row[valueKey])}
            badge={<StatusChip tone={tone}>{index === 0 ? 'lead' : 'ranked'}</StatusChip>}
          />
        );
      })}
    </div>
  );
}

function MiniRankPanel({
  title,
  rows,
  labelKey,
  valueKey,
}: {
  title: string;
  rows: LeaderboardRow[];
  labelKey: string;
  valueKey: string;
}) {
  return (
    <div className="glass-panel p-4 flex flex-col justify-between">
      <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3 border-b border-white/5 pb-2">{title}</div>
      <div className="grid gap-3">
        {rows.length ? (
          rows.map((row, index) => (
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
}

function formatCompactValue(value: unknown) {
  return formatMomentumCount(Number(value ?? 0));
}
