import { Award, Flame, Share2, ShieldCheck } from 'lucide-react';
import type { UserState } from '../../src/types';

interface ProofOfSupportPageProps {
  userState: UserState;
}

export default function ProofOfSupportPage({ userState }: ProofOfSupportPageProps) {
  const events = [
    { id: 'support-1', label: 'Boosted Dormant Yields', points: 10, source: 'direct' },
    { id: 'support-2', label: 'Shared Pepe2Clicker catalyst', points: 4, source: 'share' },
    { id: 'support-3', label: 'Shared a builder submission', points: 12, source: 'referral' },
  ];
  const totalPoints = events.reduce((sum, event) => sum + event.points, 0);

  return (
    <div className="space-y-6" id="proof-of-support-page">
      <section className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffd285]">
              <ShieldCheck className="h-4 w-4" />
              Proof of Support
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">Proof of Support 与 KAIRO Score</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
              Boost、分享与社区推荐会形成 Proof of Support，Runtime V2 先展示本地会话记录，后续接入 D1 事实源。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#ffd285]/10 bg-[#07090e]/70 p-4">
              <div className="text-[10px] uppercase text-white/40">KAIRO Score</div>
              <div className="mt-1 font-mono text-xl font-black text-[#ffd285]">{totalPoints}</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#07090e]/70 p-4">
              <div className="text-[10px] uppercase text-white/40">Boosts</div>
              <div className="mt-1 font-mono text-xl font-black text-white">{userState.boostedCatalysts.length}</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#07090e]/70 p-4">
              <div className="text-[10px] uppercase text-white/40">KAIRO</div>
              <div className="mt-1 font-mono text-xl font-black text-emerald-400">{userState.balanceKairo}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#0c0e14]/40 p-5 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
          <Award className="h-4 w-4 text-[#ffd285]" />
          Proof of Support
        </div>
        <div className="divide-y divide-white/5">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                {event.source === 'share' ? (
                  <Share2 className="h-4 w-4 text-sky-400" />
                ) : (
                  <Flame className="h-4 w-4 text-[#f52329]" />
                )}
                <span className="text-sm font-semibold text-white">{event.label}</span>
              </div>
              <span className="font-mono text-sm font-black text-[#ffd285]">+{event.points}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
