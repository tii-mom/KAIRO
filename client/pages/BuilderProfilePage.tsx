import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import { getLeaderboard, listSubmissions, type LeaderboardResponse } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from './pageUtils';

export default function BuilderProfilePage() {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [submissions, setSubmissions] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [board, items] = await Promise.all([getLeaderboard(), listSubmissions()]);
      setLeaderboard(board);
      setSubmissions(items.filter((item) => item.builderId === id) as Array<Record<string, unknown>>);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load builder profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  if (isLoading) return <LoadingState label="Loading builder profile..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const builder = (leaderboard?.topBuilders ?? []).find((item) => String(item.builder_id) === id);

  return (
    <section className="space-y-6 rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6">
      <div className="flex items-center gap-2 text-[#ffd285]"><User className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Builder Profile</span></div>
      <h1 className="text-3xl font-black text-white">{String(builder?.builder_name ?? id ?? 'Builder')}</h1>
      <p className="text-white/60">KAIRO Score {String(builder?.total_score ?? 0)} · Completed {String(builder?.completed_count ?? 0)} · Won {String(builder?.won_count ?? 0)}</p>
      {submissions.length ? (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <Link key={String(submission.id)} to={`/submissions/${String(submission.id)}`} className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="font-bold text-white">{String(submission.name)}</div>
              <div className="mt-1 text-sm text-white/50">{String(submission.tagline ?? '')}</div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No submissions found" description="This builder has not published any submissions in the current runtime dataset." />
      )}
    </section>
  );
}
