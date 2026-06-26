import { INITIAL_CATALYSTS } from '../../src/mockData';
import { PageShell } from './pageUtils';

export default function DormantGiantsPage() {
  const giants = [...INITIAL_CATALYSTS].sort((a, b) => b.token.originalPeakMc - a.token.originalPeakMc);
  return <PageShell><div className="space-y-4"><h1 className="text-3xl font-black">Dormant Giants</h1>{giants.map((cat) => <article key={cat.id} className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-5"><div className="text-xs font-bold text-[#ffd285]">${cat.token.symbol}</div><h2 className="mt-1 text-xl font-black">{cat.token.name}</h2><p className="mt-2 text-white/60">Peak MC ${cat.token.originalPeakMc.toLocaleString()} → Current MC ${cat.token.currentMc.toLocaleString()}</p></article>)}</div></PageShell>;
}
