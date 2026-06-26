import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getLeaderboard, type LeaderboardResponse } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from './pageUtils';

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

  if (isLoading) return <LoadingState label="Loading leaderboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]"><Trophy className="h-4 w-4" /> KAIRO Score</div>
      <h1 className="text-3xl font-black text-white">Leaderboards built from valid Momentum and support data</h1>
      <section className="grid gap-4 lg:grid-cols-2">
        <LeaderboardCard title="Hottest Catalysts" rows={(leaderboard?.hottestCatalysts ?? []) as LeaderboardRow[]} labelKey="title" valueKey="momentum_score" />
        <LeaderboardCard title="Confirmed Reward Catalysts" rows={(leaderboard?.confirmedRewardCatalysts ?? []) as LeaderboardRow[]} labelKey="title" valueKey="boost_count" />
        <LeaderboardCard title="Top Builders" rows={(leaderboard?.topBuilders ?? []) as LeaderboardRow[]} labelKey="builder_name" valueKey="total_score" />
        <LeaderboardCard title="Most Boosted Submissions" rows={(leaderboard?.mostBoostedSubmissions ?? []) as LeaderboardRow[]} labelKey="name" valueKey="boost_count" />
        <LeaderboardCard title="Dormant Giants" rows={(leaderboard?.dormantGiants ?? []) as LeaderboardRow[]} labelKey="title" valueKey="sort_order" />
        <LeaderboardCard title="Breakout Stories" rows={(leaderboard?.breakoutStories ?? []) as LeaderboardRow[]} labelKey="title" valueKey="sort_order" />
        <LeaderboardCard title="Comeback Hall" rows={(leaderboard?.comebackHall ?? []) as LeaderboardRow[]} labelKey="title" valueKey="sort_order" />
        <LeaderboardCard title="Genesis Candidates" rows={(leaderboard?.genesisCandidates ?? []) as LeaderboardRow[]} labelKey="title" valueKey="sort_order" />
      </section>
    </div>
  );
}

function LeaderboardCard({ title, rows, labelKey, valueKey }: { title: string; rows: LeaderboardRow[]; labelKey: string; valueKey: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white/60">{title}</h2>
      {rows.length ? rows.map((row, index) => (
        <div key={`${String(row[labelKey] ?? row.id)}-${index}`} className="flex items-center justify-between border-b border-white/5 py-4 last:border-0">
          <span className="text-white/70">#{index + 1} {String(row[labelKey] ?? row.title ?? 'Unknown')}</span>
          <span className="font-mono font-black text-[#ffd285]">{String(row[valueKey] ?? 0)}</span>
        </div>
      )) : <EmptyState title={`No ${title} yet`} description="Seed content and valid runtime activity will populate this section." />}
    </div>
  );
}
