import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Flame, Github, Globe, Loader2 } from 'lucide-react';
import { boostSubmission, getSubmission } from '../lib/api';
import type { SubmissionRecord } from '../../shared/domain';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getSubmission(id)
      .then(setSubmission)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load submission'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (!id) return <Navigate to="/catalysts" replace />;
  if (isLoading) return <div className="flex items-center gap-2 text-white/55"><Loader2 className="h-4 w-4 animate-spin text-[#ffd285]" /> Loading submission...</div>;
  if (error) return <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-100">{error}</div>;
  if (!submission) return <Navigate to="/catalysts" replace />;

  const handleBoost = async () => {
    try {
      const result = await boostSubmission(submission.id, submission.bountyId);
      setBoostMessage(result.duplicate ? 'Boost already recorded.' : `Boost recorded: +${result.pointsDelta} support points.`);
    } catch (boostError) {
      setBoostMessage(boostError instanceof Error ? boostError.message : 'Unable to record Boost.');
    }
  };

  return (
    <article className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6">
      <Link to={`/catalysts/${submission.bountyId}`} className="text-sm font-bold text-[#ffd285]">Back to Catalyst</Link>
      <h1 className="mt-4 text-3xl font-black text-white">{submission.name}</h1>
      <p className="mt-2 text-white/50">by {submission.builderId} · {submission.status} · {submission.boostCount} Boosts</p>
      <p className="mt-6 max-w-3xl leading-relaxed text-white/70">{submission.description ?? submission.tagline}</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        {submission.demoUrl ? <a className="flex items-center gap-2 text-[#ffd285]" href={submission.demoUrl}><Globe className="h-4 w-4" />Demo</a> : null}
        {submission.githubUrl ? <a className="flex items-center gap-2 text-[#ffd285]" href={submission.githubUrl}><Github className="h-4 w-4" />GitHub</a> : null}
        <button type="button" onClick={handleBoost} className="flex items-center gap-2 text-[#ffd285]"><Flame className="h-4 w-4" />Boost</button>
      </div>
      {boostMessage ? <p className="mt-4 text-sm text-[#ffd285]">{boostMessage}</p> : null}
    </article>
  );
}
