import { useEffect, useState } from 'react';
import { listCuratedItemsByType } from '../lib/api';
import type { CuratedItemRecord } from '../../shared/domain';
import { EmptyState, ErrorState, LoadingState } from './pageUtils';

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

  if (isLoading) return <LoadingState label="Loading Dormant Giants..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return giants.length ? (
    <div className="space-y-4">
      <h1 className="text-3xl font-black text-white">Dormant Giants</h1>
      {giants.map((item) => (
        <article key={item.id} className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-5">
          <div className="text-xs font-bold text-[#ffd285]">{(item.itemType ?? 'curated item').replace(/_/g, ' ')}</div>
          <h2 className="mt-1 text-xl font-black text-white">{item.title}</h2>
          <p className="mt-2 text-white/60">{item.description}</p>
        </article>
      ))}
    </div>
  ) : (
    <EmptyState title="No Dormant Giants yet" description="Seed curated dormant giant entries to keep this launch section populated." />
  );
}
