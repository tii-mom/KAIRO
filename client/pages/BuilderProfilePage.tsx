import { useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import { INITIAL_BIDS } from '../../src/mockData';
import { PageShell } from './pageUtils';

export default function BuilderProfilePage() {
  const { id } = useParams();
  const decoded = decodeURIComponent(id ?? 'Builder');
  const bids = INITIAL_BIDS.filter((bid) => bid.builderName.toLowerCase().includes(decoded.toLowerCase()) || bid.id === id);
  return <PageShell><section className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6"><div className="flex items-center gap-2 text-[#ffd285]"><User className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Builder Profile</span></div><h1 className="mt-3 text-3xl font-black">{decoded}</h1><p className="mt-2 text-white/60">{bids.length} tracked submissions in KAIRO.</p></section></PageShell>;
}
