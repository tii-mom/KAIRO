import { useEffect, useState } from 'react';
import { Orbit, Radar } from 'lucide-react';
import { listCuratedItemsByType } from '../lib/api';
import type { CuratedItemRecord } from '../../shared/domain';
import { DataRow, EmptyPanel, PageHero, Panel, StatusChip } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';

export default function DormantGiantsPage() {
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

  if (isLoading) return <LoadingState label="Loading Dormant Giants telemetry watchlist..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow="Giant Watchlist"
        title="Dormant Giant Token watchlist and metrics"
        description="A registry dashboard tracking high-potential legacy tokens with established communities, historical scale, and high comeback potential."
        stats={[
          { label: 'Ecosystems Tracked', value: giants.length, detail: 'Dormant Giant records verified' },
          { label: 'Lane Type', value: 'Editorial', detail: 'Curated by community operations', tone: 'sky' },
          { label: 'Target Focus', value: 'Comeback', detail: 'Reactivating developer attention pipelines', tone: 'emerald' },
        ]}
        aside={
          <Panel eyebrow="Platform boundary" title="Watchlist Disclaimer" icon={Radar}>
            <p className="text-xs leading-5 text-white/50">
              Giant Watchlist is for community signal and coordination tracking, containing zero buy/sell metrics or trading services.
            </p>
          </Panel>
        }
      />

      <Panel eyebrow="Telemetry logs" title="Dormant Giant watchlist records" icon={Orbit}>
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
            title="Watchlist registry is empty"
            description="Giant logs will stream here once operators verify ecosystem records."
          />
        )}
      </Panel>
    </div>
  );
}
