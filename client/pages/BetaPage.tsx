import { Link } from 'react-router-dom';
import { CheckCircle2, FlaskConical, MessageSquare, ShieldAlert } from 'lucide-react';

export default function BetaPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]">
          <FlaskConical className="h-4 w-4" />
          Private Beta
        </div>
        <h1 className="mt-4 max-w-4xl text-4xl font-black text-white">KAIRO is in invite-only beta for workflow and community-signal testing.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Testers should try Catalyst discovery, Builder submissions, Boost, Proof of Support, leaderboards, Dormant Giants, and admin review flows. This beta is not a public launch and does not include trading, token launch, asset holding, or financial-service functionality.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/catalysts" className="rounded-full bg-[#ffd285] px-5 py-2 text-sm font-black text-[#05070d] transition hover:bg-white">Browse Catalysts</Link>
          <Link to="/feedback" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm font-bold text-white/80 transition hover:border-white/25 hover:text-white">
            <MessageSquare className="h-4 w-4" />
            Give feedback
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <BetaCard title="Builders" items={['Find a Catalyst', 'Submit a working demo', 'Check whether submissions and Boosts appear correctly']} />
        <BetaCard title="Supporters" items={['Browse Catalysts', 'Boost a Catalyst or submission', 'Copy Proof of Support summary']} />
        <BetaCard title="Operators" items={['Review Catalyst and submission state', 'Update Funding Status', 'Record public-safe Reward Records']} />
      </section>

      <section className="rounded-2xl border border-[#ffd285]/20 bg-[#ffd285]/10 p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-[#ffd285]" />
          <div>
            <h2 className="text-lg font-black text-white">Important beta limits</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">
              Boost is not investment. KAIRO does not guarantee rewards or airdrops. Funding Status is a public coordination label and is not asset holding or a financial service. The beta is for workflow, content quality, and community-signal testing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function BetaCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0c0e14]/70 p-5">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm leading-6 text-white/60">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}
