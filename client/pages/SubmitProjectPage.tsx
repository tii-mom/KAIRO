import { Navigate, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { INITIAL_CATALYSTS } from '../../src/mockData';
import { PageShell } from './pageUtils';

export default function SubmitProjectPage() {
  const { id } = useParams();
  const catalyst = INITIAL_CATALYSTS.find((item) => item.id === id);
  if (!catalyst) return <Navigate to="/catalysts" replace />;
  return <PageShell><section className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffd285]"><Send className="h-4 w-4" />Submit Project</div><h1 className="mt-3 text-3xl font-black">提交方案：{catalyst.token.symbol}</h1><p className="mt-2 text-white/60">Attach demo, repository, video, funding request, and milestone plan for this catalyst.</p></section></PageShell>;
}
