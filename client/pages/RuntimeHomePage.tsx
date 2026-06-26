import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { listBounties, listCuratedItemsByPlacement, type LeaderboardResponse, getLeaderboard } from '../lib/api';
import type { BountyRecord, CuratedItemRecord } from '../../shared/domain';
import { EmptyState, ErrorState, LoadingState } from './pageUtils';

export default function RuntimeHomePage() {
  const [catalysts, setCatalysts] = useState<BountyRecord[]>([]);
  const [curatedItems, setCuratedItems] = useState<CuratedItemRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [bounties, curated, board] = await Promise.all([
        listBounties(),
        listCuratedItemsByPlacement('home'),
        getLeaderboard(),
      ]);
      setCatalysts(bounties);
      setCuratedItems(curated);
      setLeaderboard(board);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load runtime data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (isLoading) return <LoadingState label="Loading KAIRO home..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const banner = curatedItems.find((item) => item.itemType === 'homepage_banner');
  const featured = curatedItems.filter((item) => item.itemType === 'featured_catalyst').slice(0, 3);
  const hottest = leaderboard?.hottestCatalysts ?? [];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl lg:p-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd285]/30 bg-[#ffd285]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]">
            <Sparkles className="h-4 w-4" />
            KAIRO Phase 0
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-white lg:text-6xl">
            Community signal, builder discovery, and public reward records for dormant token comebacks.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/60">
            Publish a Catalyst, collect Boosts, track Momentum, and keep Funding Status, Reward Records, and Proof of Support visible in one public runtime.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalysts" className="inline-flex items-center gap-2 rounded-full bg-[#ffd285] px-5 py-3 text-sm font-black text-[#05070d]">
              Explore Catalysts <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/proof" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-black text-white/80">
              View Proof of Support
            </Link>
          </div>
        </div>
        {banner ? (
          <div className="mt-8 rounded-3xl border border-[#ffd285]/20 bg-[#ffd285]/10 p-5">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd285]">Homepage Banner</div>
            <div className="mt-2 text-2xl font-black text-white">{banner.title}</div>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">{banner.description}</p>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Live Catalysts" value={catalysts.length} icon={Sparkles} />
        <StatCard label="Funding Events" value={catalysts.filter((item) => item.fundingStatus !== 'unverified').length} icon={ShieldCheck} />
        <StatCard label="Support Proof" value={leaderboard?.mostBoostedSubmissions.length ?? 0} icon={HeartHandshake} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
          <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/60">
            <Trophy className="h-4 w-4 text-[#ffd285]" />
            Featured Momentum
          </div>
          <div className="grid gap-4">
            {(featured.length ? featured : curatedItems.slice(0, 3)).map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd285]">{item.itemType.replace(/_/g, ' ')}</div>
                <h2 className="mt-2 text-lg font-black text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
          <div className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-white/60">Hottest Catalysts</div>
          {hottest.length ? (
            <div className="space-y-3">
              {hottest.slice(0, 5).map((row, index) => (
                <Link key={`${String(row.id)}-${index}`} to={`/catalysts/${String(row.id)}`} className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">#{index + 1}</div>
                  <div className="mt-1 font-black text-white">{String(row.title)}</div>
                  <div className="mt-1 text-sm text-white/55">Momentum {String(row.momentum_score ?? 0)}</div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No catalysts yet" description="Seed or publish catalysts to populate the home feed." />
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Sparkles }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0e14]/80 p-6">
      <Icon className="h-5 w-5 text-[#ffd285]" />
      <div className="mt-5 text-3xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/40">{label}</div>
    </div>
  );
}
