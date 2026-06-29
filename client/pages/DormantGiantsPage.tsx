import { useEffect, useState } from 'react';
import { Orbit, Radar } from 'lucide-react';
import { listCuratedItemsByType } from '../lib/api';
import type { CuratedItemRecord } from '../../shared/domain';
import { DataRow, EmptyPanel, PageHero, Panel, StatusChip } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';
import { useI18n } from '../i18n/useI18n';

export default function DormantGiantsPage() {
  const { t } = useI18n();
  const [giants, setGiants] = useState<CuratedItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const items = await listCuratedItemsByType('dormant_giant');
      setGiants(items);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Dormant Giants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (isLoading) return <LoadingState label={t('dormantGiants.loading')} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow={t('dormantGiants.giantWatchlist')}
        title={t('dormantGiants.watchlistTitle')}
        description={t('dormantGiants.watchlistDesc')}
        stats={[
          { label: t('dormantGiants.ecosystemsTracked'), value: giants.length, detail: t('dormantGiants.recordsVerified') },
          { label: t('dormantGiants.laneType'), value: t('dormantGiants.editorial'), detail: t('dormantGiants.curatedByOps'), tone: 'sky' },
          { label: t('dormantGiants.targetFocus'), value: t('dormantGiants.comeback'), detail: t('dormantGiants.reactivatingPipelines'), tone: 'emerald' },
        ]}
        aside={
          <Panel eyebrow={t('dormantGiants.boundaryEyebrow')} title={t('dormantGiants.boundaryTitle')} icon={Radar}>
            <p className="text-xs leading-5 text-white/50">
              {t('dormantGiants.boundaryDesc')}
            </p>
          </Panel>
        }
      />

      <Panel eyebrow={t('dormantGiants.telemetryLogs')} title={t('dormantGiants.watchlistRecords')} icon={Orbit}>
        {giants.length ? (
          <div className="grid gap-3">
            {giants.map((item, index) => (
              <DataRow
                key={item.id}
                rank={index + 1}
                title={item.title}
                subtitle={item.description ?? 'Curated watchlist record.'}
                badge={<StatusChip tone="gold">{(item.itemType ?? 'curated').replace(/_/g, ' ')}</StatusChip>}
                value={`slot: ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <EmptyPanel
            title={t('dormantGiants.noGiants')}
            description={t('dormantGiants.noGiantsDesc')}
          />
        )}
      </Panel>
    </div>
  );
}
