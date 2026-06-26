import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, HeartHandshake, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { listBounties } from '../lib/api';
import type { BountyRecord } from '../../shared/domain';

export default function RuntimeHomePage() {
  const [catalysts, setCatalysts] = useState<BountyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listBounties()
      .then((items) => {
        setCatalysts(items);
        setError(null);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load Runtime data'))
      .finally(() => setIsLoading(false));
  }, []);

  const topCatalyst = catalysts[0];
  const confirmedCount = useMemo(() => catalysts.filter((item) => item.fundingStatus !== 'unverified').length, [catalysts]);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl lg:p-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd285]/30 bg-[#ffd285]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]">
            <Sparkles className="h-4 w-4" /> Phase 0 Runtime V2
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-white lg:text-6xl">
            Catalyst discovery, community Boost, and builder delivery records.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">
            KAIRO helps each community publish a Catalyst, gather Proof of Support, track Momentum, and maintain public Funding Status.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalysts" className="inline-flex items-center gap-2 rounded-full bg-[#ffd285] px-5 py-3 text-sm font-black text-[#05070d]">
              View Catalysts <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/proof" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-black text-white/80">
              Proof of Support
            </Link>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center gap-2 text-white/55"><Loader2 className="h-4 w-4 animate-spin text-[#ffd285]" /> Loading Runtime data...</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">{error}</div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {[
              ['Catalyst', catalysts.length, Sparkles],
              ['Boost', topCatalyst?.boostCount ?? 0, Flame],
              ['Funding Events', confirmedCount, ShieldCheck],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="rounded-3xl border border-white/10 bg-[#0c0e14]/80 p-6">
                <Icon className="h-5 w-5 text-[#ffd285]" />
                <div className="mt-5 text-3xl font-black">{String(value)}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/40">{label}</div>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/60">
              <HeartHandshake className="h-4 w-4 text-[#ffd285]" /> Community Momentum
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {catalysts.slice(0, 6).map((catalyst) => (
                <Link key={catalyst.id} to={`/catalysts/${catalyst.id}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#ffd285]/40">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd285]">{catalyst.status}</div>
                  <h2 className="mt-3 text-lg font-black text-white">{catalyst.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">{catalyst.description}</p>
                  <div className="mt-5 flex items-center justify-between text-xs font-bold text-white/45">
                    <span>Momentum {catalyst.momentumScore}</span>
                    <span>Boost {catalyst.boostCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
