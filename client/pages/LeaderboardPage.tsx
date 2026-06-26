import { Trophy } from 'lucide-react';
import { runtimeV2Builders, runtimeV2Catalysts } from '../runtimeV2Data';

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]"><Trophy className="h-4 w-4" /> KAIRO Score</div>
      <h1 className="text-3xl font-black text-white">Leaderboard for builders and community Momentum</h1>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white/60">Builder KAIRO Score</h2>
          {runtimeV2Builders.map((builder, index) => (
            <div key={builder.name} className="flex items-center justify-between border-b border-white/5 py-4 last:border-0">
              <span className="text-white/70">#{index + 1} {builder.name}</span>
              <span className="font-mono font-black text-[#ffd285]">{builder.kairoScore}</span>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#0c0e14]/70 p-6">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white/60">Catalyst Momentum</h2>
          {runtimeV2Catalysts.map((catalyst, index) => (
            <div key={catalyst.id} className="flex items-center justify-between border-b border-white/5 py-4 last:border-0">
              <span className="text-white/70">#{index + 1} {catalyst.title}</span>
              <span className="font-mono font-black text-[#ffd285]">{catalyst.momentum}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
