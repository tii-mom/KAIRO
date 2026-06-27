import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Orbit, Trophy } from 'lucide-react';
import { getLeaderboard, type LeaderboardResponse } from '../lib/api';
import { formatMomentumCount } from '../lib/formatters';
import { DataRow, EmptyPanel, PageHero, Panel, StatusChip } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';

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

  if (isLoading) return <LoadingState label="Loading Builder Board telemetry..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const builders = leaderboard?.topBuilders ?? [];

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow="Builder Registry"
        title="Ranked Builder Profiles & Delivery Scores"
        description="Monitor verified developer scores, completed solution metrics, and reputation achievements. Score points are computed via shipped code solutions."
        stats={[
          { label: 'Active Builders', value: builders.length, detail: 'Profiles tracked in runtime' },
          { label: 'Scoring Schema', value: 'Dynamic', detail: 'Based on verified deliverable status', tone: 'sky' },
          { label: 'Platform Scope', value: 'Phase 0', detail: 'Private beta network coordinate', tone: 'emerald' },
        ]}
        aside={
          <Panel eyebrow="Score parameters" title="Reputation Mechanics" icon={Orbit}>
            <p className="text-xs leading-5 text-white/50">
              Builder rankings reflect community solution history and coordinate logs. These represent delivery evidence without asset/token guarantees.
            </p>
          </Panel>
        }
      />

      <Panel eyebrow="Telemetry Grid" title="Ranked Builder Grid" icon={Award}>
        {builders.length ? (
          <div className="grid gap-3">
            {builders.map((builder, index) => (
              <DataRow
                key={`${String(builder.builder_id)}-${index}`}
                to={`/builder/${String(builder.builder_id)}`}
                rank={index + 1}
                title={String(builder.builder_name ?? builder.builder_id)}
                subtitle={`Solutions Shipped: ${String(builder.completed_count ?? 0)} · Milestone Wins: ${String(builder.won_count ?? 0)}`}
                value={formatMomentumCount(Number(builder.total_score ?? 0))}
                badge={<StatusChip tone={index < 3 ? 'gold' : 'slate'}>{index < 3 ? 'top code builder' : 'ranked builder'}</StatusChip>}
              />
            ))}
          </div>
        ) : (
          <EmptyPanel title="No builders verified yet" description="The builder grid will populate as users submit solution proposals." />
        )}
      </Panel>

      {builders.length ? (
        <div className="grid gap-6 md:grid-cols-3">
          {builders.slice(0, 3).map((builder, index) => (
            <Link key={`${String(builder.builder_id)}-card-${index}`} to={`/builder/${String(builder.builder_id)}`} className="glass-panel p-5 hover:border-[#ffb95f]/30 flex flex-col justify-between">
              <div>
                <StatusChip tone="gold">top {index + 1} builder</StatusChip>
                <Trophy className="mt-4 h-5 w-5 text-[#ffb95f]" />
                <h2 className="mt-4 text-lg font-bold tracking-tight text-white">{String(builder.builder_name ?? builder.builder_id)}</h2>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                <StatBox label="KAIRO Score" value={formatMomentumCount(Number(builder.total_score ?? 0))} />
                <StatBox label="Shipped" value={String(builder.completed_count ?? 0)} />
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-3 border-white/5 bg-[#050608]">
      <div className="text-[9px] font-mono uppercase tracking-wider text-white/30">{label}</div>
      <div className="mt-1 font-mono text-base font-semibold text-white">{value}</div>
    </div>
  );
}
