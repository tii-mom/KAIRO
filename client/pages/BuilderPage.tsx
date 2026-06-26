import { Award, Trophy } from 'lucide-react';
import { runtimeV2Builders } from '../runtimeV2Data';

export default function BuilderPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]"><Award className="h-4 w-4" /> Builder Board</div>
        <h1 className="mt-4 text-4xl font-black text-white">Builders earn KAIRO Score through delivery.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Runtime V2 highlights completed Catalysts, Reward Records, and verifiable Proof of Support from the community.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {runtimeV2Builders.map((builder) => (
          <article key={builder.name} className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
            <Trophy className="h-5 w-5 text-[#ffd285]" />
            <h2 className="mt-4 text-xl font-black text-white">{builder.name}</h2>
            <p className="mt-2 text-sm text-white/50">{builder.specialty}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-[10px] uppercase text-white/35">KAIRO Score</div><div className="mt-1 font-mono text-xl font-black text-[#ffd285]">{builder.kairoScore}</div></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-[10px] uppercase text-white/35">Catalyst</div><div className="mt-1 font-mono text-xl font-black text-white">{builder.completedCatalysts}</div></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
