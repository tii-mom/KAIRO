import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Orbit, Trophy } from 'lucide-react';
import { getLeaderboard, type LeaderboardResponse } from '../lib/api';
import { formatMomentumCount } from '../lib/formatters';
import { DataRow, EmptyPanel, PageHero, Panel, StatusChip } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';
import { useI18n } from '../i18n/useI18n';

export default function BuilderPage() {
  const { t } = useI18n();
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

  if (isLoading) return <LoadingState label={t('builder.loading')} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const builders = leaderboard?.topBuilders ?? [];

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow={t('builder.eyebrow')}
        title={t('builder.title')}
        description={t('builder.description')}
        stats={[
          { label: t('builder.activeBuilders'), value: builders.length, detail: t('builder.activeBuildersDetail') },
          { label: t('builder.scoringSchema'), value: t('builder.scoringSchemaValue'), detail: t('builder.scoringSchemaDetail'), tone: 'sky' },
          { label: t('builder.platformScope'), value: t('builder.platformScopeValue'), detail: t('builder.platformScopeDetail'), tone: 'emerald' },
        ]}
        aside={
          <Panel eyebrow={t('builder.statsTitle')} title={t('builder.reputationTitle')} icon={Orbit}>
            <p className="text-xs leading-5 text-white/50">
              {t('builder.reputationDesc')}
            </p>
          </Panel>
        }
      />

      <Panel eyebrow={t('builder.gridEyebrow')} title={t('builder.gridTitle')} icon={Award}>
        {builders.length ? (
          <div className="grid gap-3">
            {builders.map((builder, index) => (
              <DataRow
                key={`${String(builder.builder_id)}-${index}`}
                to={`/builder/${String(builder.builder_id)}`}
                rank={index + 1}
                title={String(builder.builder_name ?? builder.builder_id)}
                subtitle={t('builder.summaryText', { completed: String(builder.completed_count ?? 0), won: String(builder.won_count ?? 0) })}
                value={formatMomentumCount(Number(builder.total_score ?? 0))}
                badge={<StatusChip tone={index < 3 ? 'gold' : 'slate'}>{index < 3 ? t('builder.topCodeBuilder') : t('builder.rankedBuilder')}</StatusChip>}
              />
            ))}
          </div>
        ) : (
          <EmptyPanel title={t('builder.noResultsTitle')} description={t('builder.noResultsDesc')} />
        )}
      </Panel>

      {builders.length ? (
        <div className="grid gap-6 md:grid-cols-3">
          {builders.slice(0, 3).map((builder, index) => (
            <Link key={`${String(builder.builder_id)}-card-${index}`} to={`/builder/${String(builder.builder_id)}`} className="glass-panel p-5 hover:border-[#ffb95f]/30 flex flex-col justify-between">
              <div>
                <StatusChip tone="gold">{t('builder.topRankCard', { rank: String(index + 1) })}</StatusChip>
                <Trophy className="mt-4 h-5 w-5 text-[#ffb95f]" />
                <h2 className="mt-4 text-lg font-bold tracking-tight text-white">{String(builder.builder_name ?? builder.builder_id)}</h2>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                <StatBox label={t('builder.score')} value={formatMomentumCount(Number(builder.total_score ?? 0))} />
                <StatBox label={t('builder.shipped')} value={String(builder.completed_count ?? 0)} />
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
