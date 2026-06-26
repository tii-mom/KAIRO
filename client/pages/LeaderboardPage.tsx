import { useEffect, useState } from 'react';
import { Loader2, Trophy } from 'lucide-react';
import { getLeaderboard, type LeaderboardResponse } from '../lib/api';

type LeaderboardRow = Record<string, unknown>;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((payload) => {
        setLeaderboard(payload);
        setError(null);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load leaderboard'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="flex items-center gap-2 text-white/55"><Loader2 className="h-4 w-4 animate-spin text-[#ffd285]" /> Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">{error}</div>;
  }

  const builders = (leaderboard?.topBuilders ?? []) as LeaderboardRow[];
  const catalysts = (leaderboard?.hottestCatalysts ?? []) as LeaderboardRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]"><Trophy className="h-4 w-4" /> KAIRO Score</div>
      <h1 className="text-3xl font-black text-white">Leaderboard for builders and community Momentum</h1>
      <section className="grid gap-4 lg:grid-cols-2">
        <LeaderboardCard title="Builder KAIRO Score" rows={builders} labelKey="builder_id" valueKey="total_score" />
        <LeaderboardCard title="Catalyst Momentum" rows={catalysts} labelKey="title" valueKey="momentum_score" />
      </section>
    </div>
  );
}

function LeaderboardCard({ title, rows, labelKey, valueKey }: { title: string; rows: LeaderboardRow[]; labelKey: string; valueKey: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white/60">{title}</h2>
      {rows.length ? rows.map((row, index) => (
        <div key={`${String(row[labelKey])}-${index}`} className="flex items-center justify-between border-b border-white/5 py-4 last:border-0">
          <span className="text-white/70">#{index + 1} {String(row[labelKey] ?? 'Unknown')}</span>
          <span className="font-mono font-black text-[#ffd285]">{String(row[valueKey] ?? 0)}</span>
        </div>
      )) : <p className="py-4 text-sm text-white/45">No rows yet.</p>}
    </div>
  );
}
