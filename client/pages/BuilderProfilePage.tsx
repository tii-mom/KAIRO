import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { User, Trophy, Award } from 'lucide-react';
import { getLeaderboard, listSubmissions, type LeaderboardResponse } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from './pageUtils';
import { StatusChip } from '../components/runtimeUi';

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

  if (isLoading) return <LoadingState label="Connecting to Builder Profile telemetry..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const builder = (leaderboard?.topBuilders ?? []).find((item) => String(item.builder_id) === id);

  return (
    <section className="glass-panel p-6 sm:p-8 max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2 text-[#ffb95f]">
        <User className="h-5 w-5 text-[#EE1C25] animate-pulse" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider">Builder Console</span>
      </div>
      
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">{String(builder?.builder_name ?? id ?? 'Builder')}</h1>
        <p className="text-xs text-white/50 mt-2 font-mono uppercase tracking-wider flex flex-wrap gap-4">
          <span>KAIRO Score: <strong className="text-[#ffb95f]">{String(builder?.total_score ?? 0)}</strong></span>
          <span>Shipped: <strong className="text-white">{String(builder?.completed_count ?? 0)}</strong></span>
          <span>Milestones Won: <strong className="text-[#4ade80]">{String(builder?.won_count ?? 0)}</strong></span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white/40">
          <Award className="h-4 w-4" />
          Shipped Solutions
        </div>

        {submissions.length ? (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Link key={String(submission.id)} to={`/submissions/${String(submission.id)}`} className="glass-panel glass-panel-hover p-4 block hover:border-[#ffb95f]/30">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white tracking-tight">{String(submission.name)}</h4>
                  <StatusChip tone={submission.status === 'approved' ? 'emerald' : 'gold'}>{String(submission.status)}</StatusChip>
                </div>
                <div className="text-xs text-white/50 leading-relaxed">{String(submission.tagline ?? '')}</div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No solutions shipped" description="This builder profile has no recorded solutions submitted in the system." />
        )}
      </div>
    </section>
  );
}
