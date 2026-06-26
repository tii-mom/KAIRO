import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Flame, Github, Globe, PlayCircle } from 'lucide-react';
import { boostSubmission, getSubmission } from '../lib/api';
import type { SubmissionRecord } from '../../shared/domain';
import { ErrorState, LoadingState } from './pageUtils';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getSubmission(id);
      setSubmission(data);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load submission');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  if (!id) return <Navigate to="/catalysts" replace />;
  if (isLoading) return <LoadingState label="Loading submission..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!submission) return <Navigate to="/catalysts" replace />;

  const handleBoost = async () => {
    try {
      const result = await boostSubmission(submission.id, submission.bountyId);
      setBoostMessage(result.duplicate ? 'Boost already recorded for this submission.' : `Boost recorded: +${result.pointsDelta ?? 0} support points.`);
      await load();
    } catch (boostError) {
      setBoostMessage(boostError instanceof Error ? boostError.message : 'Unable to record Boost.');
    }
  };

  return (
    <article className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6">
      <Link to={`/catalysts/${submission.bountyId}`} className="text-sm font-bold text-[#ffd285]">Back to Catalyst</Link>
      <h1 className="mt-4 text-3xl font-black text-white">{submission.name}</h1>
      <p className="mt-2 text-white/50">Builder {submission.builderId} · {submission.status} · Delivery {submission.deliveryStatus}</p>
      <p className="mt-6 max-w-3xl leading-relaxed text-white/70">{submission.description ?? submission.tagline}</p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {submission.demoUrl ? <a className="flex items-center gap-2 text-[#ffd285]" href={submission.demoUrl}><Globe className="h-4 w-4" />Demo</a> : null}
        {submission.githubUrl ? <a className="flex items-center gap-2 text-[#ffd285]" href={submission.githubUrl}><Github className="h-4 w-4" />GitHub</a> : null}
        {submission.videoUrl ? <a className="flex items-center gap-2 text-[#ffd285]" href={submission.videoUrl}><PlayCircle className="h-4 w-4" />Video</a> : null}
        <button type="button" onClick={handleBoost} className="flex items-center gap-2 text-[#ffd285]"><Flame className="h-4 w-4" />Boost</button>
      </div>
      {boostMessage ? <p className="mt-4 text-sm text-[#ffd285]">{boostMessage}</p> : null}
    </article>
  );
}
