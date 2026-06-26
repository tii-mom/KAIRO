import { Sparkles } from 'lucide-react';
import { PageShell } from './pageUtils';

export default function CreateCatalystPage() {
  return (
    <PageShell>
      <section className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffd285]"><Sparkles className="h-4 w-4" />Create Catalyst</div>
        <h1 className="mt-3 text-3xl font-black">发布新的复兴催化剂</h1>
        <p className="mt-2 max-w-2xl text-white/60">Define the dormant token, reward pool, revival requirements, and verification package for builders.</p>
      </section>
    </PageShell>
  );
}
