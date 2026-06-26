import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Award, Flame, Loader2, Plus, Send, ShieldCheck } from 'lucide-react';
import { boostBounty, getBounty, listBounties, listSubmissions } from '../lib/api';
import { fundingStatusLabels, type BountyRecord, type SubmissionRecord } from '../../shared/domain';

type ApiBounty = BountyRecord & {
  token_symbol?: string | null;
  token_name?: string | null;
  token_chain?: string | null;
};

export function CatalystDetailPage() {
  const { id } = useParams();
  const [catalyst, setCatalyst] = useState<ApiBounty | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);

    Promise.all([getBounty(id), listSubmissions(id)])
      .then(([bounty, submissionList]) => {
        if (!isMounted) return;
        setCatalyst(bounty as ApiBounty);
        setSubmissions(submissionList);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load Catalyst');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!id) return <Navigate to="/catalysts" replace />;

  const handleBoost = async () => {
    try {
      const result = await boostBounty(id);
      setBoostMessage(result.duplicate ? 'Boost already recorded.' : `Boost recorded: +${result.pointsDelta} support points.`);
    } catch (boostError) {
      setBoostMessage(boostError instanceof Error ? boostError.message : 'Unable to record Boost.');
    }
  };

  if (isLoading) return <LoadingState label="Loading Catalyst..." />;
  if (error) return <ErrorState message={error} />;
  if (!catalyst) return <Navigate to="/catalysts" replace />;

  return (
    <div className="space-y-6">
      <Link to="/catalysts" className="text-sm font-bold text-[#ffd285]">Back to Catalysts</Link>
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]">
          Catalyst · {catalyst.token_symbol ?? catalyst.tokenId}
        </div>
        <h1 className="mt-4 text-4xl font-black text-white">{catalyst.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/60">{catalyst.description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Boost" value={catalyst.boostCount} />
          <Metric label="Momentum" value={catalyst.momentumScore} />
          <Metric label="Submissions" value={catalyst.submissionCount} />
          <Metric label="Funding Status" value={fundingStatusLabels[catalyst.fundingStatus]} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleBoost}
            className="inline-flex items-center gap-2 rounded-full bg-[#ffd285] px-5 py-3 text-sm font-black text-[#05070d]"
          >
            <Flame className="h-4 w-4" /> Boost
          </button>
          <Link
            to={`/catalysts/${catalyst.id}/submit`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-black text-white/80"
          >
            <Send className="h-4 w-4" /> Submit Project
          </Link>
        </div>
        {boostMessage ? <p className="mt-4 text-sm text-[#ffd285]">{boostMessage}</p> : null}
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/60">Reward Records</h2>
        <p className="mt-4 text-white/70">{catalyst.rewardText ?? 'Reward details pending KAIRO confirmation.'}</p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/60">Builder Submissions</h2>
        <div className="mt-4 divide-y divide-white/5">
          {submissions.length ? submissions.map((submission) => (
            <Link key={submission.id} to={`/submissions/${submission.id}`} className="block py-4">
              <div className="font-bold text-white">{submission.name}</div>
              <div className="mt-1 text-sm text-white/45">{submission.tagline}</div>
            </Link>
          )) : <p className="py-4 text-sm text-white/45">No submissions yet.</p>}
        </div>
      </section>
    </div>
  );
}

export default function CatalystsPage() {
  const [catalysts, setCatalysts] = useState<ApiBounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    listBounties()
      .then((items) => {
        if (!isMounted) return;
        setCatalysts(items as ApiBounty[]);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load Catalysts');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fundingEvents = useMemo(
    () => catalysts.filter((catalyst) => catalyst.fundingStatus !== 'unverified').slice(0, 4),
    [catalysts],
  );

  if (isLoading) return <LoadingState label="Loading Catalysts..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]">Funding Status</div>
          <h1 className="mt-2 text-3xl font-black text-white">Catalysts ready for community support</h1>
        </div>
        <Link
          to="/catalysts/create"
          className="inline-flex items-center gap-2 rounded-full bg-[#ffd285] px-5 py-3 text-sm font-black text-[#05070d]"
        >
          <Plus className="h-4 w-4" /> Create Catalyst
        </Link>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {catalysts.map((catalyst) => (
            <Link key={catalyst.id} to={`/catalysts/${catalyst.id}`} className="block rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6 transition hover:border-[#ffd285]/40">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#ffd285]"><Award className="h-4 w-4" /> Catalyst</div>
                  <h2 className="mt-3 text-xl font-black text-white">{catalyst.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{catalyst.description}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-bold text-white/70">
                  {fundingStatusLabels[catalyst.fundingStatus]}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-white/45">
                <span>Boost {catalyst.boostCount}</span>
                <span>Momentum {catalyst.momentumScore}</span>
                <span>Submissions {catalyst.submissionCount}</span>
              </div>
            </Link>
          ))}
        </div>
        <aside className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/60"><ShieldCheck className="h-4 w-4 text-[#ffd285]" /> Funding Events</div>
          <div className="space-y-4">
            {fundingEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-sm font-black text-white">{event.title}</div>
                <div className="mt-1 text-xs text-white/45">{event.token_symbol ?? event.tokenId}</div>
                <div className="mt-3 text-sm text-[#ffd285]">{fundingStatusLabels[event.fundingStatus]}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-10 text-white/55">
      <Loader2 className="h-4 w-4 animate-spin text-[#ffd285]" /> {label}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">{message}</div>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/10 bg-[#05070d]/70 p-4"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{label}</div><div className="mt-2 text-lg font-black text-white">{value}</div></div>;
}
