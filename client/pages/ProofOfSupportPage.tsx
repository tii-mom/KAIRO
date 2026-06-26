import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, Copy, Flame, Share2, ShieldCheck, Sparkles } from 'lucide-react';
import { getProofOfSupport, getProofOfSupportByUser, type ProofOfSupport, type SupportEvent } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from './pageUtils';

export default function ProofOfSupportPage() {
  const { userId } = useParams();
  const [proof, setProof] = useState<ProofOfSupport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const payload = userId ? await getProofOfSupportByUser(userId) : await getProofOfSupport();
      setProof(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Proof of Support');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  if (isLoading) return <LoadingState label="Loading Proof of Support..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const hasEvents = Boolean(proof?.events.length);

  const handleCopy = async () => {
    if (!proof) return;
    const copy = `KAIRO Proof of Support\nUser: ${proof.user.id}\nLevel: ${proof.supporterLevel}\nSupport Points: ${proof.points.totalPoints}\nValid Boosts: ${proof.validBoostCount}`;
    await navigator.clipboard.writeText(copy);
    setCopyMessage('Proof summary copied.');
  };

  return (
    <div className="space-y-6" id="proof-of-support-page">
      <section className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffd285]">
              <ShieldCheck className="h-4 w-4" />
              Proof of Support
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">Support profile and shareable contribution record</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
              Proof of Support shows valid Boost history, support points, timeline entries, and supported Catalysts or submissions. It does not imply any guaranteed reward, airdrop, or profit outcome.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard label="Support Points" value={proof?.points.totalPoints ?? 0} tone="gold" />
            <SummaryCard label="Boost Points" value={proof?.points.boostPoints ?? 0} />
            <SummaryCard label="Valid Boosts" value={proof?.validBoostCount ?? 0} tone="green" />
            <SummaryCard label="Level" value={proof?.supporterLevel ?? 'New Signal'} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void handleCopy()} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/80">
            <Copy className="h-4 w-4" />
            Copy share summary
          </button>
          {copyMessage ? <span className="text-sm text-[#ffd285]">{copyMessage}</span> : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SupportList title="Boosted Catalysts" items={proof?.boostedCatalysts ?? []} empty="No boosted Catalysts yet." pathPrefix="/catalysts" />
        <SupportList title="Boosted Submissions" items={proof?.boostedSubmissions ?? []} empty="No boosted submissions yet." pathPrefix="/submissions" />
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

        {hasEvents && proof ? (
          <div className="divide-y divide-white/5">
            {proof.events.map((event) => (
              <div key={event.id}>
                <SupportEventRow event={event} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No support events yet"
            description="Boost a Catalyst or submission to start building a visible Proof of Support timeline."
            action={<Link to="/catalysts" className="inline-flex rounded-full bg-[#ffd285] px-5 py-2 text-sm font-black text-[#07090e] transition hover:bg-white">Browse Catalysts</Link>}
          />
        )}
      </section>
    </div>
  );
}

function SupportList({ title, items, empty, pathPrefix }: { title: string; items: Array<{ id: string; title?: string; name?: string }>; empty: string; pathPrefix: string }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-5">
      <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
        <Sparkles className="h-4 w-4 text-[#ffd285]" />
        {title}
      </div>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <Link key={item.id} to={`${pathPrefix}/${item.id}`} className="block rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80">
              {item.title ?? item.name ?? item.id}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/45">{empty}</p>
      )}
    </section>
  );
}

function SummaryCard({ label, value, tone = 'default' }: { label: string; value: number | string; tone?: 'default' | 'gold' | 'green' }) {
  const valueClass = tone === 'gold' ? 'text-[#ffd285]' : tone === 'green' ? 'text-emerald-400' : 'text-white';

  return (
    <div className="rounded-xl border border-white/5 bg-[#07090e]/70 p-4">
      <div className="text-[10px] uppercase text-white/40">{label}</div>
      <div className={`mt-1 font-mono text-xl font-black ${valueClass}`}>{value}</div>
    </div>
  );
}

function SupportEventRow({ event }: { event: SupportEvent }) {
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
}

function formatEventType(eventType: string) {
  return eventType.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
