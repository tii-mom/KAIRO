import { Navigate, useParams } from 'react-router-dom';
import { Github, Globe } from 'lucide-react';
import { INITIAL_BIDS } from '../../src/mockData';
import { PageShell } from './pageUtils';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const bid = INITIAL_BIDS.find((item) => item.id === id);
  if (!bid) return <Navigate to="/catalysts" replace />;
  return <PageShell><article className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6"><h1 className="text-3xl font-black">{bid.title}</h1><p className="mt-2 text-white/50">by {bid.builderName} · {bid.status} · {bid.votes} votes</p><p className="mt-6 max-w-3xl leading-relaxed text-white/70">{bid.description}</p><div className="mt-6 flex gap-3 text-sm"><a className="flex items-center gap-2 text-[#ffd285]" href={bid.demoUrl}><Globe className="h-4 w-4" />Demo</a><a className="flex items-center gap-2 text-[#ffd285]" href={bid.githubUrl}><Github className="h-4 w-4" />GitHub</a></div></article></PageShell>;
}
