import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Trophy } from 'lucide-react';
import { getLeaderboard, type LeaderboardResponse } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from './pageUtils';

export default function BuilderPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const payload = await getLeaderboard();
      setLeaderboard(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load builders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (isLoading) return <LoadingState label="Loading builder board..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const builders = leaderboard?.topBuilders ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]"><Award className="h-4 w-4" /> Builder Board</div>
        <h1 className="mt-4 text-4xl font-black text-white">Builders earn KAIRO Score through visible delivery.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Top builders are ranked by service-layer KAIRO Score, delivery history, and valid community support.</p>
      </div>
      {builders.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {builders.map((builder, index) => (
            <Link key={`${String(builder.builder_id)}-${index}`} to={`/builder/${String(builder.builder_id)}`} className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
              <Trophy className="h-5 w-5 text-[#ffd285]" />
              <h2 className="mt-4 text-xl font-black text-white">{String(builder.builder_name ?? builder.builder_id)}</h2>
              <p className="mt-2 text-sm text-white/50">Rank #{index + 1}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-[10px] uppercase text-white/35">KAIRO Score</div><div className="mt-1 font-mono text-xl font-black text-[#ffd285]">{String(builder.total_score ?? 0)}</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-[10px] uppercase text-white/35">Completed</div><div className="mt-1 font-mono text-xl font-black text-white">{String(builder.completed_count ?? 0)}</div></div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No builders yet" description="Seed the local database or wait for submissions to populate the Builder Board." />
      )}
    </div>
  );
}
