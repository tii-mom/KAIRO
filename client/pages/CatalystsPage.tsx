import { useParams, Navigate, Link } from 'react-router-dom';
import { Award, Flame, ShieldCheck } from 'lucide-react';
import { runtimeV2Catalysts, runtimeV2FundingEvents } from '../runtimeV2Data';

export function CatalystDetailPage() {
  const { id } = useParams();
  const catalyst = runtimeV2Catalysts.find((item) => item.id === id);
  if (!catalyst) return <Navigate to="/catalysts" replace />;

  return (
    <div className="space-y-6">
      <Link to="/catalysts" className="text-sm font-bold text-[#ffd285]">← Back to Catalysts</Link>
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]">Catalyst · {catalyst.token}</div>
        <h1 className="mt-4 text-4xl font-black text-white">{catalyst.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/60">{catalyst.summary}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Boost" value={catalyst.boostCount} />
          <Metric label="Momentum" value={catalyst.momentum} />
          <Metric label="KAIRO Score" value={catalyst.kairoScore} />
          <Metric label="Funding Status" value={catalyst.fundingStatus} />
        </div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/60">Reward Records</h2>
        <p className="mt-4 text-white/70">{catalyst.reward}</p>
      </section>
    </div>
  );
}

export default function CatalystsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]">Funding Status</div>
        <h1 className="mt-2 text-3xl font-black text-white">Catalysts ready for community support</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {runtimeV2Catalysts.map((catalyst) => (
            <Link key={catalyst.id} to={`/catalysts/${catalyst.id}`} className="block rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6 transition hover:border-[#ffd285]/40">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#ffd285]"><Award className="h-4 w-4" /> Catalyst</div>
                  <h2 className="mt-3 text-xl font-black text-white">{catalyst.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{catalyst.summary}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-bold text-white/70">{catalyst.fundingStatus}</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-white/45">
                <span>Boost {catalyst.boostCount}</span>
                <span>Momentum {catalyst.momentum}</span>
                <span>KAIRO Score {catalyst.kairoScore}</span>
              </div>
            </Link>
          ))}
        </div>
        <aside className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/60"><ShieldCheck className="h-4 w-4 text-[#ffd285]" /> Funding Events</div>
          <div className="space-y-4">
            {runtimeV2FundingEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-sm font-black text-white">{event.label}</div>
                <div className="mt-1 text-xs text-white/45">{event.catalyst}</div>
                <div className="mt-3 text-sm text-[#ffd285]">{event.detail}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/10 bg-[#05070d]/70 p-4"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{label}</div><div className="mt-2 text-lg font-black text-white">{value}</div></div>;
}
