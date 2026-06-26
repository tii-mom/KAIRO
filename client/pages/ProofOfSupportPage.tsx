import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Flame, Loader2, Share2, ShieldCheck, Sparkles } from 'lucide-react';
import { getProofOfSupport, type ProofOfSupport, type SupportEvent } from '../lib/api';

export default function ProofOfSupportPage() {
  const [proof, setProof] = useState<ProofOfSupport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getProofOfSupport()
      .then((payload) => {
        if (!isMounted) return;
        setProof(payload);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load Proof of Support');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hasEvents = Boolean(proof?.events.length);

  return (
    <div className="space-y-6" id="proof-of-support-page">
      <section className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffd285]">
              <ShieldCheck className="h-4 w-4" />
              Proof of Support
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">支持证明与积分流水</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
              Boost、Referral 和分享会写入 support_events，并汇总到 support_points，供你的 KAIRO 支持证明使用。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard label="Support Points" value={proof?.points.totalPoints ?? 0} tone="gold" />
            <SummaryCard label="Boost Points" value={proof?.points.boostPoints ?? 0} />
            <SummaryCard label="Share Points" value={proof?.points.sharePoints ?? 0} />
            <SummaryCard label="Valid Boosts" value={proof?.validBoostCount ?? 0} tone="green" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-5 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
            <Award className="h-4 w-4 text-[#ffd285]" />
            Support Events Timeline
          </div>
          {proof?.user.isDemoFallback ? (
            <span className="rounded-full border border-[#ffd285]/20 bg-[#ffd285]/10 px-3 py-1 text-[10px] font-bold uppercase text-[#ffd285]">
              Demo fallback
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#07090e]/70 p-8 text-sm text-white/55">
            <Loader2 className="h-4 w-4 animate-spin text-[#ffd285]" />
            Loading Proof of Support…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">{error}</div>
        ) : hasEvents && proof ? (
          <div className="divide-y divide-white/5">
            {proof.events.map((event) => (
              <SupportEventRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#07090e]/70 p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[#ffd285]" />
            <h3 className="mt-3 text-lg font-black text-white">No support events yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/55">
              Boost a catalyst to generate your first compliant support event and start building your Proof of Support.
            </p>
            <Link
              to="/catalysts"
              className="mt-5 inline-flex rounded-full bg-[#ffd285] px-5 py-2 text-sm font-black text-[#07090e] transition hover:bg-white"
            >
              Browse catalysts
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'gold' | 'green' }) {
  const valueClass = tone === 'gold' ? 'text-[#ffd285]' : tone === 'green' ? 'text-emerald-400' : 'text-white';

  return (
    <div className="rounded-xl border border-white/5 bg-[#07090e]/70 p-4">
      <div className="text-[10px] uppercase text-white/40">{label}</div>
      <div className={`mt-1 font-mono text-xl font-black ${valueClass}`}>{value}</div>
    </div>
  );
}

const SupportEventRow: React.FC<{ event: SupportEvent }> = ({ event }) => {
  const Icon = event.source === 'share' ? Share2 : Flame;
  const label = `${formatEventType(event.eventType)} ${event.targetType} ${event.targetId}`;

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Icon className={event.source === 'share' ? 'h-4 w-4 text-sky-400' : 'h-4 w-4 text-[#f52329]'} />
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="mt-1 text-xs text-white/40">
            {formatDate(event.createdAt)} · {event.source} · {event.validityStatus}
          </div>
        </div>
      </div>
      <span className="font-mono text-sm font-black text-[#ffd285]">{event.pointsDelta >= 0 ? '+' : ''}{event.pointsDelta}</span>
    </div>
  );
};

function formatEventType(eventType: string) {
  return eventType.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
